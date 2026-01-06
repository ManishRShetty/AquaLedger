import type { Metadata } from 'next';
import './globals.css';
import { AppLayout } from '@/components/layout/AppLayout';
import { Toaster } from "@/components/ui/toaster"
import { ReactQueryProvider } from '@/providers/ReactQueryProvider';
import { SyncStatus } from '@/components/ui/SyncStatus';

export const metadata: Metadata = {
  title: 'AquaLedger',
  description: 'Traceable, Sustainable, Trustworthy Seafood',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet"></link>
      </head>
      <body className="font-body antialiased">
        <ReactQueryProvider>
          <AppLayout>
            {children}
            <SyncStatus />
            <Toaster />
          </AppLayout>
        </ReactQueryProvider>
      </body>
    </html>
  );
}
