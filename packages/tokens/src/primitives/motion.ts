/**
 * Durations and curves. A data entry interface should feel instant:
 * nothing above 250ms except a modal entering.
 */
export const duration = {
  instant: '75ms',
  fast: '100ms',
  base: '150ms',
  slow: '250ms',
} as const

export const easing = {
  standard: 'cubic-bezier(0.33, 0, 0.67, 1)',
  decelerate: 'cubic-bezier(0.1, 0.9, 0.2, 1)',
  accelerate: 'cubic-bezier(0.9, 0.1, 1, 0.2)',
} as const

export const motion = { duration, easing } as const
