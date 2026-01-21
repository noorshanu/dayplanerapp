interface TelegramResponse {
  ok: boolean;
  result?: unknown;
  description?: string;
}

export async function sendTelegramMessage(
  chatId: string,
  message: string
): Promise<boolean> {
  const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
  
  if (!TELEGRAM_BOT_TOKEN) {
    console.error('Telegram bot token not configured');
    return false;
  }

  try {
    const response = await fetch(
      `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chat_id: chatId,
          text: message,
          parse_mode: 'HTML',
        }),
      }
    );

    const data: TelegramResponse = await response.json();

    if (!data.ok) {
      console.error('Telegram API error:', data.description);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Telegram message failed:', error);
    return false;
  }
}

export interface ReminderData {
  startTime: string;
  endTime: string;
  activity: string;
  topic?: string | null;
}

export function formatReminderMessage(reminder: ReminderData): string {
  const topicLine = reminder.topic ? `\n📚 <b>Topic:</b> ${reminder.topic}` : '';

  return `
⏰ <b>Routine Reminder</b>

🕐 <b>Time:</b> ${reminder.startTime} – ${reminder.endTime}
✅ <b>Task:</b> ${reminder.activity}${topicLine}

Stay focused! 💪
`.trim();
}

export async function sendReminderTelegram(
  chatId: string,
  reminder: ReminderData
): Promise<boolean> {
  const message = formatReminderMessage(reminder);
  return sendTelegramMessage(chatId, message);
}

// Generate a unique link token for Telegram connection
export function generateTelegramLinkToken(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let token = '';
  for (let i = 0; i < 32; i++) {
    token += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return token;
}
