
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'

const supabaseUrl = 'https://zvrlstcwiozitsidgezp.supabase.co';
const supabaseKey = 'sb_publishable_70IWjmsl7RrJ6QS21qhJAA_74j8nCRU';
const supabase = createClient(supabaseUrl, supabaseKey);

async function testLargePayment() {
    console.log('Testing Large Payment (>100)...');
    const workerId = 'a9b2d862-23c3-4f96-be60-9366e6c196ea';
    const testDate = '2029-02-01';

    try {
        const { data, error } = await supabase
            .from('daily_collections')
            .upsert({
                user_id: 'payment_test',
                worker_id: workerId,
                date: testDate,
                expected_amount: 500,
                collected_amount: 500,
                status: 'FULL',
                notes: 'Testing 500 payment'
            }, { onConflict: 'user_id,worker_id,date' })
            .select();

        if (error) {
            console.error('❌ DB ERROR:', error.message);
            console.error(error);
        } else {
            console.log('✅ SUCCESS! Record saved:', data);
        }
    } catch (err) {
        console.error('💥 CRASH:', err);
    }
}

testLargePayment();
