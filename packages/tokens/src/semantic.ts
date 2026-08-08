import { blue, common, gray, green, orange, red, teal, violet } from './primitives/colors'

/**
 * Semanticki tokeni - jedini sloj koji komponente smeju da koriste.
 *
 * Pravilo: komponenta nikada ne pise `gray[3]` niti `#E1DFDD`. Pise
 * `border.default`. Zbog toga rebrand ili nova tema znaci izmenu ovog fajla,
 * a ne pretragu po celoj bazi koda.
 *
 * Svaki token postoji u obe seme. Ako neki token ima smisla samo u light
 * rezimu, to znaci da nije semanticki nego dekorativan - i ne pripada ovde.
 */

export interface SemanticTokens {
  surface: {
    /** Pozadina cele stranice, ispod svega ostalog. */
    page: string
    /** Kartice, paneli, tabele - sve sto "stoji" na stranici. */
    raised: string
    /** Uvucene zone: zaglavlja tabela, code blokovi, prazna stanja. */
    sunken: string
    /** Modali, dropdown-i, popover-i - sve sto lebdi. */
    overlay: string
    /** Traka zaglavlja aplikacije. */
    header: string
    /** Hover na redu tabele ili stavci menija. */
    hover: string
    /** Selektovan red ili aktivna stavka navigacije. */
    selected: string
    /** Onemogucene kontrole. */
    disabled: string
    /** Zatamnjenje iza modala. */
    backdrop: string
    /**
     * Zatamnjenje ISPOD teksta na fotografiji.
     * 
     * Nije isto sto i `backdrop`. Iza modala je 45% dovoljno jer tekst tamo ne
     * stoji. Preko fotografije stoji, i tada 45% daje 3.35 na najgorem slucaju
     * (bela slika, bela slova). Za 4.5 treba najmanje 53.5%; 55% daje 4.76.
     * 
     * Isto u obe teme: fotografija ne zna u kojoj je temi.
     */
    scrim: string
  }
  text: {
    primary: string
    secondary: string
    /** Pomocni tekst, placeholder-i, metapodaci. */
    tertiary: string
    disabled: string
    /** Tekst na brend ili status povrsinama. */
    onAccent: string
    brand: string
    link: string
  }
  border: {
    default: string
    strong: string
    subtle: string
    brand: string
    /** Fokus prsten - mora da zadovolji kontrast 3:1 na obe seme. */
    focus: string
  }
  brand: {
    solid: string
    solidHover: string
    solidActive: string
    /** Blaga pozadina za brend akcente (ikonice u zaglavlju, info trake). */
    subtle: string
    subtleHover: string
    onSolid: string
    accent: string
  }
  status: StatusTokens
}

export interface StatusTone {
  /** Tekst i ikonice. */
  fg: string
  /** Pozadina badge-a ili trake. */
  bg: string
  /** Ivica, kada je potrebna. */
  border: string
  /** Puna povrsina - dugmad, indikatori. */
  solid: string
}

export interface StatusTokens {
  success: StatusTone
  warning: StatusTone
  danger: StatusTone
  info: StatusTone
  neutral: StatusTone
  /** Za "enterprise" oznake modula i premium funkcije. */
  premium: StatusTone
}

export const lightTokens: SemanticTokens = {
  surface: {
    page: gray[1],
    raised: common.white,
    sunken: gray[2],
    overlay: common.white,
    header: common.white,
    hover: gray[0],
    selected: blue[0],
    disabled: gray[2],
    backdrop: 'rgba(0, 0, 0, 0.45)',
    scrim: 'rgba(0, 0, 0, 0.55)',
  },
  text: {
    primary: gray[9],
    secondary: gray[7],
    tertiary: '#6A6866',
    disabled: gray[5],
    onAccent: common.white,
    brand: blue[7],
    link: blue[7],
  },
  border: {
    default: gray[3],
    strong: gray[4],
    subtle: gray[2],
    brand: blue[6],
    focus: blue[6],
  },
  brand: {
    solid: blue[6],
    solidHover: blue[7],
    solidActive: blue[8],
    subtle: blue[0],
    subtleHover: blue[1],
    onSolid: common.white,
    accent: teal[6],
  },
  status: {
    success: { fg: green[7], bg: green[0], border: green[2], solid: green[7] },
    warning: { fg: orange[8], bg: orange[0], border: orange[2], solid: orange[7] },
    danger: { fg: red[7], bg: red[0], border: red[2], solid: red[7] },
    info: { fg: blue[7], bg: blue[0], border: blue[2], solid: blue[6] },
    neutral: { fg: gray[9], bg: gray[1], border: gray[3], solid: gray[7] },
    premium: { fg: violet[7], bg: violet[0], border: violet[2], solid: violet[6] },
  },
}

export const darkTokens: SemanticTokens = {
  surface: {
    page: common.ink,
    raised: common.inkRaised,
    sunken: common.inkSunken,
    overlay: common.inkOverlay,
    header: common.inkRaised,
    hover: 'rgba(255, 255, 255, 0.05)',
    selected: 'rgba(0, 120, 212, 0.18)',
    disabled: 'rgba(255, 255, 255, 0.06)',
    backdrop: 'rgba(0, 0, 0, 0.65)',
    scrim: 'rgba(0, 0, 0, 0.55)',
  },
  text: {
    primary: gray[1],
    secondary: '#B3B0AD',
    tertiary: gray[5],
    disabled: gray[6],
    onAccent: common.white,
    brand: blue[4],
    link: blue[4],
  },
  border: {
    default: '#3B3B3B',
    strong: '#4D4D4D',
    subtle: '#2E2E2E',
    brand: blue[5],
    /** Svetlija od light varijante - #0078D4 na crnom ne prolazi kontrast. */
    focus: blue[4],
  },
  brand: {
    solid: blue[6],
    solidHover: blue[7],
    solidActive: blue[8],
    subtle: 'rgba(0, 120, 212, 0.16)',
    subtleHover: 'rgba(0, 120, 212, 0.26)',
    onSolid: common.white,
    accent: teal[4],
  },
  status: {
    success: { fg: green[3], bg: 'rgba(16, 124, 16, 0.20)', border: 'rgba(16, 124, 16, 0.45)', solid: green[6] },
    warning: { fg: orange[3], bg: 'rgba(216, 59, 1, 0.20)', border: 'rgba(216, 59, 1, 0.45)', solid: orange[6] },
    danger: { fg: red[3], bg: 'rgba(164, 38, 44, 0.22)', border: 'rgba(164, 38, 44, 0.50)', solid: red[6] },
    info: { fg: blue[3], bg: 'rgba(0, 120, 212, 0.18)', border: 'rgba(0, 120, 212, 0.45)', solid: blue[6] },
    neutral: { fg: gray[1], bg: 'rgba(255, 255, 255, 0.07)', border: '#3B3B3B', solid: gray[5] },
    premium: { fg: violet[3], bg: 'rgba(121, 80, 242, 0.20)', border: 'rgba(121, 80, 242, 0.45)', solid: violet[5] },
  },
}

export const semantic = { light: lightTokens, dark: darkTokens } as const

export type ColorSchemeName = keyof typeof semantic
export type StatusToneName = keyof StatusTokens
