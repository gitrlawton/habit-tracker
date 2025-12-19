'use client';

import { useState } from 'react';
import { useHabits } from '@/hooks/use-habits';
import { Habit } from '@/lib/types';
import { HabitCard } from '@/components/habit-card';
import { HabitDialog } from '@/components/habit-dialog';
import { StatsOverview } from '@/components/stats-overview';
import { Button } from '@/components/ui/button';
import { Plus, Target, Sparkles } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { format } from 'date-fns';

export default function Home() {
  const { habits, isLoaded, addHabit, updateHabit, deleteHabit, toggleCompletion } = useHabits();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);
  const [deletingHabitId, setDeletingHabitId] = useState<string | null>(null);

  const handleSaveHabit = (habitData: Omit<Habit, 'id' | 'createdAt' | 'completions'>) => {
    if (editingHabit) {
      updateHabit(editingHabit.id, habitData);
      setEditingHabit(null);
    } else {
      addHabit(habitData);
    }
  };

  const handleEditClick = (habit: Habit) => {
    setEditingHabit(habit);
    setDialogOpen(true);
  };

  const handleDialogClose = (open: boolean) => {
    setDialogOpen(open);
    if (!open) {
      setEditingHabit(null);
    }
  };

  const handleDeleteClick = (habitId: string) => {
    setDeletingHabitId(habitId);
  };

  const confirmDelete = () => {
    if (deletingHabitId) {
      deleteHabit(deletingHabitId);
      setDeletingHabitId(null);
    }
  };

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 dark:from-slate-950 dark:via-blue-950 dark:to-slate-900">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6 lg:py-8">
        <div className="mb-8 sm:mb-12">
          <div className="flex items-center justify-between flex-wrap gap-4 mb-2">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl shadow-lg">
                <Target className="h-6 w-6 sm:h-7 sm:w-7 text-white" />
              </div>
              <div>
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight">
                  Habit Tracker
                </h1>
                <p className="text-sm sm:text-base text-muted-foreground mt-1">
                  {format(new Date(), 'EEEE, MMMM d, yyyy')}
                </p>
              </div>
            </div>
            <Button
              onClick={() => setDialogOpen(true)}
              size="lg"
              className="shadow-lg"
            >
              <Plus className="mr-2 h-5 w-5" />
              New Habit
            </Button>
          </div>
        </div>

        {habits.length > 0 ? (
          <div className="space-y-6 sm:space-y-8">
            <StatsOverview habits={habits} />

            <div>
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="h-5 w-5 text-blue-600" />
                <h2 className="text-xl sm:text-2xl font-semibold">Your Habits</h2>
              </div>
              <div className="grid gap-4 sm:gap-5 md:grid-cols-2 xl:grid-cols-3">
                {habits.map((habit) => (
                  <HabitCard
                    key={habit.id}
                    habit={habit}
                    onToggle={() => toggleCompletion(habit.id)}
                    onEdit={() => handleEditClick(habit)}
                    onDelete={() => handleDeleteClick(habit.id)}
                  />
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 sm:py-24">
            <div className="p-6 bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900 dark:to-blue-800 rounded-full mb-6">
              <Target className="h-12 w-12 sm:h-16 sm:w-16 text-blue-600 dark:text-blue-400" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold mb-3 text-center">
              Start Building Better Habits
            </h2>
            <p className="text-muted-foreground text-center max-w-md mb-8 px-4">
              Create your first habit and start tracking your progress. Build consistency
              one day at a time.
            </p>
            <Button onClick={() => setDialogOpen(true)} size="lg" className="shadow-lg">
              <Plus className="mr-2 h-5 w-5" />
              Create Your First Habit
            </Button>
          </div>
        )}
      </div>

      <HabitDialog
        open={dialogOpen}
        onOpenChange={handleDialogClose}
        onSave={handleSaveHabit}
        habit={editingHabit}
      />

      <AlertDialog open={!!deletingHabitId} onOpenChange={(open) => !open && setDeletingHabitId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Habit</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this habit? This action cannot be undone and all
              tracking data will be lost.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
