'use client';

import { useState, useEffect } from 'react';
import { Habit } from '@/lib/types';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Clock } from 'lucide-react';

interface HabitDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (habit: Omit<Habit, 'id' | 'createdAt' | 'completions' | 'active'>) => void;
  habit?: Habit | null;
}

const COLORS = [
  '#ef4444',
  '#f97316',
  '#f59e0b',
  '#84cc16',
  '#10b981',
  '#06b6d4',
  '#3b82f6',
  '#6366f1',
  '#ec4899',
  '#f43f5e'
];

const TIME_OPTIONS = [
  { value: 15, label: '15 min' },
  { value: 30, label: '30 min' },
  { value: 45, label: '45 min' },
  { value: 60, label: '1 hr' },
  { value: 75, label: '1 hr 15 min' },
  { value: 90, label: '1 hr 30 min' },
  { value: 105, label: '1 hr 45 min' },
  { value: 120, label: '2 hr' },
  { value: 150, label: '2 hr 30 min' },
  { value: 180, label: '3 hr' },
  { value: 240, label: '4 hr' },
];

export function HabitDialog({ open, onOpenChange, onSave, habit }: HabitDialogProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState(COLORS[0]);
  const [isTimed, setIsTimed] = useState(false);
  const [targetMinutes, setTargetMinutes] = useState(30);

  useEffect(() => {
    if (habit) {
      setName(habit.name);
      setDescription(habit.description || '');
      setColor(habit.color);
      setIsTimed(habit.isTimed || false);
      setTargetMinutes(habit.targetMinutes || 30);
    } else {
      setName('');
      setDescription('');
      setColor(COLORS[0]);
      setIsTimed(false);
      setTargetMinutes(30);
    }
  }, [habit, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onSave({
      name: name.trim(),
      description: description.trim(),
      color,
      icon: 'circle',
      frequency: 'daily',
      isTimed,
      targetMinutes: isTimed ? targetMinutes : undefined,
    });

    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{habit ? 'Edit Habit' : 'Create New Habit'}</DialogTitle>
          <DialogDescription>
            {habit
              ? 'Update your habit details below.'
              : 'Add a new habit to track. Choose a name and color that motivates you.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="name">Habit Name</Label>
            <Input
              id="name"
              placeholder="e.g., Morning Exercise, Read 30 minutes"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={50}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              placeholder="Add any notes or details about this habit..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={200}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label>Color</Label>
            <div className="grid grid-cols-5 gap-2">
              {COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`w-full aspect-square rounded-md transition-all hover:scale-110 ${
                    color === c ? 'ring-2 ring-offset-2 ring-blue-500' : ''
                  }`}
                  style={{ backgroundColor: c }}
                  aria-label={`Select color ${c}`}
                />
              ))}
            </div>
          </div>

          <div className="space-y-3 rounded-lg border p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <Label htmlFor="timed" className="font-medium cursor-pointer">Timed Habit</Label>
              </div>
              <Switch
                id="timed"
                checked={isTimed}
                onCheckedChange={setIsTimed}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Track time spent instead of simple completion
            </p>

            {isTimed && (
              <div className="space-y-2 pt-2">
                <Label htmlFor="targetTime">Daily Target Time</Label>
                <Select
                  value={targetMinutes.toString()}
                  onValueChange={(v) => setTargetMinutes(parseInt(v))}
                >
                  <SelectTrigger id="targetTime">
                    <SelectValue placeholder="Select time" />
                  </SelectTrigger>
                  <SelectContent>
                    {TIME_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value.toString()}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button type="submit" className="flex-1">
              {habit ? 'Update' : 'Create'} Habit
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
