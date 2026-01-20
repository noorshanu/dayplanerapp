import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/models/User';
import Plan from '@/models/Plan';
import PlanBlock from '@/models/PlanBlock';
import TaskLog from '@/models/TaskLog';
import { getDateInTimezone, getCurrentTimeInTimezone } from '@/lib/timezone';
import { sendReminderEmail, ReminderData } from '@/lib/email';
import { sendTelegramMessage } from '@/lib/telegram';

const CRON_SECRET = process.env.CRON_SECRET;
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

// GET/POST /api/cron/reflection - Send end-of-day reflection prompts
export async function GET(request: NextRequest) {
  try {
    // Verify cron secret
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${CRON_SECRET}`) {
      const secret = request.nextUrl.searchParams.get('secret');
      if (secret !== CRON_SECRET) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
    }

    await connectDB();

    // Find all verified users
    const users = await User.find({
      emailVerified: true,
    }).lean();

    let reflectionsSent = 0;

    for (const user of users) {
      const currentTime = getCurrentTimeInTimezone(user.timezone);
      const currentDate = getDateInTimezone(user.timezone);

      // Send reflection prompt at 9 PM (21:00) in user's timezone
      if (currentTime !== '21:00') {
        continue;
      }

      // Check if user has any task logs today (meaning they used the app)
      const todayLogs = await TaskLog.countDocuments({
        userId: user._id,
        date: currentDate,
      });

      if (todayLogs === 0) {
        continue; // Don't bother users who didn't use the app today
      }

      // Send reflection prompt via email
      if (user.reminderPrefs.email) {
        await sendReflectionEmail(user.email, currentDate);
        reflectionsSent++;
      }

      // Send reflection prompt via Telegram
      if (user.reminderPrefs.telegram && user.telegramChatId) {
        await sendReflectionTelegram(user.telegramChatId);
        reflectionsSent++;
      }
    }

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      reflectionsSent,
    });
  } catch (error) {
    console.error('Reflection cron error:', error);
    return NextResponse.json(
      { error: 'Something went wrong' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  return GET(request);
}

async function sendReflectionEmail(email: string, date: string): Promise<boolean> {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f7fa; margin: 0; padding: 40px 20px; }
        .container { max-width: 480px; margin: 0 auto; background: white; border-radius: 16px; box-shadow: 0 4px 24px rgba(0,0,0,0.08); overflow: hidden; }
        .header { background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); padding: 32px; text-align: center; }
        .header h1 { color: white; margin: 0; font-size: 24px; font-weight: 600; }
        .content { padding: 32px; text-align: center; }
        .emoji { font-size: 48px; margin-bottom: 16px; }
        .message { color: #64748b; line-height: 1.6; margin-bottom: 24px; }
        .mood-buttons { display: flex; justify-content: center; gap: 16px; margin-bottom: 24px; }
        .mood-btn { display: inline-block; padding: 16px 24px; border-radius: 12px; text-decoration: none; font-size: 32px; transition: transform 0.2s; }
        .mood-btn:hover { transform: scale(1.1); }
        .great { background: #dcfce7; }
        .okay { background: #fef3c7; }
        .bad { background: #fee2e2; }
        .footer { text-align: center; padding: 24px; color: #94a3b8; font-size: 14px; border-top: 1px solid #f1f5f9; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>📅 Daily Reflection</h1>
        </div>
        <div class="content">
          <div class="emoji">🌙</div>
          <p class="message">Time to wrap up your day! How did it go?</p>
          <div class="mood-buttons">
            <a href="${APP_URL}/reflection?mood=great" class="mood-btn great">😄</a>
            <a href="${APP_URL}/reflection?mood=okay" class="mood-btn okay">😐</a>
            <a href="${APP_URL}/reflection?mood=bad" class="mood-btn bad">😞</a>
          </div>
          <p class="message" style="font-size: 14px;">Click an emoji to submit your reflection</p>
        </div>
        <div class="footer">
          Day Planner • Building discipline, one day at a time
        </div>
      </div>
    </body>
    </html>
  `;

  try {
    const nodemailer = await import('nodemailer');
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    await transporter.sendMail({
      from: `"Day Planner" <${process.env.SMTP_USER}>`,
      to: email,
      subject: '🌙 How was your day?',
      html,
    });

    return true;
  } catch (error) {
    console.error('Failed to send reflection email:', error);
    return false;
  }
}

async function sendReflectionTelegram(chatId: string): Promise<boolean> {
  const message = `
🌙 <b>Daily Reflection</b>

How was your day?

[ 😄 Great ] [ 😐 Okay ] [ 😞 Bad ]

Click below to submit:
• /great - I crushed it!
• /okay - It was alright
• /bad - Could be better

Your honest reflection helps track your progress.
`.trim();

  return sendTelegramMessage(chatId, message);
}
