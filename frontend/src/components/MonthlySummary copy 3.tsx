import React, { useState } from 'react';
import { type MonthSummary } from '../types';
import { sendTelegramMessage } from '../lib/telegram-node';
import html2canvas from 'html2canvas';

import { 
  DailyCollection, 
  WeeklyExpense, 
  Settlement, 
  SettlementAllocation, 
  ExpensePayment 
} from '../types';

interface CsvDownloaderProps {
  collections: DailyCollection[];
  expenses: WeeklyExpense[];
  settlements: Settlement[];
  allocations: SettlementAllocation[];
  expensePayments: ExpensePayment[];
  filename?: string; // optional filename
}
interface MonthlySummaryProps {
   summary: MonthSummary;
     workerName: string;   // 👈 REQUIRED

  collections: DailyCollection[];
  expenses: WeeklyExpense[];
  settlements: Settlement[];
  allocations: SettlementAllocation[];
  expensePayments: ExpensePayment[];
  currentRate?: number;
  isLoading?: boolean;
}

export const MonthlySummary: React.FC<MonthlySummaryProps> = ({   summary,
  collections,
  expenses,
  workerName,
  settlements,
  allocations,
  expensePayments,
  currentRate,
  isLoading = false 
}) => {



  function escapeCsv(value: string | number | null | undefined): string {
  if (value === null || value === undefined) return '';
  const str = String(value);
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

function arrayToCsv(headers: string[], rows: any[][]): string {
  return [
    headers.join(','),
    ...rows.map(row => row.map(escapeCsv).join(',')),
  ].join('\n');
}
function collectionsToCsv(collections: DailyCollection[]) {
  const headers = ['Date', 'Collected Amount', 'Status'];
  const rows = collections.map(c => [
    c.date,
    c.collected_amount,
    c.status || ''
  ]);
  return ['Daily Collections', arrayToCsv(headers, rows)].join('\n');
}

function expensesToCsv(expenses: WeeklyExpense[]) {
  const headers = ['Week Start Date', 'Amount', 'Description'];
  const rows = expenses.map(e => [
    e.week_start_date,
    e.amount,
  ]);
  return ['Weekly Expenses', arrayToCsv(headers, rows)].join('\n');
}

function settlementsToCsv(settlements: Settlement[]) {
  const headers = ['Settlement Date', 'Amount', 'Details'];
  const rows = settlements.map(s => [
    s.settlement_date,
    s.amount,
  ]);
  return ['Settlements', arrayToCsv(headers, rows)].join('\n');
}

function allocationsToCsv(allocations: SettlementAllocation[]) {
  const headers = ['Allocation ID', 'Settlement ID', 'Amount'];
  const rows = allocations.map(a => [
    a.id,
    a.settlement_id,
  ]);
  return ['Settlement Allocations', arrayToCsv(headers, rows)].join('\n');
}

function expensePaymentsToCsv(payments: ExpensePayment[]) {
  const headers = ['Payment ID', 'Expense ID', 'Amount'];
  const rows = payments.map(p => [
    p.id,
    p.expense_id,
    p.amount,
  ]);
  return ['Expense Payments', arrayToCsv(headers, rows)].join('\n');
}
function generateFullCsv(
  collections: DailyCollection[],
  expenses: WeeklyExpense[],
  settlements: Settlement[],
  allocations: SettlementAllocation[],
  expensePayments: ExpensePayment[]
): string {
  return [
    collectionsToCsv(collections),
    '',
    expensesToCsv(expenses),
    '',
    settlementsToCsv(settlements),
    '',
    allocationsToCsv(allocations),
    '',
    expensePaymentsToCsv(expensePayments),
  ].join('\n\n');
}

      const downloadCsv = () => {
    const csvContent = generateFullCsv(collections, expenses, settlements, allocations, expensePayments);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `collection_summary.csv`); // simplified
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  // const completionColor = summary.total_collected >= summary.total_expected ? 'text-success' : 'text-amber-500';
  // const completionPercentage = (summary.total_collected / summary.total_expected) * 100 || 0;
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState('');
  
  const completionColor =
  summary.total_collected >= summary.worked_expected ? 'text-success' : 'text-amber-500';
  
  // UX Rule: Completion is based on Worked Expected
  const completionPercentage = summary.worked_expected > 0 
    ? (summary.total_collected / summary.worked_expected) * 100 
    : 0;
    
  const isOverachieved = completionPercentage > 100.01;


      const completion = summary.total_expected > 0 ? Math.round((summary.total_collected / summary.total_expected) * 100) : 0;

    const barLength = 20;
    // const completion = ((summary.total_collected / summary.total_expected) * 100).toFixed(2);
    const completionInt = Math.round((summary.total_collected / summary.total_expected) * 10);
    const bar = '🟩'.repeat(completionInt) + '⬜'.repeat(10 - completionInt);
    const filled = Math.round((completion / 100) * barLength);

// inside your MonthlySummary component
const downloadScreenshotCsv = async () => {
  const element = document.getElementById('monthly-summary');
  if (!element) {
    console.warn('monthly-summary not found');
    return;
  }

  const canvas = await html2canvas(element, {
    backgroundColor: '#ffffff',

    // 🔥 THIS FIXES THE ERROR
    onclone: (clonedDoc) => {
      const clonedEl = clonedDoc.getElementById('monthly-summary');
      if (!clonedEl) return;

      // Force safe colors
      clonedEl.querySelectorAll('*').forEach((node) => {
        const el = node as HTMLElement;
        el.style.color = '#000';
        el.style.backgroundColor = 'transparent';
        el.style.boxShadow = 'none';
        el.style.filter = 'none';
        el.style.backdropFilter = 'none';
      });
    },
  });

  const dataUrl = canvas.toDataURL('image/png');

  const csvContent = generateFullCsv(
    collections,
    expenses,
    settlements,
    allocations,
    expensePayments
  );

  const blob = new Blob(
    [csvContent + `\n\n"Screenshot","${dataUrl}"`],
    { type: 'text/csv;charset=utf-8;' }
  );

  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'collection_summary_with_screenshot.csv';
  link.click();
};


const sendScreenshotToTelegram = async () => {
  await fetch('/api/screenshot', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      url: window.location.href,
    }),
  });
};

// async function sendToTelegram() {
//   setSending(true);
//   setMessage('Sending summary...');
//   // 📊 Monthly Summary
  
//   // 📁 Total Expected: ${summary.total_expected}
//   // 📁 Total Collected: ${summary.total_collected}
//   // 📁 Completion: ${((summary.total_collected / summary.total_expected)*100).toFixed(2)}%
//   try {
//     const text = `

// 📊 *Collection Summary* 🎯

// 💰 *EXPECTED*  
// \$${summary.total_expected.toLocaleString()}  

// 🤑 *COLLECTED*  
// \$${summary.total_collected.toLocaleString()}  

// 📉 *TOTAL OUTSTANDING*  
// \$${summary.net_outstanding.toLocaleString()}  

// 📈 *COMPLETION*  
// ${completionPercentage}%  
// [${bar}]  

// 🎉 Keep up the good work! 🚀
// `;
//     await sendTelegramMessage(text);
//     setMessage('✅ Summary sent successfully!');
//   } catch (err: any) {
//     setMessage('❌ Error: ' + err.message);
//   } finally {
//     setSending(false);
//   }
// }


async function sendToTelegram() {
  setSending(true);
  setMessage('Sending summary...');

  try {
    const completion =
      summary.total_expected > 0
        ? ((summary.total_collected / summary.total_expected) * 100).toFixed(2)
        : '0.00';

    const surplus =
      summary.total_collected > summary.total_expected
        ? summary.total_collected - summary.total_expected
        : 0;

    const text = `
📊 *Monthly Collection Summary*

👷 *Worker:* ${workerName}

💰 *Expected:*  
$${summary.total_expected.toLocaleString()}

💵 *Collected:*  
$${summary.total_collected.toLocaleString()}

📉 *Outstanding:*  
$${summary.net_outstanding.toLocaleString()}

📈 *Completion:*  
${completion}%  
[${bar}]

${surplus > 0 ? `🎉 *Surplus:* +$${surplus.toLocaleString()}` : ''}

🗓️ *Period:* ${summary.month}
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
    <>
      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="glass p-5 rounded-2xl space-y-4 animate-pulse">
              <div className="h-3 w-16 bg-primary/10 rounded-full" />
              <div className="h-8 w-24 bg-primary/10 rounded-xl" />
            </div>
          ))}
        </div>
      ) : (
        <>
          <div id='monthly-summary2' className="monthly-summary p-4 mb-4  border rounded-lg shadow-md">
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
            <button id='monthly-summary1'
              className="mt-4 ml-4 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              onClick={downloadCsv}
            >
              📥 Download Full CSV
            </button>
            <button
              className="mt-4 ml-4 px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
              onClick={downloadScreenshotCsv}
            >
              📸 Download CSV with Screenshot
            </button>
            <button
              className="mt-4 px-4 py-2 bg-black text-white rounded"
              onClick={sendScreenshotToTelegram}
            >
              📸 Send Screenshot to Telegram
            </button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-6 mb-8">
            <div className="shadow-xl hover:shadow-blue-500/30 glass p-5 rounded-2xl space-y-2 group hover:translate-y-[-2px] transition-premium">
              <p className="text-xs font-semibold text-sub uppercase tracking-wider">Expected (Monthly)</p>
              <p className="text-2xl font-bold text-sub/50 tracking-tight">
                ${summary.total_expected.toLocaleString()}
              </p>
              {currentRate !== undefined && (
                <p className="text-[10px] text-sub/40 font-mono">
                  ${currentRate}/day × {new Date(summary.month).getDate() || 31} days
                </p>
              )}
            </div>

            <div className="shadow-xl hover:shadow-cyan-500/50 glass p-5 rounded-2xl space-y-2 group hover:translate-y-[-2px] transition-premium border-2 border-cyan-500/10">
              <p className="text-xs font-semibold text-cyan-500 uppercase tracking-wider">Expected (Worked)</p>
              <div className="flex flex-col gap-1">
                 <p className="text-2xl font-bold text-cyan-500 tracking-tight">
                    ${summary.worked_expected.toLocaleString()}
                </p>
                <p className="text-[10px] text-cyan-500/60 font-medium">
                    {summary.attendance.full} full · {summary.attendance.partial} partial · {summary.attendance.missed} missed
                </p>
              </div>
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
                      Surplus +${(summary.total_collected - summary.worked_expected).toLocaleString()}
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
          </div>
        </>
      )}
    </>
  );
};

