import { Box, Divider, Flex, Skeleton, Stack, Text, Title } from '@mantine/core'
import type { LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'
import { liroVar } from '@liro/tokens'

export interface PageHeaderViewProps {
  /** Vec razresen tekst, ili gotov cvor kada naslov nosi oznaku u sebi. */
  title?: ReactNode
  description?: string
  icon?: LucideIcon
  /** Status badge ili slicna oznaka pored naslova. */
  badge?: ReactNode
  /**
   * Dugme "nazad" kao gotov cvor.
   *
   * Namerno nije `onBack: () => void`. Funkcija ne moze preci granicu
   * server/klijent, pa bi serverska stranica koja je prosledi pukla pri
   * renderu. Serverska stranica ovde salje `<Link>`, klijentska `<ActionIcon>`.
   */
  back?: ReactNode
  /** Dugmad sa desne strane. */
  actions?: ReactNode
  loading?: boolean
  withDivider?: boolean
  /** Tabovi ili filteri ispod naslova. */
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