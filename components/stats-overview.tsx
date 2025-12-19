'use client';

import { Habit } from '@/lib/types';
import { isHabitCompletedToday } from '@/lib/habit-utils';
import { Card } from '@/components/ui/card';
import { CheckCircle2 } from 'lucide-react';
import { CompletionHeatmap } from '@/components/completion-heatmap';

interface StatsOverviewProps {
  habits: Habit[];
}

export function StatsOverview({ habits }: StatsOverviewProps) {
  const totalHabits = habits.length;
  const completedToday = habits.filter(isHabitCompletedToday).length;

  if (totalHabits === 0) return null;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-5">
      <div className="lg:col-span-1">
        <Card className="p-3 sm:p-4 h-full flex flex-col items-center justify-center">
          <div className="flex flex-col items-center text-center">
            <div className="p-2 rounded-lg bg-green-50 dark:bg-green-950 mb-3">
              <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" />
            </div>
            <p className="text-2xl sm:text-3xl font-bold">{completedToday}/{totalHabits}</p>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1">
              Completed Today
            </p>
          </div>
        </Card>
      </div>

      <div className="lg:col-span-3 min-w-0">
        <Card className="p-3 sm:p-4 h-full overflow-hidden">
          <CompletionHeatmap habits={habits} />
        </Card>
      </div>
    </div>
  );
}
