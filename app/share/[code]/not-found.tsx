import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { AlertCircle } from 'lucide-react';

export default function NotFound() {
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
