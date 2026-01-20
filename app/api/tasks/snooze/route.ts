import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/models/User';
import Plan from '@/models/Plan';
import PlanBlock from '@/models/PlanBlock';
import TaskLog from '@/models/TaskLog';
import { getCurrentUser } from '@/lib/auth';
import { getCurrentTimeInTimezone, getDateInTimezone, timeToMinutes } from '@/lib/timezone';

// POST /api/tasks/snooze - Snooze current task
export async function POST(request: NextRequest) {
  try {
    const tokenUser = await getCurrentUser();
    if (!tokenUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { duration } = body; // 10, 30, or 'next' for after next task

    if (!duration || !['10', '30', 'next', 10, 30].includes(duration)) {
      return NextResponse.json(
        { error: 'Invalid snooze duration' },
        { status: 400 }
      );
    }

    await connectDB();

    const user = await User.findById(tokenUser.userId);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const currentTime = getCurrentTimeInTimezone(user.timezone);
    const currentDate = getDateInTimezone(user.timezone);
    const currentMinutes = timeToMinutes(currentTime);

    // Find active plan
    const activePlan = await Plan.findOne({
      userId: user._id,
      active: true,
    });

    if (!activePlan) {
      return NextResponse.json({ error: 'No active plan' }, { status: 400 });
    }

    // Find current block
    const blocks = await PlanBlock.find({ planId: activePlan._id })
      .sort({ startTime: 1 })
      .lean();
    
    let currentBlock = null;
    let nextBlock = null;

    for (let i = 0; i < blocks.length; i++) {
      const block = blocks[i];
      const startMinutes = timeToMinutes(block.startTime);
      const endMinutes = timeToMinutes(block.endTime);

      if (currentMinutes >= startMinutes && currentMinutes < endMinutes) {
        currentBlock = block;
        if (i + 1 < blocks.length) {
          nextBlock = blocks[i + 1];
        }
        break;
      }
    }

    if (!currentBlock) {
      return NextResponse.json({ error: 'No current task to snooze' }, { status: 400 });
    }

    // Calculate snooze duration in minutes
    let snoozeDuration: number;
    if (duration === 'next' && nextBlock) {
      snoozeDuration = timeToMinutes(nextBlock.endTime) - currentMinutes;
    } else {
      snoozeDuration = typeof duration === 'string' ? parseInt(duration) : duration;
    }

    // Find or create task log
    let taskLog = await TaskLog.findOne({
      userId: user._id,
      planBlockId: currentBlock._id,
      date: currentDate,
    });

    if (taskLog) {
      taskLog.status = 'snoozed';
      taskLog.snoozeCount += 1;
      taskLog.snoozeHistory.push({
        snoozedAt: new Date(),
        duration: snoozeDuration,
      });
      await taskLog.save();
    } else {
      taskLog = await TaskLog.create({
        userId: user._id,
        planBlockId: currentBlock._id,
        date: currentDate,
        status: 'snoozed',
        snoozeCount: 1,
        snoozeHistory: [{
          snoozedAt: new Date(),
          duration: snoozeDuration,
        }],
      });
    }

    // Generate feedback message
    let feedbackMessage = null;
    if (taskLog.snoozeCount === 1) {
      feedbackMessage = 'Task snoozed. Try not to make it a habit!';
    } else if (taskLog.snoozeCount === 2) {
      feedbackMessage = 'You snoozed this task twice 👀';
    } else if (taskLog.snoozeCount >= 3) {
      feedbackMessage = `You snoozed this task ${taskLog.snoozeCount} times 👀`;
    }

    return NextResponse.json({
      message: `Task snoozed for ${snoozeDuration} minutes`,
      snoozeCount: taskLog.snoozeCount,
      feedbackMessage,
      snoozeDuration,
    });
  } catch (error) {
    console.error('Snooze task error:', error);
    return NextResponse.json(
      { error: 'Something went wrong' },
      { status: 500 }
    );
  }
}
