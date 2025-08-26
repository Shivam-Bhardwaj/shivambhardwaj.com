import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { Orbitron } from "next/font/google";
import "./globals.css";
import MinimalNavbar from "@/components/MinimalNavbar";
import MinimalFooter from "@/components/MinimalFooter";
import SmartAvoidanceRobots from "@/components/SmartAvoidanceRobots";
import ThemeToggle from "@/components/ThemeToggle";

const inter = Inter({ 
  subsets: ["latin"],
  variable: "--font-sans",
  display: 'swap'
});

const orbitron = Orbitron({ 
  subsets: ["latin"], 
  variable: "--font-orbitron",
  display: 'swap'
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: 'swap'
});

export const metadata: Metadata = {
  title: {
    default: "Shivam Bhardwaj - Robotics Engineer & Project Manager",
    template: "%s | Shivam Bhardwaj"
  },
  description: "Expert robotics engineer and project manager specializing in autonomous systems, self-driving technology, and medical devices. Turning prototypes into production-ready systems.",
  keywords: [
    "robotics engineer",
    "project manager", 
    "autonomous systems",
    "self-driving",
    "medical devices",
    "hardware development",
    "prototyping",
    "production systems"
  ],
  authors: [{ name: "Shivam Bhardwaj" }],
  creator: "Shivam Bhardwaj",
  metadataBase: new URL("https://shivambhardwaj.com"),
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://shivambhardwaj.com",
    title: "Shivam Bhardwaj - Robotics Engineer & Project Manager",
    description: "Expert robotics engineer and project manager specializing in autonomous systems, self-driving technology, and medical devices.",
    siteName: "Shivam Bhardwaj Portfolio"
  },
  twitter: {
    card: "summary_large_image",
    title: "Shivam Bhardwaj - Robotics Engineer & Project Manager",
    description: "Expert robotics engineer and project manager specializing in autonomous systems, self-driving technology, and medical devices."
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
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className={`${jetbrainsMono.variable} font-mono`}>
        <div className="fixed inset-0 z-0">
          <SmartAvoidanceRobots />
        </div>
        
        {/* Theme Toggle */}
        <ThemeToggle />
        
        <div className="relative z-10 flex flex-col min-h-screen">
          <MinimalNavbar />
          <main className="flex-grow flex items-center justify-center">
            {children}
          </main>
          <MinimalFooter />
        </div>
      </body>
    </html>
  );
}
