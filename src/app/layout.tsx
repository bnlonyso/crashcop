import { Inter as FontSans } from 'next/font/google'
import React, { PropsWithChildren } from 'react'

import { cn } from '@/lib/utils'
import { ThemeProvider } from '@/lib/providers/ThemeProvider'

import '@/app/globals.scss'
import IconProvider from '@/lib/providers/IconProvider'
import ProgressProvider from '@/lib/providers/ProgressProvider'
import QueryProvider from '@/lib/providers/QueryProvider'

const fontSans = FontSans({
  subsets: ['latin', 'cyrillic'],
  variable: '--font-sans',
})

export const metadata = {
  title: 'crashcop — электронный дневник и симулятор оценок',
  description: 'crashcop — удобный дневник и умный симулятор оценок',
  manifest: '/site.webmanifest?v=crashcop10',
  icons: {
    icon: [
      { url: '/favicon.svg?v=crashcop10', type: 'image/svg+xml' },
      { url: '/favicon-32x32.png?v=crashcop10', sizes: '32x32', type: 'image/png' },
      { url: '/favicon-16x16.png?v=crashcop10', sizes: '16x16', type: 'image/png' },
      { url: '/icon.svg?v=crashcop10', type: 'image/svg+xml' },
    ],
    shortcut: '/favicon.ico?v=crashcop10',
    apple: [
      { url: '/apple-icon.svg?v=crashcop10', type: 'image/svg+xml' },
      { url: '/apple-touch-icon.png?v=crashcop10', sizes: '180x180', type: 'image/png' },
    ],
  },
}

export default function RootLayout({ children }: PropsWithChildren) {
  return (
    <html lang="ru" suppressHydrationWarning className="dark">
      <head>
        <link rel="icon" type="image/svg+xml" href="/favicon.svg?v=crashcop10" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png?v=crashcop10" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png?v=crashcop10" />
        <link rel="shortcut icon" href="/favicon.ico?v=crashcop10" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png?v=crashcop10" />
        <link rel="manifest" href="/site.webmanifest?v=crashcop10" />
        <meta name="theme-color" content="#000000" />
        <meta name="msapplication-TileColor" content="#000000" />
      </head>
      <body
        className={cn(
          'min-h-screen bg-background font-sans antialiased selection:bg-purple-500 selection:text-white',
          fontSans.variable,
        )}
      >
        <div
          vaul-drawer-wrapper=""
          className={cn(
            'min-h-screen bg-background font-sans antialiased',
            fontSans.variable,
          )}
        >
          <ProgressProvider>
            <QueryProvider>
              <ThemeProvider>
                <IconProvider>{children}</IconProvider>
              </ThemeProvider>
            </QueryProvider>
          </ProgressProvider>
        </div>
      </body>
    </html>
  )
}
