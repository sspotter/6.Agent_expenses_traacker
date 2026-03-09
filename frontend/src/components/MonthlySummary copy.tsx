import React, { useState } from 'react';
import { type MonthSummary } from '../types';
import { sendTelegramMessage } from '../lib/telegram-node';

interface MonthlySummaryProps {
  summary: MonthSummary;
}

export const MonthlySummary: React.FC<MonthlySummaryProps> = ({ summary }) => {
  // const completionColor = summary.total_collected >= summary.total_expected ? 'text-success' : 'text-amber-500';
  // const completionPercentage = (summary.total_collected / summary.total_expected) * 100 || 0;
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState('');
  
  const completionColor =
  summary.total_collected >= summary.total_expected ? 'text-success' : 'text-amber-500';
  const completionPercentage = (summary.total_collected / summary.total_expected) * 100 || 0;
  const isOverachieved = completionPercentage > 100.01;


      const completion = summary.total_expected > 0 ? Math.round((summary.total_collected / summary.total_expected) * 100) : 0;

    const barLength = 20;
    // const completion = ((summary.total_collected / summary.total_expected) * 100).toFixed(2);
    const completionInt = Math.round((summary.total_collected / summary.total_expected) * 10);
    const bar = '🟩'.repeat(completionInt) + '⬜'.repeat(10 - completionInt);
    const filled = Math.round((completion / 100) * barLength);

async function sendToTelegram() {
  setSending(true);
  setMessage('Sending summary...');
  // 📊 Monthly Summary
  
  // 📁 Total Expected: ${summary.total_expected}
  // 📁 Total Collected: ${summary.total_collected}
  // 📁 Completion: ${((summary.total_collected / summary.total_expected)*100).toFixed(2)}%
  try {
    const text = `

📊 *Collection Summary* 🎯

💰 *EXPECTED*  
\$${summary.total_expected.toLocaleString()}  

🤑 *COLLECTED*  
\$${summary.total_collected.toLocaleString()}  

📉 *TOTAL OUTSTANDING*  
\$${summary.net_outstanding.toLocaleString()}  

📈 *COMPLETION*  
${completionPercentage}%  
[${bar}]  

🎉 Keep up the good work! 🚀
`;
    await sendTelegramMessage(text);
    setMessage('✅ Summary sent successfully!');
  } catch (err: any) {
    setMessage('❌ Error: ' + err.message);
  } finally {
    setSending(false);
  }
}
  return (
    <>    <div className="monthly-summary p-4 mb-4  border rounded-lg shadow-md">
      <h2 className="text-lg font-bold mb-2">Monthly Summary</h2>

      <p>
        Total Expected: {summary.total_expected} | Total Collected: {summary.total_collected}{' '}
        | Completion: {completionPercentage.toFixed(2)}%
      </p>

      {/* Send Summary Button */}
      <button
        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
        onClick={sendToTelegram}
        disabled={sending}
      >
        {sending ? 'Sending...' : '📤 Send Summary to Telegram'}
      </button>

      {message && <p className="mt-2 text-sm">{message}</p>}

      
    </div><div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">


      <div className="shadow-xl hover:shadow-cyan-500/50  glass p-5 rounded-2xl space-y-2 group hover:translate-y-[-2px] transition-premium">
        <p className="text-xs font-semibold text-sub uppercase tracking-wider">Expected</p>
        <p className="text-2xl font-bold text-cyan-500 tracking-tight">
          ${summary.total_expected.toLocaleString()}
        </p>
      </div>

      <div className="shadow-xl hover:shadow-green-500/50 glass p-5 rounded-2xl space-y-2 group hover:translate-y-[-2px] transition-premium">
        <p className="text-xs font-semibold text-sub uppercase tracking-wider">Collected</p>
        <p className="text-2xl font-bold text-success tracking-tight">
          ${summary.total_collected.toLocaleString()}
        </p>
      </div>

      <div className="shadow-xl hover:shadow-red-500/50 glass p-5 rounded-2xl space-y-2 group hover:translate-y-[-2px] transition-premium">
        <p className="text-xs font-semibold text-sub uppercase tracking-wider">Total Outstanding</p>
        <div className="flex flex-col gap-1">
          <p className="text-2xl font-bold text-danger tracking-tight">
            ${summary.total_debt?.toLocaleString() || summary.net_outstanding.toLocaleString()}
          </p>
          <div className="flex flex-wrap gap-1 mt-1">
            {summary.income_debt > 0 && (
              <span className="text-[8px] font-black bg-amber-500/10 text-amber-500 px-1.5 py-0.5 rounded-md uppercase tracking-tighter">
                ${summary.income_debt} Income Gap
              </span>
            )}
            {summary.expense_debt > 0 && (
              <span className="text-[8px] font-black bg-danger/10 text-danger px-1.5 py-0.5 rounded-md uppercase tracking-tighter">
                ${summary.expense_debt} Unpaid Exp
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="shadow-xl hover:shadow-amber-500/50 glass p-5 rounded-2xl space-y-2 overflow-hidden group hover:translate-y-[-2px] transition-premium">
        <p className="text-xs font-semibold text-sub uppercase tracking-wider">Completion</p>
        <div className="space-y-3">
          <div className="flex justify-between items-end">
            <span className={`text-xl font-bold ${completionColor}`}>
              {Math.round(completionPercentage)}%
            </span>
            {isOverachieved && (
              <span className="text-[10px] font-black text-success uppercase tracking-widest bg-success/10 px-2 py-0.5 rounded-full animate-pulse mb-1 ml-2">
                Surplus +${(summary.total_collected - summary.total_expected).toLocaleString()}
              </span>
            )}
          </div>
          <div className="relative w-full bg-primary/10 rounded-full h-1.5 overflow-hidden">
            <div
              className="absolute top-0 left-0 bg-success h-full rounded-full transition-all duration-1000 ease-out"
              style={{ width: `${Math.min(100, completionPercentage)}%` }}
            >
              <div className="absolute top-0 right-0 bottom-0 left-0 bg-white/20 animate-shimmer"></div>
            </div>
          </div>


        </div>


      </div>

      hjkhj
    </div></>
  );
};

// we want to add a button to this next js that will send those details for telegram