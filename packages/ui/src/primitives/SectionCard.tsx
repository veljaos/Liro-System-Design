import { Divider, Group, Paper, Stack, Text, Title } from '@mantine/core'
import type { LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'
import { liroVar } from '@liro/tokens'

export interface SectionCardViewProps {
  title?: string
  description?: string
  icon?: LucideIcon
  /** Buttons in the top-right corner. Pass a finished node — a client one is fine too. */
  actions?: ReactNode
  children: ReactNode
  /** Removes internal padding — for sections that contain a table to the edge. */
  flush?: boolean
  withDivider?: boolean
}

/**
 * A card that groups one unit on a detail page.
 *
 * Exists so every section has the same padding, the same title weight, and
 * the same position for actions. Without it, every detail page differs
 * slightly.
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