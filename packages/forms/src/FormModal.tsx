'use client'

import { Modal, Text } from '@mantine/core'
import { useI18n, type LocalizedLabel } from '@liro/i18n'
import { AutoForm } from './AutoForm'
import type { FieldSchema } from './types'

export interface FormModalProps {
  opened: boolean
  onClose: () => void
  schema: FieldSchema[]
  /** Popunjeno znaci izmena, prazno znaci nov unos. */
  defaultValues?: Record<string, unknown>
  onSubmit: (values: Record<string, unknown>) => void | Promise<void>
  submitting?: boolean
  title?: LocalizedLabel
  size?: string | number
}

const EDIT_TITLE: LocalizedLabel = { sr: 'Izmena podatka', 'sr-Cyrl': 'Измена податка', en: 'Edit record' }
const CREATE_TITLE: LocalizedLabel = { sr: 'Novi unos', 'sr-Cyrl': 'Нов унос', en: 'New record' }

export function FormModal({
  opened,
  onClose,
  schema,
  defaultValues,
  onSubmit,
  submitting = false,
  title,
  size = 'lg',
}: FormModalProps) {
  const { t } = useI18n()
  const isEdit = Boolean(defaultValues)

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      size={size}
      radius="lg"
      centered
      closeOnClickOutside={!submitting}
      closeOnEscape={!submitting}
      title={<Text fw={700} size="sm">{t(title ?? (isEdit ? EDIT_TITLE : CREATE_TITLE))}</Text>}
    >
      <AutoForm
        /* Bez promene kljuca forma zadrzi vrednosti prethodnog reda kada se
           modal ponovo otvori nad drugim zapisom. */
        key={(defaultValues?.id as string) ?? 'create'}
        schema={schema}
        defaultValues={defaultValues}
        onSubmit={onSubmit}
        onCancel={onClose}
        submitting={submitting}
      />
    </Modal>
  )
}
