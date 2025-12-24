'use client';

import { useState } from 'react';
import { Habit } from '@/lib/types';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { CompletionTrendsChart } from '@/components/completion-trends-chart';
import { DayPerformanceChart } from '@/components/day-performance-chart';
import { HabitCorrelations } from '@/components/habit-correlations';
import { cn } from '@/lib/utils';
import { TrendingUp, Calendar, Link2, BarChart3 } from 'lucide-react';

interface AnalyticsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  habits: Habit[];
}

type AnalyticsTab = 'trends' | 'days' | 'correlations';

const tabs: { id: AnalyticsTab; label: string; icon: React.ReactNode; description: string }[] = [
  {
    id: 'trends',
    label: 'Completion Trends',
    icon: <TrendingUp className="h-4 w-4" />,
    description: 'Track progress over time'
  },
  {
    id: 'days',
    label: 'Day Performance',
    icon: <Calendar className="h-4 w-4" />,
    description: 'Best days of the week'
  },
  {
    id: 'correlations',
    label: 'Correlations',
    icon: <Link2 className="h-4 w-4" />,
    description: 'Habits completed together'
  }
];

export function AnalyticsModal({ open, onOpenChange, habits }: AnalyticsModalProps) {
  const [activeTab, setActiveTab] = useState<AnalyticsTab>('trends');

  const renderContent = () => {
    switch (activeTab) {
      case 'trends':
        return <CompletionTrendsChart habits={habits} />;
      case 'days':
        return <DayPerformanceChart habits={habits} />;
      case 'correlations':
        return <HabitCorrelations habits={habits} />;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl h-[85vh] max-h-[700px] p-0 gap-0 overflow-hidden">
        <DialogHeader className="px-6 py-4 border-b">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-950">
              <BarChart3 className="h-4 w-4 text-blue-600" />
            </div>
            <DialogTitle className="text-lg">Analytics</DialogTitle>
          </div>
        </DialogHeader>

        <div className="flex flex-1 overflow-hidden">
          <nav className="w-56 border-r bg-muted/30 p-3 flex-shrink-0 hidden sm:block">
            <div className="space-y-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    'w-full flex items-start gap-3 px-3 py-2.5 rounded-lg text-left transition-colors',
                    activeTab === tab.id
                      ? 'bg-background shadow-sm border'
                      : 'hover:bg-background/50'
                  )}
                >
                  <div className={cn(
                    'p-1.5 rounded-md mt-0.5',
                    activeTab === tab.id
                      ? 'bg-blue-100 dark:bg-blue-950 text-blue-600'
                      : 'bg-muted text-muted-foreground'
                  )}>
                    {tab.icon}
                  </div>
                  <div className="min-w-0">
                    <p className={cn(
                      'text-sm font-medium truncate',
                      activeTab === tab.id ? 'text-foreground' : 'text-muted-foreground'
                    )}>
                      {tab.label}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {tab.description}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </nav>

          <div className="sm:hidden border-b px-4 py-2 flex gap-1 overflow-x-auto flex-shrink-0">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  'flex items-center gap-2 px-3 py-2 rounded-lg text-sm whitespace-nowrap transition-colors',
                  activeTab === tab.id
                    ? 'bg-blue-100 dark:bg-blue-950 text-blue-600 font-medium'
                    : 'text-muted-foreground hover:bg-muted'
                )}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto p-4 sm:p-6">
            {renderContent()}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
