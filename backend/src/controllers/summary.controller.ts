import { Request, Response } from 'express';
import { supabase } from '../config/supabase';

// GET /api/summary/:month - Get computed monthly summary
export const getMonthlySummary = async (req: Request, res: Response) => {
  try {
    const { month } = req.params; // Format: YYYY-MM
    
    const startDate = `${month}-01`;
    const endDate = new Date(new Date(startDate).getFullYear(), new Date(startDate).getMonth() + 1, 0)
      .toISOString().split('T')[0];

    // Get all daily collections for the month
    const { data: collections, error: collectionsError } = await supabase
      .from('daily_collections')
      .select('expected_amount, collected_amount')
      .gte('date', startDate)
      .lte('date', endDate);

    if (collectionsError) throw collectionsError;

    // Get all settlements applied to this month
    const { data: settlements, error: settlementsError } = await supabase
      .from('settlements')
      .select('amount')
      .eq('applied_to_month', startDate);

    if (settlementsError) throw settlementsError;

    // Get all weekly expenses for the month
    const { data: expenses, error: expensesError } = await supabase
      .from('weekly_expenses')
      .select('amount')
      .gte('week_start_date', startDate)
      .lte('week_start_date', endDate);

    if (expensesError) throw expensesError;

    // Calculate summary
    const totalExpected = collections?.reduce((sum, c) => sum + Number(c.expected_amount), 0) || 0;
    const totalCollected = collections?.reduce((sum, c) => sum + Number(c.collected_amount), 0) || 0;
    const grossOutstanding = totalExpected - totalCollected;
    const settledAmount = settlements?.reduce((sum, s) => sum + Number(s.amount), 0) || 0;
    const netOutstanding = grossOutstanding - settledAmount;
    const totalExpenses = expenses?.reduce((sum, e) => sum + Number(e.amount), 0) || 0;
    const cashInHand = totalCollected - totalExpenses;

    res.json({
      success: true,
      data: {
        month,
        totalExpected,
        totalCollected,
        grossOutstanding,
        settledAmount,
        netOutstanding,
        totalExpenses,
        cashInHand
      }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};
