import { CATEGORIES } from './registry'

/**
 * Spisak u levoj traci.
 *
 * Grupe prate put kojim programer prolazi prvi put: sta je ovo -> kako se
 * ukljucuje -> od cega se gradi -> kako izgleda gotovo. Kategorije se izvode iz
 * kataloga, pa dodavanje nove kategorije samo od sebe upada u traku.
 */

export interface SidebarItem {
  label: string
  href: string
}

export interface SidebarGroup {
  title: string
  items: SidebarItem[]
}

const GROUP_TITLES: Record<string, string> = {
  components: 'Komponente',
  blocks: 'Blokovi',
  charts: 'Grafikoni',
  examples: 'Primeri',
  marketing: 'Marketing',
  design: 'Dizajn sistem',
}

function categoryItems(group: string): SidebarItem[] {
  return CATEGORIES.filter((category) => category.group === group).map((category) => ({
    label: category.title,
    href: `/category/${category.slug}`,
  }))
}

export const SIDEBAR: SidebarGroup[] = [
  {
    title: 'Početak',
    items: [
      { label: 'Uvod', href: '/' },
      { label: 'Uključivanje u aplikaciju', href: '/uvod/instalacija' },
      { label: 'Obrasci navigacije', href: '/uvod/navigacija' },
      { label: 'Pravila sistema', href: '/uvod/pravila' },
    ],
  },
  ...Object.entries(GROUP_TITLES)
    .map(([group, title]) => ({ title, items: categoryItems(group) }))
    .filter((group) => group.items.length > 0),
]
