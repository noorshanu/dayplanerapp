import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/models/User';
import Plan from '@/models/Plan';
import PlanBlock from '@/models/PlanBlock';
import TaskLog from '@/models/TaskLog';
import DailyReflection from '@/models/DailyReflection';
import { getCurrentUser } from '@/lib/auth';
import { getDateInTimezone } from '@/lib/timezone';
import { calculateDailyScore, calculateWeeklyAverage, findBestDay, getScoreFeedback } from '@/lib/discipline';

// GET /api/discipline - Get user's discipline score and stats
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

    const today = getDateInTimezone(user.timezone);

    // Get active plan to count total scheduled tasks
    const activePlan = await Plan.findOne({
      userId: user._id,
      active: true,
    });

    let totalScheduledTasks = 0;
    if (activePlan) {
      totalScheduledTasks = await PlanBlock.countDocuments({ planId: activePlan._id });
    }

    // Get today's task logs
    const todayLogs = await TaskLog.find({
      userId: user._id,
      date: today,
    }).lean();

    // Calculate today's score
    const todayBreakdown = calculateDailyScore(todayLogs, totalScheduledTasks);

    // Get last 7 days for weekly average
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const weekAgoStr = weekAgo.toISOString().slice(0, 10);

    const weeklyLogs = await TaskLog.find({
      userId: user._id,
      date: { $gte: weekAgoStr, $lte: today },
    }).lean();

    // Group logs by date and calculate daily scores
    const logsByDate: Record<string, typeof weeklyLogs> = {};
    for (const log of weeklyLogs) {
      if (!logsByDate[log.date]) {
        logsByDate[log.date] = [];
      }
      logsByDate[log.date].push(log);
    }

    const dailyScores: { date: string; score: number }[] = [];
    for (const [date, logs] of Object.entries(logsByDate)) {
      const breakdown = calculateDailyScore(logs, totalScheduledTasks);
      dailyScores.push({ date, score: breakdown.percentage });
    }

    const weeklyAverage = calculateWeeklyAverage(dailyScores.map(d => d.score));
    const bestDay = findBestDay(dailyScores);
    const feedback = getScoreFeedback(todayBreakdown.percentage);

    // Update user's discipline score
    user.disciplineScore = {
      today: todayBreakdown.percentage,
      weeklyAverage,
      bestDay,
      lastUpdated: new Date(),
    };
    await user.save();

    // Get reflections for mood correlation
    const recentReflections = await DailyReflection.find({
      userId: user._id,
    })
      .sort({ date: -1 })
      .limit(7)
      .lean();

    return NextResponse.json({
      today: {
        score: todayBreakdown.percentage,
        breakdown: todayBreakdown,
        feedback,
      },
      weekly: {
        average: weeklyAverage,
        bestDay,
        dailyScores,
      },
      recentReflections: recentReflections.map(r => ({
        date: r.date,
        mood: r.mood,
        score: r.disciplineScore,
      })),
    });
  } catch (error) {
    console.error('Get discipline score error:', error);
    return NextResponse.json(
      { error: 'Something went wrong' },
      { status: 500 }
    );
  }
}
