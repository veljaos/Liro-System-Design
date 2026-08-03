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
  /** Kartice sa zbirnim brojkama iznad tabele. */
  stats?: StatItem[]
  /** Tabovi ili prosireni filteri ispod naslova. */
  subheader?: ReactNode
  /** Tabela - obicno `ResourceTable`. */
  children: ReactNode
  /** Uklanja karticu oko tabele; korisno kada tabela ima svoj okvir. */
  flush?: boolean
}

/**
 * Stranica sa spiskom: naslov, zbirne brojke, tabela.
 *
 * Isti redosled na svakom modulu. Kada korisnik nauci gde stoji dugme za nov
 * unos na zaposlenima, zna gde je i na dokumentima.
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
  /** Uz sadrzaj se prikazuje uza kolona - metapodaci, istorija, prilozi. */
  aside?: ReactNode
  /** Sirina bocne kolone u kolonama Mantine mreze (od 12). */
  asideSpan?: number
}

/**
 * Stranica sa detaljima: naslov sa oznakom stanja, sadrzaj i opciona bocna
 * kolona. Bocna kolona se na uskim ekranima spusta ispod sadrzaja.
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

/** Pocetna strana modula: brojke na vrhu, sadrzaj ispod. */
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
