import '@mantine/core/styles.css'
import '@mantine/dates/styles.css'
import '@mantine/notifications/styles.css'
import '@mantine/spotlight/styles.css'
/* Stilovi grafikona MORAJU posle core stilova - inace oblacici ispadnu van
   mesta i boje serija se ne primene. */
import '@mantine/charts/styles.css'
import '@mantine/schedule/styles.css'
import '@mantine/tiptap/styles.css'
import '@mantine/carousel/styles.css'
import '@mantine/dropzone/styles.css'
import '@mantine/nprogress/styles.css'
import '@mantine/code-highlight/styles.css'
/* React Flow stilovi, pa nase usaglasavanje sa temom - redosled je bitan. */
import '@xyflow/react/dist/style.css'
import '@liro/process/styles.css'

/*
 * REŠENJE ZA TS GREŠKU: 
 * TS se buni jer u package.json paketa '@liro/tokens' verovatno nije lepo
 * definisan tip za eksport './css'. Da te to ne bi blokiralo, koristimo
 * ts-expect-error, ili možeš da staviš tačnu putanju (npr. '@liro/tokens/styles/tokens.css')
 */
// @ts-expect-error - TS ne prepoznaje ./css export iz internog paketa
import '@liro/tokens/css'

import '@liro/theme/styles.css'
import '@liro/ui/styles.css'

import type { ReactNode } from 'react'
import { ColorSchemeScript } from '@mantine/core'
import { Inter, Space_Grotesk } from 'next/font/google'
import { Providers } from './providers'

/*
 * Redosled uvoza CSS-a je bitan: Mantine, pa tokeni, pa globalni stilovi, pa
 * stilovi komponenti. Obrnut redosled znaci da Mantine nadjacava tokene.
 */

/*
 * Inter nosi ceo interfejs.
 * Podskupovi 'cyrillic' i 'cyrillic-ext' osiguravaju da srpska slova
 * izgledaju savršeno na oba pisma bez menjanja fonta.
 */
const bodyFont = Inter({
  subsets: ['latin', 'latin-ext', 'cyrillic', 'cyrillic-ext'],
  // Inter u Google Fonts podržava raspon težina. Ovde zadajemo specifične.
  weight: ['400', '500', '600', '700'],
  // VAŽNO: Imenujemo varijablu ONAKO KAKO JE TVOJ global.css OČEKUJE
  variable: '--liro-font-sans',
  display: 'swap',
})

const brandFont = Space_Grotesk({
  subsets: ['latin'],
  weight: ['600', '700'],
  variable: '--liro-font-brand', // Isto važi i ovde
})

export const metadata = {
  title: 'Liro Design System',
  description: 'Živa dokumentacija komponenti, tokena i šablona',
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="sr" suppressHydrationWarning>
      <head>
        <ColorSchemeScript defaultColorScheme="light" />
      </head>
      {/* Dodajemo Next.js font varijable na body element */}
      <body className={`${bodyFont.variable} ${brandFont.variable}`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}