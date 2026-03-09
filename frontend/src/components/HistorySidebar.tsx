import React, { useEffect, useState } from 'react';
import { X, Clock, CheckCircle2, History, CreditCard, Receipt } from 'lucide-react';
import { format } from 'date-fns';
import { type PaymentEvent } from '../types';
import { usePaymentEvents } from '../hooks/usePaymentEvents';
import clsx from 'clsx';
import { useWorker } from '../contexts/WorkerContext';

interface HistorySidebarProps {
  isOpen: boolean;
  onClose: () => void;
  entityType: 'DAILY_COLLECTION' | 'WEEKLY_EXPENSE';
  entityId: string;
  title: string;
  subtitle: string;
  expectedAmount?: number;
  finalStatus?: string;
  isFullySettled?: boolean;
}
export const HistorySidebar: React.FC<HistorySidebarProps> = ({
  isOpen,
  onClose,
  entityType,
  entityId,
  title,
  subtitle,
  expectedAmount,
  finalStatus,
  isFullySettled
}) => {
  const { activeWorkerId } = useWorker();
  const { fetchEventsForEntity, loading } = usePaymentEvents(activeWorkerId);
  // ...
  const [events, setEvents] = useState<PaymentEvent[]>([]);

  useEffect(() => {
    if (isOpen && entityId) {
      fetchEventsForEntity(entityType, entityId).then(setEvents);
    }
  }, [isOpen, entityId, entityType, fetchEventsForEntity]);

  if (!isOpen) return null;

  return (
    <>
      <div 
        className="fixed inset-0 bg-[#0f172a]/20 backdrop-blur-sm z-[70] animate-in fade-in duration-300" 
        onClick={onClose} 
      />
      <div className={clsx(
        "fixed right-0 top-0 bottom-0 w-full max-w-md glass z-[80] flex flex-col transform transition-transform duration-500 ease-out shadow-premium",
        isOpen ? "translate-x-0" : "translate-x-full"
      )}>
        <div className="p-8 border-b border-primary/10 flex justify-between items-start">
          <div>
            <div className="flex items-center gap-2 mb-1">
               <History size={16} className="text-primary" />
               <span className="text-[10px] font-black uppercase tracking-widest text-primary/60">Payment History</span>
            </div>
            <h3 className="text-2xl font-black tracking-tighter text-main">{title}</h3>
            {expectedAmount !== undefined && (
              <p className="text-sm font-bold text-sub mt-1">Expected: ${expectedAmount}</p>
            )}
          </div>
          <button 
            onClick={onClose}
            aria-label="Close History"
            className="p-2 hover:bg-primary/5 rounded-full transition-premium text-sub"
          >
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-8 space-y-8">
          {loading && (
            <div className="flex flex-col items-center justify-center h-40 space-y-4">
              <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
              <p className="text-[10px] font-black uppercase tracking-widest text-sub">Fetching History...</p>
            </div>
          )}

          {!loading && events.length === 0 && (
            <div className="flex flex-col items-center justify-center h-40 text-center">
              <Clock size={48} className="text-primary/10 mb-4" />
              <p className="text-sm font-bold text-sub">No events recorded for this item.</p>
            </div>
          )}

          <div className="space-y-6">
            {events.map((event) => (
              <div key={event.id} className="relative group">
                <div className="flex items-start gap-4">
                  <div className={clsx(
                    "mt-1 w-2 h-2 rounded-full",
                    event.event_type === 'COLLECTED' ? "bg-amber-500" : "bg-primary"
                  )} />
                  
                  <div className="space-y-1">
                    <div className="flex items-baseline gap-2">
                       <span className="text-sm font-black text-main">
                         {event.event_type === 'COLLECTED' ? 'Collected' : 'Settled'} ${event.amount.toLocaleString()}
                       </span>
                    </div>
                    
                    <div className="flex flex-col gap-0.5 border-l-2 border-primary/10 pl-3">
                      <span className="text-[11px] font-bold text-sub">
                        → {event.event_type === 'COLLECTED' ? 'Partial payment' : (event.metadata?.notes?.includes('from') ? event.metadata.notes.split('\n').find((l: string) => l.includes('→ Settlement from'))?.replace('→ ', '') : 'Late Settlement')}
                      </span>
                      <span className="text-[11px] font-medium text-sub opacity-70">
                        → {event.event_type === 'COLLECTED' ? 'Paid on' : 'Settled on'} {format(new Date(event.event_date), 'MMM d, yyyy')}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="p-8 border-t border-primary/10 bg-primary/5">
           <div className="flex justify-between items-center mb-1">
             <span className="text-[10px] font-black uppercase tracking-widest text-sub">Total Recorded</span>
             <span className="text-xl font-black text-main">
               ${events.filter(e => e.event_type !== 'CREATED').reduce((sum, e) => sum + e.amount, 0).toLocaleString()}
             </span>
           </div>
           {finalStatus && (
             <p className={clsx(
               "text-[11px] font-black uppercase tracking-widest mt-2",
               isFullySettled ? "text-success" : "text-amber-500"
             )}>
               Status: {finalStatus}
             </p>
           )}
        </div>
      </div>
    </>
  );
};
