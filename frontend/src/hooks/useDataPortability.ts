import { useState } from 'react';
import { supabase } from '../lib/supabase';

export function useDataPortability() {
  const [loading, setLoading] = useState(false);

  const exportData = async () => {
    setLoading(true);
    try {
      const tables = [
        'workers',
        'worker_rates',
        'daily_collections',
        'weekly_expenses',
        'settlements',
        'settlement_allocations',
        'expense_payments',
        'payment_events',
        'monthly_notes'
      ];

      const backup: Record<string, any[]> = {};

      for (const table of tables) {
        const { data, error } = await supabase.from(table).select('*');
        if (error) throw error;
        backup[table] = data || [];
      }

      const payload = {
        version: '1.0',
        timestamp: new Date().toISOString(),
        data: backup
      };

      const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `agent_tracker_backup_${formatDate(new Date())}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

    } catch (err) {
      console.error('Export failed:', err);
      alert('Backup failed. Check console for details.');
    } finally {
      setLoading(false);
    }
  };

  const importData = async (file: File) => {
    setLoading(true);
    try {
      const text = await file.text();
      const payload = JSON.parse(text);

      if (payload.version !== '1.0') {
        throw new Error('Incompatible backup version');
      }

      if (!confirm('This will OVERWRITE your existing database records if IDs match. Are you sure?')) {
        return;
      }

      const data = payload.data;
      
      // Order matters for foreign keys
      const order = [
        'workers',
        'worker_rates',
        'daily_collections',
        'weekly_expenses',
        'settlements',
        'settlement_allocations',
        'expense_payments',
        'payment_events',
        'monthly_notes'
      ];

      for (const table of order) {
        if (!data[table] || data[table].length === 0) continue;
        
        // Using upsert to handle existing records
        const { error } = await supabase.from(table).upsert(data[table]);
        if (error) throw error;
      }

      alert('Data imported successfully!');
      window.location.reload(); 

    } catch (err: any) {
      console.error('Import failed:', err);
      alert(`Restore failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date: Date) => {
    return date.toISOString().split('T')[0] + '_' + date.getHours() + '-' + date.getMinutes();
  };

  return {
    exportData,
    importData,
    loading
  };
}
