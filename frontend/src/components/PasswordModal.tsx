import React, { useState } from 'react';
import { Lock, ArrowRight } from 'lucide-react';

interface PasswordModalProps {
  isOpen: boolean;
  workerName: string;
  onSubmit: (password: string) => void;
  onCancel: () => void;
  error?: string;
}

export const PasswordModal: React.FC<PasswordModalProps> = ({ 
  isOpen, 
  workerName, 
  onSubmit, 
  onCancel,
  error 
}) => {
  const [password, setPassword] = useState('');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300" onClick={onCancel} />
      
      <div className="bg-gray-900 relative w-full max-w-sm glass-panel rounded-[24px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 border border-primary/20 p-8 text-center">
        
        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6 text-primary animate-bounce">
          <Lock size={32} />
        </div>

        <h2 className="text-xl font-black text-main mb-2">Password Required</h2>
        <p className="text-sm text-primary/60 font-medium mb-6">
          Enter password to access <strong>{workerName}</strong>
        </p>

        <form 
          onSubmit={(e) => {
            e.preventDefault();
            onSubmit(password);
          }}
          className="space-y-4"
        >
          <div>
            <input
              autoFocus
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter Access Password"
              className="focus:bg-white/50 w-full px-5 py-3 rounded-xl bg-primary/5 border-2 border-transparent  focus:border-primary/30 outline-none transition-premium font-bold text-center tracking-widest"
              // className="w-full px-5 py-3 rounded-xl bg-primary/5 border-2 border-transparent focus:border-primary/30 focus:bg-white outline-none transition-premium font-bold text-center tracking-widest"
            />
            {error && (
              <p className="text-xs text-danger font-bold mt-2 animate-in slide-in-from-top-1">
                {error}
              </p>
            )}
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 py-3 px-4 rounded-xl bg-primary/5 hover:bg-primary/10 text-primary font-bold transition-premium text-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!password}
              className="flex-1 py-3 px-4 rounded-xl bg-primary text-white font-bold shadow-premium hover:shadow-premium-hover transition-premium text-sm flex items-center justify-center gap-2 disabled:opacity-50"
            >
              Unlock <ArrowRight size={14} />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
