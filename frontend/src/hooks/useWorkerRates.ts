import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { format, subDays, parseISO, isAfter, isBefore, startOfDay } from 'date-fns';

export interface WorkerRate {
  id: string;
  worker_id: string;
  rate_amount: number;
  effective_from: string; // YYYY-MM-DD
  effective_to: string | null; // YYYY-MM-DD
  created_at: string;
}

export function useWorkerRates(workerId: string | null) {
  const [rates, setRates] = useState<WorkerRate[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentRate, setCurrentRate] = useState<number>(100);

  const fetchRates = useCallback(async () => {
    if (!workerId) {
      setRates([]);
      return;
    }
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('worker_rates')
        .select('*')
        .eq('worker_id', workerId)
        .order('effective_from', { ascending: false });

      if (error) throw error;
      
      const loadedRates = (data as WorkerRate[]) || [];
      setRates(loadedRates);

      // Determine current active rate
      const active = loadedRates.find(r => !r.effective_to);
      if (active) {
        setCurrentRate(Number(active.rate_amount));
      } else if (loadedRates.length > 0) {
        // If no active rate (all closed), take the most recent one? Or default 100?
        // Logic: if all are closed, maybe use the last one's value?
        // But strictly, if there's no active rate, it's undefined. 
        // Let's assume the most recent one governs "future" until a new one is added, 
        // OR default to 100.
        setCurrentRate(Number(loadedRates[0].rate_amount));
      } else {
        setCurrentRate(100); // Default if no history
      }

    } catch (err) {
      console.error('Error fetching worker rates:', err);
    } finally {
      setLoading(false);
    }
  }, [workerId]);

  useEffect(() => {
    fetchRates();
  }, [fetchRates]);

  const getRateForDate = useCallback((date: Date): number => {
    if (!rates.length) return 100;
    
    const dateStr = format(date, 'yyyy-MM-dd');
    
    // Find the matching rate record
    const match = rates.find(r => {
      const from = r.effective_from;
      const to = r.effective_to;
      return from <= dateStr && (!to || to >= dateStr);
    });

    if (match) return Number(match.rate_amount);

    // If date is before first rate, return first rate or default
    const firstRate = rates[rates.length - 1]; // sorted desc
    if (firstRate && dateStr < firstRate.effective_from) {
        // Optional: return firstRate.rate_amount or default?
        // Spec says "Past days must keep their original rate".
        // If query is for a day BEFORE any recorded rate, we assume 100 or the earliest known rate.
        // Let's return 100 to be safe, or earliest known.
        return 100;
    }

    // If date is after all rates (should be covered by open-ended rate)
    // But if no open-ended rate exists:
    if (rates.length > 0) {
        return Number(rates[0].rate_amount);
    }
    
    return 100;
  }, [rates]);

  const updateRate = async (newRate: number, effectiveFromDate?: Date) => {
    if (!workerId) return;

    try {
      const effectiveDate = effectiveFromDate || new Date();
      const effectiveDateStr = format(effectiveDate, 'yyyy-MM-dd');
      const prevDayStr = format(subDays(effectiveDate, 1), 'yyyy-MM-dd');

      // 1. Close potentially overlapping rates
      // Logic: If there is an open-ended rate starting BEFORE this new rate, close it at prevDay.
      // If there is an open-ended rate starting AFTER this new rate... that's a conflict or advanced scenario.
      // For simplicity, we assume we are appending a new rate or inserting one that supersedes the current open one.
      
      // Close the currently active rate (effective_to IS NULL)
      // BUT only if it started before the new effective date.
      // If the current active rate started after, we have a weird integrity issue (future rate exists).
      
      // Let's stick to the spec: "Close current rate... Insert new rate".
      // Assuming "current rate" means the one that is currently open.
      
      const { error: updateError } = await supabase
        .from('worker_rates')
        .update({ effective_to: prevDayStr })
        .eq('worker_id', workerId)
        .is('effective_to', null)
        .lte('effective_from', effectiveDateStr); // Only close if it started before or on the same day (actually if on same day, we might overwrite? Let's say strictly before for closing)
        // Actually, if we set effective_to = prevDay, and effective_from was today, we effectively void the old rate (from today to yesterday is invalid).
        // This is fine.

      if (updateError) throw updateError;

      // 2. Insert new rate
      const { error: insertError } = await supabase
        .from('worker_rates')
        .insert({
          worker_id: workerId,
          rate_amount: newRate,
          effective_from: effectiveDateStr,
          effective_to: null
        });

      if (insertError) throw insertError;

      await fetchRates();
      return true;
    } catch (err) {
      console.error('Error updating rate:', err);
      throw err;
    }
  };

  /**
   * For editing past specific days (Admin override).
   * Note: This actually updates the daily_collection record, not the rate table.
   * But we can include a helper here.
   */
  const overrideDayExpectedAmount = async (collectionId: string, newExpectedAmount: number) => {
      const { error } = await supabase
        .from('daily_collections')
        .update({ expected_amount: newExpectedAmount })
        .eq('id', collectionId);
      
      if (error) throw error;
  };

  return { 
      rates, 
      currentRate, 
      loading, 
      getRateForDate, 
      updateRate,
      overrideDayExpectedAmount,
      refresh: fetchRates 
  };
}
