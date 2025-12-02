import { StackClientApp } from "@stackframe/stack";

const projectId = process.env.NEXT_PUBLIC_STACK_PROJECT_ID;
const publishableClientKey = process.env.NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY;

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

export const stackClientApp = new StackClientApp({
  tokenStore: "nextjs-cookie",
  projectId,
  publishableClientKey,
  urls: {
    signIn: '/login',
    signUp: '/signup',
    handler: '/handler',
    afterSignIn: '/',
    afterSignUp: '/',
    home: '/',
  },
});
