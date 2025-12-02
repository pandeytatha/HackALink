'use client';

import { SignIn } from '@stackframe/stack';

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8">
        <h1 className="text-2xl font-bold mb-6 text-center">Sign In</h1>
        <SignIn afterSignIn="/" />
      </div>
    </div>
  );
}
