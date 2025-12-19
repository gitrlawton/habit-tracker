'use client';

import { useState, useMemo, useRef, useEffect } from 'react';
import { Habit } from '@/lib/types';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface CompletionHeatmapProps {
  habits: Habit[];
}

const CELL_SIZE = 12;
const GAP = 3;
const WEEKS = 53;

export function CompletionHeatmap({ habits }: CompletionHeatmapProps) {
  const [selectedHabitId, setSelectedHabitId] = useState<string>('all');
  const scrollRef = useRef<HTMLDivElement>(null);
  const today = new Date();

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollLeft = scrollRef.current.scrollWidth;
    }
  }, []);

  const startDate = useMemo(() => {
    const date = new Date(today);
    date.setDate(today.getDate() - (WEEKS * 7 - 1));
    date.setHours(0, 0, 0, 0);
    return date;
  }, []);

  const selectedHabit = habits.find(h => h.id === selectedHabitId);

  const isCompletedForDate = (date: Date): boolean => {
    const dateKey = date.toISOString().split('T')[0];
    if (selectedHabit) {
      return !!selectedHabit.completions[dateKey];
    }
    return false;
  };

  const getCompletionsForDate = (date: Date): number => {
    const dateKey = date.toISOString().split('T')[0];
    return habits.filter(habit => habit.completions[dateKey]).length;
  };

  const getColorClass = (completions: number): string => {
    if (completions === 0) return 'bg-slate-100 dark:bg-slate-800';
    if (completions === 1) return 'bg-slate-300 dark:bg-slate-600';
    if (completions === 2) return 'bg-slate-500 dark:bg-slate-500';
    if (completions === 3) return 'bg-slate-700 dark:bg-slate-400';
    return 'bg-slate-900 dark:bg-slate-300';
  };

  const monthLabels = useMemo(() => {
    const labels: { month: string; weekIndex: number }[] = [];
    let lastMonth = -1;

    for (let week = 0; week < WEEKS; week++) {
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
  }, [startDate]);

  const formatDate = (date: Date): string => {
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const columnWidth = CELL_SIZE + GAP;
  const gridWidth = WEEKS * columnWidth;

  return (
    <div className="space-y-3">
      <div className="mx-auto" style={{ maxWidth: `${gridWidth}px` }}>
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
          <span className="text-sm text-muted-foreground">Filter by:</span>
          <Select value={selectedHabitId} onValueChange={setSelectedHabitId}>
            <SelectTrigger className="w-full max-w-[200px]">
              <SelectValue placeholder="Select habit" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Habits</SelectItem>
              {habits.map((habit) => (
                <SelectItem key={habit.id} value={habit.id}>
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full flex-shrink-0"
                      style={{ backgroundColor: habit.color }}
                    />
                    <span className="truncate">{habit.name}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div ref={scrollRef} className="overflow-x-auto">
        <div className="mx-auto" style={{ width: `${gridWidth}px` }}>
          <div className="flex mb-1 relative" style={{ height: '16px' }}>
            {monthLabels.map((label, i) => (
              <div
                key={i}
                className="text-[10px] sm:text-[11px] text-muted-foreground absolute whitespace-nowrap"
                style={{
                  left: `${label.weekIndex * columnWidth}px`,
                }}
              >
                {label.month}
              </div>
            ))}
          </div>

          <TooltipProvider delayDuration={100}>
            <div className="flex" style={{ gap: `${GAP}px` }}>
              {Array.from({ length: WEEKS }).map((_, weekIndex) => (
                <div
                  key={weekIndex}
                  className="flex flex-col"
                  style={{ gap: `${GAP}px` }}
                >
                  {[0, 1, 2, 3, 4, 5, 6].map((dayIndex) => {
                    const date = new Date(startDate);
                    date.setDate(startDate.getDate() + weekIndex * 7 + dayIndex);

                    if (date > today) {
                      return (
                        <div
                          key={dayIndex}
                          style={{ width: `${CELL_SIZE}px`, height: `${CELL_SIZE}px` }}
                        />
                      );
                    }

                    if (selectedHabit) {
                      const completed = isCompletedForDate(date);
                      return (
                        <Tooltip key={dayIndex}>
                          <TooltipTrigger asChild>
                            <div
                              className={`rounded-[2px] transition-colors hover:ring-2 hover:ring-offset-1 hover:ring-blue-500 cursor-pointer ${!completed ? 'bg-slate-100 dark:bg-slate-800' : ''}`}
                              style={{
                                width: `${CELL_SIZE}px`,
                                height: `${CELL_SIZE}px`,
                                backgroundColor: completed ? selectedHabit.color : undefined
                              }}
                            />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="text-xs">
                              {completed ? 'Completed' : 'Not completed'}
                            </p>
                            <p className="text-xs text-muted-foreground">{formatDate(date)}</p>
                          </TooltipContent>
                        </Tooltip>
                      );
                    }

                    const completions = getCompletionsForDate(date);
                    const colorClass = getColorClass(completions);

                    return (
                      <Tooltip key={dayIndex}>
                        <TooltipTrigger asChild>
                          <div
                            className={`rounded-[2px] ${colorClass} transition-colors hover:ring-2 hover:ring-offset-1 hover:ring-blue-500 cursor-pointer`}
                            style={{
                              width: `${CELL_SIZE}px`,
                              height: `${CELL_SIZE}px`
                            }}
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

      <div className="mx-auto" style={{ maxWidth: `${gridWidth}px` }}>
        <p className="text-xs text-muted-foreground">
          Showing 1 year of activity
        </p>
      </div>
    </div>
  );
}
