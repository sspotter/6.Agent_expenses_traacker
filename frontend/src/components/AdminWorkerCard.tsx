import React, { useState } from 'react';
import { 
  User, 
  ChevronDown, 
  ChevronRight, 
  Shield, 
  ShieldOff, 
  Key, 
  TrendingUp, 
  ExternalLink,
  MoreVertical 
} from 'lucide-react';
import { type Worker } from '../types';
import clsx from 'clsx';
import { useNavigate } from 'react-router-dom';
import { AdminTransactionsList } from './AdminTransactionsList';
import { useWorkerRates } from '../hooks/useWorkerRates';

interface AdminWorkerCardProps {
  worker: Worker;
  onToggleSuspend: (id: string, currentlySuspended: boolean) => Promise<void>;
  onRemovePassword: (id: string) => Promise<void>;
  onShowRateHistory: (worker: Worker) => void;
}

export const AdminWorkerCard: React.FC<AdminWorkerCardProps> = ({
  worker,
  onToggleSuspend,
  onRemovePassword,
  onShowRateHistory
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const navigate = useNavigate();
  const { currentRate } = useWorkerRates(worker.id);

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <div className={clsx(
      "group rounded-[2.5rem] border-2 transition-all duration-500 overflow-hidden",
      worker.is_suspended 
        ? "bg-gray-50/50 border-gray-100 opacity-60" 
        : "bg-white dark:bg-white/5 border-primary/5 hover:border-primary/20 shadow-premium hover:shadow-premium-hover"
    )}>
      {/* Summary Area */}
      <div 
        className="p-6 cursor-pointer flex items-center justify-between"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-4">
          <div className={clsx(
            "w-12 h-12 rounded-2xl flex items-center justify-center overflow-hidden shrink-0 border-2",
            worker.is_suspended ? "bg-gray-200 border-gray-300" : "bg-primary/10 border-primary/10"
          )}>
            {worker.avatar_url ? (
              <img src={worker.avatar_url} alt={worker.name} className="w-full h-full object-cover" />
            ) : (
              <span className={clsx(
                "text-lg font-black",
                worker.is_suspended ? "text-gray-400" : "text-primary"
              )}>{getInitials(worker.name)}</span>
            )}
          </div>
          <div>
            <h3 className="text-lg font-black tracking-tighter text-main flex items-center gap-2">
              {worker.name}
              {worker.is_admin && (
                <div title="Admin User">
                  <Shield size={14} className="text-primary" />
                </div>
              )}
            </h3>
            <div className="flex items-center gap-2 mt-0.5">
              <span className={clsx(
                "text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full",
                worker.is_suspended ? "bg-gray-200 text-gray-500" : "bg-success/10 text-success"
              )}>
                {worker.is_suspended ? 'Suspended' : 'Active'}
              </span>
              <span className="text-[10px] font-bold text-sub uppercase">/ {worker.slug}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="hidden md:flex flex-col items-end">
            <p className="text-[10px] font-black uppercase tracking-widest text-sub">Current Rate</p>
            <p className="text-lg font-black text-primary">${currentRate}<span className="text-xs opacity-40 ml-0.5">/day</span></p>
          </div>
          <div className={clsx(
            "p-2 rounded-xl transition-premium",
            isExpanded ? "bg-primary/10 text-primary rotate-180" : "text-sub group-hover:bg-primary/5"
          )}>
            <ChevronDown size={20} />
          </div>
        </div>
      </div>

      {/* Expanded Controls */}
      <div className={clsx(
        "px-6 pb-6 space-y-6 transition-all duration-500",
        isExpanded ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0 pointer-events-none"
      )}>
        <div className="h-px bg-primary/5 mx-2" />
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button 
            onClick={() => onToggleSuspend(worker.id, !!worker.is_suspended)}
            className={clsx(
              "flex flex-col items-center gap-3 p-4 rounded-3xl border-2 transition-premium group/btn",
              worker.is_suspended 
                ? "bg-success/5 border-success/10 text-success hover:bg-success/10" 
                : "bg-danger/5 border-danger/10 text-danger hover:bg-danger/10"
            )}
          >
            {worker.is_suspended ? <Shield size={20} /> : <ShieldOff size={20} />}
            <span className="text-[10px] font-black uppercase tracking-widest">
              {worker.is_suspended ? 'Reactivate' : 'Suspend'}
            </span>
          </button>

          <button 
            onClick={() => onRemovePassword(worker.id)}
            disabled={!worker.password_hash}
            className="flex flex-col items-center gap-3 p-4 rounded-3xl border-2 border-primary/5 bg-primary/5 text-primary hover:bg-primary/10 transition-premium disabled:opacity-30"
          >
            <Key size={20} />
            <span className="text-[10px] font-black uppercase tracking-widest">Remove Pass</span>
          </button>

          <button 
            onClick={() => onShowRateHistory(worker)}
            className="flex flex-col items-center gap-3 p-4 rounded-3xl border-2 border-primary/5 bg-primary/5 text-primary hover:bg-primary/10 transition-premium"
          >
            <TrendingUp size={20} />
            <span className="text-[10px] font-black uppercase tracking-widest">Rate History</span>
          </button>

          <button 
            onClick={() => navigate(`/${worker.slug}`)}
            className="flex flex-col items-center gap-3 p-4 rounded-3xl border-2 border-blue-500/10 bg-blue-500/5 text-blue-500 hover:bg-blue-500/10 transition-premium"
          >
            <ExternalLink size={20} />
            <span className="text-[10px] font-black uppercase tracking-widest">Switch View</span>
          </button>
        </div>

        <div className="bg-primary/5 rounded-[2rem] p-4 flex items-center justify-between px-6">
          <div className="flex gap-4">
            <div className="text-center">
              <p className="text-[9px] font-black uppercase tracking-tighter text-sub">Created</p>
              <p className="text-xs font-bold">{new Date(worker.created_at).toLocaleDateString()}</p>
            </div>
          </div>
          {worker.password_hash && (
            <div className="flex items-center gap-1.5 text-primary/60">
              <Key size={12} />
              <span className="text-[9px] font-black uppercase">Protected</span>
            </div>
          )}
        </div>

        <div className="pt-2">
          <AdminTransactionsList workerId={worker.id} />
        </div>
      </div>
    </div>
  );
};
