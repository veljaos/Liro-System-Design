import type { CSSVariablesResolver } from '@mantine/core'
import { liroVar } from '@liro/tokens'

/**
 * Prevodi Mantine-ove ugradjene CSS varijable na Liro tokene.
 *
 * Bez ovoga bi postojala dva paralelna sistema boja: Mantine bi crtao svoje
 * povrsine iz `theme.colors.dark`, a nase komponente iz `--liro-*`. Rezultat
 * bi bio dark rezim u kojem se pola ekrana slaze a pola ne.
 *
 * Isti objekat se prosledjuje i `light` i `dark` bloku jer `--liro-*`
 * varijable vec same menjaju vrednost po semi - ovde samo moramo da
 * nadjacamo Mantine-ove vrednosti u oba selektora zbog specificnosti.
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
