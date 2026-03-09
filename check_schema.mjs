
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'

const supabaseUrl = 'https://zvrlstcwiozitsidgezp.supabase.co';
const supabaseKey = 'sb_publishable_70IWjmsl7RrJ6QS21qhJAA_74j8nCRU';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkSchema() {
    console.log('--- DB SCHEMA CHECK START ---');
    
    // Check settlements
    console.log('Checking settlements table...');
    const { data: s, error: se } = await supabase.from('settlements').select().limit(1);
    if (se) {
        console.error('❌ Error fetching settlements:', se.message);
    } else if (s && s.length > 0) {
        console.log('✅ Settlements columns:', Object.keys(s[0]));
    } else {
        console.log('❓ No settlement records found to inspect.');
    }

    // Check allocations
    console.log('Checking settlement_allocations table...');
    const { data: a, error: ae } = await supabase.from('settlement_allocations').select().limit(1);
    if (ae) {
        console.error('❌ Error fetching allocations:', ae.message);
    } else if (a && a.length > 0) {
        console.log('✅ Allocations columns:', Object.keys(a[0]));
    } else {
        console.log('❓ No allocation records found to inspect.');
    }

    console.log('--- DB SCHEMA CHECK END ---');
}

checkSchema();
