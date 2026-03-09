// import React, { useState, useEffect } from 'react';
// import { useWorker } from '../contexts/WorkerContext';
// import { useWorkerRates } from '../hooks/useWorkerRates';
// import { supabase } from '../lib/supabase';
// import { format } from 'date-fns';
// import { X, UserPlus, Trash2, Camera, Shield, CheckCircle2, Edit2, Save, ArrowLeft, DollarSign, Star } from 'lucide-react';
// import { Worker } from '../types';

// interface WorkerModalProps {
//   isOpen: boolean;
//   onClose: () => void;
// }

// export const WorkerModal: React.FC<WorkerModalProps> = ({ isOpen, onClose }) => {
//   const { workers, addWorker, updateWorker } = useWorker();
//   const [mode, setMode] = useState<'LIST' | 'CREATE' | 'EDIT'>('LIST');
//   const [editingWorker, setEditingWorker] = useState<Worker | null>(null);

//   // Form State
//   const [name, setName] = useState('');
//   const [avatarUrl, setAvatarUrl] = useState('');
//   const [password, setPassword] = useState('');
//   const [dailyRate, setDailyRate] = useState<number>(100);
//   const [effectiveDate, setEffectiveDate] = useState<string>(format(new Date(), 'yyyy-MM-dd'));
//   const [isDefault, setIsDefault] = useState(false);
//   const [isAdmin, setIsAdmin] = useState(false);
//   const [submitting, setSubmitting] = useState(false);
  
//   const { currentRate, updateRate } = useWorkerRates(editingWorker?.id || null);

//   // Sync dailyRate when currentRate loads (only in EDIT mode)
//   useEffect(() => {
//     if (mode === 'EDIT' && currentRate) {
//         setDailyRate(currentRate);
//     }
//   }, [currentRate, mode]);

//   // Reset form when modal opens or mode changes
//   useEffect(() => {
//     if (!isOpen) {
//       setMode('LIST');
//       resetForm();
//     }
//   }, [isOpen]);

//   const resetForm = () => {
//     setName('');
//     setAvatarUrl('');
//     setPassword('');
//     setDailyRate(100);
//     setEffectiveDate(format(new Date(), 'yyyy-MM-dd'));
//     setIsDefault(false);
//     setIsAdmin(false);
//     setEditingWorker(null);
//     setSubmitting(false);
//   };

//   const startEdit = (worker: Worker) => {
//     setEditingWorker(worker);
//     setName(worker.name);
//     setAvatarUrl(worker.avatar_url || '');
//     setPassword(''); // Don't pre-fill password hash
//     setIsDefault(!!worker.is_default);
//     setIsAdmin(!!worker.is_admin);
//     setMode('EDIT');
//   };

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     if (!name.trim() || submitting) return;

//     setSubmitting(true);
//     try {
//       if (mode === 'CREATE') {
//         const newWorker = await addWorker(name, avatarUrl || undefined, password || undefined, isDefault, isAdmin);
//         // Create initial rate
//         await supabase.from('worker_rates').insert({
//             worker_id: newWorker.id,
//             rate_amount: dailyRate,
//             effective_from: format(new Date(), 'yyyy-MM-dd')
//         });
//         // WorkerContext.addWorker handles navigation to new slug
//       } else if (mode === 'EDIT' && editingWorker) {
//         await updateWorker(editingWorker.id, {
//           name,
//           avatar_url: avatarUrl || undefined,
//           password: password || undefined, // Only update if provided
//           is_default: isDefault,
//           is_admin: isAdmin
//         });
        
//         // Update rate if changed
//         if (dailyRate !== currentRate) {
//             await updateRate(dailyRate, new Date(effectiveDate));
//         }
//         // WorkerContext.updateWorker handles navigation if slug changes
//       }
//       setMode('LIST');
//       resetForm();
//     } catch (err) {
//       alert('Failed to save worker');
//     } finally {
//       setSubmitting(false);
//     }
//   };

//   const getInitials = (name: string) => {
//     return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
//   };

//   if (!isOpen) return null;

//   return (
//     <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
//       <div className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300" onClick={onClose} />
      
//       <div className="bg-white relative w-full max-w-lg glass-panel rounded-[32px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 border border-primary/20">
//         <div className="px-8 py-6 border-b border-primary/10 flex justify-between items-center bg-primary/5">
//           <div className=" flex items-center gap-3">
//             {mode !== 'LIST' && (
//               <button 
//                 onClick={() => setMode('LIST')}
//                 className="p-1.5 -ml-2 rounded-full hover:bg-primary/10 text-primary/60 hover:text-primary transition-colors"
//                 aria-label="LIST"
//                 title="LIST"
//               >
//                 <ArrowLeft size={20} />
//               </button>
//             )}
//             <div>
//               <h2 className="text-2xl font-black tracking-tight text-main">
//                 {mode === 'LIST' ? 'Worker Management' : (mode === 'CREATE' ? 'New Profile' : 'Edit Profile')}
//               </h2>
//               <p className="text-sm text-primary/60 font-medium">
//                 {mode === 'LIST' ? 'Manage user profiles' : 'Configure worker details'}
//               </p>
//             </div>
//           </div>
//           <button 
//             onClick={onClose}
//             className="p-2 hover:bg-primary/10 rounded-full transition-colors text-primary"
//             aria-label="Close"
//             title="Close"
//           >
//             <X size={24} />
//           </button>
//         </div>

//         <div className="p-8">
//           {mode === 'LIST' ? (
//             <div className=" space-y-6">
//               <div className="grid grid-cols-1 gap-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
//                 {workers.map(worker => (
//                   <div key={worker.id} className="shadow-lg hover:shadow-md  flex items-center gap-4 p-4 rounded-2xl bg-primary/5 border border-primary/10 group hover:border-primary/30 transition-premium relative overflow-hidden">
//                     {/* Active Indicator */}
//                     <div className=" w-12 h-12 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center overflow-hidden shrink-0 border-2 border-white/50 dark:border-white/10 shadow-sm">
//                       {worker.avatar_url ? (
//                         <img src={worker.avatar_url} alt={worker.name} className="w-full h-full object-cover" />
//                       ) : (
//                         <span className="text-lg font-black text-primary/80">
//                           {getInitials(worker.name)}
//                         </span>
//                       )}
//                     </div>
                    
//                     <div className="flex-1 min-w-0">
//                       <div className="flex items-center gap-2">
//                         <p className="font-bold text-main truncate text-lg">{worker.name}</p>
//                         {worker.is_default && (
//                           <span className="px-1.5 py-0.5 rounded bg-primary/10 text-primary text-[8px] font-black uppercase tracking-tighter border border-primary/20">Default</span>
//                         )}
//                         {worker.is_admin && (
//                           <span className="px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-600 text-[8px] font-black uppercase tracking-tighter border border-amber-500/20">Admin</span>
//                         )}
//                         {worker.password_hash && (
//                           <Shield size={12} className="text-success/80" strokeWidth={3} />
//                         )}
//                       </div>
//                       <p className="text-[10px] text-primary/40 font-mono truncate">/{worker.slug}</p>
//                     </div>

//                     <button
//                       onClick={() => startEdit(worker)}
//                       className="p-2 rounded-xl bg-white dark:bg-black/20 text-primary opacity-0 group-hover:opacity-100 transition-all hover:bg-primary hover:text-white shadow-sm translate-x-4 group-hover:translate-x-0"
//                       title="Edit Profile"
//                     >
//                       <Edit2 size={16} />
//                     </button>
//                   </div>
//                 ))}
//               </div>

//               <button
//                 onClick={() => {
//                   resetForm();
//                   setMode('CREATE');
//                 }}
//                 className="w-full py-4 rounded-2xl bg-white dark:bg-primary border-2 border-dashed border-primary/30 hover:border-primary text-primary dark:text-white font-black flex items-center justify-center gap-3 transition-premium active:scale-95"
//               >
//                 <UserPlus size={20} />
//                 Add New Worker Profile
//               </button>
//             </div>
//           ) : (
//             <form onSubmit={handleSubmit} className="space-y-6">
//               <div className="space-y-4">
//                 {/* Avatar Preview */}
//                 <div className="flex justify-center mb-6">
//                   <div className="w-24 h-24 rounded-full bg-primary/5 border-4 border-white dark:border-white/10 shadow-lg flex items-center justify-center overflow-hidden relative group">
//                     {avatarUrl ? (
//                       <img src={avatarUrl} alt="Preview" className="w-full h-full object-cover" />
//                     ) : (
//                       <div className="flex flex-col items-center justify-center text-primary/30">
//                          {name ? (
//                             <span className="text-3xl font-black text-primary/40">{getInitials(name)}</span>
//                          ) : (
//                             <Camera size={32} />
//                          )}
//                       </div>
//                     )}
//                   </div>
//                 </div>

//                 <div className="space-y-2">
//                   <label className="text-xs font-black uppercase tracking-widest text-primary/60 px-1">Worker Name</label>
//                   <input
//                     autoFocus
//                     required
//                     type="text"
//                     value={name}
//                     onChange={e => setName(e.target.value)}
//                     placeholder="e.g. John Doe"
//                     className="w-full px-6 py-4 rounded-2xl bg-primary/5 border-2 border-transparent focus:border-primary/30 focus:bg-white outline-none transition-premium font-bold text-lg"
//                   />
//                   {mode === 'CREATE' && name && (
//                     <p className="text-[10px] text-primary/40 px-2 font-mono">
//                       Will generate URL: /{name.toLowerCase().replace(/\s+/g, '-')}
//                     </p>
//                   )}
//                 </div>

//                 <div className="space-y-2">
//                   <label className="text-xs font-black uppercase tracking-widest text-primary/60 px-1">Avatar URL (Optional)</label>
//                   <input
//                     type="url"
//                     value={avatarUrl}
//                     onChange={e => setAvatarUrl(e.target.value)}
//                     placeholder="data:image/png;base64,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"
//                     className="w-full px-6 py-4 rounded-2xl bg-primary/5 border-2 border-transparent focus:border-primary/30 focus:bg-white outline-none transition-premium font-medium"
//                   />
//                 </div>

//                 <div className="grid grid-cols-2 gap-4">
//                   <button
//                     type="button"
//                     onClick={() => setIsDefault(!isDefault)}
//                     className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${isDefault ? 'border-primary bg-primary/5' : 'border-primary/10 hover:border-primary/30'}`}
//                   >
//                     <Star size={20} className={isDefault ? 'text-primary' : 'text-primary/30'} fill={isDefault ? 'currentColor' : 'none'} />
//                     <span className="text-[10px] font-black uppercase tracking-widest text-primary/60">Default Worker</span>
//                   </button>
//                   <button
//                     type="button"
//                     onClick={() => setIsAdmin(!isAdmin)}
//                     className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${isAdmin ? 'border-amber-500 bg-amber-500/5' : 'border-primary/10 hover:border-primary/30'}`}
//                   >
//                     <Shield size={20} className={isAdmin ? 'text-amber-500' : 'text-primary/30'} />
//                     <span className="text-[10px] font-black uppercase tracking-widest text-primary/60">Admin Role</span>
//                   </button>
//                 </div>

//                 <div className="space-y-2">
//                   <label className="text-xs font-black uppercase tracking-widest text-primary/60 px-1">
//                     {mode === 'EDIT' ? 'Change Password (Optional)' : 'Password (Optional)'}
//                   </label>
//                   <div className="relative">
//                     <input
//                       type="password"
//                       value={password}
//                       onChange={e => setPassword(e.target.value)}
//                       placeholder={mode === 'EDIT' ? "Leave empty to keep current" : "Leave empty for no password"}
//                       className="w-full px-6 py-4 rounded-2xl bg-primary/5 border-2 border-transparent focus:border-primary/30 focus:bg-white outline-none transition-premium font-medium pl-12"
//                     />
//                     <Shield size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-primary/40" />
//                   </div>
//                 </div>

//                 <div className="space-y-2">
//                    <label className="text-xs font-black uppercase tracking-widest text-primary/60 px-1">Daily Rate Target</label>
//                    <div className="relative">
//                      <span className="absolute left-6 top-1/2 -translate-y-1/2 text-primary font-black text-lg">$</span>
//                      <input
//                         type="number"
//                         min="1"
//                         value={dailyRate}
//                         onChange={e => setDailyRate(Number(e.target.value))}
//                         className="w-full px-6 py-4 rounded-2xl bg-primary/5 border-2 border-transparent focus:border-primary/30 focus:bg-white outline-none transition-premium font-black text-lg pl-12"
//                         title="Daily Rate"
//                      />
//                    </div>
                   
//                    {mode === 'EDIT' && dailyRate !== currentRate && (
//                        <div className="animate-in fade-in slide-in-from-top-2 pt-2">
//                            <label className="text-[10px] font-bold uppercase tracking-widest text-primary/60 px-1 block mb-1">
//                                Effective From Date
//                            </label>
//                            <input 
//                                 type="date"
//                                 value={effectiveDate}
//                                 onChange={e => setEffectiveDate(e.target.value)}
//                                 className="w-full px-4 py-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-600 font-bold text-sm outline-none focus:border-amber-500/50"
//                                 title="Effective Date"
//                            />
//                            <p className="text-[10px] text-amber-600/70 px-2 font-medium pt-1">
//                                New rate of ${dailyRate} will apply starting from {effectiveDate}. Past days will keep the old rate.
//                            </p>
//                        </div>
//                    )}
//                    {mode === 'CREATE' && (
//                        <p className="text-[10px] text-primary/40 px-2 font-mono pt-1">
//                             Initial rate effective immediately.
//                        </p>
//                    )}
//                 </div>
//               </div>

//               <div className="flex gap-4 pt-4">
//                 <button
//                   type="button"
//                   onClick={() => setMode('LIST')}
//                   className="flex-1 py-4 px-6 rounded-2xl bg-primary/5 hover:bg-primary/10 text-primary font-bold transition-premium"
//                 >
//                   Cancel
//                 </button>
//                 <button
//                   type="submit"
//                   disabled={submitting || !name.trim()}
//                   className="flex-[2] py-4 px-6 rounded-2xl bg-primary text-white font-black shadow-premium hover:shadow-premium-hover hover:-translate-y-0.5 transition-premium disabled:opacity-50 disabled:translate-y-0 flex items-center justify-center gap-2"
//                 >
//                   {submitting ? 'Saving...' : (
//                     <>
//                       <Save size={18} />
//                       {mode === 'CREATE' ? 'Create Profile' : 'Save Changes'}
//                     </>
//                   )}
//                 </button>
//               </div>
//             </form>
//           )}
//         </div>
        
//         <div className="px-8 py-4 bg-primary/5 border-t border-primary/10 text-center">
//           <p className="text-[10px] text-primary/40 font-bold uppercase tracking-widest flex items-center justify-center gap-2">
//             <CheckCircle2 size={12} />
//             Worker Data Is Fully Isolated
//           </p>
//         </div>
//       </div>
//     </div>
//   );
// };


// import React, { useState, useEffect } from 'react';
// import { useWorker } from '../contexts/WorkerContext';
// import { useWorkerRates } from '../hooks/useWorkerRates';
// import { supabase } from '../lib/supabase';
// import { format } from 'date-fns';
// import { X, UserPlus, Trash2, Camera, Shield, CheckCircle2, Edit2, Save, ArrowLeft, DollarSign, Star } from 'lucide-react';
// import { Worker } from '../types';

// interface WorkerModalProps {
//   isOpen: boolean;
//   onClose: () => void;
// }

// export const WorkerModal: React.FC<WorkerModalProps> = ({ isOpen, onClose }) => {
//   const { workers, addWorker, updateWorker } = useWorker();
//   const [mode, setMode] = useState<'LIST' | 'CREATE' | 'EDIT'>('LIST');
//   const [editingWorker, setEditingWorker] = useState<Worker | null>(null);

//   // Form State
//   const [name, setName] = useState('');
//   const [avatarUrl, setAvatarUrl] = useState('');
//   const [password, setPassword] = useState('');
//   const [dailyRate, setDailyRate] = useState<number>(100);
//   const [effectiveDate, setEffectiveDate] = useState<string>(format(new Date(), 'yyyy-MM-dd'));
//   const [isDefault, setIsDefault] = useState(false);
//   const [isAdmin, setIsAdmin] = useState(false);
//   const [submitting, setSubmitting] = useState(false);
  
//   const { currentRate, updateRate } = useWorkerRates(editingWorker?.id || null);

//   // Sync dailyRate when currentRate loads (only in EDIT mode)
//   useEffect(() => {
//     if (mode === 'EDIT' && currentRate) {
//         setDailyRate(currentRate);
//     }
//   }, [currentRate, mode]);

//   // Reset form when modal opens or mode changes
//   useEffect(() => {
//     if (!isOpen) {
//       setMode('LIST');
//       resetForm();
//     }
//   }, [isOpen]);

//   const resetForm = () => {
//     setName('');
//     setAvatarUrl('');
//     setPassword('');
//     setDailyRate(100);
//     setEffectiveDate(format(new Date(), 'yyyy-MM-dd'));
//     setIsDefault(false);
//     setIsAdmin(false);
//     setEditingWorker(null);
//     setSubmitting(false);
//   };

//   const startEdit = (worker: Worker) => {
//     setEditingWorker(worker);
//     setName(worker.name);
//     setAvatarUrl(worker.avatar_url || '');
//     setPassword(''); // Don't pre-fill password hash
//     setIsDefault(!!worker.is_default);
//     setIsAdmin(!!worker.is_admin);
//     setMode('EDIT');
//   };

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     if (!name.trim() || submitting) return;

//     setSubmitting(true);
//     try {
//       if (mode === 'CREATE') {
//         const newWorker = await addWorker(name, avatarUrl || undefined, password || undefined, isDefault, isAdmin);
//         // Create initial rate
//         await supabase.from('worker_rates').insert({
//             worker_id: newWorker.id,
//             rate_amount: dailyRate,
//             effective_from: format(new Date(), 'yyyy-MM-dd')
//         });
//         // WorkerContext.addWorker handles navigation to new slug
//       } else if (mode === 'EDIT' && editingWorker) {
//         await updateWorker(editingWorker.id, {
//           name,
//           avatar_url: avatarUrl || undefined,
//           password: password || undefined, // Only update if provided
//           is_default: isDefault,
//           is_admin: isAdmin
//         });
        
//         // Update rate if changed
//         if (dailyRate !== currentRate) {
//             await updateRate(dailyRate, new Date(effectiveDate));
//         }
//         // WorkerContext.updateWorker handles navigation if slug changes
//       }
//       setMode('LIST');
//       resetForm();
//     } catch (err) {
//       alert('Failed to save worker');
//     } finally {
//       setSubmitting(false);
//     }
//   };

//   const getInitials = (name: string) => {
//     return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
//   };

//   if (!isOpen) return null;

//   return (
//     <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
//       <div className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300" onClick={onClose} />
      
//       <div className="bg-white relative w-full max-w-lg glass-panel rounded-[32px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 border border-primary/20">
//         <div className="px-8 py-6 border-b border-primary/10 flex justify-between items-center bg-primary/5">
//           <div className=" flex items-center gap-3">
//             {mode !== 'LIST' && (
//               <button 
//                 onClick={() => setMode('LIST')}
//                 className="p-1.5 -ml-2 rounded-full hover:bg-primary/10 text-primary/60 hover:text-primary transition-colors"
//                 aria-label="LIST"
//                 title="LIST"
//               >
//                 <ArrowLeft size={20} />
//               </button>
//             )}
//             <div>
//               <h2 className=" text-2xl font-black tracking-tight text-cyan-500/50">                {mode === 'LIST' ? 'Worker Management' : (mode === 'CREATE' ? 'New Profile' : 'Edit Profile')}
//               </h2>
//               <p className="text-sm text-primary/60 font-medium">
//                 {mode === 'LIST' ? 'Manage user profiles' : 'Configure worker details'}
//               </p>
//             </div>
//           </div>
//           <button 
//             onClick={onClose}
//             className="p-2 hover:bg-primary/10 rounded-full transition-colors text-primary"
//             aria-label="Close"
//             title="Close"
//           >
//             <X size={24} />
//           </button>
//         </div>

//         <div className="p-8">
//           {mode === 'LIST' ? (
//             <div className=" space-y-6">
//               <div className="grid grid-cols-1 gap-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
//                 {workers.map(worker => (
//                   <div key={worker.id} className="shadow-lg hover:shadow-md  flex items-center gap-4 p-4 rounded-2xl bg-primary/5 border border-primary/10 group hover:border-primary/30 transition-premium relative overflow-hidden">
//                     {/* Active Indicator */}
//                     <div className=" w-12 h-12 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center overflow-hidden shrink-0 border-2 border-white/50 dark:border-white/10 shadow-sm">
//                       {worker.avatar_url ? (
//                         <img src={worker.avatar_url} alt={worker.name} className="w-full h-full object-cover" />
//                       ) : (
//                         <span className="text-lg font-black text-primary/80">
//                           {getInitials(worker.name)}
//                         </span>
//                       )}
//                     </div>
                    
//                     <div className="flex-1 min-w-0">
//                       <div className="flex items-center gap-2">
//                                       <p className="text-gray-900 font-bold  truncate text-lg">{worker.name}</p>                        {worker.is_default && (
//                           <span className="px-1.5 py-0.5 rounded bg-primary/10 text-primary text-[8px] font-black uppercase tracking-tighter border border-primary/20">Default</span>
//                         )}
//                         {worker.is_admin && (
//                           <span className="px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-600 text-[8px] font-black uppercase tracking-tighter border border-amber-500/20">Admin</span>
//                         )}
//                         {worker.password_hash && (
//                           <Shield size={12} className="text-success/80" strokeWidth={3} />
//                         )}
//                       </div>
//                       <p className="text-[10px] text-primary/40 font-mono truncate">/{worker.slug}</p>
//                     </div>

//                     <button
//                       onClick={() => startEdit(worker)}
//                                                             className="p-2 rounded-xl bg-white dark:bg-black/20 text-primary opacity-0 group-hover:opacity-100 transition-all hover:bg-cyan-500/50 hover:text-white shadow-sm translate-x-4 group-hover:translate-x-0"                      title="Edit Profile"
//                     >
//                       <Edit2 size={16} />
//                     </button>
//                   </div>
//                 ))}
//               </div>

//               <button
//                 onClick={() => {
//                   resetForm();
//                   setMode('CREATE');
//                 }}
// className="hover:bg-cyan-500 hover:border-white hover:animate-pulse w-full py-4 rounded-2xl bg-white dark:bg-primary border-2 border-dashed border-primary/30 hover:border-primary text-primary dark:text-white font-black flex items-center justify-center gap-3 transition-premium active:scale-95"                // className="w-full py-4 rounded-2xl bg-white dark:bg-primary border-2 border-dashed border-primary/30 hover:border-primary text-primary dark:text-white font-black flex items-center justify-center gap-3 transition-premium active:scale-95"
//               >
//                 <UserPlus size={20} />
//                 Add New Worker Profile
//               </button>
//             </div>
//           ) : (
//             <form onSubmit={handleSubmit} className="space-y-6">
//               <div className="space-y-4">
//                 {/* Avatar Preview */}
//                 <div className="flex justify-center mb-6">
//                   <div className="w-24 h-24 rounded-full bg-primary/5 border-4 border-white dark:border-white/10 shadow-lg flex items-center justify-center overflow-hidden relative group">
//                     {avatarUrl ? (
//                       <img src={avatarUrl} alt="Preview" className="w-full h-full object-cover" />
//                     ) : (
//                       <div className="flex flex-col items-center justify-center text-primary/30">
//                          {name ? (
//                             <span className="text-3xl font-black text-primary/40">{getInitials(name)}</span>
//                          ) : (
//                             <Camera size={32} />
//                          )}
//                       </div>
//                     )}
//                   </div>
//                 </div>

//                 <div className="space-y-2">
//                   <label className="text-xs font-black uppercase tracking-widest text-primary/60 px-1">Worker Name</label>
//                   <input
//                     autoFocus
//                     required
//                     type="text"
//                     value={name}
//                     onChange={e => setName(e.target.value)}
//                     placeholder="e.g. John Doe"
//                     className="w-full px-6 py-4 rounded-2xl bg-primary/5 border-2 border-transparent focus:border-primary/30 focus:bg-white outline-none transition-premium font-bold text-lg"
//                   />
//                   {mode === 'CREATE' && name && (
//                     <p className="text-[10px] text-primary/40 px-2 font-mono">
//                       Will generate URL: /{name.toLowerCase().replace(/\s+/g, '-')}
//                     </p>
//                   )}
//                 </div>

//                 <div className="space-y-2">
//                   <label className="text-xs font-black uppercase tracking-widest text-primary/60 px-1">Avatar URL (Optional)</label>
//                   <input
//                     type="url"
//                     value={avatarUrl}
//                     onChange={e => setAvatarUrl(e.target.value)}
//                     placeholder="data:image/png;base64,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"
//                     className="w-full px-6 py-4 rounded-2xl bg-primary/5 border-2 border-transparent focus:border-primary/30 focus:bg-white outline-none transition-premium font-medium"
//                   />
//                 </div>

//                 <div className="grid grid-cols-2 gap-4">
//                   <button
//                     type="button"
//                     onClick={() => setIsDefault(!isDefault)}
//                     className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${isDefault ? 'border-primary bg-primary/5' : 'border-primary/10 hover:border-primary/30'}`}
//                   >
//                     <Star size={20} className={isDefault ? 'text-primary' : 'text-primary/30'} fill={isDefault ? 'currentColor' : 'none'} />
//                     <span className="text-[10px] font-black uppercase tracking-widest text-primary/60">Default Worker</span>
//                   </button>
//                   <button
//                     type="button"
//                     onClick={() => setIsAdmin(!isAdmin)}
//                     className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${isAdmin ? 'border-amber-500 bg-amber-500/5' : 'border-primary/10 hover:border-primary/30'}`}
//                   >
//                     <Shield size={20} className={isAdmin ? 'text-amber-500' : 'text-primary/30'} />
//                     <span className="text-[10px] font-black uppercase tracking-widest text-primary/60">Admin Role</span>
//                   </button>
//                 </div>

//                 <div className="space-y-2">
//                   <label className="text-xs font-black uppercase tracking-widest text-primary/60 px-1">
//                     {mode === 'EDIT' ? 'Change Password (Optional)' : 'Password (Optional)'}
//                   </label>
//                   <div className="relative">
//                     <input
//                       type="password"
//                       value={password}
//                       onChange={e => setPassword(e.target.value)}
//                       placeholder={mode === 'EDIT' ? "Leave empty to keep current" : "Leave empty for no password"}
//                       className="w-full px-6 py-4 rounded-2xl bg-primary/5 border-2 border-transparent focus:border-primary/30 focus:bg-white outline-none transition-premium font-medium pl-12"
//                     />
//                     <Shield size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-primary/40" />
//                   </div>
//                 </div>

//                 <div className="space-y-2">
//                    <label className="text-xs font-black uppercase tracking-widest text-primary/60 px-1">Daily Rate Target</label>
//                    <div className="relative">
//                      <span className="absolute left-6 top-1/2 -translate-y-1/2 text-primary font-black text-lg">$</span>
//                      <input
//                         type="number"
//                         min="1"
//                         value={dailyRate}
//                         onChange={e => setDailyRate(Number(e.target.value))}
//                         className="w-full px-6 py-4 rounded-2xl bg-primary/5 border-2 border-transparent focus:border-primary/30 focus:bg-white outline-none transition-premium font-black text-lg pl-12"
//                         title="Daily Rate"
//                      />
//                    </div>
                   
//                    {mode === 'EDIT' && dailyRate !== currentRate && (
//                        <div className="animate-in fade-in slide-in-from-top-2 pt-2">
//                            <label className="text-[10px] font-bold uppercase tracking-widest text-primary/60 px-1 block mb-1">
//                                Effective From Date
//                            </label>
//                            <input 
//                                 type="date"
//                                 value={effectiveDate}
//                                 onChange={e => setEffectiveDate(e.target.value)}
//                                 className="w-full px-4 py-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-600 font-bold text-sm outline-none focus:border-amber-500/50"
//                                 title="Effective Date"
//                            />
//                            <p className="text-[10px] text-amber-600/70 px-2 font-medium pt-1">
//                                New rate of ${dailyRate} will apply starting from {effectiveDate}. Past days will keep the old rate.
//                            </p>
//                        </div>
//                    )}
//                    {mode === 'CREATE' && (
//                        <p className="text-[10px] text-primary/40 px-2 font-mono pt-1">
//                             Initial rate effective immediately.
//                        </p>
//                    )}
//                 </div>
//               </div>

//               <div className="flex gap-4 pt-4">
//                 <button
//                   type="button"
//                   onClick={() => setMode('LIST')}
//                   className="flex-1 py-4 px-6 rounded-2xl bg-primary/5 hover:bg-primary/10 text-primary font-bold transition-premium"
//                 >
//                   Cancel
//                 </button>
//                 <button
//                   type="submit"
//                   disabled={submitting || !name.trim()}
//                   className="flex-[2] py-4 px-6 rounded-2xl bg-primary text-white font-black shadow-premium hover:shadow-premium-hover hover:-translate-y-0.5 transition-premium disabled:opacity-50 disabled:translate-y-0 flex items-center justify-center gap-2"
//                 >
//                   {submitting ? 'Saving...' : (
//                     <>
//                       <Save size={18} />
//                       {mode === 'CREATE' ? 'Create Profile' : 'Save Changes'}
//                     </>
//                   )}
//                 </button>
//               </div>
//             </form>
//           )}
//         </div>
        
//         <div className="px-8 py-4 bg-primary/5 border-t border-primary/10 text-center">
//           <p className="text-[10px] text-primary/40 font-bold uppercase tracking-widest flex items-center justify-center gap-2">
//             <CheckCircle2 size={12} />
//             Worker Data Is Fully Isolated
//           </p>
//         </div>
//       </div>
//     </div>
//   );
// };
import React, { useState, useEffect } from 'react';
import { useWorker } from '../contexts/WorkerContext';
import { useWorkerRates } from '../hooks/useWorkerRates';
import { useTelegramChats } from '../hooks/useTelegramChats';
import { supabase } from '../lib/supabase';
import { format } from 'date-fns';
import { X, UserPlus, Trash2, Camera, Shield, CheckCircle2, Edit2, Save, ArrowLeft, DollarSign, Star, Send } from 'lucide-react';
import { Worker } from '../types';

const TelegramSettings: React.FC<{ workerId: string }> = ({ workerId }) => {
  const { chats, loading, addChat, deleteChat, fetchChats } = useTelegramChats(workerId);
  const [newChatId, setNewChatId] = useState('');
  const [newLabel, setNewLabel] = useState('');
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    fetchChats();
  }, [fetchChats]);

  const handleAdd = async () => {
    if (!newChatId) return;
    setAdding(true);
    try {
      await addChat(newChatId, newLabel);
      setNewChatId('');
      setNewLabel('');
    } catch (err) {
      alert('Failed to add chat ID');
    } finally {
      setAdding(false);
    }
  };

  return (
    <div className="space-y-4 pt-4 border-t border-primary/10">
      <div className="flex items-center gap-2 text-cyan-500/80">
        <Send size={16} />
        <h3 className="text-xs font-black uppercase tracking-widest">Telegram Notifications</h3>
      </div>
      
      <div className="space-y-2">
        {chats.map(chat => (
          <div key={chat.id} className="flex items-center justify-between p-3 rounded-xl bg-primary/5 border border-primary/10">
            <div className="flex flex-col">
              <span className="text-xs font-bold font-mono text-primary/80">{chat.chat_id}</span>
              {chat.label && <span className="text-[10px] text-primary/50">{chat.label}</span>}
            </div>
            <button 
              onClick={() => deleteChat(chat.id)}
              className="p-1.5 text-danger/40 hover:text-danger hover:bg-danger/10 rounded-lg transition-colors"
              title="Remove Chat"
              type="button"
            >
              <Trash2 size={14} />
            </button>
          </div>
        ))}
        {chats.length === 0 && !loading && (
          <p className="text-[10px] text-primary/40 italic p-2 text-center">No tied Telegram chats. Global fallback will be used.</p>
        )}
      </div>

      <div className="flex gap-2">
        <input 
          type="text" 
          value={newChatId}
          onChange={e => setNewChatId(e.target.value)}
          placeholder="Chat ID"
          // className=" w-full px-6 py-4 rounded-2xl bg-gray-200 border-2 border-transparent focus:border-cyan-500 focus:bg-gray-500 text-cyan-500 outline-none transition-premium font-medium pl-12"

          className="flex-[2] px-3 py-2 rounded-xl bg-gray-200 border-2 border-transparent focus:border-cyan-500 focus:bg-gray-500 text-cyan-500 text-xs font-mono outline-none transition-premium font-medium pl-12"
        />
        <input 
          type="text" 
          value={newLabel}
          onChange={e => setNewLabel(e.target.value)}
          placeholder="Label (opt)"
          className="flex-[2] px-3 py-2 rounded-xl bg-gray-200 border-2 border-transparent focus:border-cyan-500 focus:bg-gray-500 text-cyan-500 text-xs font-mono outline-none transition-premium font-medium pl-12"
         
          // className="flex-1 px-3 py-2 rounded-xl bg-gray-200 border-2 border-transparent focus:border-cyan-500 text-xs outline-none"
        />
        <button 
          onClick={handleAdd}
          disabled={!newChatId || adding}
          type="button"
          title=" add chat id"
          className="px-3 py-2 bg-cyan-500 text-white rounded-xl disabled:opacity-50 hover:bg-cyan-600 transition-colors"
        >
          <UserPlus size={16} />
        </button>
      </div>
    </div>
  );
};

interface WorkerModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'LIST' | 'CREATE' | 'EDIT';
}

export const WorkerModal: React.FC<WorkerModalProps> = ({ isOpen, onClose, initialMode = 'LIST' }) => {
  const { workers, addWorker, updateWorker } = useWorker();
  const [mode, setMode] = useState<'LIST' | 'CREATE' | 'EDIT'>(initialMode);
  const [editingWorker, setEditingWorker] = useState<Worker | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [password, setPassword] = useState('');
  const [dailyRate, setDailyRate] = useState<number>(100);
  const [effectiveDate, setEffectiveDate] = useState<string>(format(new Date(), 'yyyy-MM-dd'));
  const [isDefault, setIsDefault] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  const { currentRate, updateRate } = useWorkerRates(editingWorker?.id || null);

  // Sync dailyRate when currentRate loads (only in EDIT mode)
  useEffect(() => {
    if (mode === 'EDIT' && currentRate) {
        setDailyRate(currentRate);
    }
  }, [currentRate, mode]);

  // Reset form when modal opens or mode changes
  useEffect(() => {
    if (!isOpen) {
      setMode(initialMode);
      resetForm();
    }
  }, [isOpen, initialMode]);

  const resetForm = () => {
    setName('');
    setAvatarUrl('');
    setPassword('');
    setDailyRate(100);
    setEffectiveDate(format(new Date(), 'yyyy-MM-dd'));
    setIsDefault(false);
    setIsAdmin(false);
    setEditingWorker(null);
    setSubmitting(false);
  };

  const startEdit = (worker: Worker) => {
    setEditingWorker(worker);
    setName(worker.name);
    setAvatarUrl(worker.avatar_url || '');
    setPassword(''); // Don't pre-fill password hash
    setIsDefault(!!worker.is_default);
    setIsAdmin(!!worker.is_admin);
    setMode('EDIT');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || submitting) return;

    setSubmitting(true);
    try {
      if (mode === 'CREATE') {
        const newWorker = await addWorker(name, avatarUrl || undefined, password || undefined, isDefault, isAdmin);
        // Create initial rate
        await supabase.from('worker_rates').insert({
            worker_id: newWorker.id,
            rate_amount: dailyRate,
            effective_from: format(new Date(), 'yyyy-MM-dd')
        });
        // WorkerContext.addWorker handles navigation to new slug
      } else if (mode === 'EDIT' && editingWorker) {
        await updateWorker(editingWorker.id, {
          name,
          avatar_url: avatarUrl || undefined,
          password: password || undefined, // Only update if provided
          is_default: isDefault,
          is_admin: isAdmin
        });
        
        // Update rate if changed
        if (dailyRate !== currentRate) {
            await updateRate(dailyRate, new Date(effectiveDate));
        }
        // WorkerContext.updateWorker handles navigation if slug changes
      }
      setMode('LIST');
      resetForm();
    } catch (err) {
      alert('Failed to save worker');
    } finally {
      setSubmitting(false);
    }
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300" onClick={onClose} />
      
      <div className="bg-white relative w-full max-w-lg glass-panel rounded-[32px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 border border-primary/20">
        <div className="px-8 py-6 border-b border-primary/10 flex justify-between items-center bg-primary/5">
          <div className=" flex items-center gap-3">
            {mode !== 'LIST' && (
              <button 
                onClick={() => setMode('LIST')}
                className="p-1.5 -ml-2 rounded-full hover:bg-primary/10 text-primary/60 hover:text-primary transition-colors"
                aria-label="LIST"
                title="LIST"
              >
                <ArrowLeft size={20} />
              </button>
            )}
            <div>
              <h2 className=" text-2xl font-black tracking-tight text-cyan-500/50">                {mode === 'LIST' ? 'Worker Management' : (mode === 'CREATE' ? 'New Profile' : 'Edit Profile')}
              </h2>
              <p className="text-sm text-primary/60 font-medium">
                {mode === 'LIST' ? 'Manage user profiles' : 'Configure worker details'}
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-primary/10 rounded-full transition-colors text-primary"
            aria-label="Close"
            title="Close"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-8">
          {mode === 'LIST' ? (
            <div className=" space-y-6">
              <div className="grid grid-cols-1 gap-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                {workers.map(worker => (
                  <div key={worker.id} className="shadow-lg hover:shadow-md  flex items-center gap-4 p-4 rounded-2xl bg-primary/5 border border-primary/10 group hover:border-primary/30 transition-premium relative overflow-hidden">
                    {/* Active Indicator */}
                    <div className=" w-12 h-12 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center overflow-hidden shrink-0 border-2 border-white/50 dark:border-white/10 shadow-sm">
                      {worker.avatar_url ? (
                        <img src={worker.avatar_url} alt={worker.name} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-lg font-black text-primary/80">
                          {getInitials(worker.name)}
                        </span>
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                                      <p className="text-gray-900 font-bold  truncate text-lg">{worker.name}</p>                        {worker.is_default && (
                          <span className="px-1.5 py-0.5 rounded bg-primary/10 text-primary text-[8px] font-black uppercase tracking-tighter border border-primary/20">Default</span>
                        )}
                        {worker.is_admin && (
                          <span className="px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-600 text-[8px] font-black uppercase tracking-tighter border border-amber-500/20">Admin</span>
                        )}
                        {worker.password_hash && (
                          <Shield size={12} className="text-success/80" strokeWidth={3} />
                        )}
                      </div>
                      <p className="text-[10px] text-primary/40 font-mono truncate">/{worker.slug}</p>
                    </div>

                    <button
                      onClick={() => startEdit(worker)}
                                                            className="p-2 rounded-xl bg-white dark:bg-black/20 text-primary opacity-0 group-hover:opacity-100 transition-all hover:bg-cyan-500/50 hover:text-white shadow-sm translate-x-4 group-hover:translate-x-0"                      title="Edit Profile"
                    >
                      <Edit2 size={16} />
                    </button>
                  </div>
                ))}
              </div>

              <button
                onClick={() => {
                  resetForm();
                  setMode('CREATE');
                }}
className="hover:bg-cyan-500 hover:border-white hover:animate-pulse w-full py-4 rounded-2xl bg-white dark:bg-primary border-2 border-dashed border-primary/30 hover:border-primary text-primary dark:text-white font-black flex items-center justify-center gap-3 transition-premium active:scale-95"                // className="w-full py-4 rounded-2xl bg-white dark:bg-primary border-2 border-dashed border-primary/30 hover:border-primary text-primary dark:text-white font-black flex items-center justify-center gap-3 transition-premium active:scale-95"
              >
                <UserPlus size={20} />
                Add New Worker Profile
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                {/* Avatar Preview */}
                <div className="flex justify-center mb-6">
                  <div className="w-24 h-24 rounded-full bg-primary/5 border-4 border-white dark:border-white/10 shadow-lg flex items-center justify-center overflow-hidden relative group">
                    {avatarUrl ? (
                      <img src={avatarUrl} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <div className="flex flex-col items-center justify-center text-primary/30">
                         {name ? (
                            <span className="text-3xl font-black text-primary/40">{getInitials(name)}</span>
                         ) : (
                            <Camera size={32} />
                         )}
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-cyan-500/60 px-1">Worker Name</label>
                  <input
                    autoFocus
                    required
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="e.g. John Doe"
                    className=" w-full px-6 py-4 rounded-2xl bg-gray-200 border-2 border-transparent focus:border-cyan-500 focus:bg-gray-500 text-cyan-500 outline-none transition-premium font-medium"
                    // className="w-full px-6 py-4 rounded-2xl bg-primary/5 border-2 border-transparent focus:border-primary/30 focus:bg-white outline-none transition-premium font-bold text-lg"
                  />
                  {mode === 'CREATE' && name && (
                    <p className="text-[10px] text-primary/40 px-2 font-mono">
                      Will generate URL: /{name.toLowerCase().replace(/\s+/g, '-')}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-cyan-500/60 px-1">Avatar URL (Optional)</label>
                  <input
                    type="url"
                    value={avatarUrl}
                    onChange={e => setAvatarUrl(e.target.value)}
                    placeholder="data:image/png;base64,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"
                    className=" w-full px-6 py-4 rounded-2xl bg-gray-200 border-2 border-transparent focus:border-cyan-500 focus:bg-gray-500 text-cyan-500 outline-none transition-premium font-medium"
                    // className=" w-full px-6 py-4 rounded-2xl bg-primary/5 border-2 border-transparent focus:border-primary/30 focus:bg-white outline-none transition-premium font-medium"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => setIsDefault(!isDefault)}
                    className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${isDefault ? 'border-primary bg-primary/5' : 'border-primary/10 hover:border-primary/30'}`}
                  >
                    <Star size={20} className={isDefault ? 'text-primary' : 'text-primary/30'} fill={isDefault ? 'currentColor' : 'none'} />
                    <span className="text-[10px] font-black uppercase tracking-widest text-primary/60">Default Worker</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsAdmin(!isAdmin)}
                    className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${isAdmin ? 'border-amber-500 bg-amber-500/5' : 'border-primary/10 hover:border-primary/30'}`}
                  >
                    <Shield size={20} className={isAdmin ? 'text-amber-500' : 'text-primary/30'} />
                    <span className="text-[10px] font-black uppercase tracking-widest text-primary/60">Admin Role</span>
                  </button>
                </div>

                <div className=" space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-cyan-500/60 px-1">
                    {mode === 'EDIT' ? 'Change Password (Optional)' : 'Password (Optional)'}
                  </label>
                  <div className="relative">
                    <input
                      type="password"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder={mode === 'EDIT' ? "Leave empty to keep current" : "Leave empty for no password"}
                    // className=" w-full px-6 py-4 rounded-2xl bg-gray-200 border-2 border-transparent focus:border-cyan-500 focus:bg-gray-500 text-cyan-500 outline-none transition-premium font-medium"
                    // className=" w-full px-6 py-4 rounded-2xl bg-gray-200 border-2 border-transparent focus:border-cyan-500 focus:bg-gray-500 text-cyan-500 outline-none transition-premium font-medium"
                      
                    className=" w-full px-6 py-4 rounded-2xl bg-gray-200 border-2 border-transparent focus:border-cyan-500 focus:bg-gray-500 text-cyan-500 outline-none transition-premium font-medium pl-12"
                      // className=" w-full px-6 py-4 rounded-2xl bg-gray-500 border-2 border-transparent focus:border-primary/30 focus:bg-white outline-none transition-premium font-medium pl-12"
                      // className=" w-full px-6 py-4 rounded-2xl bg-primary/5 border-2 border-transparent focus:border-primary/30 focus:bg-white outline-none transition-premium font-medium pl-12"
                    />
                    <Shield size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-primary/40" />
                  </div>
                </div>

                <div className="space-y-2">
                   <label className="text-xs font-black uppercase tracking-widest text-cyan-500/60 px-1">Daily Rate Target</label>
                   <div className="relative">
                     <span className="absolute left-6 top-1/2 -translate-y-1/2 text-primary font-black text-lg">$</span>
                     <input
                        type="number"
                        min="1"
                        value={dailyRate}
                        onChange={e => setDailyRate(Number(e.target.value))}
                    className=" w-full px-6 py-4 rounded-2xl bg-gray-200 border-2 border-transparent focus:border-cyan-500 focus:bg-gray-500 text-cyan-500 outline-none transition-premium font-medium pl-12"
                        
                        // className="w-full px-6 py-4 rounded-2xl bg-gray-500 border-2 border-transparent focus:border-primary/30 focus:bg-white outline-none transition-premium font-black text-lg pl-12"
                        title="Daily Rate"
                     />
                   </div>
                   
                   {mode === 'EDIT' && dailyRate !== currentRate && (
                       <div className="animate-in fade-in slide-in-from-top-2 pt-2">
                           <label className="text-[10px] font-bold uppercase tracking-widest text-primary/60 px-1 block mb-1">
                               Effective From Date
                           </label>
                           <input 
                                type="date"
                                value={effectiveDate}
                                onChange={e => setEffectiveDate(e.target.value)}
                                className="w-full px-4 py-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-600 font-bold text-sm outline-none focus:border-amber-500/50"
                                title="Effective Date"
                           />
                           <p className="text-[10px] text-amber-600/70 px-2 font-medium pt-1">
                               New rate of ${dailyRate} will apply starting from {effectiveDate}. Past days will keep the old rate.
                           </p>
                       </div>
                   )}
                   {mode === 'CREATE' && (
                       <p className="text-[10px] text-primary/40 px-2 font-mono pt-1">
                            Initial rate effective immediately.
                       </p>
                   )}
                </div>
                
                {/* Telegram Settings Section - Only in Edit Mode */}
                {mode === 'EDIT' && editingWorker && (
                  <TelegramSettings workerId={editingWorker.id} />
                )}
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setMode('LIST')}
                  className="hover:bg-red-500/20 hover:border-red-300 border-1 flex-1 py-4 px-6 rounded-2xl bg-primary/5 hover:bg-primary/10 text-primary font-bold transition-premium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting || !name.trim()}
                  className="hover:bg-cyan-500 flex-[2] py-4 px-6 rounded-2xl bg-primary text-white font-black shadow-premium hover:shadow-premium-hover hover:-translate-y-0.5 transition-premium disabled:opacity-50 disabled:translate-y-0 flex items-center justify-center gap-2"
                >
                  {submitting ? 'Saving...' : (
                    <>
                      <Save size={18} />
                      {mode === 'CREATE' ? 'Create Profile' : 'Save Changes'}
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
        
        <div className="px-8 py-4 bg-primary/5 border-t border-primary/10 text-center">
          <p className="text-[10px] text-primary/40 font-bold uppercase tracking-widest flex items-center justify-center gap-2">
            <CheckCircle2 size={12} />
            Worker Data Is Fully Isolated
          </p>
        </div>
      </div>
    </div>
  );
};
