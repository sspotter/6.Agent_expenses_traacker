import { Request, Response } from 'express';
import { supabase } from '../config/supabase';

// GET /api/collections/:month - Get all collections for a month
export const getCollectionsByMonth = async (req: Request, res: Response) => {
  try {
    const { month } = req.params; // Format: YYYY-MM
    
    const startDate = `${month}-01`;
    const endDate = new Date(new Date(startDate).getFullYear(), new Date(startDate).getMonth() + 1, 0)
      .toISOString().split('T')[0];

    const { data, error } = await supabase
      .from('daily_collections')
      .select('*')
      .gte('date', startDate)
      .lte('date', endDate)
      .order('date', { ascending: true });

    if (error) throw error;

    res.json({ success: true, data });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// POST /api/collections - Create or update a daily collection
export const createOrUpdateCollection = async (req: Request, res: Response) => {
  try {
    const { date, expected_amount, collected_amount, status, notes } = req.body;

    // Validate required fields
    if (!date || expected_amount === undefined || collected_amount === undefined) {
      return res.status(400).json({ 
        success: false, 
        error: 'Missing required fields: date, expected_amount, collected_amount' 
      });
    }

    // Check if collection already exists for this date
    const { data: existing } = await supabase
      .from('daily_collections')
      .select('id')
      .eq('date', date)
      .single();

    let result;
    if (existing) {
      // Update existing
      result = await supabase
        .from('daily_collections')
        .update({ expected_amount, collected_amount, status, notes, updated_at: new Date().toISOString() })
        .eq('id', existing.id)
        .select()
        .single();
    } else {
      // Create new
      result = await supabase
        .from('daily_collections')
        .insert({ date, expected_amount, collected_amount, status, notes })
        .select()
        .single();
    }

    if (result.error) throw result.error;

    res.json({ success: true, data: result.data });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// PUT /api/collections/:id - Update a collection
export const updateCollection = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { expected_amount, collected_amount, status, notes } = req.body;

    const { data, error } = await supabase
      .from('daily_collections')
      .update({ expected_amount, collected_amount, status, notes, updated_at: new Date().toISOString() })
      .eq('id', id as string)
      .select()
      .single();

    if (error) throw error;

    res.json({ success: true, data });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};
