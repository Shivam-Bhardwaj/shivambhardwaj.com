import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { logger } from '@/lib/logging';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { ThemeProvider } from '@/lib/theme';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Antimony Labs - Robotics & Autonomous Systems Portfolio',
  description: 'Antimony Labs: Autonomous systems, robotics engineering, scalable cloud architecture, and experimentation platform.',
  authors: [{ name: 'Antimony Labs', url: 'https://shivambhardwaj.com' }],
  keywords: [
    'antimony labs',
    'robotics',
    'engineering',
    'autonomous systems',
    'cloud architecture',
    'project management',
    'software development',
    'hardware development',
  ],
  openGraph: {
    title: 'Antimony Labs - Robotics & Autonomous Systems',
    description: 'Research, engineering, and platform work in robotics & autonomous systems.',
    url: 'https://shivambhardwaj.com',
    siteName: 'Antimony Labs',
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
        {/* Pre-hydration theme application to prevent FOUC */}
        <script
          // Inline, minimal, no external dependency. Mirrors ThemeManager logic (subset) before React loads.
          dangerouslySetInnerHTML={{
            __html: `(() => {try {const KEY='portfolio-theme-preferences';const d=document.documentElement;const stored=localStorage.getItem(KEY);const prefs=stored?JSON.parse(stored):{};const mode=prefs.mode||'system';const systemDark=window.matchMedia('(prefers-color-scheme: dark)').matches;const resolved=mode==='system'?(systemDark?'dark':'light'):mode;d.classList.add(resolved);d.setAttribute('data-color-scheme', prefs.colorScheme||'blue');d.setAttribute('data-font-size', prefs.fontSize||'medium');d.setAttribute('data-animation-level', prefs.animationLevel||'normal');if(prefs.highContrast) d.classList.add('high-contrast');if(prefs.reduceMotion || prefs.animationLevel==='none') d.classList.add('reduce-motion');if(prefs.compactMode) d.classList.add('compact-mode');if(prefs.customAccentColor) d.style.setProperty('--accent-color', prefs.customAccentColor);if(prefs.customFontFamily) d.style.setProperty('--font-family-custom', prefs.customFontFamily);var mt=document.querySelector('meta[name="theme-color"]');if(mt){mt.setAttribute('content', resolved==='dark'?'#1f2937':'#ffffff');}}catch(e){/* silent */}})();`
          }}
        />
      </head>
      <body className={inter.className}>
        <ThemeProvider>
          <Navigation />
          <div id="root" className="pt-16 min-h-screen flex flex-col">
            <div className="flex-1">{children}</div>
            <Footer />
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}