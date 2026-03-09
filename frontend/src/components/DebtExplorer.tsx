import React, { useState } from 'react';
import { AlertCircle, ChevronDown, ChevronRight, PieChart, DollarSign, X } from 'lucide-react';
import clsx from 'clsx';

import { format } from 'date-fns';

interface ExpenseDebtItem {
  id: string;
  category: string;
  amount: number;
  date: string;
}
interface DebtExplorerProps {
  isOpen: boolean;
  onClose: () => void;

  incomeDebt: { date: string; amount: number; status?: string }[];
  expenseDebt: ExpenseDebtItem[];

  unallocatedCredit: number;

  onSettle: () => void;
  onSettleItem: (date: string, amount: number) => void;

  // ✅ NEW
  onInstantPayIncome: (date: string, amount: number) => void;

  onPayExpenseFully: (expense: ExpenseDebtItem) => Promise<void>;
}


export const DebtExplorer: React.FC<DebtExplorerProps> = ({
  isOpen,
  onClose,
  incomeDebt,
  expenseDebt,
  unallocatedCredit,
  onSettle,
  onSettleItem,
  onPayExpenseFully,
  onInstantPayIncome
}) => {
  const [incomeExpanded, setIncomeExpanded] = useState(true);
  const [expenseExpanded, setExpenseExpanded] = useState(true);
  const [missedExpanded, setMissedExpanded] = useState(false);

  const partialIncomeDebt = incomeDebt.filter(d => d.status === 'PARTIAL');
  const missedIncomeDebt = incomeDebt.filter(d => d.status !== 'PARTIAL');

  const totalIncomeDebt = incomeDebt.reduce((sum, d) => sum + d.amount, 0);
  const totalExpenseDebt = expenseDebt.reduce((sum, d) => sum + d.amount, 0);
  const totalOutstanding = Math.max(0, totalIncomeDebt + totalExpenseDebt - unallocatedCredit);

  if (!isOpen) return null;
// onPayExpenseFully: (expense: {
//   id: string;
//   amount: number;
//   category: string;
// }) => Promise<void>;


  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end">
      <div className="absolute inset-0 bg-[#0f172a]/20 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative h-full w-full max-w-md glass shadow-premium animate-in slide-in-from-right duration-500 overflow-y-auto">
        <div className="p-8">
          <div className="flex justify-between items-center mb-10">
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-sub mb-1">Financial Health</p>
              <h2 className="text-3xl font-black tracking-tighter text-main">Debt Explorer</h2>
            </div>
            <button onClick={onClose} aria-label="Close" className="p-3 hover:bg-primary/5 rounded-2xl transition-premium text-sub">
              <X size={20} />
            </button>
          </div>

          {/* Total Summary Card */}
          <div className="bg-danger/10 border-2 border-danger/20 p-8 rounded-[2.5rem] mb-10">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-danger/10 rounded-xl text-danger">
                  <AlertCircle size={20} />
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest text-danger/60">Total Outstanding</span>
              </div>
              {totalIncomeDebt > 0 && (
                <button 
                  onClick={() => { onSettle(); onClose(); }}
                  className="px-4 py-1.5 bg-danger text-white rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm hover:shadow-md transition-premium"
                >
                  Settle Now
                </button>
              )}
            </div>
            <p className="text-5xl font-black tracking-tighter text-danger mb-2">
              ${totalOutstanding.toLocaleString()}
            </p>
            <div className="flex flex-col gap-1">
              <p className="text-xs font-bold text-sub">Accumulated across all periods</p>
              {unallocatedCredit > 0 && (
                <p className="text-[10px] font-black uppercase text-success bg-success/10 px-2 py-0.5 rounded self-start">
                  -${unallocatedCredit.toLocaleString()} Unallocated Credit
                </p>
              )}
            </div>
          </div>

          <div className="space-y-8">
            {/* Income Debt Section */}
            <div className="space-y-4">
              <button 
                onClick={() => setIncomeExpanded(!incomeExpanded)}
                className="w-full flex items-center justify-between group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-1.5 bg-success/10 rounded-lg text-success">
                    <DollarSign size={14} strokeWidth={3} />
                  </div>
                  <span className="text-xs font-black uppercase tracking-widest text-sub">Income Gaps</span>
                  <span className="px-2 py-0.5 bg-primary/5 rounded-full text-[10px] font-bold text-sub">
                    {partialIncomeDebt.length} items
                  </span>
                </div>
                {incomeExpanded ? <ChevronDown size={16} className="text-sub" /> : <ChevronRight size={16} className="text-sub" />}
              </button>

              {incomeExpanded && (
                <div className="space-y-3 pl-2">
                  {partialIncomeDebt.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center p-4 bg-primary/5 rounded-2xl border border-primary/10 group hover:bg-primary/10 transition-premium">
                      <div className="flex items-center gap-4">
                        <div className={clsx(
                          "w-2 h-2 rounded-full",
                          item.status === 'PARTIAL' ? 'bg-warning animate-pulse' : 'bg-danger'
                        )} />
                        <div className="flex flex-col">
                          <span className="text-sm font-black text-main">{format(new Date(item.date), 'MMMM do')}</span>
                          <span className={clsx(
                             "text-[10px] font-bold uppercase tracking-widest",
                             item.status === 'PARTIAL' ? 'text-amber-500' : 'text-danger/60'
                          )}>
                            {item.status === 'PARTIAL' ? 'Partial Payment' : 'Missed Entry'}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={clsx(
                          "text-sm font-black",
                          item.status === 'PARTIAL' ? 'text-amber-500' : 'text-danger'
                        )}>${item.amount}</span>
                        <button
                          onClick={() => onSettleItem(item.date, item.amount)}
                          className="cursor-pointer px-3 py-1 bg-success/10 text-success text-[10px] font-black uppercase tracking-widest rounded-lg hover:bg-success/20"
                        >
                          Settle All
                        </button>


                        <button 
onClick={() => onInstantPayIncome(item.date, item.amount)}
                          // className="px-3 py-1 bg-success text-white text-[10px] font-black uppercase tracking-widest rounded-lg hover:shadow-md transition-premium"
  className="cursor-pointer hover:bg-blue-500 px-3 py-1 bg-success text-white text-[10px] font-black uppercase tracking-widest rounded-lg hover:shadow-md transition-premium"

>
                          insta Pay
                        </button>
                      </div>
                    </div>
                  ))}
                  {incomeDebt.length === 0 && (
                    <p className="text-xs font-medium text-sub italic py-4">No income debt. Great job!</p>
                  )}
                </div>
              )}
            </div>

            {/* Expense Debt Section */}
            <div className="space-y-4">
              <button 
                onClick={() => setExpenseExpanded(!expenseExpanded)}
                className="w-full flex items-center justify-between group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-1.5 bg-warning/10 rounded-lg text-warning">
                    <PieChart size={14} strokeWidth={3} />
                  </div>
                  <span className="text-xs font-black uppercase tracking-widest text-sub">Unpaid Expenses</span>
                  <span className="px-2 py-0.5 bg-primary/5 rounded-full text-[10px] font-bold text-sub">
                    {expenseDebt.length} items
                  </span>
                </div>
                {expenseExpanded ? <ChevronDown size={16} className="text-sub" /> : <ChevronRight size={16} className="text-sub" />}
              </button>

              {expenseExpanded && (
                <div className="space-y-3 pl-2">
                  {expenseDebt.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center p-4 bg-primary/5 rounded-2xl border border-primary/10 hover:bg-primary/10 transition-premium">
                      <div className="flex flex-col">
                        <span className="text-sm font-black text-main">{item.category}</span>
                        <span className="text-[10px] font-bold text-sub uppercase tracking-widest">Week of {format(new Date(item.date), 'MMM do')}</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-sm font-black text-danger/80">${item.amount}</span>
<button
  onClick={() => onPayExpenseFully(item)}
  className="cursor-pointer hover:bg-blue-500 px-3 py-1 bg-success text-white text-[10px] font-black uppercase tracking-widest rounded-lg"
>
  Pay All
</button>
                      </div>
                    </div>
                  ))}
                  {expenseDebt.length === 0 && (
                    <p className="text-xs font-medium text-sub italic py-4">All expenses are paid.</p>
                  )}
                </div>
              )}
            </div>

            {/* Missed Work Days Section (Auto-closed) */}
            <div className="space-y-4">
              <button 
                onClick={() => setMissedExpanded(!missedExpanded)}
                className="w-full flex items-center justify-between group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-1.5 bg-danger/10 rounded-lg text-danger">
                    <X size={14} strokeWidth={3} />
                  </div>
                  <span className="text-xs font-black uppercase tracking-widest text-sub">Missed Work Days</span>
                  <span className="px-2 py-0.5 bg-primary/5 rounded-full text-[10px] font-bold text-sub">
                    {missedIncomeDebt.length} items
                  </span>
                </div>
                {missedExpanded ? <ChevronDown size={16} className="text-sub" /> : <ChevronRight size={16} className="text-sub" />}
              </button>

              {missedExpanded && (
                <div className="space-y-3 pl-2">
                  {missedIncomeDebt.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center p-4 bg-primary/5 rounded-2xl border border-primary/10 group hover:bg-primary/10 transition-premium">
                      <div className="flex items-center gap-4">
                        <div className="w-2 h-2 rounded-full bg-danger" />
                        <div className="flex flex-col">
                          <span className="text-sm font-black text-main">{format(new Date(item.date), 'MMMM do')}</span>
                          <span className="text-[10px] font-bold uppercase tracking-widest text-danger/60">Missed Entry</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-black text-danger">${item.amount}</span>
                        <button
                          onClick={() => onSettleItem(item.date, item.amount)}
                          className="cursor-pointer px-3 py-1 bg-success/10 text-success text-[10px] font-black uppercase tracking-widest rounded-lg hover:bg-success/20"
                        >
                          Settle
                        </button>
                        <button 
                          onClick={() => onInstantPayIncome(item.date, item.amount)}
                          className="cursor-pointer hover:bg-blue-500 px-3 py-1 bg-success text-white text-[10px] font-black uppercase tracking-widest rounded-lg hover:shadow-md transition-premium"
                        >
                          insta Pay
                        </button>
                      </div>
                    </div>
                  ))}
                  {missedIncomeDebt.length === 0 && (
                    <p className="text-xs font-medium text-sub italic py-4">No missed days. All shifts accounted for.</p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
