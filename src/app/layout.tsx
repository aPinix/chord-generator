import type { Metadata, Viewport } from 'next';
import { Flow_Block, Geist_Mono, Inter } from 'next/font/google';
import Script from 'next/script';
import { Footer } from '@/components/layout/footer';
import { ThemeColorMeta } from '@/components/theme/theme-color-meta';
import { ThemeNameScript } from '@/components/theme/theme-name-script';
import { Toaster } from '@/components/ui/sonner';
import { Providers } from '@/config/providers.config';
import {
  APP_DESCRIPTION,
  APP_FAVICON_DARK,
  APP_FAVICON_LIGHT,
  APP_NAME,
  APP_SOCIAL_IMAGE,
  APP_URL,
} from '@/config/variables.config';
import { DEBUG_REACT_SCAN } from '@/config/variables-const.config';
import '../styles/globals.css';
import { Header } from '@/components/layout/header';

// One family for the interface and the headings. To give headings their own
// face, load it here with `variable: '--font-family-display'`.
const fontSans = Inter({
  variable: '--font-family-sans',
  subsets: ['latin'],
});

const fontMono = Geist_Mono({
  variable: '--font-family-mono',
  subsets: ['latin'],
});

const fontSkeleton = Flow_Block({
  variable: '--font-skeleton',
  subsets: ['latin'],
  weight: ['400'],
});

export const metadata: Metadata = {
  title: APP_NAME,
  description: APP_DESCRIPTION,
  metadataBase: new URL(APP_URL),
  openGraph: {
    title: APP_NAME,
    description: APP_DESCRIPTION,
    url: APP_URL,
    siteName: APP_NAME,
    images: [
      {
        url: APP_SOCIAL_IMAGE,
        width: 1200,
        height: 630,
        alt: APP_NAME,
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: APP_NAME,
    description: APP_DESCRIPTION,
    images: [APP_SOCIAL_IMAGE],
  },
  icons: {
    icon: [
      {
        media: '(prefers-color-scheme: light)',
        url: APP_FAVICON_LIGHT,
        href: APP_FAVICON_LIGHT,
      },
      {
        media: '(prefers-color-scheme: dark)',
        url: APP_FAVICON_DARK,
        href: APP_FAVICON_DARK,
      },
    ],
  },
};

// Matches the stage; ThemeColorMeta keeps it in step with the theme toggle
export const viewport: Viewport = {
  themeColor: '#c3e5d7',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* use this script to inject the theme accent color */}
        <ThemeNameScript />
        {DEBUG_REACT_SCAN && (
          <Script
            crossOrigin="anonymous"
            src="//unpkg.com/react-scan/dist/auto.global.js"
          />
        )}
      </head>
      <body
        className={`${fontSans.variable} ${fontMono.variable} ${fontSkeleton.variable} flex min-h-screen flex-col antialiased`}
        suppressHydrationWarning
      >
        <Providers>
          <ThemeColorMeta />
          <Header />
          <main className="flex flex-1 flex-col overflow-x-clip">
            {children}
          </main>
          <Footer />
          <Toaster position="bottom-center" />
        </Providers>
      </body>
    </html>
  );
}
