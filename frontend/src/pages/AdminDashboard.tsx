import React, { useState, useMemo } from 'react';
import { Layout } from '../components/Layout';
import { 
  Users, 
  Shield, 
  Download, 
  Upload, 
  UserPlus, 
  ArrowLeft,
  Search,
  BarChart3
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useWorker } from '../contexts/WorkerContext';
import { useAdmin } from '../hooks/useAdmin';
import { useDataPortability } from '../hooks/useDataPortability';
import { AdminWorkerCard } from '../components/AdminWorkerCard';
import { MonthNavigation } from '../components/MonthNavigation';
import { RateHistoryModal } from '../components/RateHistoryModal';
import { WorkerModal } from '../components/WorkerModal';
import { GlobalReportTable } from '../components/GlobalReportTable';
import { type Worker } from '../types';
import { format } from 'date-fns';
import clsx from 'clsx';

export function AdminDashboard() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const navigate = useNavigate();
  const { workers } = useWorker();
  const { 
    isAdmin, 
    globalStats, 
    loading: adminLoading, 
    toggleWorkerSuspension, 
    deleteWorkerPassword 
  } = useAdmin(currentMonth);
  const { exportData, importData, loading: portabilityLoading } = useDataPortability();
  
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showSuspended, setShowSuspended] = useState(false);
  const [selectedWorkerForRates, setSelectedWorkerForRates] = useState<Worker | null>(null);
  const [isRateModalOpen, setRateModalOpen] = useState(false);
  const [isAddWorkerModalOpen, setAddWorkerModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'LIST' | 'REPORT'>('REPORT');

  const filteredWorkers = useMemo(() => {
    return workers.filter(w => {
      const matchesSearch = w.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = showSuspended ? w.is_suspended : !w.is_suspended;
      return matchesSearch && matchesStatus;
    });
  }, [workers, searchTerm, showSuspended]);

  // if (!isAdmin && !adminLoading) {
  //   return (
  //     <Layout>
  //       <div className="min-h-[60vh] flex flex-col items-center justify-center text-center space-y-4">
  //         <div className="p-6 bg-danger/10 rounded-full text-danger">
  //           <Shield size={48} />
  //         </div>
  //         <h2 className="text-3xl font-black tracking-tighter text-main">Access Denied</h2>
  //         <p className="text-sub font-medium max-w-sm">
  //           You do not have administrative privileges to access this area. 
  //           Please sign in with an admin account.
  //         </p>
  //         <button 
  //           onClick={() => navigate('/')}
  //           className="px-8 py-3 bg-primary text-white rounded-2xl font-black uppercase text-xs tracking-widest transition-premium shadow-premium hover:shadow-premium-hover"
  //         >
  //           Go Back
  //         </button>
  //       </div>
  //     </Layout>
  //   );
  // }

  return (
    <Layout>
      <div className="space-y-10">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
          <div>
            <button 
              onClick={() => navigate('/')}
              className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-primary hover:text-primary/80 transition-premium mb-2"
            >
              <ArrowLeft size={14} /> Back to Tracker
            </button>
            <h1 className="text-4xl font-black tracking-tighter text-main flex items-center gap-4">
              Admin Control Center
              <div className="p-2 bg-primary/10 rounded-xl text-primary">
                <Shield size={24} />
              </div>
            </h1>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept=".json"
              title="Import Data"
              onChange={(e) => e.target.files?.[0] && importData(e.target.files[0])}
            />
            <button 
              onClick={() => fileInputRef.current?.click()}
              disabled={portabilityLoading || adminLoading}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-6 py-3 bg-white dark:bg-white/5 border-2 border-primary/10 rounded-2xl font-bold text-xs uppercase tracking-widest text-sub hover:border-primary/20 transition-premium disabled:opacity-50"
            >
              <Upload size={16} /> Import
            </button>
            <button 
              onClick={exportData}
              disabled={portabilityLoading || adminLoading}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-6 py-3 bg-white dark:bg-white/5 border-2 border-primary/10 rounded-2xl font-bold text-xs uppercase tracking-widest text-sub hover:border-primary/20 transition-premium disabled:opacity-50"
            >
              <Download size={16} /> Export
            </button>
            <button 
              onClick={() => setAddWorkerModalOpen(true)}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-6 py-3 bg-primary text-white rounded-2xl font-bold text-xs uppercase tracking-widest shadow-premium hover:shadow-premium-hover transition-premium"
            >
              <UserPlus size={16} /> Add Worker
            </button>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
          <div className="flex-1 max-w-md">
            <MonthNavigation 
               currentMonth={currentMonth}
               onPrevMonth={() => setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1))}
               onNextMonth={() => setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1))}
               onOpenNotes={() => {}} 
               uncheckedNotesCount={0}
            />
          </div>
          <div className="hidden md:block p-4 bg-primary/5 rounded-[2rem] border border-primary/10">
             <p className="text-[10px] font-black uppercase tracking-widest text-primary/60">Reporting Month</p>
             <p className="text-sm font-bold text-main">{format(currentMonth, 'MMMM yyyy')}</p>
          </div>
        </div>

        {/* Global Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-6 rounded-[2rem] bg-white dark:bg-white/5 border-2 border-primary/5 hover:border-primary/10 transition-premium">
            <p className="text-[10px] font-black uppercase tracking-widest text-sub mb-1">Total Workers</p>
            <p className="text-3xl font-black text-main">{globalStats.totalWorkers}</p>
          </div>
          <div className="p-6 rounded-[2rem] bg-success/5 border-2 border-success/10 transition-premium">
            <p className="text-[10px] font-black uppercase tracking-widest text-success/60 mb-1">Active</p>
            <p className="text-3xl font-black text-success">{globalStats.activeWorkers}</p>
          </div>
          <div className="p-6 rounded-[2rem] bg-danger/5 border-2 border-danger/10 transition-premium">
            <p className="text-[10px] font-black uppercase tracking-widest text-danger/60 mb-1">Suspended</p>
            <p className="text-3xl font-black text-danger">{globalStats.suspendedWorkers}</p>
          </div>
          <div className="p-6 rounded-[2rem] bg-primary/5 border-2 border-primary/10 transition-premium">
            <p className="text-[10px] font-black uppercase tracking-widest text-primary/60 mb-1">Month Total</p>
            <p className="text-3xl font-black text-primary">${globalStats.monthlyCollected}</p>
            <p className="text-[10px] font-bold text-sub mt-1">Goal: ${globalStats.monthlyExpected}</p>
          </div>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex border-b border-primary/5">
            <button 
                onClick={() => setActiveTab('REPORT')}
                className={clsx(
                    "px-8 py-4 text-[10px] font-black uppercase tracking-widest transition-all relative",
                    activeTab === 'REPORT' ? "text-primary" : "text-sub hover:text-main"
                )}
            >
                Monthly Report
                {activeTab === 'REPORT' && <div className="absolute bottom-0 left-0 right-0 h-1 bg-primary rounded-full" />}
            </button>
            <button 
                onClick={() => setActiveTab('LIST')}
                className={clsx(
                    "px-8 py-4 text-[10px] font-black uppercase tracking-widest transition-all relative",
                    activeTab === 'LIST' ? "text-primary" : "text-sub hover:text-main"
                )}
            >
                Worker Management
                {activeTab === 'LIST' && <div className="absolute bottom-0 left-0 right-0 h-1 bg-primary rounded-full" />}
            </button>
        </div>

        {activeTab === 'REPORT' ? (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
                <div className="flex justify-end">
                    <button 
                        onClick={() => setShowSuspended(!showSuspended)}
                        className={clsx(
                            "flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-premium border-2",
                            showSuspended ? "bg-primary text-white border-primary" : "text-sub border-primary/10 hover:border-primary/30"
                        )}
                    >
                        {showSuspended ? "Showing All" : "Excluding Suspended"}
                    </button>
                </div>
                <GlobalReportTable workers={workers} currentMonth={currentMonth} includeSuspended={showSuspended} />
            </div>
        ) : (
            <div className="space-y-10 animate-in fade-in slide-in-from-bottom-2 duration-500">
                <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
                    <div className="flex items-center gap-4 bg-primary/5 px-6 py-3 rounded-2xl flex-1 max-w-md">
                    <Search size={18} className="text-sub" />
                    <input 
                        type="text"
                        placeholder="Search workers..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="bg-transparent border-none focus:ring-0 w-full text-sm font-bold placeholder:text-sub/50 outline-none"
                    />
                    </div>

                    <div className="flex items-center gap-1 bg-primary/5 p-1.5 rounded-2xl">
                    <button 
                        onClick={() => setShowSuspended(false)}
                        className={clsx(
                        "px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-premium",
                        !showSuspended ? "bg-white dark:bg-[#0f172a] shadow-sm text-primary" : "text-sub hover:text-main"
                        )}
                    >
                        Active
                    </button>
                    <button 
                        onClick={() => setShowSuspended(true)}
                        className={clsx(
                        "px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-premium",
                        showSuspended ? "bg-white dark:bg-[#0f172a] shadow-sm text-primary" : "text-sub hover:text-main"
                        )}
                    >
                        Suspended
                    </button>
                    </div>
                </div>

                {/* Worker List */}
                <div className="space-y-4">
                {filteredWorkers.length > 0 ? (
                    filteredWorkers.map(worker => (
                    <AdminWorkerCard 
                        key={worker.id} 
                        worker={worker} 
                        onToggleSuspend={async (id, current) => {
                        if (confirm(`Are you sure you want to ${current ? 'reactivate' : 'suspend'} ${worker.name}?`)) {
                            await toggleWorkerSuspension(id, !current);
                        }
                        }}
                        onRemovePassword={async (id) => {
                        if (confirm(`Remove password for ${worker.name}?`)) {
                            await deleteWorkerPassword(id);
                        }
                        }}
                        onShowRateHistory={(w) => {
                        setSelectedWorkerForRates(w);
                        setRateModalOpen(true);
                        }}
                    />
                    ))
                ) : (
                    <div className="flex flex-col items-center justify-center py-20 text-center opacity-30">
                    <Users size={64} strokeWidth={1} className="mb-4" />
                    <p className="text-lg font-black uppercase tracking-widest">No workers found</p>
                    <p className="text-xs mt-2">Try adjusting your search or filters</p>
                    </div>
                )}
                </div>
            </div>
        )}
      </div>

      <RateHistoryModal 
        isOpen={isRateModalOpen}
        onClose={() => {
          setRateModalOpen(false);
          setSelectedWorkerForRates(null);
        }}
        worker={selectedWorkerForRates}
      />

      <WorkerModal 
        isOpen={isAddWorkerModalOpen}
        onClose={() => setAddWorkerModalOpen(false)}
        initialMode="CREATE"
      />
    </Layout>
  );
}

export default AdminDashboard;
