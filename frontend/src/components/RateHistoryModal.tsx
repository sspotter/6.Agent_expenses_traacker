import React, { useState } from 'react';
import { 
  X, 
  TrendingUp, 
  Plus, 
  Calendar as CalendarIcon,
  Trash2,
  AlertTriangle
} from 'lucide-react';
import { type Worker } from '../types';
import { useWorkerRates, type WorkerRate } from '../hooks/useWorkerRates';
import { format, parseISO, isAfter, startOfDay } from 'date-fns';
import clsx from 'clsx';

interface RateHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  worker: Worker | null;
}

export const RateHistoryModal: React.FC<RateHistoryModalProps> = ({
  isOpen,
  onClose,
  worker
}) => {
  const { rates, updateRate, loading: ratesLoading } = useWorkerRates(worker?.id || null);
  const [isAdding, setIsAdding] = useState(false);
  const [newRate, setNewRate] = useState('');
  const [effectiveDate, setEffectiveDate] = useState(format(new Date(), 'yyyy-MM-dd'));

  const handleAddRate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!worker || !newRate) return;

    try {
      await updateRate(Number(newRate), parseISO(effectiveDate));
      setIsAdding(false);
      setNewRate('');
    } catch (err) {
      alert('Failed to update rate');
    }
  };

  if (!isOpen || !worker) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[#0f172a]/40 backdrop-blur-md" onClick={onClose} />
      
      <div className="relative bg-white dark:bg-[#0f172a] shadow-premium rounded-[2.5rem] w-full max-w-xl overflow-hidden border border-primary/10">
        <div className="p-8 border-b border-primary/5 bg-primary/5">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-primary/10 rounded-2xl text-primary">
                <TrendingUp size={24} strokeWidth={2.5} />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-sub mb-0.5">Financial Engine</p>
                <h2 className="text-2xl font-black tracking-tighter text-main">Rate History: {worker.name}</h2>
              </div>
            </div>
            <button 
              onClick={onClose} 
              className="p-3 hover:bg-primary/5 rounded-2xl transition-premium text-sub"
              title="Close"
            >
              <X size={20} />
            </button>
          </div>

          {!isAdding && (
            <button 
              onClick={() => setIsAdding(true)}
              className="w-full flex items-center justify-center gap-2 py-4 bg-primary text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-premium hover:scale-[1.02] transition-premium"
            >
              <Plus size={16} strokeWidth={3} /> Change Monthly Rate
            </button>
          )}

          {isAdding && (
            <form onSubmit={handleAddRate} className="space-y-4 animate-in zoom-in-95 duration-200">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-sub ml-1">New Daily Rate</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-primary font-black">$</span>
                    <input 
                      type="number" 
                      value={newRate}
                      onChange={(e) => setNewRate(e.target.value)}
                      placeholder="0.00"
                      autoFocus
                      className="w-full pl-8 pr-4 py-4 bg-white dark:bg-white/5 border-2 border-primary/20 focus:border-primary rounded-2xl font-black text-lg outline-none transition-premium"
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-sub ml-1">Effective From</label>
                  <div className="relative">
                    <input 
                      type="date" 
                      value={effectiveDate}
                      onChange={(e) => setEffectiveDate(e.target.value)}
                      title="Effective From Date"
                      className="w-full px-4 py-4 bg-white dark:bg-white/5 border-2 border-primary/20 focus:border-primary rounded-2xl font-bold text-sm outline-none transition-premium"
                    />
                  </div>
                </div>
              </div>
              
              <div className="p-4 bg-amber-500/10 rounded-2xl flex gap-3 text-amber-600">
                <AlertTriangle size={20} className="shrink-0 mt-0.5" />
                <p className="text-[10px] font-bold leading-relaxed">
                  Changing the rate mid-month will only affect days from the effective date forward. Past days preserve their original targets.
                </p>
              </div>

              <div className="flex gap-2 pt-2">
                <button 
                  type="button"
                  onClick={() => setIsAdding(false)}
                  className="flex-1 py-4 bg-primary/5 text-primary rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-primary/10 transition-premium"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={!newRate}
                  className="flex-1 py-4 bg-primary text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-premium disabled:opacity-50 transition-premium"
                >
                  Confirm Change
                </button>
              </div>
            </form>
          )}
        </div>

        <div className="p-8 max-h-[400px] overflow-y-auto">
          <div className="space-y-4">
            {rates.length > 0 ? (
              rates.map((rate, index) => (
                <div 
                  key={rate.id}
                  className={clsx(
                    "flex items-center justify-between p-5 rounded-3xl border-2 transition-premium",
                    index === 0 ? "border-primary/20 bg-primary/5" : "border-primary/5 bg-white dark:bg-white/5"
                  )}
                >
                  <div className="flex items-center gap-4">
                    <div className={clsx(
                      "w-10 h-10 rounded-xl flex items-center justify-center",
                      index === 0 ? "bg-primary text-white" : "bg-primary/10 text-primary"
                    )}>
                      <TrendingUp size={18} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-black text-main">${rate.rate_amount}</span>
                        {index === 0 && (
                          <span className="text-[8px] font-black uppercase tracking-tighter bg-primary text-white px-1.5 py-0.5 rounded shadow-sm">Current</span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-sub text-[9px] font-bold uppercase tracking-wider mt-0.5">
                        <CalendarIcon size={10} />
                        {format(parseISO(rate.effective_from), 'MMM do, yyyy')}
                        {rate.effective_to ? (
                             <> — {format(parseISO(rate.effective_to), 'MMM do, yyyy')}</>
                        ) : (
                          " — Present"
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {/* {index !== 0 && (
                     <button className="p-2 text-danger opacity-20 hover:opacity-100 transition-premium">
                        <Trash2 size={16} />
                     </button>
                  )} */}
                </div>
              ))
            ) : (
              <div className="py-10 text-center opacity-30 flex flex-col items-center">
                <TrendingUp size={48} strokeWidth={1} className="mb-4" />
                <p className="text-xs font-black uppercase tracking-widest">No rate history found</p>
                <p className="text-[10px] mt-2">A default rate of $100 will be used</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
