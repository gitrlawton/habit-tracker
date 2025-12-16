'use client';

import { Habit } from '@/lib/types';
import { calculateStats, isHabitCompletedToday, getLast7Days, getDateKey } from '@/lib/habit-utils';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Circle, Flame, MoreVertical } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { format } from 'date-fns';

interface HabitCardProps {
  habit: Habit;
  onToggle: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export function HabitCard({ habit, onToggle, onEdit, onDelete }: HabitCardProps) {
  const isCompleted = isHabitCompletedToday(habit);
  const stats = calculateStats(habit);
  const last7Days = getLast7Days();

  return (
    <Card className="overflow-hidden border-2 transition-all hover:shadow-md">
      <div className="p-4 sm:p-5">
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <div
                className="w-2 h-2 rounded-full flex-shrink-0"
                style={{ backgroundColor: habit.color }}
              />
              <h3 className="font-semibold text-base sm:text-lg truncate">
                {habit.name}
              </h3>
            </div>
            <p className="text-sm text-muted-foreground line-clamp-2">
              {habit.description || 'No description'}
            </p>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 flex-shrink-0">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={onEdit}>Edit</DropdownMenuItem>
              <DropdownMenuItem onClick={onDelete} className="text-red-600">
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="mb-4">
          <Badge variant="secondary" className="flex items-center gap-1 w-fit">
            <Flame className="h-3 w-3 text-orange-500" />
            <span className="text-xs">{stats.currentStreak} day streak</span>
          </Badge>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2 mb-4">
          {last7Days.map((date) => {
            const dateKey = getDateKey(date);
            const completed = habit.completions[dateKey];
            const isToday = dateKey === getDateKey(new Date());

            return (
              <div
                key={dateKey}
                className="flex-1 flex flex-col items-center gap-1"
              >
                <div
                  className={`w-full aspect-square rounded-md flex items-center justify-center transition-colors ${
                    completed
                      ? 'bg-green-100 dark:bg-green-900'
                      : 'bg-gray-100 dark:bg-gray-800'
                  } ${isToday ? 'ring-2 ring-blue-500' : ''}`}
                >
                  {completed && (
                    <CheckCircle2 className="h-3 w-3 sm:h-4 sm:w-4 text-green-600 dark:text-green-400" />
                  )}
                </div>
                <span className="text-[10px] sm:text-xs text-muted-foreground font-medium">
                  {format(date, 'EEE').charAt(0)}
                </span>
              </div>
            );
          })}
        </div>

        <Button
          onClick={onToggle}
          className="w-full"
          variant={isCompleted ? 'secondary' : 'default'}
          size="lg"
        >
          {isCompleted ? (
            <>
              <CheckCircle2 className="mr-2 h-5 w-5" />
              Completed Today
            </>
          ) : (
            <>
              <Circle className="mr-2 h-5 w-5" />
              Mark as Done
            </>
          )}
        </Button>
      </div>
    </Card>
  );
}
