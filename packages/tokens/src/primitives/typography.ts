/**
 * Tipografija. Dva pisma sa razlicitim poslovima:
 *  - `sans` (Inter) nosi ceo interfejs; bira se zbog visokog x-visina i tabularnih cifara,
 *    sto je bitno jer su Liro ekrani puni iznosa i tabela.
 *  - `brand` (Space Grotesk) se pojavljuje samo na wordmark-u i status ekranima.
 *    Namerno je ogranicen - ako se pojavi u tabeli, greska je.
 *
 * `brand` se ucitava preko next/font i izlaze kao CSS varijabla, pa je ovde
 * referenciran kroz `var(--font-brand)` sa fallback-om.
 */

export const fontFamily = {
  /*
   * Noto Sans.
   *
   * Izabran zbog potpune podrske za srpsku cirilicu, ukljucujuci lokalizovane
   * oblike u kurzivu (б, г, д, п, т) koji se razlikuju od ruskih. Vecina
   * groteska ima cirilicu, ali malo njih ima srpske oblike - a dokument sa
   * ruskim „т" u kurzivu odmah izgleda strano.
   *
   * Ucitava se preko `next/font` i izlaze kao `--font-sans`.
   */
  sans: "var(--font-sans), 'Noto Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  brand: "var(--font-brand), Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  mono: "'JetBrains Mono', 'Cascadia Code', ui-monospace, SFMono-Regular, Menlo, monospace",
} as const

/**
 * Skala je namerno uska. Aplikacija za unos podataka ne treba 9 velicina teksta -
 * treba joj 5 koje se dosledno koriste.
 */
export const fontSize = {
  xs: '12px',
  sm: '13px',
  md: '14px',
  lg: '16px',
  xl: '20px',
} as const

export const fontWeight = {
  regular: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
} as const

export const lineHeight = {
  tight: '1.25',
  base: '1.45',
  relaxed: '1.6',
} as const

/**
 * Blago negativan tracking na krupnijem tekstu - Inter na 20px+ deluje razvuceno
 * bez ovoga. Uppercase labele idu u suprotnom smeru.
 */
export const letterSpacing = {
  heading: '-0.015em',
  body: '-0.01em',
  none: '0',
  caps: '0.5px',
} as const

export const heading = {
  h1: { fontSize: '24px', lineHeight: '1.3', fontWeight: fontWeight.semibold },
  h2: { fontSize: '20px', lineHeight: '1.35', fontWeight: fontWeight.semibold },
  h3: { fontSize: '16px', lineHeight: '1.4', fontWeight: fontWeight.semibold },
  h4: { fontSize: '14px', lineHeight: '1.45', fontWeight: fontWeight.semibold },
  h5: { fontSize: '13px', lineHeight: '1.45', fontWeight: fontWeight.semibold },
  h6: { fontSize: '12px', lineHeight: '1.45', fontWeight: fontWeight.semibold },
} as const

export const typography = {
  fontFamily,
  fontSize,
  fontWeight,
  lineHeight,
  letterSpacing,
  heading,
} as const
