import { componentCategories } from './entries/components'
import { otherCategories } from './entries/other'
import { iconCategory } from './entries/icons'
import { gapCategories } from './entries/gaps'
import { operationsCategories } from './entries/operations'
import { structureCategories } from './entries/structure'
import { signingCategories } from './entries/signing'
import { CATALOG_GROUPS, type CatalogCategory, type CatalogGroupId } from './types'

export const CATEGORIES: CatalogCategory[] = [
  ...componentCategories,
  ...gapCategories,
  ...operationsCategories,
  ...structureCategories,
  ...signingCategories,
  iconCategory,
  ...otherCategories,
]

export function categoriesOf(group: CatalogGroupId): CatalogCategory[] {
  return CATEGORIES.filter((category) => category.group === group)
}

export function findCategory(slug: string): CatalogCategory | undefined {
  return CATEGORIES.find((category) => category.slug === slug)
}

export { CATALOG_GROUPS }
export type { CatalogCategory, CatalogGroupId }
