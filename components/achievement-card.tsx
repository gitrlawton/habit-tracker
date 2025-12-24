'use client';

import { Flame, Trophy, Target, TrendingUp } from 'lucide-react';

interface AchievementCardProps {
  habitName: string;
  habitColor: string;
  currentStreak: number;
  longestStreak: number;
  totalCompletions: number;
  completionRate: number;
  message?: string | null;
}

export function AchievementCard({
  habitName,
  habitColor,
  currentStreak,
  longestStreak,
  totalCompletions,
  completionRate,
}: AchievementCardProps) {
  const getStreakEmoji = (streak: number) => {
    if (streak >= 100) return '100';
    if (streak >= 30) return '30';
    if (streak >= 7) return '7';
    return null;
  };

  const milestoneNumber = getStreakEmoji(currentStreak);

  return (
    <div className="w-full max-w-md mx-auto">
      <div
        className="relative overflow-hidden rounded-2xl shadow-2xl"
        style={{
          background: `linear-gradient(135deg, ${habitColor}15 0%, ${habitColor}05 100%)`,
        }}
      >
        <div
          className="absolute top-0 left-0 w-full h-1.5"
          style={{ backgroundColor: habitColor }}
        />

        <div className="absolute top-0 right-0 w-32 h-32 opacity-10">
          <div
            className="w-full h-full rounded-full blur-3xl"
            style={{ backgroundColor: habitColor }}
          />
        </div>

        <div className="relative p-6 sm:p-8">
          <div className="flex items-center gap-3 mb-6">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: `${habitColor}20` }}
            >
              <Target className="w-6 h-6" style={{ color: habitColor }} />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-foreground">
                {habitName}
              </h2>
              <p className="text-sm text-muted-foreground">Achievement Card</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-background/60 backdrop-blur rounded-xl p-4 border border-border/50">
              <div className="flex items-center gap-2 mb-2">
                <Flame className="w-5 h-5 text-orange-500" />
                <span className="text-sm text-muted-foreground">Current Streak</span>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-bold" style={{ color: habitColor }}>
                  {currentStreak}
                </span>
                <span className="text-sm text-muted-foreground">days</span>
              </div>
              {milestoneNumber && (
                <div className="mt-2 text-xs font-medium text-amber-600 dark:text-amber-400">
                  {milestoneNumber}+ day milestone!
                </div>
              )}
            </div>

            <div className="bg-background/60 backdrop-blur rounded-xl p-4 border border-border/50">
              <div className="flex items-center gap-2 mb-2">
                <Trophy className="w-5 h-5 text-amber-500" />
                <span className="text-sm text-muted-foreground">Best Streak</span>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-bold text-foreground">
                  {longestStreak}
                </span>
                <span className="text-sm text-muted-foreground">days</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-background/60 backdrop-blur rounded-xl p-4 border border-border/50">
              <div className="flex items-center gap-2 mb-2">
                <Target className="w-5 h-5 text-green-500" />
                <span className="text-sm text-muted-foreground">Completions</span>
              </div>
              <span className="text-2xl font-bold text-foreground">
                {totalCompletions}
              </span>
            </div>

            <div className="bg-background/60 backdrop-blur rounded-xl p-4 border border-border/50">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-5 h-5 text-blue-500" />
                <span className="text-sm text-muted-foreground">Success Rate</span>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-bold text-foreground">
                  {completionRate}
                </span>
                <span className="text-sm text-muted-foreground">%</span>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-border/50">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                <span className="text-white text-xs font-bold">H</span>
              </div>
              <span className="text-sm font-medium text-muted-foreground">
                Habit Tracker
              </span>
            </div>
            <span className="text-xs text-muted-foreground">
              {new Date().toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
