// import { useState, useCallback, useEffect } from 'react';
// import { supabase } from '../lib/supabase';
// import { type DailyCollection, type WeeklyExpense, type Settlement, type ExpensePayment } from '../types';
// import { useWorker } from '../contexts/WorkerContext';

// export function useGlobalDebt() {
//   const { activeWorker } = useWorker();
//   const [loading, setLoading] = useState(false);
//   const [incomeDebt, setIncomeDebt] = useState<{date: string, amount: number, id: string, status: string}[]>([]);
//   const [expenseDebt, setExpenseDebt] = useState<{category: string, amount: number, date: string, id: string}[]>([]);
//   const [unallocatedCredit, setUnallocatedCredit] = useState(0);

//   const fetchGlobalDebt = useCallback(async () => {
//     if (!activeWorker?.id) return;
//     setLoading(true);
//     const user_id = 'default_user';
//     try {
//       // Fetch all historical data for the active worker
//       const { data: allCollections } = await supabase.from('daily_collections').select('*').eq('worker_id', activeWorker!.id);
//       const { data: allSettlements } = await supabase.from('settlements').select('*').eq('worker_id', activeWorker!.id);
//       const { data: allExpenses } = await supabase.from('weekly_expenses').select('*').eq('worker_id', activeWorker!.id);
//       const { data: allExpensePayments } = await supabase.from('expense_payments').select('*').eq('worker_id', activeWorker!.id);
//       const { data: allAllocations } = await supabase.from('settlement_allocations').select('*').eq('worker_id', activeWorker!.id);

//       // --- Calculate Income Debt ---
//       const totalSettled = (allSettlements || []).reduce((sum, s) => sum + s.amount, 0);
//       const totalAllocated = (allAllocations || []).reduce((sum, a) => sum + a.allocated_amount, 0);
//       const unallocated = Math.max(0, totalSettled - totalAllocated);
//       setUnallocatedCredit(unallocated);

//       const incomeDebtList = (allCollections || [])
//         .map(c => {
//           const gap = c.expected_amount - c.collected_amount;
//           const allocated = (allAllocations || [])
//             .filter(a => a.collection_id === c.id)
//             .reduce((sum, a) => sum + a.allocated_amount, 0);
          
//           return {
//             date: c.date,
//             amount: gap - allocated,
//             id: c.id,
//             status: c.status
//           };
//         })
//         .filter(c => c.amount > 0.01); 

//       // --- Calculate Expense Debt ---
//       const expenseDebtList = (allExpenses || []).map(e => {
//         const paid = (allExpensePayments || [])
//           .filter(p => p.expense_id === e.id)
//           .reduce((sum, p) => sum + p.amount, 0);
        
//         return {
//           id: e.id,
//           category: e.category || 'General',
//           amount: e.amount - paid,
//           date: e.week_start_date
//         };
//       }).filter(e => e.amount > 0.01);

//       setIncomeDebt(incomeDebtList);
//       setExpenseDebt(expenseDebtList);

//     } catch (err) {
//       console.error('Error fetching global debt:', err);
//     } finally {
//       setLoading(false);
//     }
//   }, []);

//   useEffect(() => {
//     if (activeWorker?.id) {
//       fetchGlobalDebt();
//     }
//   }, [fetchGlobalDebt, activeWorker?.id]);

//   return { incomeDebt, expenseDebt, unallocatedCredit, loading, refresh: fetchGlobalDebt };
// }


import { useState, useCallback, useEffect } from 'react';
import { supabase } from '../lib/supabase';


export function useGlobalDebt(workerId: string | null) {
  const [loading, setLoading] = useState(false);
  const [incomeDebt, setIncomeDebt] = useState<
    { date: string; amount: number; id: string; status: string }[]
  >([]);
  const [expenseDebt, setExpenseDebt] = useState<
    { category: string; amount: number; date: string; id: string }[]
  >([]);
  const [unallocatedCredit, setUnallocatedCredit] = useState(0);

  const fetchGlobalDebt = useCallback(async () => {
    if (!workerId) {
       // Clear state
       setIncomeDebt([]);
       setExpenseDebt([]);
       setUnallocatedCredit(0);
       return;
    }

    setLoading(true);

    try {
      const [
        { data: allCollections },
        { data: allSettlements },
        { data: allExpenses },
        { data: allExpensePayments },
        { data: allAllocations }
      ] = await Promise.all([
        supabase.from('daily_collections').select('*').eq('worker_id', workerId),
        supabase.from('settlements').select('*').eq('worker_id', workerId),
        supabase.from('weekly_expenses').select('*').eq('worker_id', workerId),
        supabase.from('expense_payments').select('*').eq('worker_id', workerId),
        supabase.from('settlement_allocations').select('*').eq('worker_id', workerId)
      ]);

      // --- Income: settlements vs allocations ---
      const totalSettled =
        (allSettlements ?? []).reduce((sum, s) => sum + Number(s.amount), 0);

      const totalAllocated =
        (allAllocations ?? []).reduce((sum, a) => sum + Number(a.allocated_amount), 0);

      setUnallocatedCredit(Math.max(0, totalSettled - totalAllocated));

      const incomeDebtList =
        (allCollections ?? [])
          .map(c => {
            const expectedGap = Number(c.expected_amount) - Number(c.collected_amount);

            const allocated = (allAllocations ?? [])
              .filter(a => a.collection_id === c.id)
              .reduce((sum, a) => sum + Number(a.allocated_amount), 0);

            return {
              id: c.id,
              date: c.date,
              status: c.status,
              amount: expectedGap - allocated
            };
          })
          .filter(d => d.amount > 0.01);

      // --- Expense debt ---
      const expenseDebtList =
        (allExpenses ?? [])
          .map(e => {
            const paid = (allExpensePayments ?? [])
              .filter(p => p.expense_id === e.id)
              .reduce((sum, p) => sum + Number(p.amount), 0);

            return {
              id: e.id,
              category: e.category || 'General',
              date: e.week_start_date,
              amount: Number(e.amount) - paid
            };
          })
          .filter(e => e.amount > 0.01);

      setIncomeDebt(incomeDebtList);
      setExpenseDebt(expenseDebtList);

    } catch (err) {
      console.error('Error fetching global debt:', err);
    } finally {
      setLoading(false);
    }
  }, [workerId]);

  useEffect(() => {
    fetchGlobalDebt();
  }, [fetchGlobalDebt]);

  return {
    incomeDebt,
    expenseDebt,
    unallocatedCredit,
    loading,
    refresh: fetchGlobalDebt
  };
}
