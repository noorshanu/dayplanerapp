import { ITaskLog } from '@/models/TaskLog';

/**
 * Discipline Score Calculation Rules:
 * - Complete on time: +10 points
 * - Complete late (within 30min): +5 points
 * - Snooze once: -2 points
 * - Snooze twice: -5 points
 * - Snooze 3+: -10 points
 * - Miss task: -15 points
 * - Daily max: 100 points
 */

export interface ScoreBreakdown {
  totalPoints: number;
  maxPossiblePoints: number;
  percentage: number;
  completedOnTime: number;
  completedLate: number;
  snoozed: number;
  missed: number;
  totalSnoozes: number;
}

// Points configuration
const POINTS = {
  COMPLETE_ON_TIME: 10,
  COMPLETE_LATE: 5,
  SNOOZE_ONCE: -2,
  SNOOZE_TWICE: -5,
  SNOOZE_MANY: -10,
  MISSED: -15,
  BASE_PER_TASK: 10, // Base points per scheduled task
};

/**
 * Calculate snooze penalty based on snooze count
 */
export function calculateSnoozePenalty(snoozeCount: number): number {
  if (snoozeCount === 0) return 0;
  if (snoozeCount === 1) return Math.abs(POINTS.SNOOZE_ONCE);
  if (snoozeCount === 2) return Math.abs(POINTS.SNOOZE_TWICE);
  return Math.abs(POINTS.SNOOZE_MANY);
}

/**
 * Calculate points earned for a single task
 */
export function calculateTaskPoints(
  status: ITaskLog['status'],
  snoozeCount: number,
  completedOnTime: boolean = true
): number {
  let points = 0;

  switch (status) {
    case 'completed':
      points = completedOnTime ? POINTS.COMPLETE_ON_TIME : POINTS.COMPLETE_LATE;
      break;
    case 'missed':
      points = POINTS.MISSED;
      break;
    case 'snoozed':
    case 'pending':
      // Pending tasks don't contribute yet
      points = 0;
      break;
  }

  // Apply snooze penalty
  if (snoozeCount > 0) {
    points -= calculateSnoozePenalty(snoozeCount);
  }

  return points;
}

/**
 * Calculate daily discipline score from task logs
 */
export function calculateDailyScore(taskLogs: ITaskLog[], totalScheduledTasks: number): ScoreBreakdown {
  let totalPoints = 0;
  let completedOnTime = 0;
  let completedLate = 0;
  let snoozed = 0;
  let missed = 0;
  let totalSnoozes = 0;

  for (const log of taskLogs) {
    totalSnoozes += log.snoozeCount;

    switch (log.status) {
      case 'completed':
        // Check if completed within reasonable time (using pointsEarned as indicator)
        if (log.pointsEarned >= POINTS.COMPLETE_ON_TIME) {
          completedOnTime++;
        } else {
          completedLate++;
        }
        totalPoints += log.pointsEarned;
        break;
      case 'missed':
        missed++;
        totalPoints += POINTS.MISSED;
        break;
      case 'snoozed':
        snoozed++;
        totalPoints -= calculateSnoozePenalty(log.snoozeCount);
        break;
    }

    // Apply snooze penalty for completed tasks too
    if (log.status === 'completed' && log.snoozeCount > 0) {
      totalPoints -= calculateSnoozePenalty(log.snoozeCount);
    }
  }

  // Max possible points = base points per scheduled task
  const maxPossiblePoints = totalScheduledTasks * POINTS.BASE_PER_TASK;
  
  // Calculate percentage (ensure it's between 0 and 100)
  const rawPercentage = maxPossiblePoints > 0 
    ? (totalPoints / maxPossiblePoints) * 100 
    : 0;
  const percentage = Math.max(0, Math.min(100, Math.round(rawPercentage)));

  return {
    totalPoints: Math.max(0, totalPoints),
    maxPossiblePoints,
    percentage,
    completedOnTime,
    completedLate,
    snoozed,
    missed,
    totalSnoozes,
  };
}

/**
 * Calculate weekly average from daily scores
 */
export function calculateWeeklyAverage(dailyScores: number[]): number {
  if (dailyScores.length === 0) return 0;
  const sum = dailyScores.reduce((a, b) => a + b, 0);
  return Math.round(sum / dailyScores.length);
}

/**
 * Find best day of the week from historical data
 */
export function findBestDay(
  dailyData: { date: string; score: number }[]
): string {
  const dayScores: Record<string, { total: number; count: number }> = {
    Sunday: { total: 0, count: 0 },
    Monday: { total: 0, count: 0 },
    Tuesday: { total: 0, count: 0 },
    Wednesday: { total: 0, count: 0 },
    Thursday: { total: 0, count: 0 },
    Friday: { total: 0, count: 0 },
    Saturday: { total: 0, count: 0 },
  };

  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  for (const { date, score } of dailyData) {
    const dayIndex = new Date(date).getDay();
    const dayName = dayNames[dayIndex];
    dayScores[dayName].total += score;
    dayScores[dayName].count++;
  }

  let bestDay = '';
  let bestAverage = 0;

  for (const [day, { total, count }] of Object.entries(dayScores)) {
    if (count > 0) {
      const average = total / count;
      if (average > bestAverage) {
        bestAverage = average;
        bestDay = day;
      }
    }
  }

  return bestDay;
}

/**
 * Get motivational feedback based on score
 */
export function getScoreFeedback(score: number): { emoji: string; message: string } {
  if (score >= 90) return { emoji: '🔥', message: 'On fire!' };
  if (score >= 80) return { emoji: '💪', message: 'Strong discipline!' };
  if (score >= 70) return { emoji: '👍', message: 'Good effort' };
  if (score >= 50) return { emoji: '😐', message: 'Room to improve' };
  if (score >= 30) return { emoji: '⚠️', message: 'Needs work' };
  return { emoji: '😬', message: 'Let\'s do better' };
}

/**
 * Get snooze feedback message
 */
export function getSnoozeFeedback(snoozeCount: number): string | null {
  if (snoozeCount === 0) return null;
  if (snoozeCount === 1) return 'You snoozed this task once';
  if (snoozeCount === 2) return 'You snoozed this task twice 👀';
  return `You snoozed this task ${snoozeCount} times 👀`;
}
