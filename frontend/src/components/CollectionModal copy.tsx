// import React, { useState, useEffect } from 'react';
// import { X } from 'lucide-react';
// import { format } from 'date-fns';
// import clsx from 'clsx';
// import { type CollectionStatus } from '../types';

// interface CollectionModalProps {
//   isOpen: boolean;
//   onClose: () => void;
//   day: Date;
//   expectedAmount: number;
//   existingData?: {
//     collected_amount: number;
//     status: CollectionStatus;
//     notes?: string;
//     is_expected_override?: boolean;
//     expected_amount?: number; // Add this just in case? No, it's passed as top level expectedAmount prop.
//   };
//   onSave: (data: { collected_amount: number; status: CollectionStatus; notes: string; expected_amount: number; is_expected_override?: boolean }) => void;
//   allocatedAmount?: number;
//   isSettled?: boolean;
// }

// export const CollectionModal: React.FC<CollectionModalProps> = ({
//   isOpen,
//   onClose,
//   day,
//   expectedAmount,
//   existingData,
//   onSave,
//   allocatedAmount = 0,
//   isSettled = false
// }) => {
//   const [amount, setAmount] = useState<string>('');
//   const [status, setStatus] = useState<CollectionStatus>('PARTIAL');
//   const [notes, setNotes] = useState('');
  
//   // New state for expected amount override
//   const [currentExpected, setCurrentExpected] = useState<number>(expectedAmount);
//   const [isEditingExpected, setIsEditingExpected] = useState(false);
//   const [isOverride, setIsOverride] = useState(false);

//   useEffect(() => {
//     if (isOpen) {
//       if (existingData) {
//         setAmount(existingData.collected_amount.toString());
//         setNotes(existingData.notes || '');
        
//         // existingData.expected_amount is our stored truth from DB
//         const storedExpected = (existingData as any).expected_amount;
//         if (typeof storedExpected === 'number') {
//              setCurrentExpected(storedExpected);
//              // If stored differs from current base rate, it's an override
//              setIsOverride(storedExpected !== expectedAmount);
//         } else {
//              // Legacy or new record without stored expected
//              setCurrentExpected(expectedAmount);
//              setIsOverride(false);
//         }
//       } else {
//         setAmount('');
//         setNotes('');
//         setCurrentExpected(expectedAmount);
//         setIsOverride(false);
//       }
//       setIsEditingExpected(false);
//     }
//   }, [isOpen, existingData, expectedAmount]);

//   // Derived Attendance Status - Task 2.2 in 14.expected_amount.md
//   useEffect(() => {
//     if (currentExpected === 0) {
//         setStatus('MISSED');
//     } else if (currentExpected < expectedAmount) {
//         setStatus('PARTIAL');
//     } else {
//         setStatus('FULL');
//     }
//   }, [currentExpected, expectedAmount]);

//   // REMOVED: Auto-calculate status based on collected amount
//   // Status is now derived from Expected Amount (Attendance) above.

//   if (!isOpen) return null;

//   const handleSubmit = (e: React.FormEvent) => {
//     e.preventDefault();
//     const numAmount = parseFloat(amount) || 0;
//     onSave({
//       collected_amount: numAmount,
//       status,
//       notes,
//       expected_amount: currentExpected,
//       is_expected_override: isOverride
//     });
//     onClose();
//   };

//   return (
//     <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
//       <div className="absolute inset-0 bg-[#0f172a]/20 backdrop-blur-sm" onClick={onClose} />
//       <div className="relative glass rounded-[2.5rem] shadow-premium max-w-md w-full overflow-hidden animate-in fade-in zoom-in duration-300">
//         <div className="flex justify-between items-center p-8 pb-4">
//           <div className="flex flex-col">
//             <h3 className="text-2xl font-black tracking-tighter text-amber-500 leading-tight">
//               {format(day, 'MMMM d, yyyy')}
//             </h3>
//             {isSettled && (
//               <span className="text-[10px] font-black uppercase text-success bg-success/10 px-2 py-0.5 rounded-full self-start mt-1">
//                 Resolved via Settlement
//               </span>
//             )}
//           </div>
//           <button onClick={onClose} className="p-2 hover:bg-danger/50 rounded-full transition-premium text-sub" aria-label="Close">
//             <X size={20} />
//           </button>
//         </div>

//         <form onSubmit={handleSubmit} className="p-8 pt-4 space-y-6">
//           <div className="grid grid-cols-2 gap-4">
//             <div className="p-4 bg-primary/5 rounded-2xl border border-primary/10 relative group">
//                 <p className="text-[10px] font-bold text-sub uppercase tracking-widest flex items-center gap-2">
//                     Expected 
//                     {isOverride && (
//                         <span className="bg-amber-500/10 text-amber-500 px-1 rounded text-[8px]">MANUAL</span>
//                     )}
//                 </p>
//                 {isEditingExpected ? (
//                     <input 
//                         type="number"
//                         autoFocus
//                         onBlur={() => setIsEditingExpected(false)}
//                         value={currentExpected}
//                         onChange={(e) => {
//                             const val = parseFloat(e.target.value);
//                             setCurrentExpected(val);
//                             // If value differs from base rate, mark as override
//                             if (val !== expectedAmount) {
//                                 setIsOverride(true);
//                             } else {
//                                 setIsOverride(false);
//                             }
//                         }}
//                         className="w-full bg-white border border-primary/20 rounded px-2 text-2xl font-black text-main tracking-tight outline-none"
//                         aria-label="Expected Amount Override"
//                     />
//                 ) : (
//                     <p 
//                         className="text-2xl font-black text-main tracking-tight cursor-pointer hover:underline decoration-dashed decoration-primary/30"
//                         onClick={() => setIsEditingExpected(true)}
//                         title="Click to override daily expectation"
//                     >
//                         ${currentExpected}
//                     </p>
//                 )}
//             </div>
//              <div className="p-4 bg-primary/30 rounded-2xl border border-primary/10">
//                 <p className="text-[10px] font-bold text-amber-500 uppercase tracking-widest">Remaining</p>
//                 <p className="text-2xl font-black text-amber-500 tracking-tight">
//                     ${Math.max(0, currentExpected - (parseFloat(amount) || 0))}
//                 </p>
//             </div>
//           </div>

//           <div className="space-y-2">
//             <label className="text-xs font-bold text-sub uppercase tracking-widest ml-1">
//               Collected Amount
//             </label>
//             <div className="relative group">
//               <span className="absolute left-5 top-1/2 -translate-y-1/2 text-xl font-bold text-sub transition-premium group-focus-within:text-primary">$</span>
//               <input
//                 type="number"
//                 autoFocus
//                 value={amount}
//                 onChange={(e) => setAmount(e.target.value)}
//                 min="0"
//                 className="w-full pl-10 pr-6 py-4 bg-primary/5 border-2 border-transparent rounded-2xl focus:border-primary focus:bg-primary/10 text-main outline-none transition-premium text-xl font-bold tracking-tight"
//                 placeholder="0.00"
//               />
//             </div>
//           </div>

//           {allocatedAmount > 0 && (
//              <div className="flex flex-col gap-2 p-4 bg-success/5 border border-success/10 rounded-2xl">
//                <div className="flex justify-between items-center">
//                   <span className="text-[10px] font-bold text-success/60 uppercase tracking-widest">Settled Later</span>
//                   <span className="text-sm font-black text-success tracking-tight">+ ${allocatedAmount}</span>
//                </div>
//                <p className="text-[10px] leading-relaxed text-success/70 font-medium">
//                  This missing amount was recovered via late settlements. Editing the daily collection below to match the full amount will result in <strong>double counting</strong>.
//                </p>
//              </div>
//           )}

//           <div className="space-y-3">
//             <label className="text-xs font-bold text-sub uppercase tracking-widest ml-1">Attendance / Shift Type</label>
//             <div className="flex gap-3 ">
//                 {(['FULL', 'PARTIAL', 'MISSED'] as const).map((s) => (
//                     <button
//                         key={s}
//                         type="button"
//                         onClick={() => {
//                            if (s === 'FULL') {
//                                setCurrentExpected(expectedAmount);
//                                setIsOverride(false);
//                            } else if (s === 'PARTIAL') {
//                                setCurrentExpected(expectedAmount * 0.5);
//                                setIsOverride(true);
//                            } else if (s === 'MISSED') {
//                                setCurrentExpected(0);
//                                setIsOverride(true);
//                                setAmount('0'); // If they didn't work, they likely collected 0
//                            }
//                         }}
//                         className={clsx(
//                           "flex-1 py-3 px-2 rounded-2xl text-[10px] font-black uppercase tracking-widest border-2 transition-premium",
//                           status === s 
//                             ? s === 'FULL' ? 'hover:bg-success hover:text-white bg-success/10 border-success text-success shadow-sm'
//                             : s === 'PARTIAL' ? ' hover: hover:bg-warning/20 bg-warning/10 border-warning text-warning shadow-sm'
//                             : ' bg-danger/10 border-danger text-danger shadow-sm'
//                             : 'hover:animate-pulse  bg-primary/5 border-transparent text-sub hover:bg-primary/10'
//                         )}
//                     >
//                         {s}
//                     </button>
//                 ))}
//             </div>
//           </div>

//           <div className="space-y-2">
//             <label className="text-xs font-bold text-sub uppercase tracking-widest ml-1">
//               Notes
//             </label>
//             <textarea
//               value={notes}
//               onChange={(e) => setNotes(e.target.value)}
//               className="w-full p-5 bg-primary/5 border-2 border-transparent focus:border-primary/20 focus:bg-primary/10 rounded-2xl outline-none min-h-[100px] transition-premium text-sm font-medium text-main"
//               placeholder="Add details about this collection..."
//             />
//           </div>

//           <div className="flex gap-4 pt-4">
//             <button
//               type="button"
//               onClick={onClose}
//               className="border-2 rounded-2xl hover:animate-pulse hover:bg-red-500 flex-1 px-6 py-4 text-sub font-bold uppercase tracking-widest text-xs hover:text-main transition-premium"
//             >
//               Cancel
//             </button>
//             <button
//               type="submit"
//               className="hover:bg-success flex-1 px-6 py-4 bg-primary text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-premium hover:shadow-premium-hover transition-premium hover:-translate-y-0.5"
//             >
//               Update Record
//             </button>
//           </div>
//         </form>
//       </div>
//     </div>
//   );
// };
