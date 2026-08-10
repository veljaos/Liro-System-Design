/**
 * Radii. `xs` at 2px exists deliberately - status badges are sharp, while
 * cards and modals are soft. That difference is part of the system's identity.
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
