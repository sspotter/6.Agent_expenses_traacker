import { useState, useCallback, useEffect } from 'react';
import { format } from 'date-fns';
import { supabase } from '../lib/supabase';
import { type Settlement, type SettlementAllocation } from '../types';
import { simpleTimestamp, settlementNote, systemNote } from '../utils/notes';


export function useSettlements(currentMonth: Date | undefined, workerId: string | null) {
  const [loading, setLoading] = useState(false);
  const [settlements, setSettlements] = useState<Settlement[]>([]);
  const [allocations, setAllocations] = useState<SettlementAllocation[]>([]);

  // Stable key
  const monthKey = currentMonth ? format(currentMonth, 'yyyy-MM') : null;

  const fetchSettlements = useCallback(async () => {
    if (!monthKey || !workerId) {
       if(!workerId) {
          setSettlements([]);
          setAllocations([]);
       }
       return;
    }
    setLoading(true);
    // Parse key back to components if needed, or just use it since applied_to_month matches format
    const monthStr = monthKey; // e.g. "2024-01"
    
    try {
      const { data: sData, error: sError } = await supabase
        .from('settlements')
        .select('*')
        .eq('worker_id', workerId)
        .eq('applied_to_month', monthStr);

      if (sError) {
          console.error("Error fetching settlements:", sError.message, sError);
          // If 400, table might be missing or schema mismatch
          if (sError.code === 'PGRST116' || sError.code === '42P01') {
              setSettlements([]);
          } else {
              throw sError;
          }
      } else {
          setSettlements(sData as Settlement[] || []);
      }

      const sIds = (sData || []).map(s => s.id);
      if (sIds.length > 0) {
        const { data: aData, error: aError } = await supabase
          .from('settlement_allocations')
          .select('*')
          .in('settlement_id', sIds);
        
        if (aError) {
            console.warn("Error fetching settlement_allocations (likely table missing or schema mismatch):", aError.message);
            setAllocations([]);
        } else {
            // Map legacy columns to our frontend interface if needed
            const mappedAllocations = (aData || []).map((a: any) => ({
                id: a.id,
                worker_id: workerId, // inject workerId as we know it from scope
                settlement_id: a.settlement_id,
                collection_id: a.collection_id || a.daily_collection_id,
                allocated_amount: Number(a.allocated_amount || a.amount_applied || 0)
            }));
            setAllocations(mappedAllocations as SettlementAllocation[]);
        }
      } else {
        setAllocations([]);
      }
    } catch (err) {
      console.error("Error fetching settlements/allocations:", err);
    } finally {
      setLoading(false);
    }
  }, [monthKey, workerId]);

  useEffect(() => {
    fetchSettlements();
  }, [fetchSettlements]);

  const addSettlement = async (
    amount: number, 
    appliedToMonth: string, 
    notes: string = '',
    options: {
      source?: 'SURPLUS' | 'CASH' | 'OTHER';
      sourceReferenceId?: string;
      targetDate?: string;
    } = {}
  ) => {
      if (!workerId) throw new Error('No active worker');
      setLoading(true);
      const user_id = 'default_user';
      const { source = 'CASH', sourceReferenceId, targetDate } = options;
      
      try {
          const stampedNotes = simpleTimestamp(notes);
          // 1. Create the settlement record with source tracking
          const payload: any = {
              user_id,
              worker_id: workerId,
              settlement_date: new Date().toISOString(),
              amount,
              applied_to_month: appliedToMonth,
              source,
              source_reference_id: sourceReferenceId,
              target_date: targetDate,
              notes: stampedNotes
          };

          let result;
          try {
            result = await supabase
              .from('settlements')
              .insert(payload)
              .select()
              .single();
          } catch (err: any) {
              if (err.message?.includes('source') || err.message?.includes('target_date')) {
                  console.warn('DB Migration missing: settlements table does not have source/target_date yet. Retrying without new fields.');
                  delete payload.source;
                  delete payload.source_reference_id;
                  delete payload.target_date;
                  result = await supabase
                    .from('settlements')
                    .insert(payload)
                    .select()
                    .single();
              } else {
                  throw err;
              }
          }

          let settlement = result.data;
          let sError = result.error;

          if (sError) {
              if (sError.message?.includes('source') || sError.message?.includes('target_date')) {
                  console.warn('DB Migration missing (via error object). Retrying...');
                  delete payload.source;
                  delete payload.source_reference_id;
                  delete payload.target_date;
                  const retry = await supabase
                    .from('settlements')
                    .insert(payload)
                    .select()
                    .single();
                  if (retry.error) throw retry.error;
                  settlement = retry.data; 
              } else {
                  throw sError;
              }
          }

          // 2. Allocation Logic (FIFO)
          // Find collections in this month that have gaps
          const { data: collections } = await supabase
            .from('daily_collections')
            .select('*')
            .eq('worker_id', workerId)
            .gte('date', `${appliedToMonth}-01`)
            .lte('date', `${appliedToMonth}-31`)
            .order('date', { ascending: true });

          if (collections && collections.length > 0) {
              const colIds = collections.map(c => c.id);
              const { data: allExistingAllocations } = await supabase
                .from('settlement_allocations')
                .select('*')
                .eq('worker_id', workerId)
                .in('collection_id', colIds);

              let remainingToAllocate = amount;
              const newAllocations = [];

              for (const col of collections) {
                  const dayAllocated = (allExistingAllocations || [])
                    .filter(a => a.collection_id === col.id)
                    .reduce((sum, a) => sum + a.allocated_amount, 0);
                  
                  const gap = col.expected_amount - col.collected_amount;
                  const trueGap = gap - dayAllocated;

                  if (trueGap <= 0.01) continue;

                  const allocate = Math.min(remainingToAllocate, trueGap);
                  if (allocate > 0) {
                      newAllocations.push({
                          settlement_id: (settlement as Settlement).id,
                          collection_id: col.id,
                          worker_id: workerId,
                          allocated_amount: allocate
                      });
                      remainingToAllocate -= allocate;
                  }

                  if (remainingToAllocate <= 0.01) break;
              }

              if (newAllocations.length > 0) {
                  const { error: allocError } = await supabase.from('settlement_allocations').insert(newAllocations);
                  
                  if (allocError) {
                      console.warn("Failed to insert allocations (likely schema mismatch):", allocError.message);
                      // Fallback: try different column name if it smells like a schema issue
                      if (allocError.message?.includes('amount_applied') || allocError.message?.includes('daily_collection_id')) {
                          const legacyAllocations = newAllocations.map(a => ({
                            settlement_id: a.settlement_id,
                            daily_collection_id: a.collection_id,
                            amount_applied: a.allocated_amount
                          }));
                          await supabase.from('settlement_allocations').insert(legacyAllocations);
                      }
                  }
                  
                  // Update Daily Collection Notes and Status to reflect the settlement
                  for (const allocation of newAllocations) {
                      const col = collections.find(c => c.id === allocation.collection_id);
                      if (col) {
                          const existingNotes = col.notes || '';
                          const detailedLog = settlementNote(allocation.allocated_amount, appliedToMonth);
                          const updatedNotes = existingNotes 
                            ? `${existingNotes}${detailedLog}`
                            : detailedLog;
                          
                          // Check if now fully settled
                          const dayAllocatedAfterThis = (allExistingAllocations || [])
                            .filter(a => a.collection_id === col.id)
                            .reduce((sum, a) => sum + a.allocated_amount, 0) + allocation.allocated_amount;
                          
                          const isNowFull = (col.collected_amount + dayAllocatedAfterThis) >= col.expected_amount - 0.01;
                            
                          await supabase
                            .from('daily_collections')
                            .update({ 
                                notes: updatedNotes,
                                status: isNowFull ? 'FULL' : 'PARTIAL'
                            })
                            .eq('id', col.id);
                      }
                  }
                  
                  // Log Payment Events for each allocation
                  const eventRecords = newAllocations.map(a => ({
                      user_id,
                      worker_id: workerId,
                      entity_type: 'DAILY_COLLECTION',
                      entity_id: a.collection_id,
                      event_type: 'SETTLED',
                      amount: a.allocated_amount,
                      event_date: new Date().toISOString().split('T')[0],
                      reference_id: (settlement as Settlement).id,
                      metadata: { notes: systemNote('Settled via payment', appliedToMonth) }
                  }));
                  await supabase.from('payment_events').insert(eventRecords);
              }
          }

          // 3. Update Surplus Record if needed
          if (source === 'SURPLUS' && sourceReferenceId) {
              const { data: currentSurplus } = await supabase
                .from('monthly_surplus')
                .select('amount_unallocated')
                .eq('id', sourceReferenceId)
                .single();
              
              if (currentSurplus) {
                await supabase
                  .from('monthly_surplus')
                  .update({ 
                      amount_unallocated: Math.max(0, (currentSurplus.amount_unallocated || 0) - amount),
                      updated_at: new Date().toISOString()
                  })
                  .eq('id', sourceReferenceId);
              }
          }

          await fetchSettlements(); // Refresh local list
          return settlement;
      } catch (err: any) {
          console.error("Error adding settlement:", err.message || err);
          console.dir(err);
          throw err;
      } finally {
          setLoading(false);
      }
  };

  return { addSettlement, settlements, allocations, loading, refresh: fetchSettlements };
}
