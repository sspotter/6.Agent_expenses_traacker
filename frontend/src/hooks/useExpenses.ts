import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { type WeeklyExpense } from '../types';
import { format, startOfMonth, endOfMonth } from 'date-fns';
import { withTimestamp, systemNote } from '../utils/notes';


export function useExpenses(currentMonth: Date, workerId: string | null) {
  const [expenses, setExpenses] = useState<WeeklyExpense[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Stable key
  const monthKey = format(currentMonth, 'yyyy-MM');

  const fetchExpenses = useCallback(async () => {
    if (!workerId) {
        setExpenses([]);
        return;
    }
    setLoading(true);
    setError(null);
    try {
      const dateObj = new Date(monthKey + '-01');
      const monthStart = format(startOfMonth(dateObj), 'yyyy-MM-dd');
      const monthEnd = format(endOfMonth(dateObj), 'yyyy-MM-dd');
      
      const { data, error: apiError } = await supabase
        .from('weekly_expenses')
        .select('*')
        .eq('worker_id', workerId)
        .gte('week_start_date', monthStart)
        .lte('week_start_date', monthEnd);

      if (apiError) throw apiError;

      setExpenses(data as WeeklyExpense[] || []);
    } catch (err: any) {
      console.error('Error fetching expenses:', err);
      if (err.message?.includes('Missing Supabase')) {
           setExpenses([]);
      } else {
           setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  }, [monthKey, workerId]);

  useEffect(() => {
    fetchExpenses();
  }, [fetchExpenses]);

  const addExpense = async (weekStart: Date, amount: number, category: string = 'General', notes: string = '') => {
      if (!workerId) throw new Error('No active worker');
      const user_id = 'default_user';
      try {
          const stampedNotes = withTimestamp(notes);
          const { data, error } = await supabase
            .from('weekly_expenses')
            .insert({
                user_id,
                worker_id: workerId,
                week_start_date: format(weekStart, 'yyyy-MM-dd'),
                amount,
                category,
                notes: stampedNotes
            })
            .select()
            .single();

          if (error) throw error;
          
          // Log CREATED event
          await supabase.from('payment_events').insert({
              user_id,
              worker_id: workerId,
              entity_type: 'WEEKLY_EXPENSE',
              entity_id: data.id,
              event_type: 'CREATED',
              amount: data.amount,
              event_date: format(weekStart, 'yyyy-MM-dd'),
              metadata: { category, notes: stampedNotes }
          });

          setExpenses(prev => [...prev, data as WeeklyExpense]);
          return data;
      } catch (err) {
          console.error('Error adding expense:', err);
          throw err;
      }
  };

  const updateExpense = async (id: string, amount: number, category: string = 'General', notes: string = '') => {
    if (!workerId) throw new Error('No active worker');
    try {
        const stampedNotes = withTimestamp(notes);
        const { data, error } = await supabase
          .from('weekly_expenses')
          .update({
              amount,
              category,
              notes: stampedNotes
          })
          .eq('id', id)
          .eq('worker_id', workerId)
          .select()
          .single();

        if (error) throw error;
        
        setExpenses(prev => prev.map(e => e.id === id ? (data as WeeklyExpense) : e));
        return data;
    } catch (err) {
        console.error('Error updating expense:', err);
        throw err;
    }
  };

  const addBulkExpenses = async (weeks: Date[], amount: number, category: string = 'General') => {
      if (!workerId) throw new Error('No active worker');
      const user_id = 'default_user';
      const bulkNote = systemNote('Bulk added');
      const newExpenses = weeks.map(w => ({
          user_id,
          worker_id: workerId,
          week_start_date: format(w, 'yyyy-MM-dd'),
          amount,
          category,
          notes: bulkNote
      }));

      try {
          const { data, error } = await supabase
            .from('weekly_expenses')
            .insert(newExpenses)
            .select();

          if (error) throw error;
          
          const inserted = data as WeeklyExpense[];

          // Log CREATED events for bulk insertion
          const bulkEvents = inserted.map(e => ({
              user_id,
              worker_id: workerId,
              entity_type: 'WEEKLY_EXPENSE',
              entity_id: e.id,
              event_type: 'CREATED',
              amount: e.amount,
              event_date: e.week_start_date,
              metadata: { category: e.category, notes: bulkNote }
          }));
          await supabase.from('payment_events').insert(bulkEvents);

          setExpenses(prev => [...prev, ...inserted]);
          return inserted;
      } catch (err) {
          console.error('Error adding bulk expenses:', err);
          throw err;
      }
  };

  return { expenses, loading, error, addExpense, updateExpense, addBulkExpenses, refresh: fetchExpenses };
}
