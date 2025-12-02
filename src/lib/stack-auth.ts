import { StackServerApp, StackClientApp } from '@stackframe/stack';

const projectId = process.env.NEXT_PUBLIC_STACK_PROJECT_ID || '';
const publishableClientKey = process.env.NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY || '';
const secretServerKey = process.env.STACK_SECRET_SERVER_KEY || '';

export const stackServerApp = new StackServerApp({
  tokenStore: 'nextjs-cookie',
  projectId,
  publishableClientKey,
  secretServerKey,
  urls: {
    signIn: '/login',
    signUp: '/signup',
  },
} as any); // Type assertion to work around type issues

// Client app needs tokenStore for useUser() to work
export const stackClientApp = new StackClientApp({
  tokenStore: 'nextjs-cookie',
  projectId,
  publishableClientKey,
} as any); // Type assertion to work around type issues

