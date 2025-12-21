'use client';

import { useState, useEffect, useCallback } from 'react';
import { Habit } from '@/lib/types';
import { getTodayKey } from '@/lib/habit-utils';

const STORAGE_KEY = 'habit-tracker-habits';

export function useHabits() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        const migrated = parsed.map((habit: Habit) => ({
          ...habit,
          active: habit.active ?? true,
          timedCompletions: habit.timedCompletions ?? {}
        }));
        setHabits(migrated);
      } catch (error) {
        console.error('Failed to parse habits:', error);
      }
    }
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(habits));
    }
  }, [habits, isLoaded]);

  const addHabit = useCallback((habit: Omit<Habit, 'id' | 'createdAt' | 'completions' | 'active'>) => {
    const newHabit: Habit = {
      ...habit,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      completions: {},
      active: true,
      timedCompletions: habit.isTimed ? {} : undefined
    };
    setHabits(prev => [...prev, newHabit]);
  }, []);

  const updateHabit = useCallback((id: string, updates: Partial<Habit>) => {
    setHabits(prev =>
      prev.map(habit => (habit.id === id ? { ...habit, ...updates } : habit))
    );
  }, []);

  const deleteHabit = useCallback((id: string) => {
    setHabits(prev => prev.filter(habit => habit.id !== id));
  }, []);

  const toggleCompletion = useCallback((id: string, date?: string) => {
    const dateKey = date || getTodayKey();
    setHabits(prev =>
      prev.map(habit => {
        if (habit.id === id) {
          const newCompletions = { ...habit.completions };
          newCompletions[dateKey] = !newCompletions[dateKey];
          return { ...habit, completions: newCompletions };
        }
        return habit;
      })
    );
  }, []);

  const updateTimedProgress = useCallback((id: string, minutes: number) => {
    const dateKey = getTodayKey();
    setHabits(prev =>
      prev.map(habit => {
        if (habit.id === id && habit.isTimed) {
          const targetMinutes = habit.targetMinutes || 30;
          const newTimedCompletions = { ...habit.timedCompletions };
          newTimedCompletions[dateKey] = minutes;

          const newCompletions = { ...habit.completions };
          if (minutes >= targetMinutes) {
            newCompletions[dateKey] = true;
          } else if (minutes >= 15) {
            newCompletions[dateKey] = true;
          }

          return {
            ...habit,
            timedCompletions: newTimedCompletions,
            completions: newCompletions
          };
        }
        return habit;
      })
    );
  }, []);

  const activeHabits = habits.filter(h => h.active);

  return {
    habits,
    activeHabits,
    isLoaded,
    addHabit,
    updateHabit,
    deleteHabit,
    toggleCompletion,
    updateTimedProgress
  };
}
