import React, { useState } from 'react';
import { X, Calendar, CheckSquare, Square } from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachWeekOfInterval, isSameMonth } from 'date-fns';
import clsx from 'clsx';

interface BulkExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentMonth: Date;
  onAddBulk: (data: { amount: number; category: string; selectedWeeks: Date[]; markAsPaid: boolean }) => Promise<void>;
}

export const BulkExpenseModal: React.FC<BulkExpenseModalProps> = ({
  isOpen,
  onClose,
  currentMonth,
  onAddBulk,
}) => {
  const [amount, setAmount] = useState('50');
  const [category, setCategory] = useState('Rent');
  const [markAsPaid, setMarkAsPaid] = useState(false);
  
  // Calculate weeks for the month
  const start = startOfMonth(currentMonth);
  const end = endOfMonth(currentMonth);
  const weeks = eachWeekOfInterval({ start, end });
  
  const [selectedWeeks, setSelectedWeeks] = useState<Date[]>(weeks);

  if (!isOpen) return null;

  const toggleWeek = (week: Date) => {
    setSelectedWeeks(prev => 
      prev.some(w => w.getTime() === week.getTime())
        ? prev.filter(w => w.getTime() !== week.getTime())
        : [...prev, week]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const num = parseFloat(amount);
    if (num > 0 && selectedWeeks.length > 0) {
      await onAddBulk({
        amount: num,
        category,
        selectedWeeks,
        markAsPaid
      });
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[#0f172a]/40 backdrop-blur-md" onClick={onClose} />
      <div className="relative glass rounded-[2.5rem] shadow-premium max-w-lg w-full overflow-hidden animate-in fade-in zoom-in duration-300">
        <div className="flex justify-between items-center p-8 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-xl">
              <Calendar size={18} className="text-primary" />
            </div>
            <div>
              <h3 className="text-2xl font-black tracking-tighter text-main">Bulk Weekly Expense</h3>
              <p className="text-[10px] font-bold text-sub uppercase tracking-widest">{format(currentMonth, 'MMMM yyyy')}</p>
            </div>
          </div>
          <button onClick={onClose} aria-label="Close" className="p-2 hover:bg-primary/5 rounded-full transition-premium text-sub">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 pt-4 space-y-8">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-sub uppercase tracking-widest ml-1">Amount per week</label>
              <div className="relative group">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg font-bold text-sub">$</span>
                <input
                  type="number"
                  required
                  step="0.01"
                  aria-label="Amount per week"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full pl-9 pr-4 py-3 bg-primary/5 border-2 border-transparent focus:border-sky-500 rounded-2xl outline-none transition-premium text-lg font-bold text-main"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-sub uppercase tracking-widest ml-1">Category</label>
              <input
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className=" w-full px-5 py-3 bg-primary/5 border-2 border-transparent focus:border-sky-500 rounded-2xl outline-none transition-premium text-sm font-bold text-main"
                placeholder="Category..."
              />
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-xs font-bold text-sub uppercase tracking-widest ml-1">Select Weeks</label>
            <div className="grid grid-cols-1 gap-2 ">
              {weeks.map((week, idx) => {
                const isSelected = selectedWeeks.some(w => w.getTime() === week.getTime());
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => toggleWeek(week)}
                    className={clsx(
                      " flex justify-between items-center p-4 rounded-2xl border-2 transition-premium ",
                      isSelected ? "dark:text-sky-500 dark:border-sky-500/20 bg-primary/5 border-primary text-primary" : "bg-primary/5 border-transparent text-sub"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      {isSelected ? <CheckSquare size={16} /> : <Square size={16} />}
                      <span className="text-sm font-black uppercase tracking-tight">Week {idx + 1}</span>
                    </div>
                    <span className="text-[10px] font-bold opacity-60">{format(week, 'MMM do')}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-4">
            <button
              type="button"
              onClick={() => setMarkAsPaid(!markAsPaid)}
              className={clsx(
                "w-full flex justify-between items-center p-4 rounded-2xl border-2 transition-premium",
                markAsPaid ? "bg-success/10 border-success text-success" : "bg-primary/5 border-transparent text-sub"
              )}
            >
              <div className="flex flex-col items-start">
                <span className="text-xs font-black uppercase tracking-widest">Mark as Paid Today</span>
                <span className="text-[10px] font-medium opacity-60">Creates payment records automatically</span>
              </div>
              <div className={clsx(
                "w-10 h-6 rounded-full relative transition-premium",
                markAsPaid ? "bg-success" : "bg-primary/20"
              )}>
                <div className={clsx(
                  "absolute top-1 w-4 h-4 bg-white rounded-full transition-premium shadow-sm",
                  markAsPaid ? "left-5" : "left-1"
                )} />
              </div>
            </button>
          </div>

          <div className="flex gap-4">
            <button
              type="button"
              onClick={onClose}
              className="bg-primary/5 hover:bg-primary/20 rounded-2xl  flex-1 px-6 py-4 text-sub font-bold uppercase tracking-widest text-xs hover:text-main transition-premium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="hover:bg-sky-500  flex-1 px-6 py-4 bg-primary text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-premium hover:shadow-premium-hover transition-premium hover:-translate-y-0.5"
            >
              Add {selectedWeeks.length} Expenses
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
