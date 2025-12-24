'use client';

import { useMemo, useState } from 'react';
import { Habit } from '@/lib/types';
import { calculateWeeklyTrends, calculateMonthlyTrends, WeeklyTrend, MonthlyTrend } from '@/lib/analytics-utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import { TrendingUp } from 'lucide-react';

interface CompletionTrendsChartProps {
  habits: Habit[];
}

type ViewMode = 'weekly' | 'monthly';

export function CompletionTrendsChart({ habits }: CompletionTrendsChartProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('weekly');

  const weeklyTrends = useMemo(() => calculateWeeklyTrends(habits, 12), [habits]);
  const monthlyTrends = useMemo(() => calculateMonthlyTrends(habits, 6), [habits]);

  const data = viewMode === 'weekly' ? weeklyTrends : monthlyTrends;
  const xKey = viewMode === 'weekly' ? 'week' : 'month';

  const averageRate = useMemo(() => {
    if (data.length === 0) return 0;
    const sum = data.reduce((acc, item) => acc + item.completionRate, 0);
    return Math.round(sum / data.length);
  }, [data]);

  const trend = useMemo(() => {
    if (data.length < 2) return 0;
    const recent = data.slice(-3);
    const earlier = data.slice(0, 3);
    const recentAvg = recent.reduce((acc, item) => acc + item.completionRate, 0) / recent.length;
    const earlierAvg = earlier.reduce((acc, item) => acc + item.completionRate, 0) / earlier.length;
    return Math.round(recentAvg - earlierAvg);
  }, [data]);

  if (habits.length === 0) return null;

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-950">
              <TrendingUp className="h-4 w-4 text-blue-600" />
            </div>
            <div>
              <CardTitle className="text-base sm:text-lg">Completion Rate Trends</CardTitle>
              <p className="text-xs text-muted-foreground mt-0.5">
                {averageRate}% average
                {trend !== 0 && (
                  <span className={trend > 0 ? 'text-green-600 ml-1' : 'text-red-500 ml-1'}>
                    ({trend > 0 ? '+' : ''}{trend}% trend)
                  </span>
                )}
              </p>
            </div>
          </div>
          <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as ViewMode)}>
            <TabsList className="h-8">
              <TabsTrigger value="weekly" className="text-xs px-3">Weekly</TabsTrigger>
              <TabsTrigger value="monthly" className="text-xs px-3">Monthly</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[200px] sm:h-[240px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="completionGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis
                dataKey={xKey}
                tick={{ fontSize: 11 }}
                tickLine={false}
                axisLine={false}
                className="text-muted-foreground"
              />
              <YAxis
                domain={[0, 100]}
                tick={{ fontSize: 11 }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `${value}%`}
                className="text-muted-foreground"
              />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload as WeeklyTrend | MonthlyTrend;
                    return (
                      <div className="bg-popover border rounded-lg shadow-lg p-3">
                        <p className="font-medium text-sm">{label}</p>
                        <p className="text-2xl font-bold text-blue-600">{data.completionRate}%</p>
                        <p className="text-xs text-muted-foreground">
                          {data.totalCompletions} of {data.totalPossible} completed
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Area
                type="monotone"
                dataKey="completionRate"
                stroke="#2563eb"
                strokeWidth={2}
                fill="url(#completionGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
