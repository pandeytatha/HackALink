'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function HandlerPage() {
  const router = useRouter();

  useEffect(() => {
    // After OAuth callback is processed, redirect to home
    const timer = setTimeout(() => {
      router.replace('/');
    }, 100);
    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
        <p>Completing sign in...</p>
      </div>
    </div>
  );
}
