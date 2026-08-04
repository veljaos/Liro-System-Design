import { Divider, Group, Paper, Stack, Text, Title } from '@mantine/core'
import type { LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'
import { liroVar } from '@liro/tokens'

export interface SectionCardViewProps {
  title?: string
  description?: string
  icon?: LucideIcon
  /** Dugmad u gornjem desnom uglu. Prosledi gotov cvor - i klijentski sme. */
  actions?: ReactNode
  children: ReactNode
  /** Uklanja unutrasnji razmak - za sekcije koje sadrze tabelu do ivice. */
  flush?: boolean
  withDivider?: boolean
}

/**
 * Kartica koja grupise jednu celinu na stranici sa detaljima.
 *
 * Postoji da bi svaka sekcija imala isti razmak, istu tezinu naslova i istu
 * poziciju akcija. Bez nje se svaka stranica sa detaljima pomalo razlikuje.
 */
export function SectionCard({
  title,
  description,
  icon: Icon,
  actions,
  children,
  flush = false,
  withDivider = true,
}: SectionCardViewProps) {
  const hasHeader = Boolean(title || actions)

  return (
    <Paper
      withBorder
      radius="lg"
      style={{ backgroundColor: liroVar.surface.raised, borderColor: liroVar.border.default }}
    >
      {hasHeader && (
        <>
          <Group justify="space-between" wrap="nowrap" align="flex-start" p="md" pb={description ? 'sm' : 'md'}>
            <Group gap="sm" wrap="nowrap" style={{ minWidth: 0 }}>
              {Icon && (
                <span style={{ color: liroVar.text.secondary, display: 'flex', flexShrink: 0 }}>
                  <Icon size={18} />
                </span>
              )}
              <Stack gap={2} style={{ minWidth: 0 }}>
                {title && <Title order={4}>{title}</Title>}
                {description && (
                  <Text size="xs" style={{ color: liroVar.text.secondary }}>{description}</Text>
                )}
              </Stack>
            </Group>
            {actions && <Group gap="xs" wrap="nowrap">{actions}</Group>}
          </Group>
          {withDivider && <Divider color={liroVar.border.subtle} />}
        </>
      )}

      {flush ? children : <div style={{ padding: 'var(--liro-space-md)' }}>{children}</div>}
    </Paper>
  )
}