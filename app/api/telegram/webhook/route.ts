import { NextRequest, NextResponse } from 'next/server';
import { sendTelegramMessage } from '@/lib/telegram';
import connectDB from '@/lib/db';
import User from '@/models/User';
import TelegramLink from '@/models/TelegramLink';

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://dayplanerapp.vercel.app';

interface TelegramUpdate {
  update_id: number;
  message?: {
    message_id: number;
    from: {
      id: number;
      first_name: string;
      username?: string;
    };
    chat: {
      id: number;
      first_name: string;
      type: string;
    };
    date: number;
    text?: string;
  };
}

// POST /api/telegram/webhook - Handle Telegram bot updates
export async function POST(request: NextRequest) {
  try {
    const update: TelegramUpdate = await request.json();

    if (!update.message?.text) {
      return NextResponse.json({ ok: true });
    }

    const chatId = update.message.chat.id.toString();
    const text = update.message.text;
    const firstName = update.message.from.first_name;

    // Handle /start command with link token
    if (text.startsWith('/start')) {
      const parts = text.split(' ');

      if (parts.length > 1) {
        // Has a link token - verify it directly via database
        const linkToken = parts[1];

        try {
          await connectDB();

          // Find the pending link in MongoDB
          const pendingLink = await TelegramLink.findOne({
            token: linkToken,
            used: false,
            expiresAt: { $gt: new Date() },
          });

          if (!pendingLink) {
            await sendTelegramMessage(
              chatId,
              `❌ <b>Connection Failed</b>\n\nThe link has expired or is invalid.\n\nPlease generate a new link from your Day Planner settings.`
            );
            return NextResponse.json({ ok: true });
          }

          // Update user with Telegram chat ID
          await User.findByIdAndUpdate(pendingLink.userId, {
            telegramChatId: chatId,
          });

          // Mark token as used
          pendingLink.used = true;
          await pendingLink.save();

          await sendTelegramMessage(
            chatId,
            `✅ <b>Connected Successfully!</b>\n\nHi ${firstName}! Your Telegram is now connected to <b>${pendingLink.email}</b>.\n\nYou'll receive routine reminders here when they're scheduled. 📅\n\nManage your settings at: ${APP_URL}/settings`
          );
        } catch (error) {
          console.error('Telegram connection error:', error);
          await sendTelegramMessage(
            chatId,
            `❌ <b>Connection Failed</b>\n\nSomething went wrong. Please try again later.`
          );
        }
      } else {
        // No token - show welcome message
        await sendTelegramMessage(
          chatId,
          `👋 <b>Welcome to Day Planner Bot!</b>\n\nHi ${firstName}! I'm here to send you routine reminders.\n\n<b>To connect your account:</b>\n1. Go to ${APP_URL}/settings\n2. Click "Connect Telegram"\n3. Click the link provided\n\nOnce connected, you'll receive reminders for your daily routine! ⏰`
        );
      }
    } else if (text === '/help') {
      await sendTelegramMessage(
        chatId,
        `📚 <b>Day Planner Bot Help</b>\n\n<b>Commands:</b>\n/start - Start the bot or connect your account\n/help - Show this help message\n/status - Check your connection status\n/great - Log great mood\n/okay - Log okay mood\n/bad - Log bad mood\n\n<b>Need help?</b>\nVisit ${APP_URL} to manage your routines and settings.`
      );
    } else if (text === '/status') {
      try {
        await connectDB();
        const user = await User.findOne({ telegramChatId: chatId });
        
        if (user) {
          await sendTelegramMessage(
            chatId,
            `✅ <b>Connected!</b>\n\nYour Telegram is connected to <b>${user.email}</b>.\n\nEmail reminders: ${user.reminderPrefs.email ? '✅' : '❌'}\nTelegram reminders: ${user.reminderPrefs.telegram ? '✅' : '❌'}`
          );
        } else {
          await sendTelegramMessage(
            chatId,
            `❌ <b>Not Connected</b>\n\nYour Telegram is not connected to any account.\n\nVisit ${APP_URL}/settings to connect.`
          );
        }
      } catch {
        await sendTelegramMessage(
          chatId,
          `ℹ️ <b>Connection Status</b>\n\nYour Telegram Chat ID: <code>${chatId}</code>\n\nCheck your settings at ${APP_URL}/settings.`
        );
      }
    } else if (text === '/great' || text === '/okay' || text === '/bad') {
      // Handle reflection mood commands
      const mood = text.slice(1);
      try {
        await connectDB();
        const DailyReflection = (await import('@/models/DailyReflection')).default;
        const { getDateInTimezone } = await import('@/lib/timezone');

        const user = await User.findOne({ telegramChatId: chatId });

        if (user) {
          const date = getDateInTimezone(user.timezone);

          const existing = await DailyReflection.findOne({
            userId: user._id,
            date,
          });

          if (existing) {
            existing.mood = mood as 'great' | 'okay' | 'bad';
            existing.disciplineScore = user.disciplineScore?.today || 0;
            await existing.save();
          } else {
            await DailyReflection.create({
              userId: user._id,
              date,
              mood: mood as 'great' | 'okay' | 'bad',
              disciplineScore: user.disciplineScore?.today || 0,
            });
          }

          const moodEmoji = mood === 'great' ? '😄' : mood === 'okay' ? '😐' : '😞';
          await sendTelegramMessage(
            chatId,
            `${moodEmoji} <b>Reflection Saved!</b>\n\nThanks for checking in. Your "${mood}" mood has been recorded for today.\n\nKeep building discipline! 💪`
          );
        } else {
          await sendTelegramMessage(
            chatId,
            `❌ Your Telegram isn't connected to an account. Please connect at ${APP_URL}/settings`
          );
        }
      } catch (error) {
        console.error('Reflection save error:', error);
        await sendTelegramMessage(
          chatId,
          `❌ Failed to save reflection. Please try again or use the web app.`
        );
      }
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Telegram webhook error:', error);
    return NextResponse.json({ ok: true });
  }
}

// GET /api/telegram/webhook - Set up webhook
export async function GET(request: NextRequest) {
  try {
    const secret = request.nextUrl.searchParams.get('secret');

    if (secret !== process.env.CRON_SECRET) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
    if (!TELEGRAM_BOT_TOKEN) {
      return NextResponse.json(
        { error: 'Telegram bot token not configured' },
        { status: 500 }
      );
    }

    const webhookUrl = `${APP_URL}/api/telegram/webhook`;

    const response = await fetch(
      `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/setWebhook`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: webhookUrl,
          allowed_updates: ['message'],
        }),
      }
    );

    const data = await response.json();

    return NextResponse.json({
      success: data.ok,
      webhookUrl,
      result: data,
    });
  } catch (error) {
    console.error('Set webhook error:', error);
    return NextResponse.json(
      { error: 'Something went wrong' },
      { status: 500 }
    );
  }
}
