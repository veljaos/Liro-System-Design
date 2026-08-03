/**
 * Radijusi. Namerno postoji `xs` od 2px - status badge-evi su ostri,
 * dok su kartice i modali mekani. Ta razlika je deo prepoznatljivosti.
 */
export const radius = {
  none: '0',
  xs: '2px',
  sm: '4px',
  md: '8px',
  lg: '12px',
  xl: '16px',
  full: '9999px',
} as const

export type RadiusKey = keyof typeof radius
