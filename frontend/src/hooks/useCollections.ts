import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { type DailyCollection, type CollectionStatus } from '../types';
import { format, startOfMonth, endOfMonth } from 'date-fns';
import { paymentTimestamp } from '../utils/notes';


export function useCollections(currentMonth: Date, workerId: string | null) {
  const [collections, setCollections] = useState<DailyCollection[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Stable dependency key
  const monthKey = format(currentMonth, 'yyyy-MM');

  const fetchCollections = useCallback(async () => {
    if (!workerId) {
        setCollections([]);
        return;
    }
    setLoading(true);
    setError(null);
    try {
      // Re-parse from stable key if needed, or just use currentMonth if we trust reference stability?
      // Better to use the key to derive start/end to be purely functional based on key.
      const dateObj = new Date(monthKey + '-01'); 
      const monthStart = format(startOfMonth(dateObj), 'yyyy-MM-dd');
      const monthEnd = format(endOfMonth(dateObj), 'yyyy-MM-dd');

      const { data, error: apiError } = await supabase
        .from('daily_collections')
        .select('*')
        .eq('worker_id', workerId)
        .gte('date', monthStart)
        .lte('date', monthEnd);

      if (apiError) throw apiError;

      setCollections(data as DailyCollection[] || []);
    } catch (err: any) {
      console.error('Error fetching collections:', err);
      // Don't show error if it's just missing credentials (dev mode)
      if (err.message?.includes('Missing Supabase')) {
          setCollections([]); // Fallback to empty
      } else {
          setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  }, [monthKey, workerId]);

  useEffect(() => {
    fetchCollections();
  }, [fetchCollections]);

  const saveCollection = async (date: Date, data: { collected_amount: number; status: CollectionStatus; notes: string; expected_amount: number; is_expected_override?: boolean }) => {
    if (!workerId) throw new Error('No active worker');
    const dateStr = format(date, 'yyyy-MM-dd');
    const user_id = 'default_user'; // TODO: Real auth

    try {
      const stampedNotes = paymentTimestamp(data.notes, data.collected_amount, data.status, date);
      
      // Upsert: Try to update based on date+user_id, insert if not exists
      const payload: any = {
        user_id,
        worker_id: workerId,
        date: dateStr,
        expected_amount: data.expected_amount,
        collected_amount: data.collected_amount,
        status: data.status,
        notes: stampedNotes
      };

      // Only include override if it's present to allow true/false values
      if (data.is_expected_override !== undefined) {
        payload.is_expected_override = data.is_expected_override;
      }

      let result;
      
      try {
        result = await supabase
          .from('daily_collections')
          .upsert(payload, { 
            onConflict: 'user_id,worker_id,date',
            ignoreDuplicates: false 
          })
          .select()
          .single();
      } catch (err: any) {
         // If it's a 400 and complains about the manually added column, retry without it
         if (err.message?.includes('is_expected_override')) {
            console.warn('DB Migration missing: is_expected_override column not found. Retrying without it.');
            delete payload.is_expected_override;
            result = await supabase
              .from('daily_collections')
              .upsert(payload, { 
                onConflict: 'user_id,worker_id,date',
                ignoreDuplicates: false 
              })
              .select()
              .single();
         } else {
             throw err;
         }
      }

      const { data: savedData, error } = result;

      if (error) {
           // Postgrest errors might come back in the object rather than throwing
           if (error.message?.includes('is_expected_override')) {
                console.warn('DB Migration missing (via error object). Retrying...');
                delete payload.is_expected_override;
                const retry = await supabase
                  .from('daily_collections')
                  .upsert(payload, { 
                    onConflict: 'user_id,worker_id,date',
                    ignoreDuplicates: false 
                  })
                  .select()
                  .single();
                if (retry.error) throw retry.error;
                payload.id = retry.data.id; // ensure we have ID for events
                return retry.data; 
           }
           throw error;
      }

      // Log Payment Event if amount > 0
      if (data.collected_amount > 0) {
        await supabase.from('payment_events').insert({
          user_id,
          worker_id: workerId,
          entity_type: 'DAILY_COLLECTION',
          entity_id: (savedData as DailyCollection).id,
          event_type: 'COLLECTED',
          amount: data.collected_amount,
          event_date: dateStr,
          metadata: { notes: stampedNotes }
        });
      }

      // Optimistic update or refetch
      setCollections(prev => {
        const idx = prev.findIndex(c => c.date === dateStr);
        if (idx >= 0) {
          const newArr = [...prev];
          newArr[idx] = savedData as DailyCollection;
          return newArr;
        }
        return [...prev, savedData as DailyCollection];
      });

      return savedData;
    } catch (err) {
      console.error('Error saving collection:', err);
      throw err;
    }
  };

  return { collections, loading, error, saveCollection, refresh: fetchCollections };
}
