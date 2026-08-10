import { lightTokens, type SemanticTokens } from './semantic'
import { typography } from './primitives/typography'
import { spacing } from './primitives/spacing'
import { radius } from './primitives/radius'
import { shadow, shadowDark } from './primitives/shadows'
import { motion } from './primitives/motion'
import { layout } from './primitives/layout'

export const CSS_VAR_PREFIX = '--liro'

/** `['surface', 'raised']` -> `--liro-surface-raised` */
export function toCssVarName(path: readonly string[]): string {
  return `${CSS_VAR_PREFIX}-${path.map(kebab).join('-')}`
}

function kebab(value: string): string {
  return value.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase()
}

type Nested = { [key: string]: string | number | Nested }

/** Converts a nested token object into a flat map of `--liro-a-b: value`. */
export function flatten(obj: Nested, prefix: readonly string[] = []): Record<string, string> {
  const out: Record<string, string> = {}
  for (const [key, value] of Object.entries(obj)) {
    const path = [...prefix, key]
    if (value !== null && typeof value === 'object') {
      Object.assign(out, flatten(value as Nested, path))
    } else {
      out[toCssVarName(path)] = String(value)
    }
  }
  return out
}

/** Tokens that don't change with the color scheme. */
export function staticCssVars(): Record<string, string> {
  return {
    ...flatten(typography.fontFamily, ['font']),
    ...flatten(typography.fontSize, ['fontSize']),
    ...flatten(typography.fontWeight, ['fontWeight']),
    ...flatten(typography.lineHeight, ['lineHeight']),
    ...flatten(typography.letterSpacing, ['tracking']),
    ...flatten(typography.heading as unknown as Nested, ['heading']),
    ...flatten(spacing, ['space']),
    ...flatten(radius, ['radius']),
    ...flatten(motion.duration, ['duration']),
    ...flatten(motion.easing, ['easing']),
    ...flatten(layout.size, ['size']),
    ...flatten(layout.breakpoint, ['breakpoint']),
    ...flatten(layout.zIndex as unknown as Nested, ['z']),
  }
}

export function schemeCssVars(tokens: SemanticTokens, scheme: 'light' | 'dark'): Record<string, string> {
  return {
    ...flatten(tokens as unknown as Nested),
    ...flatten(scheme === 'dark' ? shadowDark : shadow, ['shadow']),
  }
}

function toVarTree<T>(obj: T, prefix: readonly string[] = []): T {
  const out: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(obj as Record<string, unknown>)) {
    const path = [...prefix, key]
    out[key] = value !== null && typeof value === 'object'
      ? toVarTree(value, path)
      : `var(${toCssVarName(path)})`
  }
  return out as T
}

/**
 * Same shape as `lightTokens`, but the values are `var(--liro-...)` references.
 * Used in components: `color: liroVar.text.secondary` instead of a hex value.
 * This way a component automatically follows the active scheme with no logic
 * of its own.
 */
export const liroVar: SemanticTokens = toVarTree(lightTokens)
