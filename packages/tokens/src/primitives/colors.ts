/**
 * Raw palettes (primitives). There is NO meaning here — just colors.
 * Meaning ("what is a card's background") lives in semantic.ts.
 *
 * Every ramp has exactly 10 shades (0 = lightest, 9 = darkest) because that
 * is the format Mantine expects for `theme.colors`.
 */

export type ColorRamp = readonly [
  string, string, string, string, string,
  string, string, string, string, string,
]

/** Brand blue. Index 6 (#0078D4) is the primary brand color. */
export const blue: ColorRamp = [
  '#E8F5FA', '#BDE3F5', '#93D1F0', '#68BEEF', '#3EACEB',
  '#1499E6', '#0078D4', '#0069BC', '#0059A4', '#004A8C',
] as const

/** Secondary brand color — used for accents and charts. */
export const teal: ColorRamp = [
  '#E4F7F7', '#B8E8E9', '#8CD9DA', '#5FC9CB', '#33BABC',
  '#17A8AB', '#038387', '#027276', '#026165', '#015052',
] as const

/** Neutral ramp (Fluent-inspired). Carries 90% of surfaces and text. */
export const gray: ColorRamp = [
  '#FAF9F8', '#F3F2F1', '#EDEBE9', '#E1DFDD', '#D2D0CE',
  '#A19F9D', '#797775', '#605E5C', '#3B3A39', '#323130',
] as const

/** Success / positive state. Index 7 (#107C10) is text on a light background. */
export const green: ColorRamp = [
  '#DFF6DD', '#C3EBC0', '#A3DD9F', '#7FCD7A', '#5ABC55',
  '#3AA835', '#1C8815', '#107C10', '#0B6A0B', '#054B05',
] as const

/** Warning. Fluent uses a yellow background with orange text. */
export const orange: ColorRamp = [
  '#FFF4CE', '#FFE7A0', '#FFD670', '#FFC043', '#FCA61F',
  '#F08C00', '#E56F01', '#D83B01', '#B83101', '#8F2601',
] as const

/** Error / destructive actions. Index 7 (#A4262C) is text. */
export const red: ColorRamp = [
  '#FDE7E9', '#F9C8CD', '#F3A3AB', '#EB7A85', '#E05360',
  '#CF3A48', '#BD2F3B', '#A4262C', '#8A1F24', '#6B171C',
] as const

/** Violet — reserved for "enterprise" tier labels and badges. */
export const violet: ColorRamp = [
  '#F3F0FF', '#E5DBFF', '#D0BFFF', '#B197FC', '#9775FA',
  '#845EF7', '#7950F2', '#7048E8', '#6741D9', '#5F3DC4',
] as const

/** Absolute values that do not belong to any ramp. */
export const common = {
  white: '#FFFFFF',
  black: '#000000',
  /** Base background in dark mode — deliberately not gray[9]. */
  ink: '#1B1B1B',
  inkRaised: '#242424',
  inkSunken: '#141414',
  inkOverlay: '#2C2C2C',
} as const

export const palette = { blue, teal, gray, green, orange, red, violet } as const

export type PaletteName = keyof typeof palette
