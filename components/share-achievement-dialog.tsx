'use client';

import { useState } from 'react';
import { Habit } from '@/lib/types';
import { calculateStats } from '@/lib/habit-utils';
import { createSharedAchievement } from '@/lib/supabase';
import { AchievementCard } from './achievement-card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Share2, Copy, Check, Loader2, ExternalLink } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ShareAchievementDialogProps {
  habit: Habit;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ShareAchievementDialog({
  habit,
  open,
  onOpenChange,
}: ShareAchievementDialogProps) {
  const [step, setStep] = useState<'preview' | 'sharing' | 'shared'>('preview');
  const [message, setMessage] = useState('');
  const [shareUrl, setShareUrl] = useState('');
  const [copied, setCopied] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const stats = calculateStats(habit);

  const handleShare = async () => {
    setIsLoading(true);
    setStep('sharing');

    const { shareCode, error } = await createSharedAchievement({
      habitName: habit.name,
      habitColor: habit.color,
      currentStreak: stats.currentStreak,
      longestStreak: stats.longestStreak,
      totalCompletions: stats.totalCompletions,
      completionRate: stats.completionRate,
      message: message || undefined,
    });

    setIsLoading(false);

    if (error || !shareCode) {
      toast({
        title: 'Error',
        description: 'Failed to create share link. Please try again.',
        variant: 'destructive',
      });
      setStep('preview');
      return;
    }

    const url = `${window.location.origin}/share/${shareCode}`;
    setShareUrl(url);
    setStep('shared');
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast({
        title: 'Copied!',
        description: 'Share link copied to clipboard.',
      });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to copy link.',
        variant: 'destructive',
      });
    }
  };

  const handleClose = () => {
    onOpenChange(false);
    setTimeout(() => {
      setStep('preview');
      setMessage('');
      setShareUrl('');
      setCopied(false);
    }, 200);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share2 className="w-5 h-5" />
            Share Achievement
          </DialogTitle>
        </DialogHeader>

        {step === 'preview' && (
          <div className="space-y-6">
            <div className="text-sm text-muted-foreground">
              Share your progress with friends! A unique link will be created for this achievement card.
            </div>

            <AchievementCard
              habitName={habit.name}
              habitColor={habit.color}
              currentStreak={stats.currentStreak}
              longestStreak={stats.longestStreak}
              totalCompletions={stats.totalCompletions}
              completionRate={stats.completionRate}
            />

            <div className="space-y-2">
              <Label htmlFor="message">Add a message (optional)</Label>
              <Textarea
                id="message"
                placeholder="I've been working hard on this habit..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="resize-none"
                rows={2}
              />
            </div>

            <Button onClick={handleShare} className="w-full" size="lg">
              <Share2 className="w-4 h-4 mr-2" />
              Create Share Link
            </Button>
          </div>
        )}

        {step === 'sharing' && (
          <div className="flex flex-col items-center justify-center py-12 space-y-4">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Creating your share link...</p>
          </div>
        )}

        {step === 'shared' && (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto">
                <Check className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="font-semibold text-lg">Share link created!</h3>
              <p className="text-sm text-muted-foreground">
                Your achievement card is ready to share. The link will expire in 30 days.
              </p>
            </div>

            <div className="space-y-2">
              <Label>Share Link</Label>
              <div className="flex gap-2">
                <Input
                  value={shareUrl}
                  readOnly
                  className="font-mono text-sm"
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleCopy}
                  className="flex-shrink-0"
                >
                  {copied ? (
                    <Check className="w-4 h-4 text-green-600" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => window.open(shareUrl, '_blank')}
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Preview
              </Button>
              <Button className="flex-1" onClick={handleCopy}>
                <Copy className="w-4 h-4 mr-2" />
                {copied ? 'Copied!' : 'Copy Link'}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
