import { Routes, Route, Navigate } from 'react-router-dom';
import { TrackerPage } from './pages/TrackerPage';
// import { AdminDashboard } from './pages/AdminDashboard';
import  AdminDashboard  from './pages/AdminDashboard';
import { useWorker } from './contexts/WorkerContext';

function App() {
  const { workers, loading } = useWorker();

  if (loading && workers.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-[#0f172a]">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="w-16 h-16 bg-primary/10 rounded-2xl" />
          <p className="text-xs font-black uppercase tracking-widest text-primary/40">Loading System...</p>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/admin" element={<AdminDashboard />} />
      <Route path="/:slug" element={<TrackerPage />} />
      <Route path="/" element={<TrackerPage />} />
      {/* Fallback for unknown routes */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
