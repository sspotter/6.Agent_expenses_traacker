import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, CheckCircle2, Circle, StickyNote  } from 'lucide-react';
import { type MonthlyNote } from '../types';
import clsx from 'clsx';
import { format } from 'date-fns';

interface NoteItemProps {
  note: MonthlyNote;
  onToggle: (id: string, isChecked: boolean) => Promise<void>;
  onUpdateText: (id: string, text: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

const NoteItem: React.FC<NoteItemProps> = ({ note, onToggle, onUpdateText, onDelete }) => {
  const [localText, setLocalText] = useState(note.text);

  useEffect(() => {
    setLocalText(note.text);
  }, [note.text]);

  const handleBlur = () => {
    if (localText !== note.text) {
      onUpdateText(note.id, localText);
    }
  };

  return (
    <div 
      className={clsx(
        "group flex gap-4 p-5 rounded-[2rem] border transition-premium relative overflow-hidden",
        note.is_checked 
          ? "bg-primary/5 border-transparent opacity-60" 
          : "bg-white dark:bg-white/5 border-primary/10 shadow-sm hover:shadow-md hover:border-primary/20"
      )}
    >
      <button
        onClick={() => onToggle(note.id, !note.is_checked)}
        className={clsx(
          "mt-0.5 transition-premium shrink-0",
          note.is_checked ? "text-primary" : "text-sub hover:text-primary"
        )}
        title={note.is_checked ? "Mark as unchecked" : "Mark as checked"}
      >
        {note.is_checked ? <CheckCircle2 size={24} /> : <Circle size={24} />}
      </button>

      <div className="flex-1">
        <textarea
          value={localText}
          onChange={(e) => setLocalText(e.target.value)}
          onBlur={handleBlur}
          title="Edit Note Text"
          className={clsx(
            "w-full bg-transparent border-none focus:ring-0 p-0 text-sm font-bold resize-none leading-relaxed",
            note.is_checked && "line-through text-sub"
          )}
          rows={Math.max(1, localText.split('\n').length)}
        />
        <div className="mt-2 flex items-center justify-between">
          <span className="text-[9px] font-bold text-sub uppercase tracking-wider">
            {format(new Date(note.created_at), 'MMM do, HH:mm')}
          </span>
          <button
            onClick={() => onDelete(note.id)}
            className="p-2 text-danger/40 hover:text-danger hover:bg-danger/10 rounded-xl opacity-0 group-hover:opacity-100 transition-premium"
            title="Delete Note"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>
    </div>
  );
};

interface MonthlyNotesPanelProps {
  isOpen: boolean;
  onClose: () => void;
  notes: MonthlyNote[];
  month: Date;
  onAdd: (text: string) => Promise<any>;
  onToggle: (id: string, isChecked: boolean) => Promise<void>;
  onUpdateText: (id: string, text: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  isLoading?: boolean;
}

export const MonthlyNotesPanel: React.FC<MonthlyNotesPanelProps> = ({
  isOpen,
  onClose,
  notes,
  month,
  onAdd,
  onToggle,
  onUpdateText,
  onDelete,
  isLoading = false
}) => {
  const [newNoteText, setNewNoteText] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteText.trim()) return;
    
    setIsAdding(true);
    try {
      await onAdd(newNoteText);
      setNewNoteText('');
    } finally {
      setIsAdding(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end">
      <div 
        className="absolute inset-0 bg-[#0f172a]/20 backdrop-blur-sm" 
        onClick={onClose} 
      />
      
      <div className="relative h-full w-full max-w-md bg-white/95 dark:bg-[#0f172a]/95 backdrop-blur-xl shadow-premium animate-in slide-in-from-right duration-500 flex flex-col">
        <div className="p-8 border-b border-primary/5">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-primary/10 rounded-2xl text-primary">
                <StickyNote size={24} strokeWidth={2.5} />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-sub mb-0.5">Context & Reminders</p>
                <h2 className="text-2xl font-black tracking-tighter text-main">Monthly Notes</h2>
              </div>
            </div>
            <button 
              onClick={onClose} 
              className="p-3 hover:bg-primary/5 rounded-2xl transition-premium text-sub"
              title="Close Panel"
            >
              <X size={20} />
            </button>
          </div>
          <div className="px-4 py-2 bg-primary/5 rounded-xl inline-block">
            <span className="text-xs font-bold text-primary">{format(month, 'MMMM yyyy')}</span>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-8 space-y-4">
          {isLoading ? (
            <div className="space-y-4 animate-pulse">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-20 bg-primary/5 rounded-2xl" />
              ))}
            </div>
          ) : notes.length > 0 ? (
            notes.map((note) => (
              <NoteItem 
                key={note.id} 
                note={note} 
                onToggle={onToggle} 
                onUpdateText={onUpdateText} 
                onDelete={onDelete} 
              />
            ))
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center py-20 opacity-30">
              <StickyNote size={48} strokeWidth={1} className="mb-4" />
              <p className="text-sm font-bold uppercase tracking-widest">No notes for this month</p>
              <p className="text-xs mt-2">Add reminders or annotations below</p>
            </div>
          )}
        </div>

        <div className="p-8 border-t border-primary/5 bg-white/50 dark:bg-[#0f172a]/50">
          <form onSubmit={handleAdd} className="relative">
            <input
              type="text"
              value={newNoteText}
              onChange={(e) => setNewNoteText(e.target.value)}
              placeholder="Add a new note..."
              className="w-full pl-6 pr-14 py-5 bg-white dark:bg-white/5 border-2 border-primary/10 focus:border-primary focus:ring-0 rounded-[2rem] text-sm font-bold shadow-sm transition-premium"
              disabled={isAdding}
            />
            <button
              type="submit"
              disabled={isAdding || !newNoteText.trim()}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-3 bg-primary text-white rounded-2xl shadow-lg hover:scale-105 disabled:opacity-30 disabled:hover:scale-100 transition-premium"
              title="Add Note"
            >
              <Plus size={20} strokeWidth={3} />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
