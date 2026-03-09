import { Request, Response } from 'express';
import { supabase } from '../config/supabase';

// GET /api/expenses/:month - Get expenses for a month
export const getExpensesByMonth = async (req: Request, res: Response) => {
  try {
    const { month } = req.params; // Format: YYYY-MM
    
    const startDate = `${month}-01`;
    const endDate = new Date(new Date(startDate).getFullYear(), new Date(startDate).getMonth() + 1, 0)
      .toISOString().split('T')[0];

    const { data, error } = await supabase
      .from('weekly_expenses')
      .select('*')
      .gte('week_start_date', startDate)
      .lte('week_start_date', endDate)
      .order('week_start_date', { ascending: true });

    if (error) throw error;

    res.json({ success: true, data });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// POST /api/expenses - Create a weekly expense
export const createExpense = async (req: Request, res: Response) => {
  try {
    const { week_start_date, week_end_date, amount, category, notes } = req.body;

    // Validate required fields
    if (!week_start_date || !week_end_date || amount === undefined || !category) {
      return res.status(400).json({ 
        success: false, 
        error: 'Missing required fields: week_start_date, week_end_date, amount, category' 
      });
    }

    const { data, error } = await supabase
      .from('weekly_expenses')
      .insert({ week_start_date, week_end_date, amount, category, notes })
      .select()
      .single();

    if (error) throw error;

    res.json({ success: true, data });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// PUT /api/expenses/:id - Update an expense
export const updateExpense = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { week_start_date, week_end_date, amount, category, notes } = req.body;

    const { data, error } = await supabase
      .from('weekly_expenses')
      .update({ week_start_date, week_end_date, amount, category, notes, updated_at: new Date().toISOString() })
      .eq('id', id as string)
      .select()
      .single();

    if (error) throw error;

    res.json({ success: true, data });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// DELETE /api/expenses/:id - Delete an expense
export const deleteExpense = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from('weekly_expenses')
      .delete()
      .eq('id', id as string);

    if (error) throw error;

    res.json({ success: true, message: 'Expense deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};
