import { useState, useCallback, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { type ExpensePayment } from '../types';
import { withTimestamp } from '../utils/notes';
import { format, parseISO, isValid } from 'date-fns';


export function useExpensePayments(expenseIds: string[], workerId: string | null) {
  const [payments, setPayments] = useState<ExpensePayment[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchPayments = useCallback(async () => {
    if (!workerId || expenseIds.length === 0) {
      setPayments([]);
      return;
    }
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('expense_payments')
        .select('*')
        .eq('worker_id', workerId)
        .in('expense_id', expenseIds);

      if (error) throw error;
      setPayments(data as ExpensePayment[] || []);
    } catch (err) {
      console.error('Error fetching expense payments:', err);
    } finally {
      setLoading(false);
    }
  }, [expenseIds, workerId]);

  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

  const addPayment = async (expenseId: string, amount: number, notes: string = '') => {
    if (!workerId) throw new Error('No active worker');
    const user_id = 'default_user';
    try {
      const stampedNotes = withTimestamp(notes) || '';
      const { data, error } = await supabase
        .from('expense_payments')
        .insert({
          user_id,
          worker_id: workerId,
          expense_id: expenseId,
          amount,
          notes: stampedNotes,
          payment_date: new Date().toISOString().split('T')[0]
        })
        .select()
        .single();

      if (error) throw error;

      // Log Payment Event
      await supabase.from('payment_events').insert({
          user_id,
          worker_id: workerId,
          entity_type: 'WEEKLY_EXPENSE',
          entity_id: data.expense_id,
          event_type: 'PAID',
          amount: data.amount,
          event_date: data.payment_date,
          reference_id: data.id,
          metadata: { notes: stampedNotes }
      });

      setPayments(prev => [...prev, data as ExpensePayment]);
      return data;
    } catch (err) {
      console.error('Error adding expense payment:', err);
      throw err;
    }
  };

  return { payments, loading, addPayment, refresh: fetchPayments };
}
