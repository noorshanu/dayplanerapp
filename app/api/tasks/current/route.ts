import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/models/User';
import Plan from '@/models/Plan';
import PlanBlock from '@/models/PlanBlock';
import TaskLog from '@/models/TaskLog';
import { getCurrentUser } from '@/lib/auth';
import { getCurrentTimeInTimezone, getDateInTimezone, timeToMinutes } from '@/lib/timezone';
import { calculateTaskPoints } from '@/lib/discipline';

// GET /api/tasks/current - Get the current active task
export async function GET() {
  try {
    const tokenUser = await getCurrentUser();
    if (!tokenUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
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
      return NextResponse.json({
        currentTask: null,
        nextTask: null,
        message: 'No active plan',
      });
    }

    // Get all blocks sorted by start time
    const blocks = await PlanBlock.find({ planId: activePlan._id })
      .sort({ startTime: 1 })
      .lean();

    if (blocks.length === 0) {
      return NextResponse.json({
        currentTask: null,
        nextTask: null,
        message: 'No tasks scheduled',
      });
    }

    // Find current and next task
    let currentTask = null;
    let nextTask = null;

    for (let i = 0; i < blocks.length; i++) {
      const block = blocks[i];
      const startMinutes = timeToMinutes(block.startTime);
      const endMinutes = timeToMinutes(block.endTime);

      // Check if this is the current task
      if (currentMinutes >= startMinutes && currentMinutes < endMinutes) {
        // Get task log for snooze info
        const taskLog = await TaskLog.findOne({
          userId: user._id,
          planBlockId: block._id,
          date: currentDate,
        });

        const remainingMinutes = endMinutes - currentMinutes;
        const hours = Math.floor(remainingMinutes / 60);
        const minutes = remainingMinutes % 60;

        currentTask = {
          id: block._id,
          activity: block.activity,
          topic: block.topic,
          startTime: block.startTime,
          endTime: block.endTime,
          remainingMinutes,
          remainingFormatted: hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`,
          snoozeCount: taskLog?.snoozeCount || 0,
          status: taskLog?.status || 'pending',
        };

        // Next task is the one after current
        if (i + 1 < blocks.length) {
          nextTask = {
            id: blocks[i + 1]._id,
            activity: blocks[i + 1].activity,
            topic: blocks[i + 1].topic,
            startTime: blocks[i + 1].startTime,
            endTime: blocks[i + 1].endTime,
          };
        }
        break;
      }

      // Check if this is a future task (next task if no current)
      if (currentMinutes < startMinutes && !nextTask) {
        nextTask = {
          id: block._id,
          activity: block.activity,
          topic: block.topic,
          startTime: block.startTime,
          endTime: block.endTime,
        };
        if (!currentTask) break; // Found next, no current
      }
    }

    return NextResponse.json({
      currentTask,
      nextTask,
      currentTime,
      timezone: user.timezone,
    });
  } catch (error) {
    console.error('Get current task error:', error);
    return NextResponse.json(
      { error: 'Something went wrong' },
      { status: 500 }
    );
  }
}

// POST /api/tasks/current - Mark current task as done
export async function POST() {
  try {
    const tokenUser = await getCurrentUser();
    if (!tokenUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
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
    const blocks = await PlanBlock.find({ planId: activePlan._id }).lean();
    let currentBlock = null;

    for (const block of blocks) {
      const startMinutes = timeToMinutes(block.startTime);
      const endMinutes = timeToMinutes(block.endTime);

      if (currentMinutes >= startMinutes && currentMinutes < endMinutes) {
        currentBlock = block;
        break;
      }
    }

    if (!currentBlock) {
      return NextResponse.json({ error: 'No current task' }, { status: 400 });
    }

    // Find or create task log
    let taskLog = await TaskLog.findOne({
      userId: user._id,
      planBlockId: currentBlock._id,
      date: currentDate,
    });

    const isOnTime = currentMinutes <= timeToMinutes(currentBlock.startTime) + 30;
    const points = calculateTaskPoints('completed', taskLog?.snoozeCount || 0, isOnTime);

    if (taskLog) {
      taskLog.status = 'completed';
      taskLog.completedAt = new Date();
      taskLog.pointsEarned = points;
      await taskLog.save();
    } else {
      taskLog = await TaskLog.create({
        userId: user._id,
        planBlockId: currentBlock._id,
        date: currentDate,
        status: 'completed',
        completedAt: new Date(),
        pointsEarned: points,
      });
    }

    return NextResponse.json({
      message: 'Task marked as done!',
      pointsEarned: points,
      taskLog: {
        id: taskLog._id,
        status: taskLog.status,
        pointsEarned: taskLog.pointsEarned,
      },
    });
  } catch (error) {
    console.error('Mark task done error:', error);
    return NextResponse.json(
      { error: 'Something went wrong' },
      { status: 500 }
    );
  }
}
