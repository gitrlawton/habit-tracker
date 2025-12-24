'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Habit } from '@/lib/types';
import { calculateStats, getLast7Days, getDateKey, getTodayKey } from '@/lib/habit-utils';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { CheckCircle2, Circle, Flame, MoreVertical, Clock, Play, Pause, Trophy, Share2 } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ShareAchievementDialog } from './share-achievement-dialog';
import { format } from 'date-fns';

interface HabitCardProps {
  habit: Habit;
  onToggle: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onUpdateTimedProgress?: (id: string, minutes: number) => void;
  onTimerStateChange?: (habitId: string, isRunning: boolean, elapsedSeconds: number) => void;
}

function formatTime(minutes: number): string {
  const hrs = Math.floor(minutes / 60);
  const mins = Math.floor(minutes % 60);
  if (hrs > 0) {
    return `${hrs}h ${mins}m`;
  }
  return `${mins}m`;
}

function formatTimeDetailed(totalSeconds: number): string {
  const hrs = Math.floor(totalSeconds / 3600);
  const mins = Math.floor((totalSeconds % 3600) / 60);
  const secs = Math.floor(totalSeconds % 60);
  if (hrs > 0) {
    return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export function HabitCard({ habit, onToggle, onEdit, onDelete, onUpdateTimedProgress, onTimerStateChange }: HabitCardProps) {
  const todayKey = getTodayKey();
  const isCompleted = habit.completions[todayKey] === true;
  const stats = calculateStats(habit);
  const last7Days = getLast7Days();

  const todayMinutes = habit.isTimed ? (habit.timedCompletions?.[todayKey] || 0) : 0;
  const targetMinutes = habit.targetMinutes || 30;
  const isTimedComplete = habit.isTimed && todayMinutes >= targetMinutes;

  const [isRunning, setIsRunning] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(todayMinutes * 60);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const elapsedSecondsRef = useRef(elapsedSeconds);

  useEffect(() => {
    elapsedSecondsRef.current = elapsedSeconds;
  }, [elapsedSeconds]);

  useEffect(() => {
    setElapsedSeconds(todayMinutes * 60);
  }, [todayMinutes]);

  useEffect(() => {
    if (!isRunning || isTimedComplete) {
      return;
    }

    if (onTimerStateChange) {
      onTimerStateChange(habit.id, true, elapsedSecondsRef.current);
    }

    const interval = setInterval(() => {
      setElapsedSeconds((prev) => {
        const newSeconds = prev + 1;
        const newMinutes = newSeconds / 60;
        if (onTimerStateChange) {
          onTimerStateChange(habit.id, true, newSeconds);
        }
        if (newMinutes >= targetMinutes && onUpdateTimedProgress) {
          onUpdateTimedProgress(habit.id, newMinutes);
          setIsRunning(false);
          if (onTimerStateChange) {
            onTimerStateChange(habit.id, false, newSeconds);
          }
        }
        return newSeconds;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isRunning, isTimedComplete, habit.id, targetMinutes, onUpdateTimedProgress, onTimerStateChange]);

  const handleTimerToggle = useCallback(() => {
    if (isTimedComplete) return;

    if (isRunning && onUpdateTimedProgress) {
      onUpdateTimedProgress(habit.id, elapsedSeconds / 60);
    }
    setIsRunning(!isRunning);
  }, [isRunning, isTimedComplete, habit.id, elapsedSeconds, onUpdateTimedProgress]);

  const progressPercent = habit.isTimed ? Math.min((elapsedSeconds / 60 / targetMinutes) * 100, 100) : 0;
  const remainingSeconds = Math.max(targetMinutes * 60 - elapsedSeconds, 0);

  const getCompletionOpacity = (dateKey: string): number => {
    if (!habit.isTimed) return habit.completions[dateKey] ? 1 : 0;
    if (dateKey === todayKey) {
      return Math.min((elapsedSeconds / 60) / targetMinutes, 1);
    }
    const minutes = habit.timedCompletions?.[dateKey] || 0;
    return Math.min(minutes / targetMinutes, 1);
  };

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
              {habit.isTimed && (
                <div className="flex items-center gap-1 text-muted-foreground">
                  <Clock className="h-3.5 w-3.5" />
                  <span className="text-xs font-medium">{formatTime(targetMinutes)}</span>
                </div>
              )}
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
              <DropdownMenuItem onClick={() => setShareDialogOpen(true)}>
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={onEdit}>Edit</DropdownMenuItem>
              <DropdownMenuItem onClick={onDelete} className="text-red-600">
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="mb-4 flex flex-wrap items-center gap-2">
          <Badge variant="secondary" className="flex items-center gap-1 w-fit">
            <Flame className="h-3 w-3 text-orange-500" />
            <span className="text-xs">{stats.currentStreak} day streak</span>
          </Badge>
          <Badge variant="outline" className="flex items-center gap-1 w-fit">
            <Trophy className="h-3 w-3 text-amber-500" />
            <span className="text-xs">Best: {stats.longestStreak}</span>
          </Badge>
        </div>

        {habit.isTimed && !isTimedComplete ? (
          <div className="mb-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">
                {isRunning ? 'Running' : 'Elapsed'}: {formatTimeDetailed(elapsedSeconds)}
              </span>
              <span className="font-medium">
                {formatTimeDetailed(remainingSeconds)} left
              </span>
            </div>
            <Progress value={progressPercent} className="h-2" />
          </div>
        ) : (
          <div className="mb-4 h-[30px]" />
        )}

        <div className="flex items-center gap-1.5 sm:gap-2 mb-4">
          {last7Days.map((date) => {
            const dateKey = getDateKey(date);
            const completed = habit.completions[dateKey];
            const isToday = dateKey === getTodayKey();
            const opacity = getCompletionOpacity(dateKey);

            const percentComplete = habit.isTimed
              ? Math.round(Math.min(opacity * 100, 100))
              : 0;

            return (
              <div
                key={dateKey}
                className="flex-1 flex flex-col items-center gap-1"
              >
                <div
                  className={`w-full aspect-square rounded-md flex items-center justify-center transition-colors ${
                    habit.isTimed
                      ? completed
                        ? 'bg-green-100 dark:bg-green-900'
                        : 'bg-gray-100 dark:bg-gray-800'
                      : !completed
                      ? 'bg-gray-100 dark:bg-gray-800'
                      : ''
                  } ${isToday ? 'ring-2 ring-blue-500' : ''}`}
                >
                  {!habit.isTimed && completed && (
                    <div className="w-full h-full rounded-md bg-green-100 dark:bg-green-900 flex items-center justify-center">
                      <CheckCircle2 className="h-3 w-3 sm:h-4 sm:w-4 text-green-600 dark:text-green-400" />
                    </div>
                  )}
                  {habit.isTimed && completed && (
                    <CheckCircle2 className="h-3 w-3 sm:h-4 sm:w-4 text-green-600 dark:text-green-400" />
                  )}
                  {habit.isTimed && !completed && percentComplete > 0 && (
                    <span className="text-[11px] sm:text-xs font-bold text-gray-600 dark:text-gray-300">
                      {percentComplete}%
                    </span>
                  )}
                </div>
                <span className="text-[10px] sm:text-xs text-muted-foreground font-medium">
                  {format(date, 'EEE').charAt(0)}
                </span>
              </div>
            );
          })}
        </div>

        {habit.isTimed ? (
          <Button
            onClick={handleTimerToggle}
            className="w-full"
            variant={isTimedComplete ? 'secondary' : 'default'}
            size="lg"
            disabled={isTimedComplete}
          >
            {isTimedComplete ? (
              <>
                <CheckCircle2 className="mr-2 h-5 w-5" />
                Completed Today
              </>
            ) : isRunning ? (
              <>
                <Pause className="mr-2 h-5 w-5" />
                Pause Timer
              </>
            ) : elapsedSeconds > 0 ? (
              <>
                <Play className="mr-2 h-5 w-5" />
                Resume Timer
              </>
            ) : (
              <>
                <Play className="mr-2 h-5 w-5" />
                Start Timer
              </>
            )}
          </Button>
        ) : (
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
        )}
      </div>

      <ShareAchievementDialog
        habit={habit}
        open={shareDialogOpen}
        onOpenChange={setShareDialogOpen}
      />
    </Card>
  );
}
