
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://zvrlstcwiozitsidgezp.supabase.co';
const supabaseKey = 'sb_publishable_70IWjmsl7RrJ6QS21qhJAA_74j8nCRU'; // This is probably the anon key

const supabase = createClient(supabaseUrl, supabaseKey);

async function runTest() {
    console.log('--- DB CONSISTENCY TEST START ---');
    
    // 1. Check if column exists by trying to select it or inserting with it
    const testDate = '2026-01-01'; // Far in future to avoid trash
    const workerId = '00000000-0000-0000-0000-000000000000'; // Dummy ID
    const userId = 'test_runner';

    console.log('Testing upsert with is_expected_override...');
    
    const { data, error } = await supabase
        .from('daily_collections')
        .upsert({
            user_id: userId,
            worker_id: 'a9b2d862-23c3-4f96-be60-9366e6c196ea', // Use a real one if known, or dummy
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
        
        if (error.message.includes('column "is_expected_override" of relation "daily_collections" does not exist')) {
            console.log('\n--- RECOMMENDATION ---');
            console.log('The "is_expected_override" column is missing from the database.');
            console.log('Run the migration: backend/supabase/migrations/003_add_override_flag.sql');
        }
    } else {
        console.log('✅ Upsert SUCCESSFUL!');
        console.log('Returned Data:', data);
    }

    console.log('--- DB CONSISTENCY TEST END ---');
}

runTest();
