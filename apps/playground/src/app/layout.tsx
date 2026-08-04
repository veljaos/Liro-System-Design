import '@liro/preset/styles.css'

import type { ReactNode } from 'react'
import { ColorSchemeScript } from '@mantine/core'
import { Inter, Space_Grotesk } from 'next/font/google'
import { getServerLocale } from '@liro/i18n/server'
import { Providers } from './providers'

/*
 * Inter nosi ceo interfejs. Podskupovi 'cyrillic' i 'cyrillic-ext' osiguravaju
 * da srpska slova izgledaju ispravno na oba pisma bez menjanja fonta.
 *
 * Imena varijabli moraju biti tacno ova - `@liro/theme` ih ocekuje.
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
  * Jezik se cita na serveru i prosledjuje klijentu kao pocetna vrednost.
  * Bez ovoga bi server renderovao srpski, klijent posle hidratacije procitao
  * kolacic i presao na engleski - i React bi prijavio neslaganje.
  */
 const locale = await getServerLocale()

  return (
    <html lang="sr" suppressHydrationWarning>
      <head>
        {/* Bez ovoga prvi frame bljesne pogrešnom šemom. */}
        <ColorSchemeScript defaultColorScheme="light" />
      </head>
      <body className={`${bodyFont.variable} ${brandFont.variable}`}>
        <Providers initialLocale={locale}>{children}</Providers>
      </body>
    </html>
  )
}