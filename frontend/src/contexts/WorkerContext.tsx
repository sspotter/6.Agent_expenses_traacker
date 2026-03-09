import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import { Worker } from '../types';
import { useNavigate, useLocation } from 'react-router-dom';
import { PasswordModal } from '../components/PasswordModal';

interface WorkerContextValue {
  workers: Worker[];
  activeWorker: Worker | null;
  activeWorkerId: string | null;
  loading: boolean;
  addWorker(
    name: string,
    avatarUrl?: string,
    password?: string,
    isDefault?: boolean,
    isAdmin?: boolean
  ): Promise<Worker>;
  updateWorker(
    id: string,
    updates: Partial<Worker> & { password?: string }
  ): Promise<Worker>;
  refreshWorkers(): Promise<Worker[]>;
  lockWorker(id: string): void;
  isAdminSession: boolean;
}

const WorkerContext = createContext<WorkerContextValue | null>(null);

export const WorkerProvider = ({ children }: { children: ReactNode }) => {
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [activeWorker, setActiveWorker] = useState<Worker | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Phase 5: Rehydrate unlocked jobs from localStorage
  const [unlockedWorkers, setUnlockedWorkers] = useState<Set<string>>(() => {
    const saved = new Set<string>();
    if (typeof window !== 'undefined') {
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key?.startsWith('worker_unlocked_')) {
                const id = key.replace('worker_unlocked_', '');
                saved.add(id);
            }
        }
    }
    return saved;
  });

  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [pendingWorkerId, setPendingWorkerId] = useState<string | null>(null);
  
  const activeWorkerId = activeWorker?.id ?? null;

  const isAdminSession = workers.some(w => w.is_admin && unlockedWorkers.has(w.id));

  const navigate = useNavigate();
  const location = useLocation();

const refreshWorkers = useCallback(async (): Promise<Worker[]> => {
  const { data, error } = await supabase
    .from('workers')
    .select('*');

  if (error) {
    console.error('REFRESH WORKERS ERROR:', error);
    return [];
  }

  const typedWorkers = data as Worker[];
  setWorkers(typedWorkers);
  return typedWorkers;
}, []);


const addWorker = useCallback(
  async (
    name: string,
    avatarUrl?: string,
    password?: string,
    isDefault: boolean = false,
    isAdmin: boolean = false
  ): Promise<Worker> => {
    const slug =
      name.toLowerCase().replace(/\s+/g, '-') +
      '-' +
      Math.random().toString(36).slice(2, 6);

    // If new worker is default, unset others first
    if (isDefault) {
      await supabase.from('workers').update({ is_default: false }).eq('user_id', 'default_user');
    }

    const { data, error } = await supabase
      .from('workers')
      .insert({
        name,
        slug,
        avatar_url: avatarUrl ?? null,
        password_hash: password ? btoa(password) : null,
        user_id: 'default_user',
        is_default: isDefault,
        is_admin: isAdmin
      })
      .select()
      .single();

    if (error) {
      console.error('ADD WORKER ERROR:', error);
      throw error;
    }

    const newWorker = data as Worker;
    // Refresh to get consistent state
    await refreshWorkers();
    
    // This will trigger syncWorkerWithUrl via navigation
    navigate(`/${newWorker.slug}`);

    return newWorker;
  },
  [navigate, refreshWorkers]
);

  // 1. URL Sync & Initial Load (Phase 1)
  useEffect(() => {
    const syncWorkerWithUrl = async () => {
      setLoading(true);
      
      const loadedWorkers = workers.length > 0 ? workers : await refreshWorkers();
      if (loadedWorkers.length === 0) {
        setLoading(false);
        return;
      }
      
      // Extract slug from URL (e.g. /john-doe)
      const pathParts = location.pathname.split('/').filter(Boolean);
      const slugFromUrl = pathParts[0];
      
      let targetWorker = loadedWorkers.find(w => w.slug === slugFromUrl);

      // Skip worker-slug sync for reserved admin/system paths
      const reservedPaths = ['admin', 'reports', 'settings'];
      if (reservedPaths.includes(slugFromUrl)) {
        setLoading(false);
        return;
      }

      // Phase 1: If no worker found (root path or invalid slug)
      if (!targetWorker) {
        // 1. Try finding explicitly marked default worker (and active)
        targetWorker = loadedWorkers.find(w => w.is_default && !w.is_suspended);
        if (!targetWorker) targetWorker = loadedWorkers.find(w => w.is_default);

        // 2. Try localStorage if no default
        if (!targetWorker) {
          const lastActiveId = localStorage.getItem('lastActiveWorkerId');
          if (lastActiveId) {
            targetWorker = loadedWorkers.find(w => w.id === lastActiveId && !w.is_suspended);
          }
        }

        // 3. Last Fallback to first active worker
        if (!targetWorker) {
            targetWorker = loadedWorkers.find(w => !w.is_suspended) || loadedWorkers[0];
        }

        // Redirect if we are at root OR if we have a target worker differing from URL
        if (targetWorker) {
             const isRoot = location.pathname === '/';
             const isWrongSlug = slugFromUrl && targetWorker.slug !== slugFromUrl;
             
             if (isRoot || isWrongSlug) {
                navigate(`/${targetWorker.slug}`, { replace: true });
                // Don't set state here, let the next effect cycle handle it after nav
                setLoading(false);
                return;
             }
        }
      }

      if (targetWorker) {
        // Check password lock
        if (targetWorker.password_hash && !unlockedWorkers.has(targetWorker.id)) {
          setPendingWorkerId(targetWorker.id);
          setShowPasswordModal(true);
          setActiveWorker(null); 
        } else {
          setActiveWorker(targetWorker);
          setShowPasswordModal(false);
          setPendingWorkerId(null);
          // Phase 1: Persist
          localStorage.setItem('lastActiveWorkerId', targetWorker.id);
        }
      }
      
      setLoading(false);
    };

    syncWorkerWithUrl();
  }, [location.pathname, refreshWorkers, unlockedWorkers, navigate, workers.length]);



  const updateWorker = async (id: string, updates: Partial<Worker> & { password?: string }) => {
    // If updating name, regenerate slug
    const updatesToSave = { ...updates };
    if (updates.name) {
       updatesToSave.slug = updates.name.toLowerCase().replace(/\s+/g, '-');
    }
    if (updates.password) {
        updatesToSave.password_hash = btoa(updates.password);
        delete (updatesToSave as any).password;
    }

    // Handle is_default constraint
    if (updates.is_default) {
        await supabase.from('workers').update({ is_default: false }).neq('id', id).eq('user_id', 'default_user');
    }

    const { data, error } = await supabase
      .from('workers')
      .update(updatesToSave)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    const updatedWorker = data as Worker;
    // Refresh workers to ensure state is consistent across all items
    await refreshWorkers();
    
    // If we updated the active worker, update URL if slug changed
    if (activeWorker?.id === id) {
        if (updatedWorker.slug !== activeWorker.slug) {
            navigate(`/${updatedWorker.slug}`, { replace: true });
        }
        // Also update local state to reflect changes immediately
        setActiveWorker(updatedWorker);
    }
    
    return updatedWorker;
  };

  const handleUnlock = (password: string) => {
      const worker = workers.find(w => w.id === pendingWorkerId);
      if (!worker || !worker.password_hash) return;

      // Verify simple hash
      if (btoa(password) === worker.password_hash) {
          const newSet = new Set(unlockedWorkers).add(worker.id);
          setUnlockedWorkers(newSet);
          
          // Phase 5: Persist unlock
          localStorage.setItem(`worker_unlocked_${worker.id}`, 'true');

          setShowPasswordModal(false);
          setPendingWorkerId(null);
      } else {
          alert("Incorrect Password");
      }
  };

  const handleCancelUnlock = () => {
    setShowPasswordModal(false);
    setPendingWorkerId(null);
    // If no active worker, maybe go to default
    if (!activeWorker && workers.length > 0) {
        const safeWorker = workers.find(w => !w.password_hash) || workers[0];
        if (safeWorker && safeWorker.id !== pendingWorkerId) {
            navigate(`/${safeWorker.slug}`);
        }
    }
  };

  const lockWorker = (id: string) => {
    localStorage.removeItem(`worker_unlocked_${id}`);
    setUnlockedWorkers(prev => {
        const next = new Set(prev);
        next.delete(id);
        return next;
    });
  };

  return (
    <WorkerContext.Provider value={{
      workers,
      activeWorker,
      activeWorkerId,
      loading,
      addWorker,
      updateWorker,
      refreshWorkers,
      lockWorker,
      isAdminSession
    }}>
      {children}
      
      {pendingWorkerId && (
        <PasswordModal 
            isOpen={showPasswordModal}
            workerName={workers.find(w => w.id === pendingWorkerId)?.name || 'Worker'}
            onSubmit={handleUnlock}
            onCancel={handleCancelUnlock}
        />
      )}
    </WorkerContext.Provider>
  );
};

export const useWorker = () => {
  const context = useContext(WorkerContext);
  if (context === null) {
    throw new Error('useWorker must be used within a WorkerProvider');
  }
  return context;
};
