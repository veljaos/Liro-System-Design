/**
 * Spacing scale in steps of 4px. `md` (16px) is the default gap between
 * sections on a page; `xs` (8px) between related elements.
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
