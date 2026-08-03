/**
 * Spacing skala u koracima od 4px. `md` (16px) je podrazumevani razmak
 * izmedju sekcija na stranici; `xs` (8px) izmedju povezanih elemenata.
 */
export const spacing = {
  none: '0',
  xxs: '4px',
  xs: '8px',
  sm: '12px',
  md: '16px',
  lg: '24px',
  xl: '32px',
  xxl: '48px',
  xxxl: '64px',
} as const

export type SpacingKey = keyof typeof spacing
