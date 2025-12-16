'use client';

import { Habit } from '@/lib/types';
import { isHabitCompletedToday } from '@/lib/habit-utils';
import { Card } from '@/components/ui/card';
import { CheckCircle2 } from 'lucide-react';

interface StatsOverviewProps {
  habits: Habit[];
}

export function StatsOverview({ habits }: StatsOverviewProps) {
  const totalHabits = habits.length;
  const completedToday = habits.filter(isHabitCompletedToday).length;

  if (totalHabits === 0) return null;

  return (
    <div className="max-w-sm">
      <Card className="p-4 sm:p-5">
        <div className="flex items-start justify-between mb-2">
          <div className="p-2 rounded-lg bg-green-50 dark:bg-green-950">
            <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" />
          </div>
        </div>
        <div className="mt-2">
          <p className="text-2xl sm:text-3xl font-bold">{completedToday}/{totalHabits}</p>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Completed Today
          </p>
        </div>
      </Card>
    </div>
  );
}
