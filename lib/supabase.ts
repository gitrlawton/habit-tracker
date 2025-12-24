import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface SharedAchievement {
  id: string;
  share_code: string;
  habit_name: string;
  habit_color: string;
  current_streak: number;
  longest_streak: number;
  total_completions: number;
  completion_rate: number;
  message: string | null;
  created_at: string;
  expires_at: string;
}

function generateShareCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
  let code = '';
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

export async function createSharedAchievement(data: {
  habitName: string;
  habitColor: string;
  currentStreak: number;
  longestStreak: number;
  totalCompletions: number;
  completionRate: number;
  message?: string;
}): Promise<{ shareCode: string | null; error: string | null }> {
  const shareCode = generateShareCode();

  const { error } = await supabase
    .from('shared_achievements')
    .insert({
      share_code: shareCode,
      habit_name: data.habitName,
      habit_color: data.habitColor,
      current_streak: data.currentStreak,
      longest_streak: data.longestStreak,
      total_completions: data.totalCompletions,
      completion_rate: data.completionRate,
      message: data.message || null,
    });

  if (error) {
    return { shareCode: null, error: error.message };
  }

  return { shareCode, error: null };
}

export async function getSharedAchievement(shareCode: string): Promise<{ data: SharedAchievement | null; error: string | null }> {
  const { data, error } = await supabase
    .from('shared_achievements')
    .select('*')
    .eq('share_code', shareCode)
    .maybeSingle();

  if (error) {
    return { data: null, error: error.message };
  }

  return { data, error: null };
}
