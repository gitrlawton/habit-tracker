'use client';

import { Habit } from '@/lib/types';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface CompletionHeatmapProps {
  habits: Habit[];
}

export function CompletionHeatmap({ habits }: CompletionHeatmapProps) {
  const weeks = 53;
  const today = new Date();

  const startDate = new Date(today);
  startDate.setDate(today.getDate() - (weeks * 7 - 1));
  startDate.setHours(0, 0, 0, 0);

  const getCompletionsForDate = (date: Date): number => {
    const dateKey = date.toISOString().split('T')[0];
    return habits.filter(habit => habit.completions[dateKey]).length;
  };

  const getColorClass = (completions: number): string => {
    if (completions === 0) return 'bg-slate-100 dark:bg-slate-800';
    if (completions === 1) return 'bg-green-200 dark:bg-green-900';
    if (completions === 2) return 'bg-green-400 dark:bg-green-700';
    if (completions === 3) return 'bg-green-600 dark:bg-green-600';
    return 'bg-green-700 dark:bg-green-500';
  };

  const getMonthLabels = () => {
    const labels: { month: string; weekIndex: number }[] = [];
    let lastMonth = -1;

    for (let week = 0; week < weeks; week++) {
      for (let day = 0; day < 7; day++) {
        const date = new Date(startDate);
        date.setDate(startDate.getDate() + week * 7 + day);
        const month = date.getMonth();

        if (month !== lastMonth) {
          labels.push({
            month: date.toLocaleDateString('en-US', { month: 'short' }),
            weekIndex: week
          });
          lastMonth = month;
          break;
        }
      }
    }

    return labels;
  };

  const formatDate = (date: Date): string => {
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const monthLabels = getMonthLabels();
  const leftPadding = 3;

  return (
    <div className="w-full overflow-x-auto">
      <div className="inline-block min-w-full">
        <div className="relative" style={{ paddingLeft: `${leftPadding}px` }}>
          <div className="flex gap-1 mb-2 relative" style={{ height: '14px' }}>
            {monthLabels.map((label, i) => (
              <div
                key={i}
                className="text-[10px] text-muted-foreground absolute"
                style={{
                  left: `${label.weekIndex * 16}px`,
                }}
              >
                {label.month}
              </div>
            ))}
          </div>

          <TooltipProvider>
            <div className="flex gap-1 pb-1">
              {Array.from({ length: weeks }).map((_, weekIndex) => (
                <div key={weekIndex} className="flex flex-col gap-1">
                  {[0, 1, 2, 3, 4, 5, 6].map((dayIndex) => {
                    const date = new Date(startDate);
                    date.setDate(startDate.getDate() + weekIndex * 7 + dayIndex);

                    if (date > today) {
                      return <div key={dayIndex} className="w-[12px] h-[12px]" />;
                    }

                    const completions = getCompletionsForDate(date);
                    const colorClass = getColorClass(completions);

                    return (
                      <Tooltip key={dayIndex}>
                        <TooltipTrigger asChild>
                          <div
                            className={`w-[12px] h-[12px] rounded-[2px] ${colorClass} transition-colors hover:ring-2 hover:ring-offset-1 hover:ring-blue-500 cursor-pointer`}
                          />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="text-xs">
                            {completions} {completions === 1 ? 'habit' : 'habits'} completed
                          </p>
                          <p className="text-xs text-muted-foreground">{formatDate(date)}</p>
                        </TooltipContent>
                      </Tooltip>
                    );
                  })}
                </div>
              ))}
            </div>
          </TooltipProvider>
        </div>
      </div>
    </div>
  );
}
