import { supabase } from './config/supabase';

async function testSupabaseConnection() {
  console.log('🔍 Testing Supabase Connection from Backend...\n');

  // Test 1: Check tables exist
  console.log('1️⃣ Checking tables:');
  try {
    const { data: tables, error } = await supabase
      .from('daily_collections')
      .select('id')
      .limit(1);

    if (error) {
      console.error('   ❌ daily_collections Error:', error.message);
    } else {
      console.log('   ✅ daily_collections accessible');
    }
  } catch (err) {
    console.error('   ❌ Exception:', err);
  }

  try {
    const { data: tables, error } = await supabase
      .from('weekly_expenses')
      .select('id')
      .limit(1);

    if (error) {
      console.error('   ❌ weekly_expenses Error:', error.message);
    } else {
      console.log('   ✅ weekly_expenses accessible');
    }
  } catch (err) {
    console.error('   ❌ Exception:', err);
  }

  try {
    const { data: tables, error } = await supabase
      .from('settlements')
      .select('id')
      .limit(1);

    if (error) {
      console.error('   ❌ settlements Error:', error.message);
    } else {
      console.log('   ✅ settlements accessible');
    }
  } catch (err) {
    console.error('   ❌ Exception:', err);
  }
  console.log('');

  // Test 2: Count records
  console.log('2️⃣ Counting records:');
  try {
    const { data, error } = await supabase
      .from('daily_collections')
      .select('*', { count: 'exact', head: true });

    if (error) {
      console.error('   ❌ Count Error:', error.message);
    } else {
      console.log('   ✅ Daily Collections:', data?.length || 0);
    }
  } catch (err) {
    console.error('   ❌ Exception:', err);
  }

  try {
    const { data, error } = await supabase
      .from('weekly_expenses')
      .select('*', { count: 'exact', head: true });

    if (error) {
      console.error('   ❌ Count Error:', error.message);
    } else {
      console.log('   ✅ Weekly Expenses:', data?.length || 0);
    }
  } catch (err) {
    console.error('   ❌ Exception:', err);
  }

  try {
    const { data, error } = await supabase
      .from('settlements')
      .select('*', { count: 'exact', head: true });

    if (error) {
      console.error('   ❌ Count Error:', error.message);
    } else {
      console.log('   ✅ Settlements:', data?.length || 0);
    }
  } catch (err) {
    console.error('   ❌ Exception:', err);
  }
  console.log('');

  // Test 3: Insert test data (optional, comment out for production)
  console.log('3️⃣ Testing INSERT (commented out for safety):');
  console.log('   // Uncomment below to test insert');
  /*
  const testCollection = {
    user_id: 'default_user',
    date: '2026-01-23',
    expected_amount: 50,
    collected_amount: 50,
    status: 'FULL',
    notes: 'Test from backend MCP test'
  };

  try {
    const { data, error } = await supabase
      .from('daily_collections')
      .insert(testCollection)
      .select()
      .single();

    if (error) {
      console.error('   ❌ INSERT Error:', error.message);
    } else {
      console.log('   ✅ INSERT Success:', data);
    }
  } catch (err) {
    console.error('   ❌ Exception:', err);
  }
  */

  console.log('\n✨ Supabase MCP Test Complete!');
}

// Run if called directly
if (require.main === module) {
  testSupabaseConnection().catch(console.error);
}

export { testSupabaseConnection };