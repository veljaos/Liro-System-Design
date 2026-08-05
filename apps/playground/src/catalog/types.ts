import type { LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'

/**
 * Katalog.
 *
 * Prethodni prikaz je sve smestio u ugnjezdene kartice, pa je do jednog primera
 * trebalo tri klika i pamcenje gde sta stoji. Ovo prati podelu koju ljudi vec
 * poznaju sa `ui.mantine.dev`: grupa -> kategorija -> imenovani primer sa
 * sidrom, pregledom i kodom.
 *
 * Vrednost je u tome sto se svaki primer moze poslati kao veza. Kada neko kaze
 * „koristi ovo za spisak", posalje `/category/tables#resource-table` i nema
 * nesporazuma.
 */

export type CatalogGroupId = 'components' | 'blocks' | 'charts' | 'examples' | 'marketing' | 'design'

export interface CatalogEntry {
  /** Sidro u adresi; mora biti jedinstveno unutar kategorije. */
  id: string
  title: string
  description?: string
  /** Zivi prikaz. */
  demo: ReactNode
  /** Kod koji programer kopira. Kratak i potpun, bez uvoza koji se podrazumevaju. */
  code?: string
  /** Paket iz kojeg dolazi, npr. `@liro/ui`. */
  from?: string
  /**
   * Ime komponente (ili vise njih) za tabelu propova.
   * 
   * Kada se izostavi, pokusava se poklapanje po `title`. Navodi se samo kada
   * se naslov primera razlikuje od imena komponente.
   */
  component?: string | string[]
  /** Prikaz zauzima punu sirinu bez okvira - za tabele i sire rasporede. */
  wide?: boolean
  /** Pozadina pregleda; `sunken` za komponente koje su same bele. */
  surface?: 'raised' | 'sunken'
  /** Veza ka ekranu u punoj visini, kada pregled u okviru nema smisla. */
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
