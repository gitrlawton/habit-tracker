import { Habit } from './types';
import {
  format,
  parseISO,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  eachWeekOfInterval,
  subWeeks,
  subMonths,
  getDay,
  isWithinInterval
} from 'date-fns';

export interface WeeklyTrend {
  week: string;
  weekStart: string;
  completionRate: number;
  totalCompletions: number;
  totalPossible: number;
}

export interface MonthlyTrend {
  month: string;
  completionRate: number;
  totalCompletions: number;
  totalPossible: number;
}

export interface DayPerformance {
  day: string;
  dayIndex: number;
  completionRate: number;
  totalCompletions: number;
  totalPossible: number;
}

export interface HabitCorrelation {
  habit1Id: string;
  habit1Name: string;
  habit1Color: string;
  habit2Id: string;
  habit2Name: string;
  habit2Color: string;
  correlationScore: number;
  coCompletions: number;
  totalDays: number;
}

const MIN_TIMED_MINUTES = 15;

function isValidCompletion(habit: Habit, dateKey: string): boolean {
  if (!habit.completions[dateKey]) return false;
  if (habit.isTimed) {
    const minutes = habit.timedCompletions?.[dateKey] || 0;
    return minutes >= MIN_TIMED_MINUTES;
  }
  return true;
}

function getHabitCreationDate(habit: Habit): Date {
  return parseISO(habit.createdAt);
}

export function calculateWeeklyTrends(habits: Habit[], weeksBack: number = 12): WeeklyTrend[] {
  if (habits.length === 0) return [];

  const today = new Date();
  const trends: WeeklyTrend[] = [];

  for (let i = weeksBack - 1; i >= 0; i--) {
    const weekStart = startOfWeek(subWeeks(today, i), { weekStartsOn: 0 });
    const weekEnd = endOfWeek(weekStart, { weekStartsOn: 0 });
    const daysInWeek = eachDayOfInterval({ start: weekStart, end: weekEnd > today ? today : weekEnd });

    let totalCompletions = 0;
    let totalPossible = 0;

    for (const day of daysInWeek) {
      const dateKey = format(day, 'yyyy-MM-dd');

      for (const habit of habits) {
        const createdDate = getHabitCreationDate(habit);
        if (day >= createdDate) {
          totalPossible++;
          if (isValidCompletion(habit, dateKey)) {
            totalCompletions++;
          }
        }
      }
    }

    const completionRate = totalPossible > 0 ? (totalCompletions / totalPossible) * 100 : 0;

    trends.push({
      week: format(weekStart, 'MMM d'),
      weekStart: format(weekStart, 'yyyy-MM-dd'),
      completionRate: Math.round(completionRate),
      totalCompletions,
      totalPossible
    });
  }

  return trends;
}

export function calculateMonthlyTrends(habits: Habit[], monthsBack: number = 6): MonthlyTrend[] {
  if (habits.length === 0) return [];

  const today = new Date();
  const trends: MonthlyTrend[] = [];

  for (let i = monthsBack - 1; i >= 0; i--) {
    const monthStart = startOfMonth(subMonths(today, i));
    const monthEnd = endOfMonth(monthStart);
    const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd > today ? today : monthEnd });

    let totalCompletions = 0;
    let totalPossible = 0;

    for (const day of daysInMonth) {
      const dateKey = format(day, 'yyyy-MM-dd');

      for (const habit of habits) {
        const createdDate = getHabitCreationDate(habit);
        if (day >= createdDate) {
          totalPossible++;
          if (isValidCompletion(habit, dateKey)) {
            totalCompletions++;
          }
        }
      }
    }

    const completionRate = totalPossible > 0 ? (totalCompletions / totalPossible) * 100 : 0;

    trends.push({
      month: format(monthStart, 'MMM yyyy'),
      completionRate: Math.round(completionRate),
      totalCompletions,
      totalPossible
    });
  }

  return trends;
}

export function calculateDayPerformance(habits: Habit[], weeksBack: number = 12): DayPerformance[] {
  if (habits.length === 0) return [];

  const today = new Date();
  const startDate = subWeeks(today, weeksBack);
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const dayStats: Record<number, { completions: number; possible: number }> = {};
  for (let i = 0; i < 7; i++) {
    dayStats[i] = { completions: 0, possible: 0 };
  }

  const days = eachDayOfInterval({ start: startDate, end: today });

  for (const day of days) {
    const dayIndex = getDay(day);
    const dateKey = format(day, 'yyyy-MM-dd');

    for (const habit of habits) {
      const createdDate = getHabitCreationDate(habit);
      if (day >= createdDate) {
        dayStats[dayIndex].possible++;
        if (isValidCompletion(habit, dateKey)) {
          dayStats[dayIndex].completions++;
        }
      }
    }
  }

  return dayNames.map((day, index) => ({
    day,
    dayIndex: index,
    completionRate: dayStats[index].possible > 0
      ? Math.round((dayStats[index].completions / dayStats[index].possible) * 100)
      : 0,
    totalCompletions: dayStats[index].completions,
    totalPossible: dayStats[index].possible
  }));
}

export function calculateHabitCorrelations(habits: Habit[], weeksBack: number = 12): HabitCorrelation[] {
  if (habits.length < 2) return [];

  const today = new Date();
  const startDate = subWeeks(today, weeksBack);
  const days = eachDayOfInterval({ start: startDate, end: today });
  const correlations: HabitCorrelation[] = [];

  for (let i = 0; i < habits.length; i++) {
    for (let j = i + 1; j < habits.length; j++) {
      const habit1 = habits[i];
      const habit2 = habits[j];

      let coCompletions = 0;
      let habit1Completions = 0;
      let habit2Completions = 0;
      let totalDays = 0;

      for (const day of days) {
        const dateKey = format(day, 'yyyy-MM-dd');
        const h1Created = getHabitCreationDate(habit1);
        const h2Created = getHabitCreationDate(habit2);

        if (day >= h1Created && day >= h2Created) {
          totalDays++;
          const h1Completed = isValidCompletion(habit1, dateKey);
          const h2Completed = isValidCompletion(habit2, dateKey);

          if (h1Completed) habit1Completions++;
          if (h2Completed) habit2Completions++;
          if (h1Completed && h2Completed) coCompletions++;
        }
      }

      if (totalDays > 0 && habit1Completions > 0 && habit2Completions > 0) {
        const expectedCoCompletions = (habit1Completions / totalDays) * (habit2Completions / totalDays) * totalDays;
        const correlationScore = expectedCoCompletions > 0
          ? ((coCompletions - expectedCoCompletions) / Math.sqrt(expectedCoCompletions * (1 - habit1Completions/totalDays) * (1 - habit2Completions/totalDays)))
          : 0;

        const normalizedScore = Math.max(-1, Math.min(1, correlationScore / 3));

        correlations.push({
          habit1Id: habit1.id,
          habit1Name: habit1.name,
          habit1Color: habit1.color,
          habit2Id: habit2.id,
          habit2Name: habit2.name,
          habit2Color: habit2.color,
          correlationScore: Math.round(normalizedScore * 100) / 100,
          coCompletions,
          totalDays
        });
      }
    }
  }

  return correlations.sort((a, b) => Math.abs(b.correlationScore) - Math.abs(a.correlationScore));
}

export function getBestPerformingDays(dayPerformance: DayPerformance[]): DayPerformance[] {
  return [...dayPerformance].sort((a, b) => b.completionRate - a.completionRate);
}

export function getWorstPerformingDays(dayPerformance: DayPerformance[]): DayPerformance[] {
  return [...dayPerformance].sort((a, b) => a.completionRate - b.completionRate);
}
