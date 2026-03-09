// Replace with your actual bot token and chat ID
const BOT_TOKEN = import.meta.env.TELEGRAM_BOT_TOKEN;;
const CHAT_ID = import.meta.env.TELEGRAM_CHAT_ID;
const MESSAGE_TEXT = encodeURIComponent('Hello via HTTP request!');

const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;
const data = {
  chat_id: CHAT_ID,
  text: 'Hello from Node.js!'
};
fetch(url, {
  method: 'POST',
  headers: {'Content-Type': 'application/json'},
  body: JSON.stringify(data)
})
.then(response => response.json())
.then(data => console.log(data))
.catch(error => console.error(error));
