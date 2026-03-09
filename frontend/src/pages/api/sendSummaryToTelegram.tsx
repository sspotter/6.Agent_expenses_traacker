import axios from 'axios';
import type { IncomingMessage, ServerResponse } from 'http';
import { type MonthSummary } from '../../types';

export default async function handler(
  req: IncomingMessage & { body?: any },
  res: ServerResponse
) {
  if (req.method !== 'POST') {
    res.statusCode = 405;
    res.end(JSON.stringify({ message: 'Method not allowed' }));
    return;
  }

  let body: { summary?: MonthSummary };
  try {
    body = req.body ? req.body : await new Promise((resolve, reject) => {
      let data = '';
      req.on('data', chunk => { data += chunk; });
      req.on('end', () => resolve(JSON.parse(data)));
      req.on('error', err => reject(err));
    });
  } catch (err) {
    res.statusCode = 400;
    res.end(JSON.stringify({ error: 'Invalid JSON body' }));
    return;
  }

  const summary = body.summary;
  if (!summary) {
    res.statusCode = 400;
    res.end(JSON.stringify({ error: 'No summary provided' }));
    return;
  }

  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!botToken || !chatId) {
    res.statusCode = 500;
    res.end(JSON.stringify({ error: 'Telegram bot token or chat ID not configured in env' }));
    return;
  }

  const telegramUrl = `https://api.telegram.org/bot${botToken}/sendMessage`;

  const text = `
📊 Monthly Summary

📁 Total Expected: ${summary.total_expected}
📁 Total Collected: ${summary.total_collected}
📁 Completion: ${((summary.total_collected / summary.total_expected) * 100).toFixed(2)}%
`;

  try {
    const response = await axios.post(telegramUrl, { chat_id: chatId, text });
    if (response.data.ok) {
      res.statusCode = 200;
      res.end(JSON.stringify({ success: true, message: 'Summary sent successfully!' }));
    } else {
      res.statusCode = 500;
      res.end(JSON.stringify({ success: false, message: 'Failed to send summary.' }));
    }
  } catch (err: any) {
    console.error('Error sending summary to Telegram:', err.message || err);
    res.statusCode = 500;
    res.end(JSON.stringify({ success: false, message: 'Error sending summary.' }));
  }
}
