import { Habit, HabitStats } from './types';
import { format, parseISO, startOfDay, differenceInDays, subDays } from 'date-fns';

export const getTodayKey = (): string => {
  return format(startOfDay(new Date()), 'yyyy-MM-dd');
};

export const getDateKey = (date: Date): string => {
  return format(startOfDay(date), 'yyyy-MM-dd');
};

export const isHabitCompletedToday = (habit: Habit): boolean => {
  return habit.completions[getTodayKey()] === true;
};

export const calculateStats = (habit: Habit): HabitStats => {
  const sortedDates = Object.entries(habit.completions)
    .filter(([_, completed]) => completed)
    .map(([date]) => date)
    .sort((a, b) => b.localeCompare(a));

  const totalCompletions = sortedDates.length;

  let currentStreak = 0;
  let longestStreak = 0;
  let tempStreak = 0;

  const today = startOfDay(new Date());

  if (sortedDates.length > 0) {
    const mostRecentDate = parseISO(sortedDates[0]);
    const daysSinceLastCompletion = differenceInDays(today, mostRecentDate);

    if (daysSinceLastCompletion <= 1) {
      currentStreak = 1;
      let checkDate = mostRecentDate;

      for (let i = 1; i < sortedDates.length; i++) {
        const prevDate = parseISO(sortedDates[i]);
        const diff = differenceInDays(checkDate, prevDate);

        if (diff === 1) {
          currentStreak++;
          checkDate = prevDate;
        } else {
          break;
        }
      }
    }
  }

  for (let i = 0; i < sortedDates.length; i++) {
    tempStreak = 1;
    let checkDate = parseISO(sortedDates[i]);

    for (let j = i + 1; j < sortedDates.length; j++) {
      const prevDate = parseISO(sortedDates[j]);
      const diff = differenceInDays(checkDate, prevDate);

      if (diff === 1) {
        tempStreak++;
        checkDate = prevDate;
      } else {
        break;
      }
    }

    longestStreak = Math.max(longestStreak, tempStreak);
  }

  const daysSinceCreation = differenceInDays(today, parseISO(habit.createdAt)) + 1;
  const completionRate = daysSinceCreation > 0
    ? (totalCompletions / daysSinceCreation) * 100
    : 0;

  return {
    currentStreak,
    longestStreak,
    totalCompletions,
    completionRate: Math.round(completionRate)
  };
};

export const getLast7Days = (): Date[] => {
  const days: Date[] = [];
  const today = new Date();

  for (let i = 6; i >= 0; i--) {
    days.push(subDays(today, i));
  }

  return days;
};

export const getCompletionColor = (rate: number): string => {
  if (rate >= 80) return 'text-green-600';
  if (rate >= 60) return 'text-blue-600';
  if (rate >= 40) return 'text-yellow-600';
  return 'text-gray-600';
};
