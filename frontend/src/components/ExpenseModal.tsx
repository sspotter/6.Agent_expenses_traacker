import React, { useState } from 'react';
import { X, Plus, Trash2, Tag, DollarSign } from 'lucide-react';
import { format } from 'date-fns';
import { type WeeklyExpense } from '../types';
import clsx from 'clsx';

interface ExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  weekStart: Date;
  expenses: WeeklyExpense[];
  onAdd: (amount: number, category: string) => void;
  onUpdate: (id: string, amount: number, category: string) => void;
  onDelete?: (id: string) => void;
}

const PRESETS = [50, 100, 250, 500];

export const ExpenseModal: React.FC<ExpenseModalProps> = ({
  isOpen,
  onClose,
  weekStart,
  expenses,
  onAdd,
  onUpdate,
}) => {
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('General');
  const [editingId, setEditingId] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const num = parseFloat(amount);
    if (num > 0) {
      if (editingId) {
        onUpdate(editingId, num, category);
      } else {
        onAdd(num, category);
      }
      setAmount('');
      setCategory('General');
      setEditingId(null);
    }
  };

  const handleEdit = (exp: WeeklyExpense) => {
    setEditingId(exp.id);
    setAmount(exp.amount.toString());
    setCategory(exp.category || 'General');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[#0f172a]/20 backdrop-blur-sm" onClick={onClose} />
      <div className="relative glass rounded-[2.5rem] shadow-premium max-w-lg w-full overflow-hidden animate-in fade-in zoom-in duration-300">
        <div className="flex justify-between items-center p-8 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-xl">
              <Plus size={18} className="text-primary" />
            </div>
            <div>
              <h3 className="text-2xl font-black tracking-tighter text-gray-900">Weekly Expenses</h3>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Week of {format(weekStart, 'MMM do')}</p>
            </div>
          </div>
          <button onClick={onClose} aria-label="Close" className="p-2 hover:bg-gray-100 rounded-full transition-premium text-gray-400">
            <X size={20} />
          </button>
        </div>

        <div className="p-8 pt-4 space-y-8">
          {/* List of current expenses */}
          {expenses.length > 0 && (
            <div className="space-y-3">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Current Items</label>
              <div className="max-h-[200px] overflow-y-auto space-y-2 pr-2 scrollbar-hide">
                {expenses.map(exp => (
                  <div key={exp.id} className="flex justify-between items-center p-4 bg-white/50 border border-white rounded-2xl group hover:bg-white transition-premium">
                    <div className="flex items-center gap-3">
                      <div className="p-1.5 bg-gray-100 rounded-lg text-gray-400">
                        <Tag size={12} />
                      </div>
                      <div>
                        <span className="block text-sm font-black text-gray-900">{exp.category || 'General'}</span>
                        <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest">${exp.amount}</span>
                      </div>
                    </div>
                    <button 
                      onClick={() => handleEdit(exp)}
                      className="p-2 text-primary hover:bg-primary/5 rounded-xl transition-premium opacity-0 group-hover:opacity-100 font-bold text-[10px] uppercase tracking-widest"
                    >
                      Edit
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Add/Edit Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="flex-1 space-y-2">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Amount</label>
                  <div className="relative group">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg font-bold text-gray-400 group-focus-within:text-primary">$</span>
                    <input
                      type="number"
                      required
                      step="0.01"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="w-full pl-9 pr-4 py-3  border-2 border-transparent focus:border-primary focus:bg-white rounded-2xl outline-none transition-premium text-lg font-bold"
                      placeholder="0.00"
                    />
                  </div>
                </div>
                <div className="flex-[1.5] space-y-2">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Category</label>
                  <input
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-5 py-3 dark:text-amre dark:bg-gray-50/30 border-2 border-transparent focus:border-primary/20 focus:bg-white rounded-2xl outline-none transition-premium text-sm font-bold"
                    placeholder="General, Rent, Utils..."
                  />
                </div>
              </div>

              {/* Presets */}
              {!editingId && (
                <div className="flex gap-2">
                  {PRESETS.map(p => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setAmount(p.toString())}
                      className="px-3 py-1.5 bg-gray-100 hover:bg-primary/10 hover:text-primary rounded-lg text-[10px] font-black uppercase tracking-widest transition-premium text-gray-500"
                    >
                      ${p}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="flex gap-4">
              {editingId && (
                <button
                  type="button"
                  onClick={() => { setEditingId(null); setAmount(''); setCategory('General'); }}
                  className="flex-1 px-6 py-4 text-gray-400 font-bold uppercase tracking-widest text-xs hover:text-gray-600 transition-premium"
                >
                  Cancel
                </button>
              )}
              <button
                type="submit"
                className="flex-1 px-6 py-4 bg-primary text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-premium hover:shadow-premium-hover transition-premium hover:-translate-y-0.5"
              >
                {editingId ? 'Update Item' : 'Add New Item'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
