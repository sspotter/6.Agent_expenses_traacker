import { useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { type PaymentEvent } from '../types';


export function usePaymentEvents(workerId: string | null) {
  const [loading, setLoading] = useState(false);

  const fetchEventsForEntity = useCallback(async (entityType: 'DAILY_COLLECTION' | 'WEEKLY_EXPENSE', entityId: string) => {
    if (!workerId) return [];
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('payment_events')
        .select('*')
        .eq('worker_id', workerId)
        .eq('entity_type', entityType)
        .eq('entity_id', entityId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data as PaymentEvent[];
    } catch (err) {
      console.error('Error fetching payment events:', err);
      return [];
    } finally {
      setLoading(false);
    }
  }, [workerId]);

  const addEvent = async (event: Omit<PaymentEvent, 'id' | 'user_id' | 'worker_id' | 'created_at'>) => {
    if (!workerId) throw new Error('No active worker');
    const user_id = 'default_user';
    try {
      const { data, error } = await supabase
        .from('payment_events')
        .insert({
          ...event,
          user_id,
          worker_id: workerId
        })
        .select()
        .single();

      if (error) throw error;
      return data as PaymentEvent;
    } catch (err) {
      console.error('Error adding payment event:', err);
      throw err;
    }
  };

  return { addEvent, fetchEventsForEntity, loading };
}
