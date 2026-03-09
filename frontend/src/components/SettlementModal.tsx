import React, { useState } from 'react';
import { X, Calendar, Wallet, TrendingUp, CreditCard } from 'lucide-react';
import clsx from 'clsx';
import { useEffect } from 'react';
import { format } from 'date-fns';
import { type SettlementSource } from '../types';

interface SettlementModalProps {
  isOpen: boolean;
  onClose: () => void;
  monthName: string; // e.g., "March 2026"
  outstandingAmount: number;
  surplusAvailable: number; // Unallocated surplus from this or previous months
  initialAmount?: number;
  onSave: (amount: number, notes: string, source: SettlementSource) => void;
}


export const SettlementModal: React.FC<SettlementModalProps> = ({
  isOpen,
  onClose,
  monthName,
  outstandingAmount,
  surplusAvailable = 0,
  initialAmount,
  onSave,
}) => {
  // ✅ HOOKS — ALWAYS, EVERY RENDER
  const [amount, setAmount] = useState('');
  const [notes, setNotes] = useState('');
  const [source, setSource] = useState<SettlementSource>('CASH');

  useEffect(() => {
    if (!isOpen) return;

    setAmount(initialAmount ? initialAmount.toString() : '');
    
    // Default to SURPLUS if available and covers the outstanding
    if (surplusAvailable >= outstandingAmount && surplusAvailable > 0) {
      setSource('SURPLUS');
    } else {
      setSource('CASH');
    }

    if (initialAmount === outstandingAmount) {
      setNotes(
        `Auto full settlement on ${format(new Date(), 'MMM dd, yyyy')} (${monthName})`
      );
    } else {
      setNotes('');
    }
  }, [isOpen, initialAmount, outstandingAmount, monthName, surplusAvailable]);

  // ✅ RETURN AFTER HOOKS
  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    if (numAmount > 0) {
      // Validate: if using SURPLUS, can't exceed available
      if (source === 'SURPLUS' && numAmount > surplusAvailable) {
        alert(`Only $${surplusAvailable} surplus available. Use CASH for the remainder.`);
        return;
      }
      onSave(numAmount, notes, source);
      onClose();
    }
  };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[#0f172a]/20 backdrop-blur-sm" onClick={onClose} />
      <div className="relative glass rounded-[2.5rem] shadow-premium max-w-md w-full overflow-hidden animate-in fade-in zoom-in duration-300">
        <div className="flex justify-between items-center p-8 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-success/10 rounded-xl">
              <Calendar size={18} className="text-success" />
            </div>
            <h3 className="text-2xl font-black tracking-tighter text-main">Settle Balance</h3>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-primary/5 rounded-full transition-premium text-sub" aria-label="Close">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 pt-4 space-y-6">
           <div className="bg-amber-500/10 border border-amber-500/20 rounded-[1.5rem] p-6 text-center">
               <p className="text-[10px] font-bold text-amber-500 uppercase tracking-[0.2em] mb-1">Outstanding from {monthName}</p>
               <p className="text-4xl font-black text-amber-600 tracking-tighter">${outstandingAmount.toLocaleString()}</p>
           </div>

           <div className="space-y-2">
             <label className="text-xs font-bold text-sub uppercase tracking-widest ml-1">
               Payment Received Today
             </label>
             <div className="relative group">
                <span className="absolute left-5 top-1/2 -translate-y-1/2 text-xl font-bold text-sub group-focus-within:text-success transition-premium">$</span>
                <input
                  type="number"
                  autoFocus
                  required
                  step="0.01"
                  min="0.01"
                  max={outstandingAmount}
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full pl-10 pr-6 py-4 bg-primary/5 border-2 border-transparent focus:border-success focus:bg-primary/10 rounded-2xl outline-none transition-premium text-xl font-bold text-main tracking-tight"
                  placeholder="0.00"
                />
                <button 
                  type="button"
                  onClick={() => setAmount(outstandingAmount.toString())}
                  className="absolute right-4 top-1/2 -translate-y-1/2 px-3 py-1 bg-success/10 text-success text-[10px] font-black uppercase tracking-widest rounded-lg hover:bg-success/20 transition-premium"
                >
                  Settle All
                </button>
             </div>
             {amount && parseFloat(amount) > 0 && (
                <p className="text-[10px] font-bold text-sub mt-2 ml-1 uppercase tracking-widest">
                  Remaining after payment: <span className="text-success">${Math.max(0, outstandingAmount - parseFloat(amount)).toLocaleString()}</span>
                </p>
              )}
           </div>

           <div className="space-y-3">
              <label className="text-xs font-bold text-sub uppercase tracking-widest ml-1">Payment Source</label>
              <div className="grid grid-cols-3 gap-3">
                  <button
                    type="button"
                    onClick={() => setSource('SURPLUS')}
                    disabled={surplusAvailable <= 0}
                    className={clsx(
                      "p-4 rounded-2xl border-2 text-center transition-premium",
                      source === 'SURPLUS' 
                        ? "border-cyan-500 bg-cyan-500/10" 
                        : "border-transparent bg-primary/5",
                      surplusAvailable <= 0 && "opacity-40 cursor-not-allowed"
                    )}
                  >
                    <TrendingUp size={20} className={clsx("mx-auto mb-2", source === 'SURPLUS' ? "text-cyan-500" : "text-sub")} />
                    <span className={clsx("block text-[10px] font-black uppercase tracking-wider", source === 'SURPLUS' ? "text-cyan-500" : "text-sub")}>Surplus</span>
                    <span className="block text-[9px] text-sub mt-1">${surplusAvailable.toFixed(0)} available</span>
                  </button>
                  
                  <button
                    type="button"
                    onClick={() => setSource('CASH')}
                    className={clsx(
                      "p-4 rounded-2xl border-2 text-center transition-premium",
                      source === 'CASH' 
                        ? "border-success bg-success/10" 
                        : "border-transparent bg-primary/5"
                    )}
                  >
                    <Wallet size={20} className={clsx("mx-auto mb-2", source === 'CASH' ? "text-success" : "text-sub")} />
                    <span className={clsx("block text-[10px] font-black uppercase tracking-wider", source === 'CASH' ? "text-success" : "text-sub")}>Cash</span>
                    <span className="block text-[9px] text-sub mt-1">Direct Payment</span>
                  </button>
                  
                  <button
                    type="button"
                    onClick={() => setSource('OTHER')}
                    className={clsx(
                      "p-4 rounded-2xl border-2 text-center transition-premium",
                      source === 'OTHER' 
                        ? "border-purple-500 bg-purple-500/10" 
                        : "border-transparent bg-primary/5"
                    )}
                  >
                    <CreditCard size={20} className={clsx("mx-auto mb-2", source === 'OTHER' ? "text-purple-500" : "text-sub")} />
                    <span className={clsx("block text-[10px] font-black uppercase tracking-wider", source === 'OTHER' ? "text-purple-500" : "text-sub")}>Other</span>
                    <span className="block text-[9px] text-sub mt-1">Transfer, etc.</span>
                  </button>
              </div>
           </div>

           <div className="space-y-2">
             <label className="text-xs font-bold text-sub uppercase tracking-widest ml-1">Notes</label>
             <textarea 
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full p-5 bg-primary/5 border-2 border-transparent focus:border-success/20 focus:bg-primary/10 rounded-2xl outline-none min-h-[100px] transition-premium text-sm font-medium text-main"
                placeholder="Receiver name or reference..."
             />
           </div>

           <div className="flex gap-4 pt-4">
             <button
               type="button"
               onClick={onClose}
               className="flex-1 px-6 py-4 text-sub font-bold uppercase tracking-widest text-xs hover:text-main transition-premium"
             >
               Cancel
             </button>
             <button
               type="submit"
               className="flex-1 px-6 py-4 bg-success text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-premium hover:shadow-premium-hover transition-premium hover:-translate-y-0.5"
             >
               Confirm Payment
             </button>
           </div>
        </form>
      </div>
    </div>
  );
};
