/**
 * Deljeni sloj: komponente bez direktive, bez hukova i bez funkcija u
 * propovima. Rade i u serverskom i u klijentskom stablu.
 *
 * Pravilo: ovde tekst dolazi kao gotov `string`. Prevod je posao sloja iznad -
 * `@liro/ui` (klijent, kroz `useI18n`) ili stranice (server, kroz
 * `getServerI18n`).
 *
 * U klijentskim ekranima uvozi iz `@liro/ui`, ne odavde. Odavde se uvozi samo
 * kada stranica nema `'use client'`.
 */
export { PageContainer, type PageContainerProps, type PageWidth } from './PageContainer'
export { PageHeader, type PageHeaderViewProps } from './PageHeader'
export { SectionCard, type SectionCardViewProps } from './SectionCard'
export { KeyValueList, type KeyValueListViewProps, type KeyValueViewItem } from './KeyValueList'
export { StatusBadge, type StatusBadgeViewProps, type StatusTone } from './StatusBadge'
export { PersonAvatar, initials, type PersonAvatarProps } from './PersonAvatar'
export { PersonCell, type PersonCellProps } from './PersonCell'