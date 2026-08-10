/**
 * Shared layer: components with no directive, no hooks, and no functions in
 * props. They work in both the server and the client tree.
 *
 * Rule: text arrives here as a finished `string`. Translation is the job of
 * the layer above — `@liro/ui` (client, through `useI18n`) or the page
 * (server, through `getServerI18n`).
 *
 * In client screens, import from `@liro/ui`, not from here. Import from here
 * only when the page has no `'use client'`.
 */
export { PageContainer, type PageContainerProps, type PageWidth } from './PageContainer'
export { PageHeader, type PageHeaderViewProps } from './PageHeader'
export { SectionCard, type SectionCardViewProps } from './SectionCard'
export { KeyValueList, type KeyValueListViewProps, type KeyValueViewItem } from './KeyValueList'
export { StatusBadge, type StatusBadgeViewProps, type StatusTone } from './StatusBadge'
export { PersonAvatar, initials, type PersonAvatarProps } from './PersonAvatar'
export { PersonCell, type PersonCellProps } from './PersonCell'
export { ArticleCard, type ArticleCardProps } from './ArticleCard'