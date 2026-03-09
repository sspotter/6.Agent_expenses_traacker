import React, { useMemo } from 'react';
import { 
  format, 
  eachDayOfInterval, 
  startOfMonth, 
  endOfMonth, 
  getWeek,
  getDate,
  isWithinInterval,
  isToday,
  isBefore,
  startOfDay
} from 'date-fns';
import { type DailyCollection, type WeeklyExpense, type Settlement, type ExpensePayment, type SettlementAllocation } from '../types';
import { Check, X, AlertCircle, Edit2, Plus, History as LuHistory } from 'lucide-react';
import clsx from 'clsx';
import { WeeklyExpenseCard } from './WeeklyExpenseCard';

interface DailyGridProps {
  currentMonth: Date;
  collections: DailyCollection[];
  expenses: WeeklyExpense[];
  settlements: Settlement[];
  allocations: SettlementAllocation[];
  expensePayments: ExpensePayment[];
  onDayClick: (date: Date) => void;
  onAddExpense: (weekStart: Date) => void;
  onPayExpense: (expense: WeeklyExpense) => void;
  onViewHistory: (type: 'DAILY_COLLECTION' | 'WEEKLY_EXPENSE', id: string, title: string, subtitle: string) => void;
  onQuickFullPay: (date: Date) => void; // ✅ NEW
  isLoading?: boolean;
}

export const DailyGrid: React.FC<DailyGridProps> = ({ 
  currentMonth, 
  collections, 
  expenses,
  settlements,
  allocations,
  expensePayments,
  onDayClick,
  onQuickFullPay,
  onAddExpense,
  onPayExpense,
  onViewHistory,
  isLoading = false
}) => {
  const isPastMonth = React.useMemo(() => {
    return isBefore(endOfMonth(currentMonth), startOfMonth(new Date()));
  }, [currentMonth]);

  const weeks = React.useMemo(() => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

    const weeksMap = new Map<number, Date[]>();
    
    days.forEach(day => {
      const weekNum = getWeek(day); 
      if (!weeksMap.has(weekNum)) {
        weeksMap.set(weekNum, []);
      }
      weeksMap.get(weekNum)?.push(day);
    });

    return Array.from(weeksMap.values());
  }, [currentMonth]);


  const getStatusStyles = (status?: string, today?: boolean) => {
    if (status === 'FULL') return 'bg-success/10 text-success border-success/30';
    if (status === 'PARTIAL') return 'bg-warning/10 text-warning border-warning/30';
    if (status === 'MISSED') return 'bg-danger/10 text-danger border-danger/30';

  // const getCellStyles = (status?: string, isPaidOff?: boolean, isPartialShift?: boolean, isMissedShift?: boolean, today?: boolean) => {
  //   if (isMissedShift) return 'bg-gray-100 text-gray-400 border-gray-200 opacity-60';
  //   if (isPaidOff) return 'bg-success/10 text-success border-success/30';
  //   if (status) {
  //       // We have a shift record but it's not paid off
  //       return 'bg-danger/10 text-danger border-danger/20'; 
  //   }
    
    return clsx(
      'bg-white border-gray-100 text-gray-400',
      !isPastMonth && 'hover:border-primary/30 hover:bg-white cursor-pointer bg-primary/10',
      today && 'border-primary ring-2 ring-primary/20 ring-offset-2'
    );
  };

  const getCollection = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return collections.find(c => c.date === dateStr);
  };

  const getWeeklyFinancials = (weekDays: Date[]) => {
      const start = weekDays[0];
      const end = weekDays[weekDays.length - 1];
      
      // Income from daily collections
      const dailyIncome = weekDays.reduce((acc, day) => {
          const col = getCollection(day);
          return acc + (col?.collected_amount || 0);
      }, 0);

      // Income from settlements received THIS week
      const settlementIncome = settlements.filter(s => {
          const sDate = new Date(s.settlement_date);
          return isWithinInterval(sDate, { start, end }) || format(sDate, 'yyyy-MM-dd') === format(start, 'yyyy-MM-dd');
      }).reduce((acc, s) => acc + s.amount, 0);

      // Total Net Weekly Income
      const income = dailyIncome + settlementIncome;

      const weekExpenses = expenses.filter(e => {
        const eDate = new Date(e.week_start_date);
        return isWithinInterval(eDate, { start, end }) || format(eDate, 'yyyy-MM-dd') === format(start, 'yyyy-MM-dd');
      });

      const expenseTotal = weekExpenses.reduce((sum, e) => sum + e.amount, 0);
      const paidTotal = expensePayments
        .filter(p => weekExpenses.some(e => e.id === p.expense_id))
        .reduce((sum, p) => sum + p.amount, 0);

      // Return first unpaid expense for the Pay Now shortcut
      const unpaidExpense = weekExpenses.find(e => {
        const paid = expensePayments
          .filter(p => p.expense_id === e.id)
          .reduce((sum, p) => sum + p.amount, 0);
        return paid < e.amount;
      });

      return { 
        income, 
        expense: expenseTotal, 
        paidAmount: paidTotal,
        expenseObj: unpaidExpense || weekExpenses[0]
      };
  };

  return (
    <div className="overflow-x-auto pb-6 scrollbar-hide">
      <div className="min-w-[850px] grid grid-cols-5 gap-6">
        {isLoading ? (
          // Skeleton loader for 5 weeks
          [1, 2, 3, 4, 5].map((w) => (
            <div key={w} className="flex flex-col space-y-4 animate-pulse">
              <div className="h-4 w-16 bg-primary/10 rounded-full" />
              <div className="space-y-3">
                {[1, 2, 3, 4, 5, 6, 7].map((d) => (
                  <div key={d} className="h-24 w-full bg-primary/10 rounded-2xl border-2 border-transparent" />
                ))}
              </div>
            </div>
          ))
        ) : (
          weeks.map((weekDays, index) => {
              const { income, expense, paidAmount, expenseObj } = getWeeklyFinancials(weekDays);
              
              return (
            <div key={index} className="flex flex-col space-y-4">
              <div className="flex justify-between items-center px-1">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">
                  Week {index + 1}
                </span>
                <button 
                  onClick={() => onAddExpense(weekDays[0])}
                  className="hover:bg-blue-500 border-blue-500 bg-blue-500/20 cursor-pointer dark:hover:border-sky-500 dark:border-white/80 p-1 hover:bg-primary/10 rounded-lg text-primary transition-premium border border-transparent "
                  title="Quick Add Expense"
                >
                  <Plus size={12} strokeWidth={3} color='blue' />
                </button>
              </div>
              
              <div className="space-y-3">
                {weekDays.map(day => {
                  const collection = getCollection(day);
                  const dayAllocations = allocations.filter(a => a.collection_id === collection?.id);
                  const allocatedTotal = dayAllocations.reduce((sum, a) => sum + a.allocated_amount, 0);
                  
                  const expected = collection?.expected_amount || 100;
                  const collected = collection?.collected_amount || 0;
                  const status = collection?.status;
                  
                  
                  const gap = expected - collected;
                  const isFullySettled = gap > 0 && allocatedTotal >= gap - 0.01;

                  const isPaidOff = (collected + allocatedTotal) >= expected - 0.01 && expected > 0;
                  const isMissedShift = status === 'MISSED' || (collection && expected === 0);
                  const isPartialShift = status === 'PARTIAL';
                  
                  const today = isToday(day);
                  const disabled = isPastMonth;
                  
                   return (
                     <div key={day.toString()} className="relative group">
                       <div
                         role="button"
                         tabIndex={disabled ? -1 : 0}
                         onClick={() => !disabled && onDayClick(day)}
                         onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); !disabled && onDayClick(day); } }}
                         aria-label={`Track collection for ${format(day, 'MMMM do')}`}
                         className={clsx(
                           " w-full p-4 rounded-2xl border-2 text-left transition-premium overflow-hidden cursor-pointer",
                          //  getCellStyles(status, isPaidOff, isPartialShift, isMissedShift, today),
                                                     isFullySettled 
                             ? " bg-resolved/10 border-resolved/30 text-resolved shadow-sm" 
                             : getStatusStyles(status, today),
                           disabled && " opacity-0 cursor-not-allowed pointer-events-none"
                         )}
                       >
                         <div className="flex justify-between items-start mb-2">
                           <span className={clsx(
                             "text-2xl font-black leading-none tracking-tighter",
                             !status ? "opacity-80" : "opacity-100"
                           )}>
                             {getDate(day)}
                           </span>
                            {/* <div className="flex items-center gap-1.5">
                              {isPaidOff && <Check size={16} strokeWidth={3} className="text-success" />}
                              {(status && !isPaidOff && !isMissedShift) && <AlertCircle size={16} strokeWidth={3} className="text-danger" />}
                              {isMissedShift && <X size={16} strokeWidth={3} className="text-gray-400" />}
                              {collection?.is_expected_override && (
                                <span className="text-[8px] bg-amber-500/10 text-amber-500 px-1 rounded font-black">M</span>
                              )}
                            </div> */}


                                                       <div className="flex items-center gap-1.5">
                             {status === 'FULL' && <Check size={16} strokeWidth={3} className="text-success" />}
                             {status === 'PARTIAL' && !isFullySettled && <AlertCircle size={16} strokeWidth={3} className="text-warning" />}
                             {status === 'MISSED' && !isFullySettled && <X size={16} strokeWidth={3} className="text-danger" />}
                             
                             {isFullySettled && (
                               <div className="flex items-center justify-center w-5 h-5 bg-resolved/20 rounded-full" title="Resolved via later settlement">
                                 <Check size={12} strokeWidth={4} className="text-resolved" />
                               </div>
                             )}
                           </div>
                         </div>
  
                         <div className="flex justify-between items-center min-h-[1.25rem]">
                           <div>
                              {/* {status && (
                                 <div className="flex flex-col">
                                   <div className="flex items-baseline gap-1">
                                     <span className={clsx(
                                       "text-sm font-bold",
                                       isPaidOff ? "text-success" : (isMissedShift ? "text-gray-400" : "text-danger")
                                     )}>
                                       ${(collection?.collected_amount || 0) + allocatedTotal}
                                     </span>
                                     <span className="text-[10px] opacity-60 font-medium">/ {expected}</span>
                                   </div>
                                    {isPartialShift && !isMissedShift && (
                                        <span className="text-[8px] font-bold text-amber-600 uppercase">Half Shift</span>
                                    )}
                                 </div>
                              )} */}


                                                        {status && (
                                <div className="flex flex-col">
                                  <div className="flex items-baseline gap-1">
                                    <span className={clsx(
                                      "text-sm font-bold",
                                      status === 'FULL' ? "text-success" : (isFullySettled ? "text-resolved" : (status === 'MISSED' ? "text-danger/60" : "text-amber-600"))
                                    )}>
                                      ${(collection?.collected_amount || 0) + allocatedTotal}
                                    </span>
                                    <span className="text-[10px] opacity-60 font-medium">/ {expected}</span>
                                  </div>
                                  {isFullySettled && (
                                    <div className="flex items-center gap-1 mt-0.5">
                                      <span className="text-[9px] font-black uppercase tracking-tight text-resolved flex items-center gap-1">
                                        <span className="w-1 h-1 bg-resolved rounded-full animate-pulse"></span>
                                        Resolved Late
                                      </span>
                                    </div>
                                  )}
                                </div>
                             )}
                           </div>
  
                           {collection?.id && (
                             <button
                               onClick={(e) => {
                                 e.stopPropagation();
                                 onViewHistory(
                                   'DAILY_COLLECTION', 
                                   collection.id, 
                                   format(day, 'MMMM do'), 
                                   'Collection & Settlements'
                                 );
                               }}
                               className="p-1.5 hover:bg-black/5 rounded-lg text-gray-400 hover:text-primary transition-premium opacity-80 group-hover:opacity-100"
                               title="View Audit Trail"
                             >
                               <LuHistory size={12} />
                             </button>
                           )}
                         </div>
                           {/* dark mode track word in dark color */}
  {!status && !disabled && (
    <div className="flex items-center justify-between gap-2">
      <span className="text-xs font-bold uppercase tracking-widest opacity-80 group-hover:opacity-100 transition-premium text-primary">
        Track
      </span>
  
      <button
        onClick={(e) => {
          e.stopPropagation(); // 🚨 prevents modal
          onQuickFullPay(day); // ✅ NO modal
        }}
        className="text-[10px] font-black uppercase tracking-widest 
                   text-success opacity-80 hover:opacity-100
                   transition-premium"
        title="Mark as fully paid"
      >
        Pay All
      </button>
    </div>
  )}
  
                       </div>
                       
                       {collection && !disabled && (
                         <button 
                           onClick={(e) => { e.stopPropagation(); onDayClick(day); }}
                           aria-label="Edit collection"
                           className="absolute bottom-2 right-2 p-1.5 rounded-lg glass shadow-sm opacity-0 group-hover:opacity-100 transition-premium text-sub hover:text-primary"
                         >
                           <Edit2 size={12} />
                         </button>
                       )}
                     </div>
                  );
                })}
              </div>
  
              <div className="mt-auto pt-2">
                  <WeeklyExpenseCard 
                      income={income} 
                      expense={expense} 
                      paidAmount={paidAmount}
                      hasExpense={!!expenseObj}
                      onAddExpense={() => onAddExpense(weekDays[0])} 
                      onPayExpense={() => expenseObj && onPayExpense(expenseObj)}
                      onViewHistory={() => expenseObj && onViewHistory(
                          'WEEKLY_EXPENSE', 
                          expenseObj.id, 
                          expenseObj.category || 'General Expense',
                          'Creation & Payments'
                      )}
                  />
              </div>
            </div>
              );
          })
        )}
      </div>
    </div>
  );
};



// import React, { useMemo } from 'react';
// import { 
//   format, 
//   eachDayOfInterval, 
//   startOfMonth, 
//   endOfMonth, 
//   getWeek,
//   getDate,
//   isWithinInterval,
//   isToday,
//   isBefore,
//   startOfDay
// } from 'date-fns';
// import { type DailyCollection, type WeeklyExpense, type Settlement, type ExpensePayment, type SettlementAllocation } from '../types';
// import { Check, X, AlertCircle, Edit2, Plus, History as LuHistory } from 'lucide-react';
// import clsx from 'clsx';
// import { WeeklyExpenseCard } from './WeeklyExpenseCard';

// interface DailyGridProps {
//   currentMonth: Date;
//   collections: DailyCollection[];
//   expenses: WeeklyExpense[];
//   settlements: Settlement[];
//   allocations: SettlementAllocation[];
//   expensePayments: ExpensePayment[];
//   onDayClick: (date: Date) => void;
//   onAddExpense: (weekStart: Date) => void;
//   onPayExpense: (expense: WeeklyExpense) => void;
//   onViewHistory: (type: 'DAILY_COLLECTION' | 'WEEKLY_EXPENSE', id: string, title: string, subtitle: string) => void;
//   onQuickFullPay: (date: Date) => void; // ✅ NEW
//   isLoading?: boolean;
// }

// export const DailyGrid: React.FC<DailyGridProps> = ({ 
//   currentMonth, 
//   collections, 
//   expenses,
//   settlements,
//   allocations,
//   expensePayments,
//   onDayClick,
//   onQuickFullPay,
//   onAddExpense,
//   onPayExpense,
//   onViewHistory,
//   isLoading = false
// }) => {
//   const isPastMonth = React.useMemo(() => {
//     return isBefore(endOfMonth(currentMonth), startOfMonth(new Date()));
//   }, [currentMonth]);

//   const weeks = React.useMemo(() => {
//     const monthStart = startOfMonth(currentMonth);
//     const monthEnd = endOfMonth(currentMonth);
//     const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

//     const weeksMap = new Map<number, Date[]>();
    
//     days.forEach(day => {
//       const weekNum = getWeek(day); 
//       if (!weeksMap.has(weekNum)) {
//         weeksMap.set(weekNum, []);
//       }
//       weeksMap.get(weekNum)?.push(day);
//     });

//     return Array.from(weeksMap.values());
//   }, [currentMonth]);

//   const getCellStyles = (status?: string, isPaidOff?: boolean, isPartialShift?: boolean, isMissedShift?: boolean, today?: boolean) => {
//     if (isMissedShift) return 'bg-gray-100 text-gray-400 border-gray-200 opacity-60';
//     if (isPaidOff) return 'bg-success/10 text-success border-success/30';
//     if (status) {
//         // We have a shift record but it's not paid off
//         return 'bg-danger/10 text-danger border-danger/20'; 
//     }
    
//     return clsx(
//       'bg-white border-gray-100 text-gray-400',
//       !isPastMonth && 'hover:border-primary/30 hover:bg-white cursor-pointer bg-primary/10',
//       today && 'border-primary ring-2 ring-primary/20 ring-offset-2'
//     );
//   };

//   const getCollection = (date: Date) => {
//     const dateStr = format(date, 'yyyy-MM-dd');
//     return collections.find(c => c.date === dateStr);
//   };

//   const getWeeklyFinancials = (weekDays: Date[]) => {
//       const start = weekDays[0];
//       const end = weekDays[weekDays.length - 1];
      
//       // Income from daily collections
//       const dailyIncome = weekDays.reduce((acc, day) => {
//           const col = getCollection(day);
//           return acc + (col?.collected_amount || 0);
//       }, 0);

//       // Income from settlements received THIS week
//       const settlementIncome = settlements.filter(s => {
//           const sDate = new Date(s.settlement_date);
//           return isWithinInterval(sDate, { start, end }) || format(sDate, 'yyyy-MM-dd') === format(start, 'yyyy-MM-dd');
//       }).reduce((acc, s) => acc + s.amount, 0);

//       // Total Net Weekly Income
//       const income = dailyIncome + settlementIncome;

//       const weekExpenses = expenses.filter(e => {
//         const eDate = new Date(e.week_start_date);
//         return isWithinInterval(eDate, { start, end }) || format(eDate, 'yyyy-MM-dd') === format(start, 'yyyy-MM-dd');
//       });

//       const expenseTotal = weekExpenses.reduce((sum, e) => sum + e.amount, 0);
//       const paidTotal = expensePayments
//         .filter(p => weekExpenses.some(e => e.id === p.expense_id))
//         .reduce((sum, p) => sum + p.amount, 0);

//       // Return first unpaid expense for the Pay Now shortcut
//       const unpaidExpense = weekExpenses.find(e => {
//         const paid = expensePayments
//           .filter(p => p.expense_id === e.id)
//           .reduce((sum, p) => sum + p.amount, 0);
//         return paid < e.amount;
//       });

//       return { 
//         income, 
//         expense: expenseTotal, 
//         paidAmount: paidTotal,
//         expenseObj: unpaidExpense || weekExpenses[0]
//       };
//   };

//   return (
//     <div className="overflow-x-auto pb-6 scrollbar-hide">
//       <div className="min-w-[850px] grid grid-cols-5 gap-6">
//         {isLoading ? (
//           // Skeleton loader for 5 weeks
//           [1, 2, 3, 4, 5].map((w) => (
//             <div key={w} className="flex flex-col space-y-4 animate-pulse">
//               <div className="h-4 w-16 bg-primary/10 rounded-full" />
//               <div className="space-y-3">
//                 {[1, 2, 3, 4, 5, 6, 7].map((d) => (
//                   <div key={d} className="h-24 w-full bg-primary/10 rounded-2xl border-2 border-transparent" />
//                 ))}
//               </div>
//             </div>
//           ))
//         ) : (
//           weeks.map((weekDays, index) => {
//               const { income, expense, paidAmount, expenseObj } = getWeeklyFinancials(weekDays);
              
//               return (
//             <div key={index} className="flex flex-col space-y-4">
//               <div className="flex justify-between items-center px-1">
//                 <span className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">
//                   Week {index + 1}
//                 </span>
//                 <button 
//                   onClick={() => onAddExpense(weekDays[0])}
//                   className="hover:bg-blue-500 border-blue-500 bg-blue-500/20 cursor-pointer dark:hover:border-sky-500 dark:border-white/80 p-1 hover:bg-primary/10 rounded-lg text-primary transition-premium border border-transparent "
//                   title="Quick Add Expense"
//                 >
//                   <Plus size={12} strokeWidth={3} color='blue' />
//                 </button>
//               </div>
              
//               <div className="space-y-3">
//                 {weekDays.map(day => {
//                   const collection = getCollection(day);
//                   const dayAllocations = allocations.filter(a => a.collection_id === collection?.id);
//                   const allocatedTotal = dayAllocations.reduce((sum, a) => sum + a.allocated_amount, 0);
                  
//                   const expected = collection?.expected_amount || 100;
//                   const collected = collection?.collected_amount || 0;
//                   const status = collection?.status;
                  
//                   const isPaidOff = (collected + allocatedTotal) >= expected - 0.01 && expected > 0;
//                   const isMissedShift = status === 'MISSED' || (collection && expected === 0);
//                   const isPartialShift = status === 'PARTIAL';
                  
//                   const today = isToday(day);
//                   const disabled = isPastMonth;
                  
//                    return (
//                      <div key={day.toString()} className="relative group">
//                        <div
//                          role="button"
//                          tabIndex={disabled ? -1 : 0}
//                          onClick={() => !disabled && onDayClick(day)}
//                          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); !disabled && onDayClick(day); } }}
//                          aria-label={`Track collection for ${format(day, 'MMMM do')}`}
//                          className={clsx(
//                            " w-full p-4 rounded-2xl border-2 text-left transition-premium overflow-hidden cursor-pointer",
//                            getCellStyles(status, isPaidOff, isPartialShift, isMissedShift, today),
//                            disabled && " opacity-0 cursor-not-allowed pointer-events-none"
//                          )}
//                        >
//                          <div className="flex justify-between items-start mb-2">
//                            <span className={clsx(
//                              "text-2xl font-black leading-none tracking-tighter",
//                              !status ? "opacity-80" : "opacity-100"
//                            )}>
//                              {getDate(day)}
//                            </span>
//                             <div className="flex items-center gap-1.5">
//                               {isPaidOff && <Check size={16} strokeWidth={3} className="text-success" />}
//                               {(status && !isPaidOff && !isMissedShift) && <AlertCircle size={16} strokeWidth={3} className="text-danger" />}
//                               {isMissedShift && <X size={16} strokeWidth={3} className="text-gray-400" />}
//                               {collection?.is_expected_override && (
//                                 <span className="text-[8px] bg-amber-500/10 text-amber-500 px-1 rounded font-black">M</span>
//                               )}
//                             </div>
//                          </div>
  
//                          <div className="flex justify-between items-center min-h-[1.25rem]">
//                            <div>
//                               {status && (
//                                  <div className="flex flex-col">
//                                    <div className="flex items-baseline gap-1">
//                                      <span className={clsx(
//                                        "text-sm font-bold",
//                                        isPaidOff ? "text-success" : (isMissedShift ? "text-gray-400" : "text-danger")
//                                      )}>
//                                        ${(collection?.collected_amount || 0) + allocatedTotal}
//                                      </span>
//                                      <span className="text-[10px] opacity-60 font-medium">/ {expected}</span>
//                                    </div>
//                                     {isPartialShift && !isMissedShift && (
//                                         <span className="text-[8px] font-bold text-amber-600 uppercase">Half Shift</span>
//                                     )}
//                                  </div>
//                               )}
//                            </div>
  
//                            {collection?.id && (
//                              <button
//                                onClick={(e) => {
//                                  e.stopPropagation();
//                                  onViewHistory(
//                                    'DAILY_COLLECTION', 
//                                    collection.id, 
//                                    format(day, 'MMMM do'), 
//                                    'Collection & Settlements'
//                                  );
//                                }}
//                                className="p-1.5 hover:bg-black/5 rounded-lg text-gray-400 hover:text-primary transition-premium opacity-80 group-hover:opacity-100"
//                                title="View Audit Trail"
//                              >
//                                <LuHistory size={12} />
//                              </button>
//                            )}
//                          </div>
//                            {/* dark mode track word in dark color */}
//   {!status && !disabled && (
//     <div className="flex items-center justify-between gap-2">
//       <span className="text-xs font-bold uppercase tracking-widest opacity-80 group-hover:opacity-100 transition-premium text-primary">
//         Track
//       </span>
  
//       <button
//         onClick={(e) => {
//           e.stopPropagation(); // 🚨 prevents modal
//           onQuickFullPay(day); // ✅ NO modal
//         }}
//         className="text-[10px] font-black uppercase tracking-widest 
//                    text-success opacity-80 hover:opacity-100
//                    transition-premium"
//         title="Mark as fully paid"
//       >
//         Pay All
//       </button>
//     </div>
//   )}
  
//                        </div>
                       
//                        {collection && !disabled && (
//                          <button 
//                            onClick={(e) => { e.stopPropagation(); onDayClick(day); }}
//                            aria-label="Edit collection"
//                            className="absolute bottom-2 right-2 p-1.5 rounded-lg glass shadow-sm opacity-0 group-hover:opacity-100 transition-premium text-sub hover:text-primary"
//                          >
//                            <Edit2 size={12} />
//                          </button>
//                        )}
//                      </div>
//                   );
//                 })}
//               </div>
  
//               <div className="mt-auto pt-2">
//                   <WeeklyExpenseCard 
//                       income={income} 
//                       expense={expense} 
//                       paidAmount={paidAmount}
//                       hasExpense={!!expenseObj}
//                       onAddExpense={() => onAddExpense(weekDays[0])} 
//                       onPayExpense={() => expenseObj && onPayExpense(expenseObj)}
//                       onViewHistory={() => expenseObj && onViewHistory(
//                           'WEEKLY_EXPENSE', 
//                           expenseObj.id, 
//                           expenseObj.category || 'General Expense',
//                           'Creation & Payments'
//                       )}
//                   />
//               </div>
//             </div>
//               );
//           })
//         )}
//       </div>
//     </div>
//   );
// };
