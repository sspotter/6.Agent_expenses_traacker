import { useState, useCallback, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { type MonthlySurplus, type DailyCollection } from '../types';

/**
 * Hook to track and manage monthly surplus (over-collections).
 * Surplus occurs when collected_amount > expected_amount for a working day.
 */
export function useSurplus(workerId: string | null, currentMonth: Date | null) {
  const [surplus, setSurplus] = useState<MonthlySurplus | null>(null);
  const [loading, setLoading] = useState(false);
  const [calculatedSurplus, setCalculatedSurplus] = useState(0);

  // Calculate surplus from daily collections (real-time)
  const calculateSurplusFromCollections = useCallback(async () => {
    if (!workerId || !currentMonth) {
      setCalculatedSurplus(0);
      return 0;
    }

    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth() + 1;
    const monthStr = `${year}-${month.toString().padStart(2, '0')}`;

    try {
      const { data: collections, error } = await supabase
        .from('daily_collections')
        .select('expected_amount, collected_amount')
        .eq('worker_id', workerId)
        .gte('date', `${monthStr}-01`)
        .lte('date', `${monthStr}-31`);

      if (error) throw error;

      // Sum up surplus from days where collected > expected
      const totalSurplus = (collections || []).reduce((sum, c) => {
        const expected = c.expected_amount || 0;
        const collected = c.collected_amount || 0;
        if (collected > expected) {
          return sum + (collected - expected);
        }
        return sum;
      }, 0);

      setCalculatedSurplus(totalSurplus);
      return totalSurplus;
    } catch (err) {
      console.error('Error calculating surplus:', err);
      return 0;
    }
  }, [workerId, currentMonth]);

  // Fetch stored surplus record
  const fetchSurplus = useCallback(async () => {
    if (!workerId || !currentMonth) {
      setSurplus(null);
      return;
    }

    setLoading(true);
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth() + 1;

    try {
      const { data, error } = await supabase
        .from('monthly_surplus')
        .select('*')
        .eq('worker_id', workerId)
        .eq('year', year)
        .eq('month', month)
        .single();

      if (error && error.code !== 'PGRST116') {
        // PGRST116 = no rows returned, which is fine
        throw error;
      }

      setSurplus(data as MonthlySurplus || null);
      
      // Also calculate real-time surplus
      await calculateSurplusFromCollections();
    } catch (err) {
      console.error('Error fetching surplus:', err);
    } finally {
      setLoading(false);
    }
  }, [workerId, currentMonth, calculateSurplusFromCollections]);

  useEffect(() => {
    fetchSurplus();
  }, [fetchSurplus]);

  // Sync calculated surplus to database
  const syncSurplusToDb = useCallback(async () => {
    if (!workerId || !currentMonth) return;

    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth() + 1;
    const totalSurplus = await calculateSurplusFromCollections();

    // Get current allocated amount (if surplus record exists)
    const allocatedAmount = surplus?.amount_total 
      ? surplus.amount_total - surplus.amount_unallocated 
      : 0;

    try {
      const { data, error } = await supabase
        .from('monthly_surplus')
        .upsert({
          worker_id: workerId,
          month,
          year,
          amount_total: totalSurplus,
          amount_unallocated: Math.max(0, totalSurplus - allocatedAmount),
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'worker_id,month,year'
        })
        .select()
        .single();

      if (error) throw error;
      setSurplus(data as MonthlySurplus);
      return data;
    } catch (err) {
      console.error('Error syncing surplus:', err);
      throw err;
    }
  }, [workerId, currentMonth, surplus, calculateSurplusFromCollections]);

  // Allocate surplus to a settlement
  const allocateSurplus = useCallback(async (amount: number) => {
    if (!surplus || amount <= 0) return false;

    const newUnallocated = Math.max(0, surplus.amount_unallocated - amount);

    try {
      const { error } = await supabase
        .from('monthly_surplus')
        .update({ 
          amount_unallocated: newUnallocated,
          updated_at: new Date().toISOString()
        })
        .eq('id', surplus.id);

      if (error) throw error;

      setSurplus(prev => prev ? { ...prev, amount_unallocated: newUnallocated } : null);
      return true;
    } catch (err) {
      console.error('Error allocating surplus:', err);
      return false;
    }
  }, [surplus]);

  return {
    surplus,
    calculatedSurplus,
    unallocatedSurplus: surplus?.amount_unallocated || calculatedSurplus,
    loading,
    refresh: fetchSurplus,
    syncSurplusToDb,
    allocateSurplus
  };
}
