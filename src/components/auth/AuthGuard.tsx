'use client';

import { useEffect, useState } from 'react';
import { useUser } from '@stackframe/stack';
import { useRouter } from 'next/navigation';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const user = useUser();
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    // Give it a moment to check auth status
    const timer = setTimeout(() => {
      setIsChecking(false);
      if (!user) {
        router.push('/login');
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [user, router]);

  // Show loading only briefly, then show content or redirect
  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  // If no user after checking, redirect will happen
  // But show content anyway in case auth is optional
  return <>{children}</>;
}

