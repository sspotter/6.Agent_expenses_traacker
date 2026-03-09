import { useState, useMemo, useEffect } from 'react';
import { Calendar, Sun, Moon } from 'lucide-react';
import { addMonths, subMonths, format, isToday, startOfMonth, endOfMonth } from 'date-fns';
import { Layout } from '../components/Layout';
import { MonthNavigation } from '../components/MonthNavigation';
import { MonthlySummary } from '../components/MonthlySummary';
import { DailyGrid } from '../components/DailyGrid';
import { CollectionModal } from '../components/CollectionModal';
import { SettlementModal } from '../components/SettlementModal';
import { type MonthSummary, type CollectionStatus, type WeeklyExpense } from '../types';
import { useCollections } from '../hooks/useCollections';
import { useExpenses } from '../hooks/useExpenses';
import { useSettlements } from '../hooks/useSettlements';
import { useExpensePayments } from '../hooks/useExpensePayments';
import { useGlobalDebt } from '../hooks/useGlobalDebt';
import { DebtExplorer } from '../components/DebtExplorer';
import { ExpensePaymentModal } from '../components/ExpensePaymentModal';
import { ExpenseModal } from '../components/ExpenseModal';
import { BulkExpenseModal } from '../components/BulkExpenseModal';
import { HistorySidebar } from '../components/HistorySidebar';
import { WorkerSwitcher } from '../components/WorkerSwitcher';
import { WorkerModal } from '../components/WorkerModal';
import { useWorker } from '../contexts/WorkerContext';
import { useWorkerRates } from '../hooks/useWorkerRates';
import { DBTester } from '../components/DBTester';
import { useSurplus } from '../hooks/useSurplus';
import { useMonthlyNotes } from '../hooks/useMonthlyNotes';
import { MonthlyNotesPanel } from '../components/MonthlyNotesPanel';
import { AdminModeBanner } from '../components/AdminModeBanner';

export function TrackerPage() {
  const [currentMonth, setCurrentMonth] = useState(new Date()); 
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window !== 'undefined') {
      return (localStorage.getItem('theme') as 'light' | 'dark') || 
             (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    }
    return 'light';
  });

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme(prev => prev === 'light' ? 'dark' : 'light');
  
  // Data Hooks
  const { activeWorker, activeWorkerId, loading: workerLoading } = useWorker();
  const { getRateForDate, currentRate, loading: ratesLoading } = useWorkerRates(activeWorkerId);
  const { collections, saveCollection, loading: collectionsLoading, refresh: refreshCollections } = useCollections(currentMonth, activeWorkerId);
  const { surplus, syncSurplusToDb, refresh: refreshSurplus } = useSurplus(activeWorkerId, currentMonth);
  const { expenses, addExpense, updateExpense, addBulkExpenses, refresh: refreshExpenses, loading: expensesLoading } = useExpenses(currentMonth, activeWorkerId);
  const { addSettlement, settlements, allocations, loading: settlementsLoading } = useSettlements(currentMonth, activeWorkerId);
  
  // Expense Payments logic
  const expenseIds = useMemo(() => expenses.map(e => e.id), [expenses]);
const {
  payments: expensePayments,
  addPayment,
  refresh: refreshExpensePayments,
} = useExpensePayments(expenseIds, activeWorkerId);
  // Global Debt logic
  const {
    incomeDebt,
    expenseDebt: serverExpenseDebt,
    unallocatedCredit,
    refresh: refreshGlobalDebt,
  } = useGlobalDebt(activeWorkerId);

  const {
    notes: monthlyNotes,
    loading: notesLoading,
    addNote,
    toggleNote,
    updateNoteText,
    deleteNote
  } = useMonthlyNotes(activeWorkerId, currentMonth);

// ⚡ OPTIMISTIC STATE
const [optimisticExpenseDebt, setOptimisticExpenseDebt] = useState<
  typeof serverExpenseDebt
>([]);
useEffect(() => {
  setOptimisticExpenseDebt(serverExpenseDebt);
}, [serverExpenseDebt]);
  // Modals State
  const [isCollectionModalOpen, setCollectionModalOpen] = useState(false);
  const [isSettlementModalOpen, setSettlementModalOpen] = useState(false);
 
  const [isDebtExplorerOpen, setDebtExplorerOpen] = useState(false);
  const [isExpensePaymentOpen, setExpensePaymentOpen] = useState(false);
  const [isExpenseModalOpen, setExpenseModalOpen] = useState(false);
  const [isBulkModalOpen, setBulkModalOpen] = useState(false);
  const [isHistorySidebarOpen, setHistorySidebarOpen] = useState(false);
  const [isWorkerModalOpen, setWorkerModalOpen] = useState(false);
  const [isNotesPanelOpen, setNotesPanelOpen] = useState(false);
  const [settlementPrefill, setSettlementPrefill] = useState<number | undefined>(undefined);
  const [historyTarget, setHistoryTarget] = useState<{ type: 'DAILY_COLLECTION' | 'WEEKLY_EXPENSE'; id: string; title: string; subtitle: string } | null>(null);
  
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);
  const [selectedWeekStart, setSelectedWeekStart] = useState<Date | null>(null);
  const [selectedExpense, setSelectedExpense] = useState<WeeklyExpense | null>(null);

const [optimisticIncomeDebt, setOptimisticIncomeDebt] = useState<
  typeof incomeDebt
>([]);

useEffect(() => {
  setOptimisticIncomeDebt(incomeDebt);
}, [incomeDebt]);

  const handleQuickFullPay = (day: Date) => {
  const existing = collections.find(
    c => c.date === format(day, 'yyyy-MM-dd')
  );

  const expected = existing?.expected_amount ?? getRateForDate(day);

  saveCollection(day, {
    collected_amount: expected,
    expected_amount: expected,
    status: 'FULL',
    notes: 'Auto-marked as fully paid'
  });
};
  // Derived Summary
  const summary = useMemo<MonthSummary>(() => {
    // 1. Total Expected (Sum of daily expected amounts for ALL days in month)
    const daysInMonth = Array.from({ length: endOfMonth(currentMonth).getDate() }, (_, i) => {
        const d = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), i + 1);
        return format(d, 'yyyy-MM-dd');
    });

    // 1a. Monthly Expected (Contractual Ceiling)
    // Sum of historical rates for EVERY day in the month. 
    // This represents the maximum possible income if every day was worked.
    const total_expected = daysInMonth.reduce((sum, dateStr) => {
       return sum + getRateForDate(new Date(dateStr));
    }, 0);

    // 1b. Worked Expected (Actual Attendance-Based Target)
    // Sum of targets only for days where work actually happened (Full or Partial).
    const worked_expected = collections.reduce((sum, c) => {
        if (c.status === 'FULL' || c.status === 'PARTIAL') {
             return sum + (c.expected_amount || 0);
        }
        return sum;
    }, 0); 
    
    // 2. Total Collected ON DAYS (Raw daily income)
    const daily_collected = collections.reduce((sum, c) => sum + (c.collected_amount || 0), 0);
    
    // 3. Settlements Received (Late payments applied to this month)
    const settled_amount = settlements.reduce((sum, s) => sum + (s.amount || 0), 0);
    
    // 4. Surplus Calculation (Per Spec Section 4 & 2.B)
    // Surplus = sum of (collected - expected) for days where collected > expected
    // Working days: Surplus is anything above the rate.
    // Non-working days: All collected amount is surplus.
    const surplus_total = collections.reduce((sum, c) => {
        const expected = c.expected_amount || 0;
        const collected = c.collected_amount || 0;
        if (collected > expected) {
            return sum + (collected - expected);
        }
        return sum;
    }, 0);
    
    // Calculate already allocated surplus from settlements
    const allocatedFromSurplus = (allocations || []).reduce((sum, a) => sum + a.allocated_amount, 0);
    const surplus_unallocated = Math.max(0, surplus_total - allocatedFromSurplus);

    // 5. Total Monthly Collected (Daily income only, settlements are separate)
    // Per spec: monthly_collected = sum(collected_amount) + sum(settlements.amount)
    const total_collected = daily_collected + settled_amount;
    
    // 6. Net Outstanding (True deficit based on worked days)
    // Per spec: outstanding = expected - collected - settlements
    const gross_outstanding = Math.max(0, worked_expected - daily_collected);
    const net_outstanding = Math.max(0, gross_outstanding - settled_amount);

    // 1c. Attendance Breakdown
    const attendance = collections.reduce((acc, c) => {
        if (c.status === 'FULL') acc.full++;
        else if (c.status === 'PARTIAL') acc.partial++;
        else if (c.status === 'MISSED') acc.missed++;
        return acc;
    }, { full: 0, partial: 0, missed: 0 });
    
    // Add empty days to missed count
    const daysInMonthCount = endOfMonth(currentMonth).getDate();
    attendance.missed += (daysInMonthCount - collections.length);

    const expense_debt = expenses.reduce((sum, e) => {
      const paid = expensePayments
        .filter(p => p.expense_id === e.id)
        .reduce((pSum, p) => pSum + p.amount, 0);
      return sum + (e.amount - paid);
    }, 0);

    return {
      month: format(currentMonth, 'yyyy-MM'),
      total_expected,
      total_collected,
      gross_outstanding,
      settled_amount,
      net_outstanding,
      income_debt: net_outstanding,
      expense_debt,
      total_debt: net_outstanding + expense_debt,
      worked_expected,
      surplus_total,
      surplus_unallocated,
      attendance
    };
  }, [collections, settlements, currentMonth, expenses, expensePayments, allocations]);

  const handlePrevMonth = () => setCurrentMonth(prev => subMonths(prev, 1));
  const handleNextMonth = () => setCurrentMonth(prev => addMonths(prev, 1));

  const handleDayClick = async (date: Date) => {
    const existing = collections.find(c => c.date === format(date, 'yyyy-MM-dd'));
    
    // UX RULE: One-click full collection for "Today" if no data exists
    if (isToday(date) && !existing) {
        try {
            const amount = getRateForDate(date);
            await saveCollection(date, {
                collected_amount: amount, 
                status: 'FULL',
                notes: 'Quick check',
                expected_amount: amount
            });
            refreshGlobalDebt();
            return;
        } catch (e) {
            console.error('Failed quick save');
        }
    }

    // Default to opening modal
    setSelectedDay(date);
    setCollectionModalOpen(true);
  };

  const handleSaveCollection = async (data: { 
    collected_amount: number; 
    status: CollectionStatus; 
    notes: string;
    expected_amount: number;
    is_expected_override?: boolean;
  }) => {
    if (!selectedDay) return;
    try {
        await saveCollection(selectedDay, data);
        await syncSurplusToDb();
        refreshSurplus();
        setCollectionModalOpen(false);
        refreshGlobalDebt();
    } catch (e) {
        alert('Failed to save collection');
    }
  };

  const handleSaveSettlement = async (amount: number, notes: string, source: 'SURPLUS' | 'CASH' | 'OTHER' = 'CASH') => {
      try {
        const options: any = { source };
        if (source === 'SURPLUS' && surplus?.id) {
          options.sourceReferenceId = surplus.id;
        }

        await addSettlement(amount, format(currentMonth, 'yyyy-MM'), notes, options);
        
        // Refresh local data
        refreshSurplus();
        refreshCollections(); 
        setSettlementModalOpen(false);
        refreshGlobalDebt();
      } catch (e) {
          alert('Failed to save settlement');
      }
  };

  const handleAddExpense = (weekStart: Date) => {
    setSelectedWeekStart(weekStart);
    setExpenseModalOpen(true);
  };

const handleAddExpenseItem = async (amount: number, category: string) => {
  if (!selectedWeekStart) return;

  try {
    await addExpense(selectedWeekStart, amount, category);

    // 🔥 REQUIRED — this fixes single add
    await refreshExpenses();

    setExpenseModalOpen(false);
    refreshGlobalDebt();
  } catch (e) {
    console.error(e);
    alert('Failed to add expense');
  }
};



  const handleUpdateExpenseItem = async (id: string, amount: number, category: string) => {
    try {
      await updateExpense(id, amount, category);
      setExpenseModalOpen(false);
      refreshGlobalDebt();
    } catch (e) {
      alert('Failed to update expense');
    }
  };

  const handleBulkAddExpense = async (data: { amount: number; category: string; selectedWeeks: Date[]; markAsPaid: boolean }) => {
    try {
      const newExpenses = await addBulkExpenses(data.selectedWeeks, data.amount, data.category);
      
      if (data.markAsPaid) {
        for (const exp of newExpenses) {
          await addPayment(exp.id, exp.amount, 'Marked as paid in bulk');
        }
      }
      
      refreshGlobalDebt();
    } catch (e) {
      alert('Failed to add bulk expenses');
    }
  };

  const handleOpenHistory = (type: 'DAILY_COLLECTION' | 'WEEKLY_EXPENSE', id: string, title: string, subtitle: string) => {
    setHistoryTarget({ type, id, title, subtitle });
    setHistorySidebarOpen(true);
  };

  const handlePayExpense = (expense: WeeklyExpense) => {
    setSelectedExpense(expense);
    setExpensePaymentOpen(true);
  };

  const handleSaveExpensePayment = async (amount: number, notes: string) => {
    if (!selectedExpense) return;
    try {
      await addPayment(selectedExpense.id, amount, notes);
      setExpensePaymentOpen(false);
      refreshGlobalDebt();
    } catch (e) {
      alert('Failed to record expense payment');
    }
  };

const payExpenseFully = async (expense: {
  id: string;
  amount: number;
  category: string;
}) => {
  // 🔥 1. OPTIMISTIC REMOVE
  setOptimisticExpenseDebt(prev =>
    prev.filter(e => e.id !== expense.id)
  );

  try {
    const paid = expensePayments
      .filter(p => p.expense_id === expense.id)
      .reduce((sum, p) => sum + p.amount, 0);

    const remaining = expense.amount - paid;
    if (remaining <= 0) return;

    await addPayment(
      expense.id,
      remaining,
      `Auto full payment for ${expense.category}`
    );

    // 🔄 sync truth
    await refreshExpensePayments();
    await refreshGlobalDebt();
  } catch (err) {
    // ❌ ROLLBACK on failure
    setOptimisticExpenseDebt(serverExpenseDebt);
    alert('Payment failed. Please try again.');
  }
};
const onInstantPayIncome = async (date: string, amount: number) => {
  // ⚡ 1. OPTIMISTIC REMOVE
  setOptimisticIncomeDebt(prev =>
    prev.filter(d => d.date !== date)
  );

  try {
    const monthKey = format(new Date(date), 'yyyy-MM');

    await addSettlement(
      amount,
      monthKey,
      `Auto full settlement on ${format(new Date(), 'MMM dd, yyyy')}`
    );

    // 🔄 sync with backend truth
    await refreshGlobalDebt();
    await refreshCollections();
  } catch (err) {
    console.error('Instant income settlement failed', err);

    // ❌ rollback on failure
    setOptimisticIncomeDebt(incomeDebt);
    alert('Failed to settle income. Please try again.');
  }
};

  return (
    <>
      <AdminModeBanner />
      <Layout>
        <header className="mb-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-4xl font-black tracking-tighter text-main mb-1">
              Agent Tracker
            </h1>
            <div className="flex items-center gap-3 ">
              <p className="dark:text-sky-500/80 font-medium ">Daily Tracking System</p>
              <span className="w-1 h-1 bg-primary/30 rounded-full" />
              <p className="text-primary font-black text-xs uppercase tracking-widest dark:text-sky-500">{format(new Date(), 'EEEE, MMMM do')}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button 
                onClick={toggleTheme}
                className="p-2.5 glass-button rounded-full transition-premium flex items-center justify-center"
                aria-label="Toggle Theme"
            >
                {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
            </button>

            <WorkerSwitcher onOpenManagement={() => setWorkerModalOpen(true)} />

            <button 
                onClick={() => setDebtExplorerOpen(true)}
                className="px-6 py-2.5 glass-button rounded-full font-bold text-sm transition-premium"
            >
                Financial Health
            </button>
            <button 
                onClick={() => setSettlementModalOpen(true)}
                className=" text-xs px-6 py-2.5 bg-primary text-white rounded-full font-bold text-sm shadow-premium hover:shadow-premium-hover transition-premium hover:-translate-y-0.5 active:translate-y-0"
            >
                Settle Past Debt
            </button>
          </div>
        </header>

        <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between mb-8">
          <div className="flex-1">
            <MonthNavigation 
              currentMonth={currentMonth}
              onPrevMonth={handlePrevMonth}
              onNextMonth={handleNextMonth}
              onOpenNotes={() => setNotesPanelOpen(true)}
              uncheckedNotesCount={monthlyNotes.filter(n => !n.is_checked).length}
            />
          </div>
          <button
            onClick={() => setBulkModalOpen(true)}
            className="border-gray-600 text-sky-500 dark:hover:text-sky-500/80 dark:hover:border-sky-500/80 md:mb-8 flex items-center justify-center gap-3 px-8 py-5 bg-white  border-2 border-primary/10 rounded-3xl font-black text-xs uppercase tracking-widest  transition-premium shadow-premium hover:shadow-premium-hover hover:-translate-y-1"
          >
            <Calendar size={18} strokeWidth={3} />
            Add Weekly Expense for Month
          </button>
        </div>

        <MonthlySummary
    summary={summary}
    collections={collections || []}
    expenses={expenses || []}
    settlements={settlements || []}
    allocations={allocations || []}
    expensePayments={expensePayments || []}
    isLoading={workerLoading || collectionsLoading || expensesLoading || settlementsLoading}
    workerName={activeWorker?.name || 'Worker'}
    workerId={activeWorkerId || undefined}
    currentRate={currentRate}
  />


        <div id='monthly-summary' className="mt-8">
          <DailyGrid 
            currentMonth={currentMonth}
            collections={collections}
            expenses={expenses}
            settlements={settlements}
            allocations={allocations}
            expensePayments={expensePayments}
            onDayClick={handleDayClick}
            onQuickFullPay={handleQuickFullPay}
            onAddExpense={handleAddExpense}
            onPayExpense={handlePayExpense}
            onViewHistory={handleOpenHistory}
            getRateForDate={getRateForDate}
            isLoading={workerLoading || collectionsLoading || expensesLoading || ratesLoading}
          />
        </div>

        <CollectionModal 
          isOpen={isCollectionModalOpen}
          onClose={() => setCollectionModalOpen(false)}
          day={selectedDay || new Date()}
          expectedAmount={selectedDay ? getRateForDate(selectedDay) : 100}
          existingData={selectedDay ? collections.find(c => c.date === format(selectedDay, 'yyyy-MM-dd')) : undefined}
          onSave={handleSaveCollection}
          allocatedAmount={(() => {
            const col = selectedDay ? collections.find(c => c.date === format(selectedDay, 'yyyy-MM-dd')) : null;
            return (col && allocations) 
              ? allocations.filter(a => a.collection_id === col.id).reduce((sum, a) => sum + a.allocated_amount, 0)
              : 0;
          })()}
          isSettled={(() => {
            const col = selectedDay ? collections.find(c => c.date === format(selectedDay, 'yyyy-MM-dd')) : null;
            if (!col) return false;
            const allocated = allocations.filter(a => a.collection_id === col.id).reduce((sum, a) => sum + a.allocated_amount, 0);
            return (col.expected_amount - col.collected_amount) > 0 && allocated >= (col.expected_amount - col.collected_amount) - 0.01;
          })()}
        />

        <SettlementModal
          isOpen={isSettlementModalOpen}
          onClose={() => {
            setSettlementModalOpen(false);
            setSettlementPrefill(undefined);
          }}
          monthName={format(currentMonth, 'MMMM yyyy')}
          outstandingAmount={summary.net_outstanding}
          surplusAvailable={summary.surplus_unallocated}
          initialAmount={settlementPrefill}
          onSave={handleSaveSettlement}
        />

  <DebtExplorer
    isOpen={isDebtExplorerOpen}
    onClose={() => setDebtExplorerOpen(false)}
    incomeDebt={optimisticIncomeDebt}
    expenseDebt={optimisticExpenseDebt}
    unallocatedCredit={unallocatedCredit}
    onSettle={() => {
      setSettlementPrefill(undefined);
      setSettlementModalOpen(true);
    }}
    onSettleItem={(date, amount) => {
    setDebtExplorerOpen(false);        
    setCurrentMonth(new Date(date));
    setSettlementPrefill(amount);
    setSettlementModalOpen(true);      
  }}
    onInstantPayIncome={onInstantPayIncome}
    onPayExpenseFully={payExpenseFully}
  />

        {selectedWeekStart && (
          <ExpenseModal 
            isOpen={isExpenseModalOpen}
            onClose={() => setExpenseModalOpen(false)}
            weekStart={selectedWeekStart}
            expenses={expenses.filter(e => e.week_start_date === format(selectedWeekStart, 'yyyy-MM-dd'))}
            onAdd={handleAddExpenseItem}
            onUpdate={handleUpdateExpenseItem}
          />
        )}

        {selectedExpense && (
          <ExpensePaymentModal 
            isOpen={isExpensePaymentOpen}
            onClose={() => setExpensePaymentOpen(false)}
            expense={selectedExpense}
            paidAmount={expensePayments.filter(p => p.expense_id === selectedExpense.id).reduce((sum, p) => sum + p.amount, 0)}
            onSave={handleSaveExpensePayment}
          />
        )}

        <BulkExpenseModal 
          isOpen={isBulkModalOpen}
          onClose={() => setBulkModalOpen(false)}
          currentMonth={currentMonth}
          onAddBulk={handleBulkAddExpense}
        />

        {historyTarget && (
          <HistorySidebar 
            isOpen={isHistorySidebarOpen}
            onClose={() => setHistorySidebarOpen(false)}
            entityType={historyTarget.type}
            entityId={historyTarget.id}
            title={historyTarget.title}
            subtitle={historyTarget.subtitle}
          />
        )}

        <WorkerModal 
          isOpen={isWorkerModalOpen}
          onClose={() => setWorkerModalOpen(false)}
        />

        <MonthlyNotesPanel 
          isOpen={isNotesPanelOpen}
          onClose={() => setNotesPanelOpen(false)}
          notes={monthlyNotes}
          month={currentMonth}
          onAdd={addNote}
          onToggle={toggleNote}
          onUpdateText={updateNoteText}
          onDelete={deleteNote}
          isLoading={notesLoading}
        />

        {/* <DBTester /> */}
      </Layout>
    </>
  );
}
