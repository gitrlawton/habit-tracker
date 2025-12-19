export interface Habit {
  id: string;
  name: string;
  description?: string;
  color: string;
  icon: string;
  frequency: 'daily' | 'weekly';
  targetDays?: number[];
  createdAt: string;
  completions: Record<string, boolean>;
  active: boolean;
}

export interface HabitStats {
  currentStreak: number;
  longestStreak: number;
  totalCompletions: number;
  completionRate: number;
}
