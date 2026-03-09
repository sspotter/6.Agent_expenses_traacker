// simplemessage.ts
import { sendTelegramMessage } from './telegram-node'; // <-- note the .ts

async function main() {
  try {
    console.log('📨 Sending test message to Telegram...');
    await sendTelegramMessage('Hello! This is a test message from Node.js 🚀');
    console.log('✅ Message sent successfully!');
  } catch (err: any) {
    console.error('❌ Failed to send message:', err.message);
  }
}

main();
