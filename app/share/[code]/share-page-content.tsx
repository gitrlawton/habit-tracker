'use client';

import { useState, useEffect } from 'react';
import { AchievementCard } from '@/components/achievement-card';
import { Button } from '@/components/ui/button';
import { Copy, Check, Sparkles, Loader2, AlertCircle } from 'lucide-react';
import { getSharedAchievement, SharedAchievement } from '@/lib/supabase';
import Link from 'next/link';

interface SharePageContentProps {
  code: string;
}

export function SharePageContent({ code }: SharePageContentProps) {
  const [achievement, setAchievement] = useState<SharedAchievement | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    async function fetchAchievement() {
      setLoading(true);
      const { data, error: fetchError } = await getSharedAchievement(code);

      if (fetchError || !data) {
        setError('Achievement not found or has expired.');
      } else {
        setAchievement(data);
      }
      setLoading(false);
    }

    fetchAchievement();
  }, [code]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      console.error('Failed to copy');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading achievement...</p>
        </div>
      </div>
    );
  }

  if (error || !achievement) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center px-4">
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="w-8 h-8 text-muted-foreground" />
          </div>
          <h1 className="text-2xl font-bold mb-2">Achievement Not Found</h1>
          <p className="text-muted-foreground mb-6 max-w-md">
            This achievement card may have expired or the link is invalid. Achievement links are valid for 30 days.
          </p>
          <Button asChild>
            <Link href="/">Go to Habit Tracker</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute top-20 left-10 w-72 h-72 rounded-full blur-[100px] opacity-20"
          style={{ backgroundColor: achievement.habit_color }}
        />
        <div
          className="absolute bottom-20 right-10 w-96 h-96 rounded-full blur-[120px] opacity-15"
          style={{ backgroundColor: achievement.habit_color }}
        />
      </div>

      <div className="relative container max-w-2xl mx-auto px-4 py-12 sm:py-20">
        <div className="text-center mb-8 sm:mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-muted/50 backdrop-blur border border-border/50 mb-6">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span className="text-sm font-medium">Achievement Unlocked</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold mb-3">
            Check out my progress!
          </h1>
          <p className="text-muted-foreground">
            Building better habits, one day at a time.
          </p>
        </div>

        <AchievementCard
          habitName={achievement.habit_name}
          habitColor={achievement.habit_color}
          currentStreak={achievement.current_streak}
          longestStreak={achievement.longest_streak}
          totalCompletions={achievement.total_completions}
          completionRate={achievement.completion_rate}
          message={achievement.message}
        />

        {achievement.message && (
          <div className="mt-8 p-6 rounded-xl bg-muted/30 backdrop-blur border border-border/50 text-center">
            <p className="text-muted-foreground italic">"{achievement.message}"</p>
          </div>
        )}

        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button
            variant="outline"
            size="lg"
            onClick={handleCopy}
            className="w-full sm:w-auto"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 mr-2 text-green-600" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 mr-2" />
                Copy Link
              </>
            )}
          </Button>
          <Button
            size="lg"
            className="w-full sm:w-auto"
            asChild
          >
            <Link href="/">Start Your Own Journey</Link>
          </Button>
        </div>

        <div className="mt-16 text-center text-sm text-muted-foreground">
          <p>Created with Habit Tracker</p>
        </div>
      </div>
    </div>
  );
}
