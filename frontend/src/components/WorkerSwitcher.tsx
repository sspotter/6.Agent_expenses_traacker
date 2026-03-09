// // import React, { useState, useRef, useEffect } from 'react';
// // import { useNavigate } from 'react-router-dom';
// // import { useWorker } from '../contexts/WorkerContext';
// // import { User, ChevronDown, UserPlus, Settings, LogOut } from 'lucide-react';

// // interface WorkerSwitcherProps {
// //   onOpenManagement: () => void;
// // }

// // export const WorkerSwitcher: React.FC<WorkerSwitcherProps> = ({ onOpenManagement }) => {
// //   const { activeWorker, workers, lockWorker } = useWorker();
// //   const navigate = useNavigate();
// //   const [isOpen, setIsOpen] = useState(false);
// //   const dropdownRef = useRef<HTMLDivElement>(null);

// //   useEffect(() => {
// //     const handleClickOutside = (event: MouseEvent) => {
// //       if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
// //         setIsOpen(false);
// //       }
// //     };
// //     document.addEventListener('mousedown', handleClickOutside);
// //     return () => document.removeEventListener('mousedown', handleClickOutside);
// //   }, []);

// //   const getInitials = (name: string) => {
// //     return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
// //   };

// //   return (
// //     <div className="relative" ref={dropdownRef}>
// //       <button
// //         onClick={() => setIsOpen(!isOpen)}
// //         className="flex items-center gap-2 p-1.5 glass-button rounded-full transition-premium group"
// //       >
// //         <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center overflow-hidden border border-primary/30 group-hover:border-primary transition-colors">
// //           {activeWorker?.avatar_url ? (
// //             <img src={activeWorker.avatar_url} alt={activeWorker.name} className="w-full h-full object-cover" />
// //           ) : (
// //             <span className="text-xs font-bold text-primary">
// //               {activeWorker ? getInitials(activeWorker.name) : '?'}
// //             </span>
// //           )}
// //         </div>
// //         <div className="hidden sm:block text-left mr-1">
// //           <p className="text-[10px] uppercase tracking-widest font-black text-primary/60 leading-tight">Worker</p>
// //           <p className="text-xs font-bold text-main leading-tight">{activeWorker?.name || 'Loading...'}</p>
// //         </div>
// //         <ChevronDown size={14} className={`text-primary/60 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
// //       </button>

// //       {isOpen && (
// //         <div className="bg-white shadow-2xl absolute right-0 mt-2 w-64 glass-panel rounded-2xl  border border-primary/10 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
// //           <div className="px-4 py-2 border-b border-primary/5 mb-2">
// //             <p className="text-[10px] uppercase tracking-widest font-black text-primary/40">Switch User</p>
// //           </div>
          
// //           <div className="max-h-60 overflow-y-auto custom-scrollbar">
// //             {workers.map(worker => (
// //               <button
// //                 key={worker.id}
// //                 onClick={() => {
// //                   navigate(`/${worker.slug}`);
// //                   setIsOpen(false);
// //                 }}
// //                 className={` hover:bg-[#0f172a]/20 w-full flex items-center gap-3 px-4 py-2.5 transition-colors  text-left border-l-2 ${activeWorker?.id === worker.id ? 'bg-resolved/20 border-primary bg-primary/5' : 'border-transparent'}`}
// //               >
// //                 <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden shrink-0">
// //                   {worker.avatar_url ? (
// //                     <img src={worker.avatar_url} alt={worker.name} className="w-full h-full object-cover" />
// //                   ) : (
// //                     <span className="text-xs font-bold text-primary">{getInitials(worker.name)}</span>
// //                   )}
// //                 </div>
// //                 <div className=" flex-1 min-w-0">
// //                   <div className="flex items-center gap-1.5">
// //                     <p className={`text-sm font-bold truncate ${activeWorker?.id === worker.id ? 'text-primary' : 'text-main'}`}>
// //                       {worker.name}
// //                     </p>
// //                     {worker.is_default && <span className="text-[8px] font-black uppercase bg-primary/10 text-primary px-1 rounded border border-primary/20">Default</span>}
// //                   </div>
// //                   {activeWorker?.id === worker.id && (
// //                     <p className=" text-[10px] text-primary/60 font-medium">Active Now</p>
// //                   )}
// //                 </div>
// //               </button>
// //             ))}
// //           </div>

// //           <div className="mt-2 pt-2 border-t border-primary/5 flex flex-col gap-1">
// //             {activeWorker?.password_hash && (
// //                 <button
// //                 onClick={() => {
// //                     lockWorker(activeWorker.id);
// //                     setIsOpen(false);
// //                 }}
// //                 className="w-full flex items-center gap-3 px-4 py-2.5 transition-colors hover:bg-primary/5 text-left text-orange-500 group"
// //                 >
// //                 <div className="w-8 h-8 rounded-full bg-orange-500/10 flex items-center justify-center group-hover:bg-orange-500 group-hover:text-white transition-colors">
// //                     <LogOut size={14} />
// //                 </div>
// //                 <span className="text-sm font-bold">Lock Workspace</span>
// //                 </button>
// //             )}
// //             <button
// //               onClick={() => {
// //                 onOpenManagement();
// //                 setIsOpen(false);
// //               }}
// //               className="w-full flex items-center gap-3 px-4 py-2.5 transition-colors hover:bg-primary/5 text-left text-primary group"
// //             >
// //               <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors">
// //                 <Settings size={14} />
// //               </div>
// //               <span className="text-sm font-bold">Manage Users</span>
// //             </button>
// //           </div>
// //         </div>
// //       )}
// //     </div>
// //   );
// // };
// import React, { useState, useRef, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { useWorker } from '../contexts/WorkerContext';
// import { User, ChevronDown, UserPlus, Settings, LogOut } from 'lucide-react';

// interface WorkerSwitcherProps {
//   onOpenManagement: () => void;
// }

// export const WorkerSwitcher: React.FC<WorkerSwitcherProps> = ({ onOpenManagement }) => {
//   const { activeWorker, workers, lockWorker } = useWorker();
//   const navigate = useNavigate();
//   const [isOpen, setIsOpen] = useState(false);
//   const dropdownRef = useRef<HTMLDivElement>(null);

//   useEffect(() => {
//     const handleClickOutside = (event: MouseEvent) => {
//       if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
//         setIsOpen(false);
//       }
//     };
//     document.addEventListener('mousedown', handleClickOutside);
//     return () => document.removeEventListener('mousedown', handleClickOutside);
//   }, []);

//   const getInitials = (name: string) => {
//     return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
//   };

//   return (
//     <div className="relative" ref={dropdownRef}>
//       <button
//         onClick={() => setIsOpen(!isOpen)}
//         className="flex items-center gap-2 p-1.5 glass-button rounded-full transition-premium group"
//       >
//         <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center overflow-hidden border border-primary/30 group-hover:border-primary transition-colors">
//           {activeWorker?.avatar_url ? (
//             <img src={activeWorker.avatar_url} alt={activeWorker.name} className="w-full h-full object-cover" />
//           ) : (
//             <span className="text-xs font-bold text-primary">
//               {activeWorker ? getInitials(activeWorker.name) : '?'}
//             </span>
//           )}
//         </div>
//         <div className="hidden sm:block text-left mr-1">
//           <p className="text-[10px] uppercase tracking-widest font-black text-cyan-500/50 leading-tight">Worker</p>
//           <p className="text-xs font-bold text-cyan-500/20 leading-tight">{activeWorker?.name || 'Loading...'}</p>
//           {/* <p className="text-xs font-bold text-main leading-tight">{activeWorker?.name || 'Loading...'}</p> */}
//         </div>
//         <ChevronDown size={14} className={`text-primary/60 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
//       </button>

//       {isOpen && (
//         // <div className="bg-white shadow-2xl absolute right-0 mt-2 w-64 glass-panel rounded-2xl  border border-primary/10 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
//           <div className=" bg-white shadow-2xl absolute right-0 mt-2 w-64 glass-panel rounded-2xl  border border-primary/10 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
//           <div className="px-4 py-2 border-b border-primary/5 mb-2">

//             <p className="text-[10px] uppercase tracking-widest font-black text-primary/40">Switch User</p>
//           </div>
          
//           <div className="max-h-60 overflow-y-auto custom-scrollbar">
//             {workers.map(worker => (
//               <button
//                 key={worker.id}
//                 onClick={() => {
//                   navigate(`/${worker.slug}`);
//                   setIsOpen(false);
//                 }}
// className={` hover:bg-[#0f172a]/20 w-full flex items-center gap-3 px-4 py-2.5 transition-colors  text-left border-l-2 ${activeWorker?.id === worker.id ? 'bg-resolved/20 border-cyan-500 bg-primary/5' : 'border-transparent'}`}              >
// {/* className={`  hover:bg-red-500 w-full flex items-center gap-3 px-4 py-2.5 transition-colors  text-left border-l-2 ${activeWorker?.id === worker.id ? 'bg-resolved/20 border-primary bg-primary/5' : 'border-transparent'}`}              > */}
//                 <div className=" hover:bg-red-500 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden shrink-0">
//                   {worker.avatar_url ? (
//                     <img src={worker.avatar_url} alt={worker.name} className="w-full h-full object-cover" />
//                   ) : (
//                     <span className="text-xs font-bold text-primary">{getInitials(worker.name)}</span>
//                   )}
//                 </div>
//                 <div className=" flex-1 min-w-0">
//                   <div className="flex items-center gap-1.5">
//                   <p className={`text-sm font-bold truncate ${activeWorker?.id === worker.id ? 'text-primary' : 'text-black '}`}>                      {worker.name}
//                     </p>
//                     {worker.is_default && <span className="text-[8px] font-black uppercase bg-primary/10 text-primary px-1 rounded border border-primary/20">Default</span>}
//                   </div>
//                   {activeWorker?.id === worker.id && (
//                     <p className=" text-[10px] text-primary/60 font-medium">Active Now</p>
//                   )}
//                 </div>
//               </button>
//             ))}
//           </div>

//           <div className="mt-2 pt-2 border-t border-primary/5 flex flex-col gap-1">
//             {activeWorker?.password_hash && (
//                 <button
//                 onClick={() => {
//                     lockWorker(activeWorker.id);
//                     setIsOpen(false);
//                 }}
//                 className="w-full flex items-center gap-3 px-4 py-2.5 transition-colors hover:bg-primary/5 text-left text-orange-500 group"
//                 >
//                 <div className="w-8 h-8 rounded-full bg-orange-500/10 flex items-center justify-center group-hover:bg-orange-500 group-hover:text-white transition-colors">
//                     <LogOut size={14} />
//                 </div>
//                 <span className="text-sm font-bold">Lock Workspace</span>
//                 </button>
//             )}
//             <button
//               onClick={() => {
//                 onOpenManagement();
//                 setIsOpen(false);
//               }}
//               className="w-full flex items-center gap-3 px-4 py-2.5 transition-colors hover:bg-blue-500/20 text-left text-primary group"
//             >
//               <div className="w-8 h-8 rounded-full bg-primary/30 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors">
//                 <Settings size={14} />
//               </div>
//               <span className="text-sm font-bold">Manage Users</span>
//             </button>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };



import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWorker } from '../contexts/WorkerContext';
import { User, ChevronDown, UserPlus, Settings, LogOut, Shield } from 'lucide-react';

interface WorkerSwitcherProps {
  onOpenManagement: () => void;
}

export const WorkerSwitcher: React.FC<WorkerSwitcherProps> = ({ onOpenManagement }) => {
  const { activeWorker, workers, lockWorker } = useWorker();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 p-1.5 glass-button rounded-full transition-premium group"
      >
        <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center overflow-hidden border border-primary/30 group-hover:border-primary transition-colors">
          {activeWorker?.avatar_url ? (
            <img src={activeWorker.avatar_url} alt={activeWorker.name} className="w-full h-full object-cover" />
          ) : (
            <span className="text-xs font-bold text-primary">
              {activeWorker ? getInitials(activeWorker.name) : '?'}
            </span>
          )}
        </div>
        <div className="hidden sm:block text-left mr-1">
          <p className="text-[10px] uppercase tracking-widest font-black text-primary/60 leading-tight">Worker</p>
          <p className="text-xs font-bold text-main leading-tight">{activeWorker?.name || 'Loading...'}</p>
        </div>
        <ChevronDown size={14} className={`text-primary/60 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        // <div className="bg-white shadow-2xl absolute right-0 mt-2 w-64 glass-panel rounded-2xl  border border-primary/10 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className=" bg-white shadow-2xl absolute right-0 mt-2 w-64 glass-panel rounded-2xl  border border-primary/10 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="px-4 py-2 border-b border-primary/5 mb-2">

            <p className="text-[10px] uppercase tracking-widest font-black text-primary/40">Switch User</p>
          </div>
          
          <div className="max-h-60 overflow-y-auto custom-scrollbar">
            {workers.filter(w => !w.is_suspended).map(worker => (
              <button
                key={worker.id}
                onClick={() => {
                  navigate(`/${worker.slug}`);
                  setIsOpen(false);
                }}className={` hover:bg-[#0f172a]/20 w-full flex items-center gap-3 px-4 py-2.5 transition-colors  text-left border-l-2 ${activeWorker?.id === worker.id ? 'bg-resolved/20 border-cyan-500 bg-primary/5' : 'border-transparent'}`}              >

                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden shrink-0">
                  {worker.avatar_url ? (
                    <img src={worker.avatar_url} alt={worker.name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-xs font-bold text-primary">{getInitials(worker.name)}</span>
                  )}
                </div>
                <div className=" flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                  <p className={`text-sm font-bold truncate ${activeWorker?.id === worker.id ? 'text-primary' : 'text-black '}`}>                      {worker.name}
                    </p>
                    {worker.is_default && <span className="text-[8px] font-black uppercase bg-primary/10 text-primary px-1 rounded border border-primary/20">Default</span>}
                  </div>
                  {activeWorker?.id === worker.id && (
                    <p className=" text-[10px] text-primary/60 font-medium">Active Now</p>
                  )}
                </div>
              </button>
            ))}
          </div>

          <div className="mt-2 pt-2 border-t border-primary/5 flex flex-col gap-1">
            {activeWorker?.password_hash && (
                <button
                onClick={() => {
                    lockWorker(activeWorker.id);
                    setIsOpen(false);
                }}
                className="w-full flex items-center gap-3 px-4 py-2.5 transition-colors hover:bg-primary/5 text-left text-orange-500 group"
                >
                <div className="w-8 h-8 rounded-full bg-orange-500/10 flex items-center justify-center group-hover:bg-orange-500 group-hover:text-white transition-colors">
                    <LogOut size={14} />
                </div>
                <span className="text-sm font-bold">Lock Workspace</span>
                </button>
            )}
            <button
              onClick={() => {
                onOpenManagement();
                setIsOpen(false);
              }}
              className="w-full flex items-center gap-3 px-4 py-2.5 transition-colors hover:bg-primary/5 text-left text-primary group"
            >
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors">
                <Settings size={14} />
              </div>
              <span className="text-sm font-bold">Manage Users</span>
            </button>

            <button
              onClick={() => {
                navigate('/admin');
                setIsOpen(false);
              }}
              className="w-full flex items-center gap-3 px-4 py-2.5 transition-colors hover:bg-primary/5 text-left text-primary group border-t border-primary/5"
            >
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors">
                <Shield size={14} />
              </div>
              <span className="text-sm font-bold">Admin Panel</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
