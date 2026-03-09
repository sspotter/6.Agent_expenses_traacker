import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { 
  ArrowUpRight, 
  ArrowDownLeft, 
  Trash2, 
  AlertCircle,
  Clock,
  ExternalLink
} from 'lucide-react';
import { format, parseISO } from 'date-fns';
import clsx from 'clsx';

interface Transaction {
  id: string;
  type: 'PAYMENT' | 'EXPENSE' | 'SETTLEMENT';
  amount: number;
  date: string;
  notes: string;
  category?: string;
}

interface AdminTransactionsListProps {
  workerId: string;
}

export const AdminTransactionsList: React.FC<AdminTransactionsListProps> = ({ workerId }) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      // Fetch collections (payments)
      const { data: cols } = await supabase
        .from('daily_collections')
        .select('*')
        .eq('worker_id', workerId)
        .order('date', { ascending: false })
        .limit(10);

      // Fetch expenses
      const { data: exps } = await supabase
        .from('expense_payments')
        .select('*, weekly_expenses(category)')
        .eq('worker_id', workerId)
        .order('payment_date', { ascending: false })
        .limit(10);

      const normalized: Transaction[] = [
        ...(cols || [])
          .filter(c => c.collected_amount > 0)
          .map(c => ({
            id: c.id,
            type: 'PAYMENT' as const,
            amount: c.collected_amount,
            date: c.date,
            notes: c.notes || 'Daily collection'
          })),
        ...(exps || []).map(e => ({
          id: e.id,
          type: 'EXPENSE' as const,
          amount: e.amount,
          date: e.payment_date,
          notes: e.notes || `Payment for ${e.weekly_expenses?.category || 'expense'}`,
          category: e.weekly_expenses?.category
        }))
      ].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 10);

      setTransactions(normalized);
    } catch (err) {
      console.error('Error fetching transactions:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (t: Transaction) => {
    if (!confirm(`Are you sure you want to delete this ${t.type.toLowerCase()}? This action is permanent.`)) return;

    try {
      if (t.type === 'PAYMENT') {
        // For payments, we usually just reset the collected amount instead of deleting the row
        // since rows represent days.
        const { error } = await supabase
            .from('daily_collections')
            .update({ 
                collected_amount: 0,
                status: 'MISSED',
                notes: `Admin Reset on ${new Date().toISOString()}`
            })
            .eq('id', t.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
            .from('expense_payments')
            .delete()
            .eq('id', t.id);
        if (error) throw error;
      }
      await fetchTransactions();
    } catch (err) {
      alert('Delete failed');
    }
  };

  const [isAdjusting, setIsAdjusting] = useState(false);
  const [adjAmount, setAdjAmount] = useState('');
  const [adjType, setAdjType] = useState<'PAYMENT' | 'EXPENSE'>('PAYMENT');
  const [adjDate, setAdjDate] = useState(format(new Date(), 'yyyy-MM-dd'));

  const handleAddAdjustment = async () => {
    if (!adjAmount || !workerId) return;
    try {
      if (adjType === 'PAYMENT') {
        const { error } = await supabase.from('daily_collections').upsert({
          worker_id: workerId,
          date: adjDate,
          collected_amount: Number(adjAmount),
          status: 'PARTIAL',
          notes: `Admin Adjustment (${new Date().toLocaleDateString()})`
        });
        if (error) throw error;
      } else {
        const { error } = await supabase.from('expense_payments').insert({
          worker_id: workerId,
          payment_date: adjDate,
          amount: Number(adjAmount),
          notes: `Admin Adjustment (${new Date().toLocaleDateString()})`
        });
        if (error) throw error;
      }
      setIsAdjusting(false);
      setAdjAmount('');
      await fetchTransactions();
    } catch (err) {
      alert('Adjustment failed');
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [workerId]);

  if (loading) return <div className="animate-pulse space-y-3">
    {[1, 2, 3].map(i => <div key={i} className="h-12 bg-primary/5 rounded-xl" />)}
  </div>;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between px-2">
        <p className="text-[10px] font-black uppercase tracking-widest text-sub">Recent Activity</p>
        <div className="flex gap-4">
          <button 
            onClick={() => setIsAdjusting(!isAdjusting)}
            className="text-[10px] font-black uppercase text-primary hover:underline"
          >
            {isAdjusting ? 'Cancel' : 'Add Adjustment'}
          </button>
          <button onClick={fetchTransactions} className="text-[10px] font-black uppercase text-primary hover:underline">Refresh</button>
        </div>
      </div>

      {isAdjusting && (
        <div className="p-4 bg-primary/5 rounded-[2rem] border border-primary/10 animate-in slide-in-from-top-2 duration-300">
          <div className="grid grid-cols-2 gap-3 mb-3">
            <input 
              type="number" 
              placeholder="Amount"
              value={adjAmount}
              onChange={e => setAdjAmount(e.target.value)}
              title="Adjustment Amount"
              className="bg-white dark:bg-white/5 border border-primary/10 rounded-xl px-3 py-2 text-xs font-bold"
            />
            <input 
              type="date" 
              value={adjDate}
              onChange={e => setAdjDate(e.target.value)}
              title="Adjustment Date"
              className="bg-white dark:bg-white/5 border border-primary/10 rounded-xl px-3 py-2 text-xs font-bold"
            />
          </div>
          <div className="flex gap-2">
            <button 
              onClick={() => setAdjType('PAYMENT')}
              className={clsx(
                "flex-1 py-2 rounded-xl text-[10px] font-black uppercase transition-premium",
                adjType === 'PAYMENT' ? "bg-success text-white" : "bg-success/10 text-success"
              )}
            >
              + Payment
            </button>
            <button 
              onClick={() => setAdjType('EXPENSE')}
              className={clsx(
                "flex-1 py-2 rounded-xl text-[10px] font-black uppercase transition-premium",
                adjType === 'EXPENSE' ? "bg-danger text-white" : "bg-danger/10 text-danger"
              )}
            >
              - Expense
            </button>
            <button 
              onClick={handleAddAdjustment}
              className="px-4 py-2 bg-primary text-white rounded-xl text-[10px] font-black uppercase"
            >
              Save
            </button>
          </div>
        </div>
      )}

      {transactions.length > 0 ? (
        transactions.map(t => (
          <div key={t.id} className="group flex items-center justify-between p-3 bg-white dark:bg-white/5 border border-primary/5 rounded-2xl hover:border-primary/10 transition-premium">
            <div className="flex items-center gap-3">
              <div className={clsx(
                "p-2 rounded-lg",
                t.type === 'PAYMENT' ? "bg-success/10 text-success" : "bg-danger/10 text-danger"
              )}>
                {t.type === 'PAYMENT' ? <ArrowDownLeft size={16} /> : <ArrowUpRight size={16} />}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <p className="text-xs font-black text-main">
                    {t.type === 'PAYMENT' ? '+' : '-'}${t.amount}
                  </p>
                  <span className="text-[9px] font-bold text-sub uppercase">• {format(parseISO(t.date), 'MMM do')}</span>
                </div>
                <p className="text-[10px] text-sub truncate max-w-[150px] font-medium">{t.notes}</p>
              </div>
            </div>

            <button 
              onClick={() => handleDelete(t)}
              className="p-1.5 text-danger/20 hover:text-danger hover:bg-danger/10 rounded-lg opacity-0 group-hover:opacity-100 transition-premium"
              title="Delete Transaction"
            >
              <Trash2 size={14} />
            </button>
          </div>
        ))
      ) : (
        <div className="py-8 text-center bg-primary/5 rounded-3xl border border-dashed border-primary/10">
          <Clock size={24} className="mx-auto text-sub opacity-20 mb-2" />
          <p className="text-[10px] font-bold text-sub uppercase">No recent activity</p>
        </div>
      )}
    </div>
  );
};
