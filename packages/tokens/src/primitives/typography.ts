/**
 * Typography. Two typefaces with different jobs:
 *  - `sans` (Inter) carries the whole interface; chosen for its tall x-height and tabular
 *    figures, which matter because Liro screens are full of amounts and tables.
 *  - `brand` (Space Grotesk) appears only on the wordmark and status screens.
 *    Deliberately restricted — if it shows up in a table, that is a bug.
 *
 * `brand` is loaded via next/font and exposed as a CSS variable, so it is
 * referenced here through `var(--font-brand)` with a fallback.
 */

export const fontFamily = {
  /*
   * Noto Sans.
   *
   * Chosen for full support of Serbian Cyrillic, including the localized
   * italic forms (б, г, д, п, т) that differ from the Russian ones. Most
   * grotesques have Cyrillic, but few have the Serbian forms — and a document
   * with a Russian italic "т" immediately looks foreign.
   *
   * Loaded via `next/font` and exposed as `--font-sans`.
   */
  sans: "var(--font-sans), 'Noto Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  brand: "var(--font-brand), Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  mono: "'JetBrains Mono', 'Cascadia Code', ui-monospace, SFMono-Regular, Menlo, monospace",
} as const

/**
 * The scale is deliberately narrow. A data-entry application does not need 9
 * text sizes — it needs 5 that are used consistently.
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
 * A slightly negative tracking on larger text — Inter at 20px+ feels stretched
 * out without this. Uppercase labels go in the opposite direction.
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
