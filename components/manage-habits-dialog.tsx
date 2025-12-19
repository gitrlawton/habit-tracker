'use client';

import { Habit } from '@/lib/types';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { ScrollArea } from '@/components/ui/scroll-area';

interface ManageHabitsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  habits: Habit[];
  onToggleActive: (id: string, active: boolean) => void;
}

export function ManageHabitsDialog({
  open,
  onOpenChange,
  habits,
  onToggleActive,
}: ManageHabitsDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Manage Habits</DialogTitle>
        </DialogHeader>
        <div className="py-2">
          <p className="text-sm text-muted-foreground mb-4">
            Toggle habits on or off. Hidden habits won't appear in your daily view but their data is preserved.
          </p>
          {habits.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              No habits created yet.
            </p>
          ) : (
            <ScrollArea className="max-h-[400px] pr-4">
              <div className="space-y-3">
                {habits.map((habit) => (
                  <div
                    key={habit.id}
                    className="flex items-center justify-between p-3 rounded-lg border bg-card"
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div
                        className="w-4 h-4 rounded-full flex-shrink-0"
                        style={{ backgroundColor: habit.color }}
                      />
                      <div className="min-w-0 flex-1">
                        <p className={`font-medium truncate ${!habit.active ? 'text-muted-foreground' : ''}`}>
                          {habit.name}
                        </p>
                        {habit.description && (
                          <p className="text-xs text-muted-foreground truncate">
                            {habit.description}
                          </p>
                        )}
                      </div>
                    </div>
                    <Switch
                      checked={habit.active}
                      onCheckedChange={(checked) => onToggleActive(habit.id, checked)}
                    />
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
