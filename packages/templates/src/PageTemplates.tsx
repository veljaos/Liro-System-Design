'use client'

import { Grid, Stack } from '@mantine/core'
import type { LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'
import type { LocalizedLabel } from '@liro/i18n'
import { PageHeader, SectionCard, StatGrid, type StatItem } from '@liro/ui'

interface BasePageProps {
  title?: LocalizedLabel
  description?: LocalizedLabel
  icon?: LucideIcon
  badge?: ReactNode
  actions?: ReactNode
  onBack?: () => void
  loading?: boolean
}

export interface ListPageTemplateProps extends BasePageProps {
  /** Cards with summary figures above the table. */
  stats?: StatItem[]
  /** Tabs or extended filters below the title. */
  subheader?: ReactNode
  /** Table - usually `ResourceTable`. */
  children: ReactNode
  /** Removes the card around the table; useful when the table has its own frame. */
  flush?: boolean
}

/**
 * List page: title, summary figures, table.
 *
 * The same order on every module. When the user learns where the "new
 * entry" button sits on employees, they know where it is on documents too.
 */
export function ListPageTemplate({
  title,
  description,
  icon,
  badge,
  actions,
  onBack,
  loading,
  stats,
  subheader,
  children,
  flush = false,
}: ListPageTemplateProps) {
  return (
    <Stack gap={0}>
      <PageHeader
        title={title}
        description={description}
        icon={icon}
        badge={badge}
        actions={actions}
        onBack={onBack}
        loading={loading}
      >
        {subheader}
      </PageHeader>

      {stats && stats.length > 0 && <StatGrid data={stats} loading={loading} />}

      {flush ? children : <SectionCard flush>{children}</SectionCard>}
    </Stack>
  )
}

export interface DetailPageTemplateProps extends BasePageProps {
  children: ReactNode
  /** A narrow column shown next to the content — metadata, history, attachments. */
  aside?: ReactNode
  /** Width of the side column in Mantine grid columns (out of 12). */
  asideSpan?: number
}

/**
 * Detail page: title with a status badge, content, and an optional side
 * column. The side column drops below the content on narrow screens.
 */
export function DetailPageTemplate({
  title,
  description,
  icon,
  badge,
  actions,
  onBack,
  loading,
  children,
  aside,
  asideSpan = 4,
}: DetailPageTemplateProps) {
  return (
    <Stack gap={0}>
      <PageHeader
        title={title}
        description={description}
        icon={icon}
        badge={badge}
        actions={actions}
        onBack={onBack}
        loading={loading}
      />

      {aside ? (
        <Grid gap="lg">
          <Grid.Col span={{ base: 12, md: 12 - asideSpan }}>
            <Stack gap="md">{children}</Stack>
          </Grid.Col>
          <Grid.Col span={{ base: 12, md: asideSpan }}>
            <Stack gap="md">{aside}</Stack>
          </Grid.Col>
        </Grid>
      ) : (
        <Stack gap="md">{children}</Stack>
      )}
    </Stack>
  )
}

export interface DashboardTemplateProps extends BasePageProps {
  stats?: StatItem[]
  children: ReactNode
}

/** Module home page: figures at the top, content below. */
export function DashboardTemplate({
  title,
  description,
  icon,
  actions,
  loading,
  stats,
  children,
}: DashboardTemplateProps) {
  return (
    <Stack gap={0}>
      <PageHeader
        title={title}
        description={description}
        icon={icon}
        actions={actions}
        loading={loading}
      />
      {stats && stats.length > 0 && <StatGrid data={stats} loading={loading} />}
      <Stack gap="md">{children}</Stack>
    </Stack>
  )
}
