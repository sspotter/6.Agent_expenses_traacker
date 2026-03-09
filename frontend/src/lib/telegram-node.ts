// telegram-node


function escapeMarkdownV2(text: string): string {
  return text.replace(/([_\*\[\]\(\)~`>#+\-=|{}.!])/g, '\\$1');
}
export async function sendTelegramMessage(message: string, targetChatId?: string): Promise<void> {
// const botToken = import.meta.env.TELEGRAM_BOT_TOKEN;;
// const chatId = import.meta.env.TELEGRAM_CHAT_ID;
    console.log('Sending Telegram message...');
      // const botToken = process.env.VITE_TELEGRAM_BOT_TOKEN;
  // const chatId = process.env.VITE_TELEGRAM_CHAT_ID;
    const botToken = import.meta.env.VITE_TELEGRAM_BOT_TOKEN;;       // replace with your bot token
    const envChatId = import.meta.env.VITE_TELEGRAM_CHAT_ID;

    // Use targetChatId if provided, otherwise fallback to env
    const chatId = targetChatId || envChatId;  

  if (!botToken || !chatId) {
    throw new Error('Telegram bot token or chat ID not configured in env');
  }
const escapedMessage = escapeMarkdownV2(message);

  const res = await fetch(
    `https://api.telegram.org/bot${botToken}/sendMessage`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: escapedMessage,
          parse_mode: 'MarkdownV2',

        
      }),
    }
  );

  const data = await res.json();

  if (!data.ok) {
    throw new Error(data.description || 'Failed to send message to Telegram');
  }
}
