import React from 'react';
import { Shield, ArrowRight, Settings } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAdmin } from '../hooks/useAdmin';
import { useWorker } from '../contexts/WorkerContext';

export const AdminModeBanner: React.FC = () => {
  const navigate = useNavigate();
  const { isAdmin } = useAdmin();
  const { activeWorker } = useWorker();

  if (!isAdmin) return null;

  return (
    <div className="bg-primary text-white py-3 px-6 flex items-center justify-between animate-in slide-in-from-top duration-500">
      <div className="flex items-center gap-3">
        <div className="p-1.5 bg-white/20 rounded-lg">
          <Shield size={16} strokeWidth={3} />
        </div>
        <p className="text-[10px] font-black uppercase tracking-widest">
          Admin Mode <span className="opacity-60 ml-2">•</span> Viewing <span className="underline">{activeWorker?.name}</span>
        </p>
      </div>

      <button 
        onClick={() => navigate('/admin')}
        className="flex items-center gap-2 bg-white/10 hover:bg-white/20 px-4 py-1.5 rounded-full transition-premium group"
      >
        <span className="text-[10px] font-black uppercase tracking-widest">Return to Dashboard</span>
        <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
      </button>
    </div>
  );
};
