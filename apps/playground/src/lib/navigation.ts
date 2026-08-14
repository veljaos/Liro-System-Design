import { Component, LayoutDashboard, Megaphone, Palette, Rows3, TrendingUp } from 'lucide-react'
import type { NavItem } from '@liro/ui'

/**
 * Tabs in the header lead to a view filtered by group.
 *
 * Everything else opens from the catalog, so the navigation stays short no
 * matter how many examples we add.
 */
export const navigation: NavItem[] = [
  { id: 'all', label: { en: 'All' }, href: '/', icon: Component },
  { id: 'components', label: { en: 'Components' }, href: '/#components', icon: Rows3 },
  { id: 'charts', label: { en: 'Charts' }, href: '/#charts', icon: TrendingUp },
  { id: 'examples', label: { en: 'Examples' }, href: '/#examples', icon: LayoutDashboard },
  { id: 'marketing', label: { en: 'Marketing' }, href: '/#marketing', icon: Megaphone },
  { id: 'design', label: { en: 'Design' }, href: '/#design', icon: Palette },
]
