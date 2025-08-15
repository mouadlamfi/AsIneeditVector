import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { PerformanceOptimizer } from '@/components/performance-optimizer';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'As I Need It - Design & Geometry Platform',
  description: 'Where creativity meets precision in the universe of design and geometry. Explore our Flower of Life design app for professional vector drawing and sacred geometry.',
  keywords: 'design, geometry, Flower of Life, vector drawing, sacred geometry, art, creativity, precision',
  authors: [{ name: 'As I Need It' }],
  creator: 'As I Need It',
  publisher: 'As I Need It',
  robots: 'index, follow',
  openGraph: {
    title: 'As I Need It - Design & Geometry Platform',
    description: 'Where creativity meets precision in the universe of design and geometry.',
    url: 'https://asineedit.com',
    siteName: 'As I Need It',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'As I Need It - Design Platform',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'As I Need It - Design & Geometry Platform',
    description: 'Where creativity meets precision in the universe of design and geometry.',
    images: ['/og-image.png'],
  },
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
  manifest: '/manifest.json',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#000000',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <PerformanceOptimizer>
          {children}
        </PerformanceOptimizer>
      </body>
    </html>
  );
}
