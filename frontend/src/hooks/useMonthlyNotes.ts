import { useState, useCallback, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { type MonthlyNote } from '../types';

export function useMonthlyNotes(workerId: string | null, month: Date) {
  const [notes, setNotes] = useState<MonthlyNote[]>([]);
  const [loading, setLoading] = useState(false);
  
  const monthStr = `${month.getFullYear()}-${String(month.getMonth() + 1).padStart(2, '0')}`;

  const fetchNotes = useCallback(async () => {
    if (!workerId) {
      setNotes([]);
      return;
    }
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('monthly_notes')
        .select('*')
        .eq('worker_id', workerId)
        .eq('month', monthStr)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setNotes(data || []);
    } catch (err) {
      console.error('Error fetching monthly notes:', err);
    } finally {
      setLoading(false);
    }
  }, [workerId, monthStr]);

  const addNote = async (text: string) => {
    if (!workerId) return;
    try {
      const { data, error } = await supabase
        .from('monthly_notes')
        .insert([{
          worker_id: workerId,
          month: monthStr,
          text,
          is_checked: false
        }])
        .select()
        .single();

      if (error) throw error;
      setNotes(prev => [...prev, data]);
      return data;
    } catch (err) {
      console.error('Error adding note:', err);
      throw err;
    }
  };

  const toggleNote = async (id: string, isChecked: boolean) => {
    try {
      const { error } = await supabase
        .from('monthly_notes')
        .update({ is_checked: isChecked, updated_at: new Date().toISOString() })
        .eq('id', id);

      if (error) throw error;
      setNotes(prev => prev.map(n => n.id === id ? { ...n, is_checked: isChecked } : n));
    } catch (err) {
      console.error('Error toggling note:', err);
      throw err;
    }
  };

  const updateNoteText = async (id: string, text: string) => {
    try {
      const { error } = await supabase
        .from('monthly_notes')
        .update({ text, updated_at: new Date().toISOString() })
        .eq('id', id);

      if (error) throw error;
      setNotes(prev => prev.map(n => n.id === id ? { ...n, text } : n));
    } catch (err) {
      console.error('Error updating note text:', err);
      throw err;
    }
  };

  const deleteNote = async (id: string) => {
    try {
      const { error } = await supabase
        .from('monthly_notes')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setNotes(prev => prev.filter(n => n.id !== id));
    } catch (err) {
      console.error('Error deleting note:', err);
      throw err;
    }
  };

  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

  return {
    notes,
    loading,
    addNote,
    toggleNote,
    updateNoteText,
    deleteNote,
    refresh: fetchNotes
  };
}
