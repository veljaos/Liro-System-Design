import { CATEGORIES } from './registry'

/**
 * The list in the left sidebar.
 *
 * Groups follow the path a developer takes the first time: what is this ->
 * how is it wired in -> what is it built from -> what does it look like
 * finished. Categories are derived from the catalog, so adding a new
 * category drops it into the sidebar on its own.
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
