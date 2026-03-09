import React from 'react';
import { Plus, History as LuHistory } from 'lucide-react';
import clsx from 'clsx';

interface WeeklyExpenseCardProps {
  income: number;
  directIncome?: number;
  settlementIncome?: number;
  expense: number;
  paidAmount: number;
  onAddExpense: () => void;
  onPayExpense: () => void;
  onViewHistory: () => void;
  hasExpense: boolean;
}

export const WeeklyExpenseCard: React.FC<WeeklyExpenseCardProps> = ({
  income,
  directIncome,
  settlementIncome,
  expense,
  paidAmount,
  onAddExpense,
  onPayExpense,
  onViewHistory,
  hasExpense
}) => {
  // const income = collected_amount + settlement_allocations
  
  const net = income - (expense - paidAmount);
  const remainingDebt = expense - paidAmount;

  // Status Logic
  let status: 'NONE' | 'PAID' | 'PARTIAL' | 'MISSED' = 'NONE';
  if (expense > 0) {
    if (paidAmount >= expense) status = 'PAID';
    else if (paidAmount > 0) status = 'PARTIAL';
    else status = 'MISSED';
  }

  const statusStyles = {
    NONE: 'bg-gray-50/30 border-gray-100/50',
    PAID: 'bg-success/5 border-success/20 text-success',
    PARTIAL: 'bg-warning/10 border-warning/20 text-amber-700',
    MISSED: ' bg-danger/5 border-danger/10 text-danger'
  };

  return (
    <div className={clsx(
      " mt-4 pt-4 border-2 rounded-[2rem] p-5 transition-premium hover:shadow-md shadow-xl hover:shadow-cyan-500 relative group/card border-gray-800/20  ",
      statusStyles[status]
    )}>
      {hasExpense && (
        <button
          onClick={(e) => { e.stopPropagation(); onViewHistory(); }}
          className="absolute top-4 right-4 p-2 hover:bg-black/5 rounded-xl text-current opacity-20 group-hover/card:opacity-100 transition-premium"
          title="View Expense History"
        >
          <LuHistory size={14} />
        </button>
      )}
      <div className="space-y-2 text-[10px] font-bold uppercase tracking-wider">
        <div className="flex justify-between items-center opacity-60">
          <span>Income</span>
          <div className="flex flex-col items-end">
             <span className="font-black">${income.toLocaleString()}</span>
             {(settlementIncome !== undefined && settlementIncome > 0) && (
               <span className="text-[8px] text-teal-600 font-medium">Incl. ${settlementIncome.toLocaleString()} settled</span>
             )}
          </div>
        </div>
        <div className="flex justify-between items-center">
          <span>Expense</span>
          <span className="font-black tracking-tighter">-${expense.toLocaleString()}</span>
        </div>
        {expense > 0 && (
          <div className="flex justify-between items-center border-t border-current/10 pt-2 mt-1">
            <span>Paid</span>
            <span className="font-black">${paidAmount.toLocaleString()}</span>
          </div>
        )}
        <div className="pt-2 border-t border-current/20 flex justify-between items-baseline mt-2">
            <span className="opacity-60">Week Net</span>
            <span className={clsx(
              "text-lg font-black tracking-tight",
              net >= 0 ? 'text-success' : 'text-danger'
            )}>
              {net < 0 ? '-' : ''}${Math.abs(net).toLocaleString()}
            </span>
        </div>
      </div>
      
      <div className=" flex gap-2 mt-5">
        <button 
          onClick={onAddExpense}
          className={clsx(
            " dark:hover:bg-blue-500/80 dark:hover:text-white flex-1 flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest py-3 rounded-xl transition-premium border",
            status === 'NONE' ? "bg-primary/5 text-primary border-primary/20 hover:bg-primary/10" : "bg-white/40 border-current/10 hover:bg-white/60"
          )}
        >
          <Plus size={12} strokeWidth={3} />
          {hasExpense ? 'Edit' : 'Add'}
        </button>
        {remainingDebt > 0 && (
          <button 
            onClick={onPayExpense}
            className="flex-[1.2] flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest text-white bg-gray-900 hover:bg-black py-3 rounded-xl transition-premium shadow-sm"
          >
            Pay Now
          </button>
        )}
      </div>
    </div>
  );
};
