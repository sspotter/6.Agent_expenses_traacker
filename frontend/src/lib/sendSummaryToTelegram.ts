import { sendTelegramMessage } from './telegram-node'; // <-- remove .ts
import { type MonthSummary } from '../types'; // <-- point to the file

const summary: MonthSummary = {
  total_expected: 1000,
  total_collected: 850,
  month: "January",
  gross_outstanding: 850,
  settled_amount: 850,
  net_outstanding: 850,
  income_debt: 850,
  expense_debt: 850,
  total_debt: 850,
  worked_expected: 850,
  surplus_total: 850,
  surplus_unallocated: 850,
  attendance: {
    full: 1,
    partial: 0,
    missed: 0,
  },
};

async function main() {
  try {
    console.log('📨 Sending monthly summary to Telegram...');

    const completionPercentage = summary.total_expected
      ? ((summary.total_collected / summary.total_expected) * 100).toFixed(2)
      : '0';

    const text = `
📊 Monthly Summary

📁 Total Expected: ${summary.total_expected}
📁 Total Collected: ${summary.total_collected}
📁 Completion: ${completionPercentage}%
`;

    await sendTelegramMessage(text);

    console.log('✅ Summary sent successfully!');
  } catch (err: any) {
    console.error('❌ Failed to send summary:', err.message);
  }
}

main();
