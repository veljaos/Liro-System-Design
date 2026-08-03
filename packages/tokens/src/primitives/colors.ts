/**
 * Sirove palete (primitives). Ovde NEMA znacenja - samo boje.
 * Znacenje ("sta je pozadina kartice") zivi u semantic.ts.
 *
 * Svaka rampa ima tacno 10 nijansi (0 = najsvetlija, 9 = najtamnija)
 * jer je to format koji Mantine ocekuje za `theme.colors`.
 */

export type ColorRamp = readonly [
  string, string, string, string, string,
  string, string, string, string, string,
]

/** Brend plava. Indeks 6 (#0078D4) je primarna brend boja. */
export const blue: ColorRamp = [
  '#E8F5FA', '#BDE3F5', '#93D1F0', '#68BEEF', '#3EACEB',
  '#1499E6', '#0078D4', '#0069BC', '#0059A4', '#004A8C',
] as const

/** Sekundarna brend boja - koristi se za akcente i grafikone. */
export const teal: ColorRamp = [
  '#E4F7F7', '#B8E8E9', '#8CD9DA', '#5FC9CB', '#33BABC',
  '#17A8AB', '#038387', '#027276', '#026165', '#015052',
] as const

/** Neutralna rampa (Fluent-inspirisana). Nosi 90% povrsina i teksta. */
export const gray: ColorRamp = [
  '#FAF9F8', '#F3F2F1', '#EDEBE9', '#E1DFDD', '#D2D0CE',
  '#A19F9D', '#797775', '#605E5C', '#3B3A39', '#323130',
] as const

/** Uspeh / pozitivno stanje. Indeks 7 (#107C10) je tekst na svetloj podlozi. */
export const green: ColorRamp = [
  '#DFF6DD', '#C3EBC0', '#A3DD9F', '#7FCD7A', '#5ABC55',
  '#3AA835', '#1F9018', '#107C10', '#0B6A0B', '#054B05',
] as const

/** Upozorenje. Fluent koristi zutu pozadinu sa narandzastim tekstom. */
export const orange: ColorRamp = [
  '#FFF4CE', '#FFE7A0', '#FFD670', '#FFC043', '#FCA61F',
  '#F08C00', '#E56F01', '#D83B01', '#B83101', '#8F2601',
] as const

/** Greska / destruktivne akcije. Indeks 7 (#A4262C) je tekst. */
export const red: ColorRamp = [
  '#FDE7E9', '#F9C8CD', '#F3A3AB', '#EB7A85', '#E05360',
  '#CF3A48', '#BD2F3B', '#A4262C', '#8A1F24', '#6B171C',
] as const

/** Ljubicasta - rezervisana za "enterprise" tier oznake i badge-ove. */
export const violet: ColorRamp = [
  '#F3F0FF', '#E5DBFF', '#D0BFFF', '#B197FC', '#9775FA',
  '#845EF7', '#7950F2', '#7048E8', '#6741D9', '#5F3DC4',
] as const

/** Apsolutne vrednosti koje ne pripadaju nijednoj rampi. */
export const common = {
  white: '#FFFFFF',
  black: '#000000',
  /** Osnovna pozadina u dark rezimu - namerno nije gray[9]. */
  ink: '#1B1B1B',
  inkRaised: '#242424',
  inkSunken: '#141414',
  inkOverlay: '#2C2C2C',
} as const

export const palette = { blue, teal, gray, green, orange, red, violet } as const

export type PaletteName = keyof typeof palette
