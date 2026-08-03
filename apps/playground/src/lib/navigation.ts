import { Component, LayoutDashboard, Megaphone, Palette, Rows3, TrendingUp } from 'lucide-react'
import type { NavItem } from '@liro/ui'

/**
 * Kartice u zaglavlju vode na pregled filtriran po grupi.
 *
 * Sve ostalo se otvara iz kataloga, pa navigacija ostaje kratka bez obzira
 * koliko primera dodamo.
 */
export const navigation: NavItem[] = [
  { id: 'all', label: { sr: 'Sve', en: 'All' }, href: '/', icon: Component },
  { id: 'components', label: { sr: 'Komponente', en: 'Components' }, href: '/#components', icon: Rows3 },
  { id: 'charts', label: { sr: 'Grafikoni', en: 'Charts' }, href: '/#charts', icon: TrendingUp },
  { id: 'examples', label: { sr: 'Primeri', en: 'Examples' }, href: '/#examples', icon: LayoutDashboard },
  { id: 'marketing', label: { sr: 'Marketing', en: 'Marketing' }, href: '/#marketing', icon: Megaphone },
  { id: 'design', label: { sr: 'Dizajn sistem', en: 'Design' }, href: '/#design', icon: Palette },
]
