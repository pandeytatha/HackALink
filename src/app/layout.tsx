import type { Metadata } from 'next';
import { StackProvider, StackTheme } from '@stackframe/stack';
import { stackClientApp } from '@/stack/client';
import Sidebar from '@/components/layout/Sidebar';
import './globals.css';

export const metadata: Metadata = {
  title: 'HackaLink - Hackathon Networking Assistant',
  description: 'Find your perfect hackathon teammates, discover who to network with, and generate personalized talking points.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased bg-neutral-50">
        <StackProvider app={stackClientApp}>
          <StackTheme>
            <div className="flex min-h-screen">
              <Sidebar />
              <main className="flex-1 ml-64">
                {children}
              </main>
            </div>
          </StackTheme>
        </StackProvider>
      </body>
    </html>
  );
}
