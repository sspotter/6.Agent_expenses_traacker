import { ChevronLeft, ChevronRight,   CalendarPlus  } from 'lucide-react';
import { format } from 'date-fns';

interface MonthNavigationProps {
  currentMonth: Date;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onOpenNotes: () => void;
  uncheckedNotesCount: number;
}

export const MonthNavigation: React.FC<MonthNavigationProps> = ({
  currentMonth,
  onPrevMonth,
  onNextMonth,
  onOpenNotes,
  uncheckedNotesCount,
}) => {
  return (
    <div className="flex items-center justify-between glass px-6 py-4 rounded-3xl border-white/50 mb-8">
      <div className="flex items-center gap-2">
        <button
          onClick={onPrevMonth}
          className="hover:bg-blue-500/20 border-blue-500 border-1 p-3 rounded-2xl transition-premium text-blue-500 hover:text-red-500 hover:shadow-premium"
          aria-label="Previous Month"
        >
          <ChevronLeft size={24} strokeWidth={2.5} />
        </button>

        <button
          onClick={onOpenNotes}
          className="relative hover:bg-primary/10 border-primary border-1 p-3 rounded-2xl transition-premium text-primary hover:shadow-premium group"
          aria-label="Monthly Notes"
        >
          <CalendarPlus size={24} strokeWidth={2.5} />
          {/* <StickyNote size={24} strokeWidth={2.5} /> */}
          {uncheckedNotesCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-danger text-[10px] font-black text-white ring-2 ring-white animate-in zoom-in duration-300">
              {uncheckedNotesCount}
            </span>
          )}
          <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 bg-primary text-white text-[10px] font-bold px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
            Monthly Notes
          </span>
        </button>
      </div>

      <div className="text-center group cursor-default">
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-1">Active View</p>
        <h2 className="hover:text-blue-500/80 text-2xl font-black tracking-tighter transition-premium group-hover:scale-110">
          {format(currentMonth, 'MMMM yyyy')}
        </h2>
      </div>

      <button
        onClick={onNextMonth}
        className="hover:bg-blue-500/20 border-blue-500 border-1 p-3 rounded-2xl transition-premium text-blue-500 hover:text-red-500 hover:shadow-premium"
        aria-label="Next Month"
      >
        <ChevronRight size={24} strokeWidth={2.5} />
      </button>
    </div>
  );
};
