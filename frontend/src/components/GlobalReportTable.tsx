import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { format, startOfMonth, endOfMonth } from 'date-fns';
import { TrendingUp, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { type Worker } from '../types';

interface GlobalReportTableProps {
  workers: Worker[];
  currentMonth: Date;
  includeSuspended?: boolean;
}

export const GlobalReportTable: React.FC<GlobalReportTableProps> = ({ workers, currentMonth, includeSuspended = true }) => {
  const [reportData, setReportData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchReport = async () => {
      setLoading(true);
      try {
        const startDate = format(startOfMonth(currentMonth), 'yyyy-MM-dd');
        const endDate = format(endOfMonth(currentMonth), 'yyyy-MM-dd');
        const monthKey = format(currentMonth, 'yyyy-MM');

        // Fetch all collections and settlements at once to filter locally (more efficient than many queries)
        const { data: cols } = await supabase
            .from('daily_collections')
            .select('worker_id, expected_amount, collected_amount')
            .gte('date', startDate)
            .lte('date', endDate);

        const { data: sets } = await supabase
            .from('settlements')
            .select('worker_id, amount')
            .eq('applied_to_month', monthKey);

        const filteredWorkers = includeSuspended ? workers : workers.filter(w => !w.is_suspended);

        const data = filteredWorkers.map(w => {
            const workerCols = (cols || []).filter(c => c.worker_id === w.id);
            const workerSets = (sets || []).filter(s => s.worker_id === w.id);

            const expected = workerCols.reduce((sum, c) => sum + Number(c.expected_amount || 0), 0);
            const collectedDaily = workerCols.reduce((sum, c) => sum + Number(c.collected_amount || 0), 0);
            const collectedSets = workerSets.reduce((sum, s) => sum + Number(s.amount || 0), 0);
            
            const totalCollected = collectedDaily + collectedSets;
            const status = totalCollected >= expected && expected > 0 ? 'COMPLETED' : (totalCollected > 0 ? 'IN_PROGRESS' : 'PENDING');

            return {
                id: w.id,
                name: w.name,
                is_suspended: w.is_suspended,
                expected,
                collected: totalCollected,
                outstanding: Math.max(0, expected - totalCollected),
                status
            };
        });

        setReportData(data);
      } catch (err) {
        console.error('Error generating global report:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchReport();
  }, [workers, currentMonth]);

  if (loading) return (
    <div className="p-10 text-center animate-pulse">
        <p className="text-xs font-black uppercase tracking-widest text-sub">Generating Monthly Report...</p>
    </div>
  );

  return (
    <div className="overflow-x-auto custom-scrollbar">
      <table className="w-full text-left border-separate border-spacing-y-2">
        <thead>
          <tr className="text-[10px] font-black uppercase tracking-widest text-sub">
            <th className="px-6 py-2">Worker</th>
            <th className="px-6 py-2">Target</th>
            <th className="px-6 py-2">Collected</th>
            <th className="px-6 py-2">Balance</th>
            <th className="px-6 py-2 text-center">Status</th>
          </tr>
        </thead>
        <tbody className="space-y-4">
          {reportData.map((row) => (
            <tr key={row.id} className="group bg-white dark:bg-white/5 hover:bg-primary/5 transition-premium rounded-2xl overflow-hidden shadow-sm">
              <td className="px-6 py-4 rounded-l-2xl">
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${row.is_suspended ? 'bg-sub' : (row.status === 'COMPLETED' ? 'bg-success' : 'bg-primary')}`} />
                  <p className="font-bold text-main">{row.name}</p>
                  {row.is_suspended && <span className="text-[8px] font-black uppercase px-1.5 py-0.5 bg-sub/10 text-sub rounded">Suspended</span>}
                </div>
              </td>
              <td className="px-6 py-4">
                <p className="font-bold text-main">${row.expected}</p>
              </td>
              <td className="px-6 py-4 text-success">
                <p className="font-black">${row.collected}</p>
              </td>
              <td className="px-6 py-4">
                <p className={`font-bold ${row.outstanding > 0 ? 'text-danger' : 'text-success/40'}`}>
                  {row.outstanding > 0 ? `-$${row.outstanding}` : 'Settled'}
                </p>
              </td>
              <td className="px-6 py-4 rounded-r-2xl text-center">
                <div className="flex justify-center">
                    {row.status === 'COMPLETED' ? (
                        <CheckCircle2 size={18} className="text-success" />
                    ) : (row.status === 'IN_PROGRESS' ? (
                        <TrendingUp size={18} className="text-primary" />
                    ) : (
                        <AlertTriangle size={18} className="text-sub/30" />
                    ))}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
