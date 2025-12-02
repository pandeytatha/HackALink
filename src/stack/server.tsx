import "server-only";

import { StackServerApp } from "@stackframe/stack";

const projectId = process.env.NEXT_PUBLIC_STACK_PROJECT_ID;
const publishableClientKey = process.env.NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY;
const secretServerKey = process.env.STACK_SECRET_SERVER_KEY;

if (!projectId) {
  throw new Error(
    'Missing required environment variable: NEXT_PUBLIC_STACK_PROJECT_ID\n' +
    'Please create a .env.local file with your Stack Auth credentials.\n' +
    'See README.md or SETUP.md for setup instructions.'
  );
}

if (!publishableClientKey) {
  throw new Error(
    'Missing required environment variable: NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY\n' +
    'Please create a .env.local file with your Stack Auth credentials.\n' +
    'See README.md or SETUP.md for setup instructions.'
  );
}

if (!secretServerKey) {
  throw new Error(
    'Missing required environment variable: STACK_SECRET_SERVER_KEY\n' +
    'Please create a .env.local file with your Stack Auth credentials.\n' +
    'See README.md or SETUP.md for setup instructions.'
  );
}

export const stackServerApp = new StackServerApp({
  tokenStore: "nextjs-cookie",
  projectId,
  publishableClientKey,
  secretServerKey,
  urls: {
    signIn: '/login',
    signUp: '/signup',
    handler: '/handler',
    afterSignIn: '/',
    afterSignUp: '/',
    home: '/',
  },
});
