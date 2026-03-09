import { useState, useCallback, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { type Worker } from '../types';
import { useWorker } from '../contexts/WorkerContext';
import { startOfMonth, endOfMonth, format } from 'date-fns';

export function useAdmin(currentMonth: Date = new Date()) {
  const { workers, refreshWorkers, activeWorker, isAdminSession } = useWorker();
  const [loading, setLoading] = useState(false);
  
  const isAdmin = isAdminSession;
  const [globalStats, setGlobalStats] = useState({
    totalWorkers: 0,
    activeWorkers: 0,
    suspendedWorkers: 0,
    monthlyExpected: 0,
    monthlyCollected: 0,
    monthlyOutstanding: 0
  });

  const fetchGlobalStats = useCallback(async () => {
    setLoading(true);
    try {
      const active = workers.filter(w => !w.is_suspended).length;
      const suspended = workers.filter(w => !!w.is_suspended).length;

      const startDate = format(startOfMonth(currentMonth), 'yyyy-MM-dd');
      const endDate = format(endOfMonth(currentMonth), 'yyyy-MM-dd');
      const monthKey = format(currentMonth, 'yyyy-MM');

      // 1. Fetch all collections for the month
      const { data: collections } = await supabase
        .from('daily_collections')
        .select('expected_amount, collected_amount')
        .gte('date', startDate)
        .lte('date', endDate);

      // 2. Fetch all settlements for the month (applied to this month)
      const { data: settlements } = await supabase
        .from('settlements')
        .select('amount')
        .eq('applied_to_month', monthKey);

      const exp = (collections || []).reduce((sum, c) => sum + Number(c.expected_amount || 0), 0);
      const col = (collections || []).reduce((sum, c) => sum + Number(c.collected_amount || 0), 0);
      const set = (settlements || []).reduce((sum, s) => sum + Number(s.amount || 0), 0);

      const totalCollected = col + set;
      const totalOutstanding = Math.max(0, exp - totalCollected);

      setGlobalStats({
        totalWorkers: workers.length,
        activeWorkers: active,
        suspendedWorkers: suspended,
        monthlyExpected: exp,
        monthlyCollected: totalCollected,
        monthlyOutstanding: totalOutstanding
      });

    } catch (err) {
      console.error('Error fetching admin stats:', err);
    } finally {
      setLoading(false);
    }
  }, [workers, currentMonth]);

  const toggleWorkerSuspension = async (workerId: string, suspend: boolean) => {
    try {
      const { error } = await supabase
        .from('workers')
        .update({ is_suspended: suspend })
        .eq('id', workerId);

      if (error) throw error;
      await refreshWorkers();
    } catch (err) {
      console.error('Error toggling worker suspension:', err);
      throw err;
    }
  };

  const deleteWorkerPassword = async (workerId: string) => {
    try {
      const { error } = await supabase
        .from('workers')
        .update({ password_hash: null })
        .eq('id', workerId);

      if (error) throw error;
      await refreshWorkers();
    } catch (err) {
      console.error('Error removing worker password:', err);
      throw err;
    }
  };

  useEffect(() => {
    fetchGlobalStats();
  }, [fetchGlobalStats]);

  return {
    isAdmin,
    globalStats,
    loading,
    toggleWorkerSuspension,
    deleteWorkerPassword,
    refreshStats: fetchGlobalStats
  };
}
