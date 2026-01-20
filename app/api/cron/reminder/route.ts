import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/models/User';
import Plan from '@/models/Plan';
import PlanBlock from '@/models/PlanBlock';
import { getCurrentTimeInTimezone, isTimeMatch } from '@/lib/timezone';
import { sendReminderEmail, ReminderData } from '@/lib/email';
import { sendReminderTelegram } from '@/lib/telegram';

const CRON_SECRET = process.env.CRON_SECRET;

// Track sent reminders to avoid duplicates (in production, use Redis)
const sentReminders = new Map<string, number>();

// Clean up old entries (keep for 2 minutes)
function cleanupSentReminders() {
  const twoMinutesAgo = Date.now() - 2 * 60 * 1000;
  for (const [key, timestamp] of sentReminders.entries()) {
    if (timestamp < twoMinutesAgo) {
      sentReminders.delete(key);
    }
  }
}

// GET /api/cron/reminder - Triggered by Vercel Cron every minute
export async function GET(request: NextRequest) {
  try {
    // Verify cron secret
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${CRON_SECRET}`) {
      // Also check query param for manual testing
      const secret = request.nextUrl.searchParams.get('secret');
      if (secret !== CRON_SECRET) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
    }

    cleanupSentReminders();

    await connectDB();

    // Find all users with reminder preferences enabled
    const users = await User.find({
      emailVerified: true,
      $or: [
        { 'reminderPrefs.email': true },
        { 'reminderPrefs.telegram': true },
      ],
    }).lean();

    let remindersProcessed = 0;
    let remindersSent = 0;

    for (const user of users) {
      // Get current time in user's timezone
      const currentTime = getCurrentTimeInTimezone(user.timezone);

      // Find user's active plan
      const activePlan = await Plan.findOne({
        userId: user._id,
        active: true,
      }).lean();

      if (!activePlan) continue;

      // Find blocks that match the current time
      const matchingBlocks = await PlanBlock.find({
        planId: activePlan._id,
        startTime: currentTime,
      }).lean();

      for (const block of matchingBlocks) {
        remindersProcessed++;

        // Create unique key for deduplication
        const reminderKey = `${user._id}-${block._id}-${currentTime}`;
        if (sentReminders.has(reminderKey)) {
          continue; // Already sent this reminder
        }

        const reminderData: ReminderData = {
          startTime: block.startTime,
          endTime: block.endTime,
          activity: block.activity,
          topic: block.topic,
        };

        // Send email reminder
        if (user.reminderPrefs.email) {
          const emailSent = await sendReminderEmail(user.email, reminderData);
          if (emailSent) {
            remindersSent++;
          }
        }

        // Send Telegram reminder
        if (user.reminderPrefs.telegram && user.telegramChatId) {
          const telegramSent = await sendReminderTelegram(
            user.telegramChatId,
            reminderData
          );
          if (telegramSent) {
            remindersSent++;
          }
        }

        // Mark as sent
        sentReminders.set(reminderKey, Date.now());
      }
    }

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      usersChecked: users.length,
      remindersProcessed,
      remindersSent,
    });
  } catch (error) {
    console.error('Cron reminder error:', error);
    return NextResponse.json(
      { error: 'Something went wrong' },
      { status: 500 }
    );
  }
}

// Also support POST for Vercel Cron
export async function POST(request: NextRequest) {
  return GET(request);
}
