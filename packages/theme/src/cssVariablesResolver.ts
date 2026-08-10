import type { CSSVariablesResolver } from '@mantine/core'
import { liroVar } from '@liro/tokens'

/**
 * Translates Mantine's built-in CSS variables to Liro tokens.
 *
 * Without this, there would be two parallel color systems: Mantine would
 * draw its surfaces from `theme.colors.dark`, while our components draw from
 * `--liro-*`. The result would be a dark mode where half the screen matches
 * and half does not.
 *
 * The same object is passed to both the `light` and `dark` blocks because
 * the `--liro-*` variables already change value by scheme on their own —
 * here we only need to override Mantine's values in both selectors because
 * of specificity.
 */
const mapping = {
  '--mantine-color-body': liroVar.surface.page,
  '--mantine-color-text': liroVar.text.primary,
  '--mantine-color-dimmed': liroVar.text.secondary,
  '--mantine-color-placeholder': liroVar.text.tertiary,
  '--mantine-color-anchor': liroVar.text.link,
  '--mantine-color-default': liroVar.surface.raised,
  '--mantine-color-default-hover': liroVar.surface.hover,
  '--mantine-color-default-color': liroVar.text.primary,
  '--mantine-color-default-border': liroVar.border.default,
  '--mantine-color-disabled': liroVar.surface.disabled,
  '--mantine-color-disabled-color': liroVar.text.disabled,
  '--mantine-color-disabled-border': liroVar.border.subtle,
  '--mantine-color-error': liroVar.status.danger.fg,
  '--mantine-color-overlay': liroVar.surface.backdrop,
  '--mantine-primary-color-filled': liroVar.brand.solid,
  '--mantine-primary-color-filled-hover': liroVar.brand.solidHover,
  '--mantine-primary-color-light': liroVar.brand.subtle,
  '--mantine-primary-color-light-hover': liroVar.brand.subtleHover,
}

export const liroCssVariablesResolver: CSSVariablesResolver = () => ({
  variables: {},
  light: mapping,
  dark: mapping,
})
