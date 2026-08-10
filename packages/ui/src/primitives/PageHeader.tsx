import { Box, Divider, Flex, Skeleton, Stack, Text, Title } from '@mantine/core'
import type { LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'
import { liroVar } from '@liro/tokens'

export interface PageHeaderViewProps {
  /** Already-resolved text, or a finished node when the title carries a badge in itself. */
  title?: ReactNode
  description?: string
  icon?: LucideIcon
  /** Status badge or similar marker next to the title. */
  badge?: ReactNode
  /**
   * "Back" button as a finished node.
   *
   * Deliberately not `onBack: () => void`. A function cannot cross the
   * server/client boundary, so a server page passing it would crash on
   * render. A server page sends a `<Link>` here, a client page an `<ActionIcon>`.
   */
  back?: ReactNode
  /** Buttons on the right side. */
  actions?: ReactNode
  loading?: boolean
  withDivider?: boolean
  /** Tabs or filters below the title. */
  children?: ReactNode
}

export function PageHeader({
  title,
  description,
  icon: Icon,
  badge,
  back,
  actions,
  loading = false,
  withDivider = false,
  children,
}: PageHeaderViewProps) {
  const hasTitle = title !== undefined && title !== null

  if (!hasTitle && !actions && !children && !back) return null

  return (
    <Stack gap="md" mb="lg">
      <Flex
        direction={{ base: 'column', sm: 'row' }}
        justify="space-between"
        align={{ base: 'stretch', sm: 'center' }}
        gap="md"
      >
        <Flex gap="sm" align="flex-start" wrap="nowrap" style={{ minWidth: 0 }}>
          {back}

          {hasTitle && (
            <>
              {Icon && (
                <Box
                  p={10}
                  style={{
                    borderRadius: 'var(--liro-radius-md)',
                    flexShrink: 0,
                    backgroundColor: liroVar.brand.subtle,
                    color: liroVar.text.brand,
                    display: 'flex',
                  }}
                >
                  <Icon size={20} />
                </Box>
              )}

              <Stack gap={4} style={{ minWidth: 0 }}>
                {loading ? (
                  <>
                    <Skeleton height={24} width={160} />
                    {description && <Skeleton height={14} width={220} mt={4} />}
                  </>
                ) : (
                  <>
                    <Flex align="center" gap="xs" wrap="wrap">
                      <Title
                        order={2}
                        fw={600}
                        style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                      >
                        {title}
                      </Title>
                      {badge}
                    </Flex>
                    {description && (
                      <Text size="xs" style={{ color: liroVar.text.secondary }}>
                        {description}
                      </Text>
                    )}
                  </>
                )}
              </Stack>
            </>
          )}
        </Flex>

        {actions && (
          <Flex gap="xs" wrap="wrap" justify={{ base: 'flex-start', sm: 'flex-end' }}>
            {actions}
          </Flex>
        )}
      </Flex>

      {children}
      {withDivider && <Divider />}
    </Stack>
  )
}