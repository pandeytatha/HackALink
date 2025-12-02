# Setup Guide

## Quick Start

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Create Environment File**
   Create a `.env.local` file in the root directory with the following variables:
   ```bash
   # Stack Auth
   STACK_AUTH_SECRET=your_stack_auth_secret_here
   NEXT_PUBLIC_STACK_AUTH_PROJECT_ID=your_project_id_here

   # ScraperAI
   NEXT_PUBLIC_SCRAPERAI_API_KEY=your_scraperai_api_key_here
   SCRAPERAI_BASE_URL=https://api.scraperai.com/v1

   # OpenAI
   OPENAI_API_KEY=your_openai_api_key_here

   # App
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```

3. **Get API Keys**
   - **Stack Auth**: Sign up at https://stack-auth.com and create a project
   - **ScraperAI**: Sign up at https://scraperai.com and get your API key
   - **OpenAI**: Get your API key from https://platform.openai.com/api-keys

4. **Run Development Server**
   ```bash
   npm run dev
   ```

5. **Open Browser**
   Navigate to http://localhost:3000

## Project Structure

```
src/
├── app/                    # Next.js app directory
│   ├── api/                # API routes
│   ├── dashboard/          # Main dashboard page
│   ├── login/              # Login page
│   ├── signup/             # Sign up page
│   └── layout.tsx          # Root layout with Stack Auth provider
├── components/             # React components
│   ├── analysis/           # Analysis result components
│   ├── auth/               # Authentication components
│   ├── linkedin/           # LinkedIn post generator
│   ├── participants/       # Participant-related components
│   └── ui/                 # Reusable UI components
├── lib/                    # Core libraries
│   ├── linkedin-scraper.ts    # ScraperAI integration
│   ├── llm-client.ts          # OpenAI integration
│   ├── rate-limiter.ts        # Rate limiting logic
│   ├── services/              # Business logic services
│   └── stack-auth.ts          # Stack Auth configuration
├── types/                  # TypeScript type definitions
└── utils/                  # Utility functions
```

