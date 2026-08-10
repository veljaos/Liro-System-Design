export * from './primitives/colors'
export * from './primitives/typography'
export * from './primitives/spacing'
export * from './primitives/radius'
export * from './primitives/shadows'
export * from './primitives/motion'
export * from './primitives/layout'
export * from './semantic'
export * from './intents'
export * from './css-var-names'

import { palette } from './primitives/colors'
import { typography } from './primitives/typography'
import { spacing } from './primitives/spacing'
import { radius } from './primitives/radius'
import { shadow, shadowDark } from './primitives/shadows'
import { motion } from './primitives/motion'
import { layout } from './primitives/layout'
import { semantic } from './semantic'

/** The whole token system in a single object - handy for documentation and tests. */
export const tokens = {
  palette,
  typography,
  spacing,
  radius,
  shadow,
  shadowDark,
  motion,
  layout,
  semantic,
} as const

export type LiroTokens = typeof tokens
