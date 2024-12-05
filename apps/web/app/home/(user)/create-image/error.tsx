'use client';

import { useEffect } from 'react';
import { Button } from "@kit/ui/button";
import { useRouter } from 'next/navigation';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const router = useRouter();

  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Error:', error);
  }, [error]);

  return (
    <div className="flex h-full flex-col items-center justify-center gap-4">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-semibold">Something went wrong!</h2>
        <p className="text-muted-foreground">
          {error.message || 'An unexpected error occurred while generating your image.'}
        </p>
      </div>
      <div className="flex gap-4">
        <Button onClick={() => router.push('/home')}>
          Go Back Home
        </Button>
        <Button variant="outline" onClick={reset}>
          Try Again
        </Button>
      </div>
    </div>
  );
} 