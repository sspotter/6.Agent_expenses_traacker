
import React, { useState } from 'react';
import { supabase } from '../lib/supabase';

export const DBTester: React.FC = () => {
    const [result, setResult] = useState<string>('');
    const [loading, setLoading] = useState(false);

    const runTest = async () => {
        setLoading(true);
        setResult('Running test...');
        try {
            // Test upsert with override flag
            const { data, error } = await supabase
                .from('daily_collections')
                .upsert({
                    user_id: 'auto_test',
                    worker_id: 'a9b2d862-23c3-4f96-be60-9366e6c196ea', // Use a real ID or dummy
                    date: '2029-01-01',
                    expected_amount: 555,
                    collected_amount: 0,
                    status: 'PARTIAL',
                    is_expected_override: true,
                    notes: 'Self-test for override column'
                }, { onConflict: 'user_id,worker_id,date' })
                .select();

            if (error) {
                setResult(`❌ FAILED: ${error.message}\n\nThis likely means the "is_expected_override" column is MISSING from your database.`);
            } else {
                setResult(`✅ SUCCESS!\nData: ${JSON.stringify(data[0])}\n\nYour database is ready for manual overrides.`);
            }
        } catch (err: any) {
            setResult(`💥 ERROR: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed bottom-4 right-4 z-[100]">
            <button 
                onClick={runTest}
                disabled={loading}
                className="px-4 py-2 bg-purple-600 text-white rounded-full font-bold text-xs shadow-xl hover:bg-purple-700 transition-all"
            >
                {loading ? 'Testing...' : 'Verify DB Schema'}
            </button>
            {result && (
                <div className="absolute bottom-12 right-0 w-80 p-4 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-primary/20 text-[10px] font-mono whitespace-pre-wrap">
                    <button onClick={() => setResult('')} className="float-right text-gray-500">X</button>
                    {result}
                </div>
            )}
        </div>
    );
};
