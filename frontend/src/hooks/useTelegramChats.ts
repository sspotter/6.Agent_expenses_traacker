import { useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { WorkerTelegramChat } from '../types';

export function useTelegramChats(workerId: string | undefined) {
  const [chats, setChats] = useState<WorkerTelegramChat[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchChats = useCallback(async () => {
    if (!workerId) {
      setChats([]);
      return;
    }
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('worker_telegram_chats')
        .select('*')
        .eq('worker_id', workerId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setChats(data as WorkerTelegramChat[]);
    } catch (err) {
      console.error('Error fetching telegram chats:', err);
    } finally {
      setLoading(false);
    }
  }, [workerId]);

  const addChat = async (chatId: string, label?: string) => {
    if (!workerId) return;
    try {
      const { data, error } = await supabase
        .from('worker_telegram_chats')
        .insert({
          worker_id: workerId,
          chat_id: chatId,
          label,
          is_active: true
        })
        .select()
        .single();

      if (error) throw error;
      setChats(prev => [...prev, data as WorkerTelegramChat]);
      return data;
    } catch (err) {
      console.error('Error adding telegram chat:', err);
      throw err;
    }
  };

  const deleteChat = async (id: string) => {
    try {
      const { error } = await supabase
        .from('worker_telegram_chats')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setChats(prev => prev.filter(c => c.id !== id));
    } catch (err) {
      console.error('Error deleting telegram chat:', err);
      throw err;
    }
  };

  const toggleChat = async (id: string, isActive: boolean) => {
    try {
      const { error } = await supabase
        .from('worker_telegram_chats')
        .update({ is_active: isActive })
        .eq('id', id);

      if (error) throw error;
      setChats(prev => prev.map(c => c.id === id ? { ...c, is_active: isActive } : c));
    } catch (err) {
      console.error('Error toggling telegram chat:', err);
      throw err;
    }
  };

  return {
    chats,
    loading,
    fetchChats,
    addChat,
    deleteChat,
    toggleChat
  };
}
