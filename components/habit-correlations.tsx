'use client';

import { useMemo } from 'react';
import { Habit } from '@/lib/types';
import { calculateHabitCorrelations, HabitCorrelation } from '@/lib/analytics-utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Link2, TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface HabitCorrelationsProps {
  habits: Habit[];
}

function CorrelationBadge({ score }: { score: number }) {
  if (score > 0.3) {
    return (
      <div className="flex items-center gap-1 text-xs font-medium text-green-600 bg-green-50 dark:bg-green-950/50 px-2 py-1 rounded-full">
        <TrendingUp className="h-3 w-3" />
        Strong
      </div>
    );
  }
  if (score > 0.1) {
    return (
      <div className="flex items-center gap-1 text-xs font-medium text-blue-600 bg-blue-50 dark:bg-blue-950/50 px-2 py-1 rounded-full">
        <TrendingUp className="h-3 w-3" />
        Moderate
      </div>
    );
  }
  if (score < -0.3) {
    return (
      <div className="flex items-center gap-1 text-xs font-medium text-red-500 bg-red-50 dark:bg-red-950/50 px-2 py-1 rounded-full">
        <TrendingDown className="h-3 w-3" />
        Inverse
      </div>
    );
  }
  if (score < -0.1) {
    return (
      <div className="flex items-center gap-1 text-xs font-medium text-amber-600 bg-amber-50 dark:bg-amber-950/50 px-2 py-1 rounded-full">
        <TrendingDown className="h-3 w-3" />
        Weak Inverse
      </div>
    );
  }
  return (
    <div className="flex items-center gap-1 text-xs font-medium text-muted-foreground bg-muted px-2 py-1 rounded-full">
      <Minus className="h-3 w-3" />
      Neutral
    </div>
  );
}

function CorrelationItem({ correlation }: { correlation: HabitCorrelation }) {
  const percentage = Math.round(correlation.correlationScore * 100);

  return (
    <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <div
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: correlation.habit1Color }}
          />
          <Link2 className="h-3 w-3 text-muted-foreground" />
          <div
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: correlation.habit2Color }}
          />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium truncate">
            {correlation.habit1Name} + {correlation.habit2Name}
          </p>
          <p className="text-xs text-muted-foreground">
            Completed together {correlation.coCompletions} times
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0 ml-2">
        <CorrelationBadge score={correlation.correlationScore} />
      </div>
    </div>
  );
}

export function HabitCorrelations({ habits }: HabitCorrelationsProps) {
  const correlations = useMemo(() => calculateHabitCorrelations(habits, 12), [habits]);

  const topCorrelations = correlations.slice(0, 5);

  const strongPairs = correlations.filter(c => c.correlationScore > 0.3);
  const inversePairs = correlations.filter(c => c.correlationScore < -0.3);

  if (habits.length < 2) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-cyan-50 dark:bg-cyan-950">
              <Link2 className="h-4 w-4 text-cyan-600" />
            </div>
            <div>
              <CardTitle className="text-base sm:text-lg">Habit Correlations</CardTitle>
              <p className="text-xs text-muted-foreground mt-0.5">Last 12 weeks</p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <p className="text-sm">Add at least 2 habits to see correlations</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-cyan-50 dark:bg-cyan-950">
            <Link2 className="h-4 w-4 text-cyan-600" />
          </div>
          <div>
            <CardTitle className="text-base sm:text-lg">Habit Correlations</CardTitle>
            <p className="text-xs text-muted-foreground mt-0.5">
              {strongPairs.length > 0 && `${strongPairs.length} strong pair${strongPairs.length > 1 ? 's' : ''}`}
              {strongPairs.length > 0 && inversePairs.length > 0 && ' · '}
              {inversePairs.length > 0 && `${inversePairs.length} inverse pair${inversePairs.length > 1 ? 's' : ''}`}
              {strongPairs.length === 0 && inversePairs.length === 0 && 'Last 12 weeks'}
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {topCorrelations.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p className="text-sm">Not enough data to calculate correlations yet</p>
            <p className="text-xs mt-1">Keep tracking your habits!</p>
          </div>
        ) : (
          <div className="space-y-2">
            {topCorrelations.map((correlation, index) => (
              <CorrelationItem key={index} correlation={correlation} />
            ))}
            {correlations.length > 5 && (
              <p className="text-xs text-muted-foreground text-center pt-2">
                And {correlations.length - 5} more pair{correlations.length - 5 > 1 ? 's' : ''}
              </p>
            )}
          </div>
        )}

        {strongPairs.length > 0 && (
          <div className="mt-4 p-3 rounded-lg bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-900">
            <p className="text-xs text-green-700 dark:text-green-400">
              <strong>Insight:</strong> When you complete {strongPairs[0].habit1Name}, you tend to also complete {strongPairs[0].habit2Name}. Consider stacking these habits together!
            </p>
          </div>
        )}

        {inversePairs.length > 0 && strongPairs.length === 0 && (
          <div className="mt-4 p-3 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900">
            <p className="text-xs text-amber-700 dark:text-amber-400">
              <strong>Insight:</strong> {inversePairs[0].habit1Name} and {inversePairs[0].habit2Name} tend not to be completed on the same day. Consider spacing them differently.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
