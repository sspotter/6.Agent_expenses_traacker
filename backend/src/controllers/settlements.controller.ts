import { Request, Response } from 'express';
import { supabase } from '../config/supabase';

// GET /api/settlements/:month - Get settlements for a month
export const getSettlementsByMonth = async (req: Request, res: Response) => {
  try {
    const { month } = req.params; // Format: YYYY-MM
    
    const startDate = `${month}-01`;
    const endDate = new Date(new Date(startDate).getFullYear(), new Date(startDate).getMonth() + 1, 0)
      .toISOString().split('T')[0];

    const { data, error } = await supabase
      .from('settlements')
      .select('*')
      .gte('settlement_date', startDate)
      .lte('settlement_date', endDate)
      .order('settlement_date', { ascending: true });

    if (error) throw error;

    res.json({ success: true, data });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// POST /api/settlements - Create a settlement
export const createSettlement = async (req: Request, res: Response) => {
  try {
    const { settlement_date, amount, applied_to_month, notes } = req.body;

    // Validate required fields
    if (!amount || !applied_to_month) {
      return res.status(400).json({ 
        success: false, 
        error: 'Missing required fields: amount, applied_to_month' 
      });
    }

    const { data, error } = await supabase
      .from('settlements')
      .insert({ settlement_date, amount, applied_to_month, notes })
      .select()
      .single();

    if (error) throw error;

    res.json({ success: true, data });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};
