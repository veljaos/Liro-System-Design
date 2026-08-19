'use client'

import { Modal, Text } from '@mantine/core'
import { useI18n, type LocalizedLabel, type TranslationKey } from '@liro/i18n'
import { AutoForm } from './AutoForm'
import type { FieldSchema } from './types'

export interface FormModalProps {
  opened: boolean
  onClose: () => void
  schema: FieldSchema[]
  /** Filled in means edit, empty means new entry. */
  defaultValues?: Record<string, unknown>
  onSubmit: (values: Record<string, unknown>) => void | Promise<void>
  submitting?: boolean
  title?: LocalizedLabel
  size?: string | number
}

const EDIT_TITLE: TranslationKey = 'forms.record.editTitle'
const CREATE_TITLE: TranslationKey = 'forms.record.createTitle'

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
        /* Without changing the key, the form would keep the previous row's
           values when the modal reopens over a different record. */
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
