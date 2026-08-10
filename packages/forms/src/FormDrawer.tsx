'use client'

import { Drawer, Text } from '@mantine/core'
import { useI18n, type LocalizedLabel } from '@liro/i18n'
import { AutoForm } from './AutoForm'
import type { FieldSchema } from './types'

export interface FormDrawerProps {
  opened: boolean
  onClose: () => void
  schema: FieldSchema[]
  defaultValues?: Record<string, unknown>
  onSubmit: (values: Record<string, unknown>) => void | Promise<void>
  submitting?: boolean
  title?: LocalizedLabel
  size?: string | number
  position?: 'left' | 'right'
}

const EDIT_TITLE: LocalizedLabel = { sr: 'Izmena podatka', 'sr-Cyrl': 'Измена податка', en: 'Edit record' }
const CREATE_TITLE: LocalizedLabel = { sr: 'Novi unos', 'sr-Cyrl': 'Нов унос', en: 'New record' }

/**
 * Same as `FormModal`, but from the side. Chosen when the form has many
 * fields or when the user needs to see the list behind it while entering data.
 */
export function FormDrawer({
  opened,
  onClose,
  schema,
  defaultValues,
  onSubmit,
  submitting = false,
  title,
  size = 'lg',
  position = 'right',
}: FormDrawerProps) {
  const { t } = useI18n()
  const isEdit = Boolean(defaultValues)

  return (
    <Drawer
      opened={opened}
      onClose={onClose}
      position={position}
      size={size}
      radius="lg"
      closeOnClickOutside={!submitting}
      closeOnEscape={!submitting}
      title={<Text fw={700} size="sm">{t(title ?? (isEdit ? EDIT_TITLE : CREATE_TITLE))}</Text>}
    >
      <AutoForm
        key={(defaultValues?.id as string) ?? 'create'}
        schema={schema}
        defaultValues={defaultValues}
        onSubmit={onSubmit}
        onCancel={onClose}
        submitting={submitting}
      />
    </Drawer>
  )
}
