import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/models/User';
import Plan from '@/models/Plan';
import PlanBlock from '@/models/PlanBlock';
import TaskLog from '@/models/TaskLog';
import { getCurrentTimeInTimezone, getDateInTimezone, timeToMinutes } from '@/lib/timezone';
import { sendReminderEmail, ReminderData } from '@/lib/email';
import { sendReminderTelegram } from '@/lib/telegram';

const CRON_SECRET = process.env.CRON_SECRET;

// GET /api/cron/reminder - Triggered by cron every minute
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
      const currentTime = getCurrentTimeInTimezone(user.timezone);
      const currentDate = getDateInTimezone(user.timezone);
      const currentMinutes = timeToMinutes(currentTime);

      // Find user's active plan
      const activePlan = await Plan.findOne({
        userId: user._id,
        active: true,
      }).lean();

      if (!activePlan) continue;

      // Find ALL blocks for the plan
      const blocks = await PlanBlock.find({
        planId: activePlan._id,
      }).lean();

      for (const block of blocks) {
        const blockStartMinutes = timeToMinutes(block.startTime);
        
        // Check if current time is within first 2 minutes of the block start
        // This allows for cron timing variations
        const minutesSinceStart = currentMinutes - blockStartMinutes;
        
        // Only send reminder if we're within 0-2 minutes of start time
        if (minutesSinceStart < 0 || minutesSinceStart > 2) {
          continue;
        }

        remindersProcessed++;

        // Check if we already sent a reminder today for this block
        const existingLog = await TaskLog.findOne({
          userId: user._id,
          planBlockId: block._id,
          date: currentDate,
        });

        // If log exists with status other than 'pending', skip (already handled)
        if (existingLog && existingLog.status !== 'pending') {
          continue;
        }

        // Create or get task log
        if (!existingLog) {
          await TaskLog.create({
            userId: user._id,
            planBlockId: block._id,
            date: currentDate,
            status: 'pending',
          });
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
            console.log(`Email sent to ${user.email} for task: ${block.activity}`);
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
            console.log(`Telegram sent to ${user.telegramChatId} for task: ${block.activity}`);
          }
        }
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

// Also support POST for cron services
export async function POST(request: NextRequest) {
  return GET(request);
}
