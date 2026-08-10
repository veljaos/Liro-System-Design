'use client'

import { ActionIcon } from '@mantine/core'
import { ArrowLeft, type LucideIcon } from 'lucide-react'
import { isValidElement, type ReactNode } from 'react'
import { useI18n, type LocalizedLabel } from '@liro/i18n'
import { PageHeader as PageHeaderView } from '../primitives/PageHeader'

/**
 * Client version: accepts `LocalizedLabel` and `onBack`, resolves the
 * translation through context, and passes finished text to the shared view.
 *
 * For a server page, use `@liro/ui/primitives` and `getServerI18n`.
 */
export interface PageHeaderProps {
  title?: LocalizedLabel | ReactNode
  description?: LocalizedLabel
  icon?: LucideIcon
  /** Status badge or similar marker next to the title. */
  badge?: ReactNode
  /** Shows a "back" button that calls this function. */
  onBack?: () => void
  /** Buttons on the right side. */
  actions?: ReactNode
  loading?: boolean
  withDivider?: boolean
  /** Tabs or filters below the title. */
  children?: ReactNode
}

const BACK_LABEL: LocalizedLabel = { sr: 'Nazad', 'sr-Cyrl': 'Назад', en: 'Back' }

export function PageHeader({
  title,
  description,
  icon,
  badge,
  onBack,
  actions,
  loading = false,
  withDivider = false,
  children,
}: PageHeaderProps) {
  const { t } = useI18n()

  const hasTitle = title !== undefined && title !== null
  const resolvedTitle = hasTitle
    ? isValidElement(title)
      ? title
      : t(title as LocalizedLabel)
    : undefined

  return (
    <PageHeaderView
      title={resolvedTitle}
      description={description ? t(description) : undefined}
      icon={icon}
      badge={badge}
      back={
        onBack ? (
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
        ) : undefined
      }
      actions={actions}
      loading={loading}
      withDivider={withDivider}
    >
      {children}
    </PageHeaderView>
  )
}