'use client'

import { Box, Group, Paper, SimpleGrid, Skeleton, Stack, Text, Tooltip } from '@mantine/core'
import { Lock, type LucideIcon } from 'lucide-react'
import type { ElementType, ReactNode } from 'react'
import { liroVar } from '@liro/tokens'
import { useI18n, type LocalizedLabel } from '@liro/i18n'
import { useLiroAppOptional } from '../app/LiroAppProvider'

export type ModuleTier = 'regular' | 'pro' | 'enterprise'

export interface ModuleItem {
  id: string
  title: LocalizedLabel
  description?: LocalizedLabel
  icon: LucideIcon
  href: string
  tier?: ModuleTier
  /** Modul postoji ali korisnik nema pristup - prikazuje se prigušeno. */
  locked?: boolean
}

const TIER_COLOR: Record<Exclude<ModuleTier, 'regular'>, string> = {
  pro: liroVar.status.info.fg,
  enterprise: liroVar.status.premium.fg,
}

const LOCKED_LABEL: LocalizedLabel = { sr: 'NEDOSTUPNO', 'sr-Cyrl': 'НЕДОСТУПНО', en: 'UNAVAILABLE' }
const LOCKED_TOOLTIP: LocalizedLabel = {
  sr: 'Ovaj modul nije uključen u vaš paket.',
  'sr-Cyrl': 'Овај модул није укључен у ваш пакет.',
  en: 'This module is not part of your plan.',
}

export interface ModuleCardProps {
  module: ModuleItem
  /** Podrazumevano se uzima iz `LiroAppProvider`. */
  linkComponent?: ElementType
}

export function ModuleCard({ module, linkComponent }: ModuleCardProps) {
  const { t } = useI18n()
  const app = useLiroAppOptional()
  const Icon = module.icon
  const locked = module.locked ?? false
  const tier = module.tier ?? 'regular'

  const card = (
    <Paper
      withBorder
      radius="lg"
      p="md"
      className={`liro-module-card${locked ? ' is-locked' : ''}`}
      style={{ backgroundColor: liroVar.surface.raised, borderColor: liroVar.border.default }}
    >
      <Stack gap="xs" align="flex-start">
        <Group justify="space-between" w="100%" wrap="nowrap">
          <span className="liro-module-icon"><Icon size={20} /></span>

          {locked ? (
            <Group gap={4} wrap="nowrap" style={{ color: liroVar.text.tertiary }}>
              <Lock size={12} />
              <Text size="xs" fw={800} style={{ letterSpacing: 'var(--liro-tracking-caps)' }}>
                {t(LOCKED_LABEL)}
              </Text>
            </Group>
          ) : tier !== 'regular' ? (
            <Text
              size="xs"
              fw={800}
              style={{ letterSpacing: 'var(--liro-tracking-caps)', color: TIER_COLOR[tier] }}
            >
              {tier.toUpperCase()}
            </Text>
          ) : null}
        </Group>

        <Text size="sm" fw={700} mt={4}>{t(module.title)}</Text>
        {module.description && (
          <Text size="xs" style={{ color: liroVar.text.secondary }}>{t(module.description)}</Text>
        )}
      </Stack>
    </Paper>
  )

  if (locked) {
    return (
      <Tooltip label={t(LOCKED_TOOLTIP)} withArrow>
        <Box>{card}</Box>
      </Tooltip>
    )
  }

  const Link = (linkComponent ?? app?.linkComponent ?? 'a') as ElementType
  return (
    <Link href={module.href} style={{ textDecoration: 'none', color: 'inherit' }}>
      {card}
    </Link>
  )
}

export interface ModuleGridProps {
  modules: ModuleItem[]
  loading?: boolean
  linkComponent?: ElementType
  /** Prikazuje se kada nema nijednog modula. */
  emptyState?: ReactNode
}

/**
 * Ulazna tabla aplikacije. Prima module kao podatke - ne dovlaci ih sama,
 * jer svaka Liro aplikacija ima svoj izvor liste modula.
 */
export function ModuleGrid({ modules, loading = false, linkComponent, emptyState }: ModuleGridProps) {
  const cols = { base: 1, xs: 2, sm: 3 }

  if (loading) {
    return (
      <SimpleGrid cols={cols} spacing="md">
        {Array.from({ length: 6 }).map((_, index) => (
          <Skeleton key={index} height={132} radius="lg" />
        ))}
      </SimpleGrid>
    )
  }

  if (modules.length === 0 && emptyState) return <>{emptyState}</>

  return (
    <SimpleGrid cols={cols} spacing="md">
      {modules.map((module) => (
        <ModuleCard key={module.id} module={module} linkComponent={linkComponent} />
      ))}
    </SimpleGrid>
  )
}
