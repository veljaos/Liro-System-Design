import { blue, common, gray, green, orange, red, teal, violet } from './primitives/colors'

/**
 * Semantic tokens — the only layer components are allowed to use.
 *
 * Rule: a component never writes `gray[3]` or `#E1DFDD`. It writes
 * `border.default`. Because of this, a rebrand or a new theme means editing
 * this file, not searching across the whole codebase.
 *
 * Every token exists in both schemes. If a token only makes sense in light
 * mode, that means it is not semantic but decorative — and does not belong
 * here.
 */

export interface SemanticTokens {
  surface: {
    /** Background of the whole page, below everything else. */
    page: string
    /** Cards, panels, tables — everything that "sits" on the page. */
    raised: string
    /** Recessed zones: table headers, code blocks, empty states. */
    sunken: string
    /** Modals, dropdowns, popovers — everything that floats. */
    overlay: string
    /** Application header bar. */
    header: string
    /** Hover on a table row or menu item. */
    hover: string
    /** Selected row or active navigation item. */
    selected: string
    /** Disabled controls. */
    disabled: string
    /** Darkening behind a modal. */
    backdrop: string
    /**
     * Darkening UNDER text on a photo.
     *
     * Not the same as `backdrop`. Behind a modal, 45% is enough because text
     * does not sit there. Over a photo it does, and there 45% gives 3.35 in
     * the worst case (white image, white letters). For 4.5 you need at least
     * 53.5%; 55% gives 4.76.
     *
     * The same in both themes: the photo does not know which theme it is in.
     */
    scrim: string
  }
  text: {
    primary: string
    secondary: string
    /** Helper text, placeholders, metadata. */
    tertiary: string
    disabled: string
    /** Text on brand or status surfaces. */
    onAccent: string
    brand: string
    link: string
  }
  border: {
    default: string
    strong: string
    subtle: string
    brand: string
    /** Focus ring — must meet a 3:1 contrast in both schemes. */
    focus: string
  }
  brand: {
    solid: string
    solidHover: string
    solidActive: string
    /** A light background for brand accents (header icons, info banners). */
    subtle: string
    subtleHover: string
    onSolid: string
    accent: string
  }
  status: StatusTokens
}

export interface StatusTone {
  /** Text and icons. */
  fg: string
  /** Badge or banner background. */
  bg: string
  /** Border, when needed. */
  border: string
  /** Full-color surface — buttons, indicators. */
  solid: string
}

export interface StatusTokens {
  success: StatusTone
  warning: StatusTone
  danger: StatusTone
  info: StatusTone
  neutral: StatusTone
  /** For "enterprise" module badges and premium features. */
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
    /** Lighter than the light variant — #0078D4 on black does not pass contrast. */
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
