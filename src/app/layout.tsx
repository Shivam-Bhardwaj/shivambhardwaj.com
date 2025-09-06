import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { logger } from '@/lib/logging';
import Navigation from '@/components/Navigation';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Shivam Bhardwaj - Robotics Engineer & Portfolio',
  description: 'Professional portfolio showcasing robotics engineering expertise, project management experience, and technical skills in autonomous systems.',
  authors: [{ name: 'Shivam Bhardwaj', url: 'https://shivambhardwaj.com' }],
  keywords: [
    'robotics',
    'engineering',
    'portfolio',
    'autonomous systems',
    'project management',
    'software development',
    'hardware development',
  ],
  openGraph: {
    title: 'Shivam Bhardwaj - Robotics Engineer',
    description: 'Professional portfolio showcasing robotics engineering expertise and technical skills.',
    url: 'https://shivambhardwaj.com',
    siteName: 'Shivam Bhardwaj Portfolio',
    type: 'website',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'your-google-verification-code',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Log application startup
  if (typeof window === 'undefined') {
    logger.info('Application starting', {
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      nodeVersion: process.version,
    });
  }

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
        <meta name="theme-color" content="#0f172a" />
      </head>
      <body className={inter.className}>
        <Navigation />
        <div id="root" className="pt-16">
          {children}
        </div>
      </body>
    </html>
  );
}