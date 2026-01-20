import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/models/User';
import TaskLog from '@/models/TaskLog';
import DailyReflection, { Mood } from '@/models/DailyReflection';
import { getCurrentUser } from '@/lib/auth';
import { getDateInTimezone } from '@/lib/timezone';

// GET /api/reflection - Get reflection history
export async function GET() {
  try {
    const tokenUser = await getCurrentUser();
    if (!tokenUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const reflections = await DailyReflection.find({ userId: tokenUser.userId })
      .sort({ date: -1 })
      .limit(30)
      .lean();

    return NextResponse.json({
      reflections: reflections.map(r => ({
        id: r._id,
        date: r.date,
        mood: r.mood,
        disciplineScore: r.disciplineScore,
        tasksCompleted: r.tasksCompleted,
        tasksMissed: r.tasksMissed,
        totalSnoozes: r.totalSnoozes,
      })),
    });
  } catch (error) {
    console.error('Get reflections error:', error);
    return NextResponse.json(
      { error: 'Something went wrong' },
      { status: 500 }
    );
  }
}

// POST /api/reflection - Submit daily reflection
export async function POST(request: NextRequest) {
  try {
    const tokenUser = await getCurrentUser();
    if (!tokenUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { mood, date: providedDate } = body;

    if (!mood || !['great', 'okay', 'bad'].includes(mood)) {
      return NextResponse.json(
        { error: 'Invalid mood value' },
        { status: 400 }
      );
    }

    await connectDB();

    const user = await User.findById(tokenUser.userId);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const date = providedDate || getDateInTimezone(user.timezone);

    // Get today's task logs for stats
    const dayLogs = await TaskLog.find({
      userId: user._id,
      date,
    }).lean();

    const tasksCompleted = dayLogs.filter(l => l.status === 'completed').length;
    const tasksMissed = dayLogs.filter(l => l.status === 'missed').length;
    const totalSnoozes = dayLogs.reduce((sum, l) => sum + l.snoozeCount, 0);

    // Check if reflection already exists for this date
    const existingReflection = await DailyReflection.findOne({
      userId: user._id,
      date,
    });

    if (existingReflection) {
      existingReflection.mood = mood as Mood;
      existingReflection.disciplineScore = user.disciplineScore.today;
      existingReflection.tasksCompleted = tasksCompleted;
      existingReflection.tasksMissed = tasksMissed;
      existingReflection.totalSnoozes = totalSnoozes;
      await existingReflection.save();

      return NextResponse.json({
        message: 'Reflection updated',
        reflection: existingReflection,
      });
    }

    // Create new reflection
    const reflection = await DailyReflection.create({
      userId: user._id,
      date,
      mood: mood as Mood,
      disciplineScore: user.disciplineScore.today,
      tasksCompleted,
      tasksMissed,
      totalSnoozes,
    });

    return NextResponse.json({
      message: 'Reflection saved',
      reflection,
    });
  } catch (error) {
    console.error('Submit reflection error:', error);
    return NextResponse.json(
      { error: 'Something went wrong' },
      { status: 500 }
    );
  }
}
