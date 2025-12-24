'use client';

import { useMemo } from 'react';
import { Habit } from '@/lib/types';
import { calculateDayPerformance, getBestPerformingDays, DayPerformance } from '@/lib/analytics-utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell
} from 'recharts';
import { Calendar, Trophy, AlertTriangle } from 'lucide-react';

interface DayPerformanceChartProps {
  habits: Habit[];
}

export function DayPerformanceChart({ habits }: DayPerformanceChartProps) {
  const dayPerformance = useMemo(() => calculateDayPerformance(habits, 12), [habits]);

  const sortedByPerformance = useMemo(() => getBestPerformingDays(dayPerformance), [dayPerformance]);

  const bestDay = sortedByPerformance[0];
  const worstDay = sortedByPerformance[sortedByPerformance.length - 1];

  const getBarColor = (rate: number): string => {
    if (rate >= 70) return '#16a34a';
    if (rate >= 50) return '#2563eb';
    if (rate >= 30) return '#eab308';
    return '#dc2626';
  };

  if (habits.length === 0) return null;

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-green-50 dark:bg-green-950">
            <Calendar className="h-4 w-4 text-green-600" />
          </div>
          <div>
            <CardTitle className="text-base sm:text-lg">Performance by Day</CardTitle>
            <p className="text-xs text-muted-foreground mt-0.5">Last 12 weeks</p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[180px] sm:h-[200px] mb-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={dayPerformance} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" vertical={false} />
              <XAxis
                dataKey="day"
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
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload as DayPerformance;
                    return (
                      <div className="bg-popover border rounded-lg shadow-lg p-3">
                        <p className="font-medium text-sm">{data.day}</p>
                        <p className="text-2xl font-bold" style={{ color: getBarColor(data.completionRate) }}>
                          {data.completionRate}%
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {data.totalCompletions} of {data.totalPossible} completed
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar dataKey="completionRate" radius={[4, 4, 0, 0]}>
                {dayPerformance.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={getBarColor(entry.completionRate)} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="flex items-center gap-2 p-3 rounded-lg bg-green-50 dark:bg-green-950/50">
            <Trophy className="h-4 w-4 text-green-600 flex-shrink-0" />
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground">Best Day</p>
              <p className="font-semibold text-sm truncate">
                {bestDay?.day} <span className="text-green-600">({bestDay?.completionRate}%)</span>
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 p-3 rounded-lg bg-amber-50 dark:bg-amber-950/50">
            <AlertTriangle className="h-4 w-4 text-amber-600 flex-shrink-0" />
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground">Needs Work</p>
              <p className="font-semibold text-sm truncate">
                {worstDay?.day} <span className="text-amber-600">({worstDay?.completionRate}%)</span>
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
