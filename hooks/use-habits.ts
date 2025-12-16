'use client';

import { useState, useEffect } from 'react';
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
        setHabits(JSON.parse(stored));
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

  const addHabit = (habit: Omit<Habit, 'id' | 'createdAt' | 'completions'>) => {
    const newHabit: Habit = {
      ...habit,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      completions: {}
    };
    setHabits(prev => [...prev, newHabit]);
  };

  const updateHabit = (id: string, updates: Partial<Habit>) => {
    setHabits(prev =>
      prev.map(habit => (habit.id === id ? { ...habit, ...updates } : habit))
    );
  };

  const deleteHabit = (id: string) => {
    setHabits(prev => prev.filter(habit => habit.id !== id));
  };

  const toggleCompletion = (id: string, date?: string) => {
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
  };

  return {
    habits,
    isLoaded,
    addHabit,
    updateHabit,
    deleteHabit,
    toggleCompletion
  };
}
