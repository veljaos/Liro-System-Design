'use client'

import { Button, Group, Modal, Stack, Text } from '@mantine/core'
import { AlertTriangle, type LucideIcon } from 'lucide-react'
import { liroVar, type StatusToneName } from '@liro/tokens'
import { useI18n, type LocalizedLabel, type TranslationKey } from '@liro/i18n'

export interface ConfirmModalProps {
  opened: boolean
  onClose: () => void
  onConfirm: () => void
  loading?: boolean
  title?: LocalizedLabel
  text?: LocalizedLabel
  confirmLabel?: LocalizedLabel
  cancelLabel?: LocalizedLabel
  icon?: LucideIcon
  tone?: StatusToneName
  /** Color of the Mantine confirm button; defaults to following `tone`. */
  confirmColor?: string
}

const TONE_BUTTON_COLOR: Record<StatusToneName, string> = {
  success: 'liro-green',
  warning: 'liro-orange',
  danger: 'liro-red',
  info: 'liro-blue',
  neutral: 'liro-gray',
  premium: 'liro-violet',
}

const DEFAULT_CANCEL: TranslationKey = 'feedback.confirmModal.cancel'
const DEFAULT_CONFIRM: TranslationKey = 'feedback.confirmModal.confirm'

/**
 * General action confirmation. Not tied to deletion - see `DeleteConfirmModal`
 * below for that case, which just fills in the default texts.
 */
export function ConfirmModal({
  opened,
  onClose,
  onConfirm,
  loading = false,
  title,
  text,
  confirmLabel,
  cancelLabel,
  icon: Icon = AlertTriangle,
  tone = 'warning',
  confirmColor,
}: ConfirmModalProps) {
  const { t } = useI18n()

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      centered
      radius="lg"
      closeOnClickOutside={!loading}
      closeOnEscape={!loading}
      title={
        <Group gap="xs" style={{ color: liroVar.status[tone].fg }}>
          <Icon size={18} />
          <Text fw={700} size="sm">{t(title)}</Text>
        </Group>
      }
    >
      <Stack gap="md">
        <Text size="sm" style={{ color: liroVar.text.secondary }}>{t(text)}</Text>
        <Group justify="flex-end" gap="sm" mt="md">
          <Button variant="default" onClick={onClose} disabled={loading}>
            {t(cancelLabel ?? DEFAULT_CANCEL)}
          </Button>
          <Button color={confirmColor ?? TONE_BUTTON_COLOR[tone]} onClick={onConfirm} loading={loading}>
            {t(confirmLabel ?? DEFAULT_CONFIRM)}
          </Button>
        </Group>
      </Stack>
    </Modal>
  )
}

const DELETE_TITLE: TranslationKey = 'feedback.confirmModal.deleteTitle'
const DELETE_TEXT: TranslationKey = 'feedback.confirmModal.deleteText'
const DELETE_CONFIRM: TranslationKey = 'feedback.confirmModal.deleteConfirm'

export type DeleteConfirmModalProps = Omit<ConfirmModalProps, 'tone'>

export function DeleteConfirmModal({
  title = DELETE_TITLE,
  text = DELETE_TEXT,
  confirmLabel = DELETE_CONFIRM,
  ...rest
}: DeleteConfirmModalProps) {
  return <ConfirmModal tone="danger" title={title} text={text} confirmLabel={confirmLabel} {...rest} />
}
