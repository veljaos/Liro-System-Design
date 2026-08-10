import type { LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'

/**
 * Catalog.
 *
 * The previous display put everything into nested cards, so reaching one
 * example took three clicks and remembering where things were. This follows
 * a structure people already know from `ui.mantine.dev`: group -> category ->
 * named example with an anchor, a preview, and code.
 *
 * The value is that every example can be sent as a link. When someone says
 * "use this for a list", they send `/category/tables#resource-table` and
 * there is no misunderstanding.
 */

export type CatalogGroupId = 'components' | 'blocks' | 'charts' | 'examples' | 'marketing' | 'design'

export interface CatalogEntry {
  /** Anchor in the URL; must be unique within the category. */
  id: string
  title: string
  description?: string
  /** Live preview. */
  demo: ReactNode
  /** Code the developer copies. Short and complete, without imports that are assumed. */
  code?: string
  /** Package it comes from, e.g. `@liro/ui`. */
  from?: string
  /**
   * Component name (or several) for the props table.
   *
   * When omitted, a match by `title` is attempted. Specified only when the
   * example's title differs from the component name.
   */
  component?: string | string[]
  /** The preview takes the full width with no frame — for tables and wider layouts. */
  wide?: boolean
  /** Preview background; `sunken` for components that are themselves white. */
  surface?: 'raised' | 'sunken'
  /** Link to a full-height screen, when a framed preview does not make sense. */
  fullScreenHref?: string
  tags?: string[]
}

export interface CatalogCategory {
  slug: string
  title: string
  description: string
  group: CatalogGroupId
  icon: LucideIcon
  entries: CatalogEntry[]
}

export interface CatalogGroup {
  id: CatalogGroupId
  title: string
  description: string
}

export const CATALOG_GROUPS: CatalogGroup[] = [
  {
    id: 'components',
    title: 'Komponente',
    description: 'Najsitniji gradivni elementi. Od ovoga se sve ostalo sastavlja.',
  },
  {
    id: 'blocks',
    title: 'Blokovi',
    description: 'Sastavljene celine koje rešavaju jedan zadatak na ekranu.',
  },
  {
    id: 'charts',
    title: 'Grafikoni i kalendar',
    description: 'Prikaz brojeva i vremena, sa Liro paletom i formatiranjem.',
  },
  {
    id: 'examples',
    title: 'Primeri',
    description: 'Cele stranice. Izaberete jednu, uvezete je i radi.',
  },
  {
    id: 'marketing',
    title: 'Marketing',
    description: 'Javne stranice, dokumentacija i pomoć unutar aplikacije.',
  },
  {
    id: 'design',
    title: 'Dizajn sistem',
    description: 'Boje, skale, pravila i sistem rasporeda.',
  },
]
