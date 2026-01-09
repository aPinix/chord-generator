import type { Metadata } from 'next';
import { Flow_Block, Geist, Geist_Mono } from 'next/font/google';
import Script from 'next/script';
import { Footer } from '@/components/footer';
import { ThemeNameScript } from '@/components/theme/theme-name-script';
import { Providers } from '@/config/providers.config';
import {
  APP_FAVICON_DARK,
  APP_FAVICON_LIGHT,
  APP_NAME,
} from '@/config/variables.config';
import { DEBUG_REACT_SCAN } from '@/config/variables-const.config';
import '../styles/globals.css';
import { Header } from '@/components/header';

const fontPrimary = Geist({
  variable: '--font-primary',
  subsets: ['latin'],
});

const fontMono = Geist_Mono({
  variable: '--font-mono',
  subsets: ['latin'],
});

const fontSkeleton = Flow_Block({
  variable: '--font-skeleton',
  subsets: ['latin'],
  weight: ['400'],
});

export const metadata: Metadata = {
  title: APP_NAME,
  description: APP_NAME,
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
0;
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
        className={`${fontPrimary.variable} ${fontMono.variable} ${fontSkeleton.variable} flex min-h-screen flex-col antialiased`}
        suppressHydrationWarning
      >
        <Providers>
          <Header />
          <main className="flex flex-1 flex-col overflow-x-clip">
            {children}
          </main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
