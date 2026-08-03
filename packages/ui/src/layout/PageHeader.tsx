'use client'

import { ActionIcon, Box, Divider, Flex, Skeleton, Stack, Text, Title } from '@mantine/core'
import { ArrowLeft, type LucideIcon } from 'lucide-react'
import { isValidElement, type ReactNode } from 'react'
import { liroVar } from '@liro/tokens'
import { useI18n, type LocalizedLabel } from '@liro/i18n'

export interface PageHeaderProps {
  title?: LocalizedLabel | ReactNode
  description?: LocalizedLabel
  icon?: LucideIcon
  /** Status badge ili slicna oznaka pored naslova. */
  badge?: ReactNode
  /** Prikazuje dugme "nazad" koje poziva ovu funkciju. */
  onBack?: () => void
  /** Dugmad sa desne strane. */
  actions?: ReactNode
  loading?: boolean
  withDivider?: boolean
  /** Tabovi ili filteri ispod naslova. */
  children?: ReactNode
}

const BACK_LABEL: LocalizedLabel = { sr: 'Nazad', 'sr-Cyrl': 'Назад', en: 'Back' }

export function PageHeader({
  title,
  description,
  icon: Icon,
  badge,
  onBack,
  actions,
  loading = false,
  withDivider = false,
  children,
}: PageHeaderProps) {
  const { t } = useI18n()
  const hasTitle = title !== undefined && title !== null
  const titleContent = hasTitle
    ? isValidElement(title)
      ? title
      : t(title as LocalizedLabel)
    : null

  if (!hasTitle && !actions && !children && !onBack) return null

  return (
    <Stack gap="md" mb="lg">
      <Flex
        direction={{ base: 'column', sm: 'row' }}
        justify="space-between"
        align={{ base: 'stretch', sm: 'center' }}
        gap="md"
      >
        <Flex gap="sm" align="flex-start" wrap="nowrap" style={{ minWidth: 0 }}>
          {onBack && (
            <ActionIcon
              variant="subtle"
              color="gray"
              size="md"
              radius="md"
              mt={2}
              onClick={onBack}
              aria-label={t(BACK_LABEL)}
            >
              <ArrowLeft size={18} />
            </ActionIcon>
          )}

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
                        style={{
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {titleContent}
                      </Title>
                      {badge}
                    </Flex>
                    {description && (
                      <Text size="xs" style={{ color: liroVar.text.secondary }}>
                        {t(description)}
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
