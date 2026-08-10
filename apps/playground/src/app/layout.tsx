import '@liro/preset/styles.css'

import type { ReactNode } from 'react'
import { ColorSchemeScript } from '@mantine/core'
import { Inter, Space_Grotesk } from 'next/font/google'
import { getServerLocale } from '@liro/i18n/server'
import { Providers } from './providers'

/*
 * Inter carries the whole interface. The 'cyrillic' and 'cyrillic-ext'
 * subsets ensure Serbian letters look correct in both scripts without
 * changing the font.
 *
 * The variable names must be exactly these — `@liro/theme` expects them.
 */
const bodyFont = Inter({
  subsets: ['latin', 'latin-ext', 'cyrillic', 'cyrillic-ext'],
  weight: ['400', '500', '600', '700'],
  variable: '--liro-font-sans',
  display: 'swap',
})

const brandFont = Space_Grotesk({
  subsets: ['latin'],
  weight: ['600', '700'],
  variable: '--liro-font-brand',
  display: 'swap',
})

export const metadata = {
  title: 'Liro Design System',
  description: 'Živa dokumentacija komponenti, tokena i šablona',
}

export default async function RootLayout({ children }: { children: ReactNode }) {
  /*
  * The language is read on the server and passed to the client as the
  * initial value. Without this, the server would render Serbian, the client
  * would read the cookie after hydration and switch to English — and React
  * would report a mismatch.
  */
 const locale = await getServerLocale()

  return (
    <html lang="sr" suppressHydrationWarning>
      <head>
        {/* Without this, the first frame flashes the wrong scheme. */}
        <ColorSchemeScript defaultColorScheme="light" />
      </head>
      <body className={`${bodyFont.variable} ${brandFont.variable}`}>
        <Providers initialLocale={locale}>{children}</Providers>
      </body>
    </html>
  )
}