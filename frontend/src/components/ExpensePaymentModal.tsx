import React, { useState } from 'react';
import { X, DollarSign } from 'lucide-react';
import clsx from 'clsx';
import { format } from 'date-fns';

interface ExpensePaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  expense: {
    id: string;
    category?: string;
    amount: number;
    week_start_date: string;
  };
  paidAmount: number;
  onSave: (amount: number, notes: string) => void;
}

export const ExpensePaymentModal: React.FC<ExpensePaymentModalProps> = ({
  isOpen,
  onClose,
  expense,
  paidAmount,
  onSave,
}) => {
  const [amount, setAmount] = useState('');
  const [notes, setNotes] = useState('');

  const remaining = expense.amount - paidAmount;

  React.useEffect(() => {
    if (isOpen) {
      setAmount(remaining.toString());
    }
  }, [isOpen, remaining]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    if (numAmount > 0) {
      onSave(numAmount, notes);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[#0f172a]/20 backdrop-blur-sm" onClick={onClose} />
      <div className="relative glass rounded-[2.5rem] shadow-premium max-w-md w-full overflow-hidden animate-in fade-in zoom-in duration-300">
        <div className="flex justify-between items-center p-8 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-xl">
              <DollarSign size={18} className="text-primary" />
            </div>
            <h3 className="text-2xl font-black tracking-tighter text-main">Pay Expense</h3>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-primary/5 rounded-full transition-premium text-sub" aria-label="Close">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 pt-4 space-y-6">
           <div className="bg-primary/5 border border-primary/10 rounded-[1.5rem] p-6 text-center">
               <p className="text-[10px] font-bold text-sub uppercase tracking-[0.2em] mb-1">
                 Remaining for {expense.category || 'Expense'}
               </p>
               <p className="text-4xl font-black text-main tracking-tighter">${remaining.toLocaleString()}</p>
           </div>

           <div className="space-y-2">
             <label className="text-xs font-bold text-sub uppercase tracking-widest ml-1">
               Payment Amount
             </label>
             <div className="relative group">
                <span className="absolute left-5 top-1/2 -translate-y-1/2 text-xl font-bold text-sub group-focus-within:text-primary transition-premium">$</span>
                <input
                  type="number"
                  autoFocus
                  required
                  step="0.01"
                  min="0.01"
                  max={remaining}
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full pl-10 pr-6 py-4 bg-primary/5 border-2 border-transparent focus:border-primary focus:bg-primary/10 rounded-2xl outline-none transition-premium text-xl font-bold text-main tracking-tight"
                  placeholder="0.00"
                />
                <button 
                  type="button"
                  onClick={() => setAmount(remaining.toString())}
                  className="absolute right-4 top-1/2 -translate-y-1/2 px-3 py-1 bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest rounded-lg hover:bg-primary/20 transition-premium"
                >
                  Pay All
                </button>
             </div>
           </div>

           <div className="space-y-2">
             <label className="text-xs font-bold text-sub uppercase tracking-widest ml-1">Notes</label>
             <textarea 
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full p-5 bg-primary/5 border-2 border-transparent focus:border-primary/20 focus:bg-primary/10 rounded-2xl outline-none min-h-[100px] transition-premium text-sm font-medium text-main"
                placeholder="Where did this money come from? (e.g. Personal funds)"
             />
           </div>

            <div className="flex flex-col gap-3 pt-4">
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={onClose}
                   className=" flex-1 px-6 py-4 text-sub font-bold uppercase tracking-widest text-[10px] hover:text-main transition-premium"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onSave(remaining, 'Full Payment');
                    onClose();
                  }}
                  className="flex-[1.5] px-6 py-4 bg-success text-white rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-premium hover:shadow-premium-hover transition-premium hover:-translate-y-0.5"
                >
                  Full Payment (${remaining})
                </button>
              </div>
              <button
                type="submit"
                className="w-full px-6 py-4 bg-primary text-white rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-premium hover:shadow-premium-hover transition-premium hover:-translate-y-0.5 active:translate-y-0"
              >
                Record Partial Payment
              </button>
            </div>
        </form>
      </div>
    </div>
  );
};
