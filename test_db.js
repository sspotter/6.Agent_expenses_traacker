
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://zvrlstcwiozitsidgezp.supabase.co';
const supabaseKey = 'sb_publishable_70IWjmsl7RrJ6QS21qhJAA_74j8nCRU'; 

const supabase = createClient(supabaseUrl, supabaseKey);

async function runTest() {
    console.log('--- DB CONSISTENCY TEST START ---');
    
    // 1. Check if column exists by trying to select it or inserting with it
    const testDate = '2026-01-01'; 
    const userId = 'test_runner';

    console.log('Testing upsert with is_expected_override...');
    
    const { data, error } = await supabase
        .from('daily_collections')
        .upsert({
            user_id: userId,
            worker_id: 'a9b2d862-23c3-4f96-be60-9366e6c196ea', 
            date: testDate,
            expected_amount: 150,
            collected_amount: 50,
            status: 'PARTIAL',
            is_expected_override: true,
            notes: 'Test manual override'
        }, {
            onConflict: 'user_id,worker_id,date'
        })
        .select();

    if (error) {
        console.error('❌ Upsert FAILED:', error.message);
        console.error('Details:', error);
    } else {
        console.log('✅ Upsert SUCCESSFUL!');
        console.log('Returned Data:', data);
    }

    console.log('--- DB CONSISTENCY TEST END ---');
}

runTest();
