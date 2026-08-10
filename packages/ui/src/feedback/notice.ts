'use client'

import { notifications } from '@mantine/notifications'
import { AlertTriangle, CheckCircle2, CircleX, Info } from 'lucide-react'
import { createElement } from 'react'
import { resolveLabel, type Locale, type LocalizedLabel } from '@liro/i18n'
import { INTENT_FAMILY_COLOR } from '@liro/tokens'

/**
 * Notifications.
 *
 * Same reason as with buttons: the developer chooses what happened, not what
 * it looks like. Success is always green and disappears by itself, an error
 * is always red and waits for the user to close it — because an error
 * message that disappears after three seconds is the same as no message at
 * all.
 */

export type NoticeKind = 'success' | 'error' | 'warning' | 'info'

interface NoticeStyle {
  color: string
  icon: typeof CheckCircle2
  /** `false` means the notification stays until the user closes it. */
  autoClose: number | false
}

const NOTICE_STYLE: Record<NoticeKind, NoticeStyle> = {
  success: { color: INTENT_FAMILY_COLOR.positive, icon: CheckCircle2, autoClose: 3500 },
  info: { color: INTENT_FAMILY_COLOR.primary, icon: Info, autoClose: 4000 },
  warning: { color: INTENT_FAMILY_COLOR.caution, icon: AlertTriangle, autoClose: 6000 },
  error: { color: INTENT_FAMILY_COLOR.destructive, icon: CircleX, autoClose: false },
}

export interface NoticeOptions {
  title?: LocalizedLabel
  message: LocalizedLabel
  /** Language for resolving the label; defaults to Serbian. */
  locale?: Locale
  /** The same `id` replaces the previous notification instead of adding a new one. */
  id?: string
}

function show(kind: NoticeKind, options: NoticeOptions) {
  const style = NOTICE_STYLE[kind]
  const locale = options.locale ?? 'sr'

  notifications.show({
    id: options.id,
    color: style.color,
    icon: createElement(style.icon, { size: 18 }),
    title: options.title ? resolveLabel(options.title, locale) : undefined,
    message: resolveLabel(options.message, locale),
    autoClose: style.autoClose,
    withBorder: true,
    radius: 'md',
  })
}

export const notice = {
  success: (options: NoticeOptions) => show('success', options),
  error: (options: NoticeOptions) => show('error', options),
  warning: (options: NoticeOptions) => show('warning', options),
  info: (options: NoticeOptions) => show('info', options),

  /** A notification that awaits an outcome — replace it with `success` or `error` using the same `id`. */
  loading: (options: NoticeOptions) => {
    notifications.show({
      id: options.id,
      loading: true,
      color: INTENT_FAMILY_COLOR.primary,
      title: options.title ? resolveLabel(options.title, options.locale ?? 'sr') : undefined,
      message: resolveLabel(options.message, options.locale ?? 'sr'),
      autoClose: false,
      withCloseButton: false,
      radius: 'md',
    })
  },

  update: (kind: Exclude<NoticeKind, 'info'>, options: NoticeOptions & { id: string }) => {
    const style = NOTICE_STYLE[kind]
    notifications.update({
      id: options.id,
      loading: false,
      color: style.color,
      icon: createElement(style.icon, { size: 18 }),
      title: options.title ? resolveLabel(options.title, options.locale ?? 'sr') : undefined,
      message: resolveLabel(options.message, options.locale ?? 'sr'),
      autoClose: style.autoClose,
      withCloseButton: true,
      radius: 'md',
    })
  },

  dismiss: (id: string) => notifications.hide(id),
  dismissAll: () => notifications.clean(),
}

const SAVED: LocalizedLabel = { sr: 'Sačuvano', 'sr-Cyrl': 'Сачувано', en: 'Saved' }
const DELETED: LocalizedLabel = { sr: 'Obrisano', 'sr-Cyrl': 'Обрисано', en: 'Deleted' }
const FAILED: LocalizedLabel = {
  sr: 'Radnja nije uspela',
  'sr-Cyrl': 'Радња није успела',
  en: 'The action failed',
}

/**
 * The three most common outcomes as ready-made messages.
 *
 * They exist so that thirty modules do not end up with thirty different texts
 * for the same thing — "Successfully saved!", "Data has been saved",
 * "It's saved".
 */
export const commonNotice = {
  saved: (message?: LocalizedLabel) => notice.success({ title: SAVED, message: message ?? SAVED }),
  deleted: (message?: LocalizedLabel) => notice.success({ title: DELETED, message: message ?? DELETED }),
  failed: (error: unknown) =>
    notice.error({
      title: FAILED,
      message: error instanceof Error ? error.message : String(error),
    }),
}


const UNDO: LocalizedLabel = { sr: 'Poništi', 'sr-Cyrl': 'Поништи', en: 'Undo' }

export interface UndoNoticeOptions extends NoticeOptions {
  onUndo: () => void
  /** How long undo stays possible; defaults to 7 seconds. */
  timeout?: number
}

/**
 * A notification with the ability to undo.
 *
 * A replacement for the "Are you sure?" question on actions that can be
 * reversed. Confirmation before an action slows things down all hundred
 * times the user is sure, to help in the one time they are not. Undo after
 * the action works the other way around.
 *
 * Confirmation stays only where there is no going back — deleting an
 * account, voiding a posted document, submitting to an authority.
 */
export function undoNotice(options: UndoNoticeOptions) {
  const locale = options.locale ?? 'sr'
  const id = options.id ?? `undo-${Date.now()}`

  notifications.show({
    id,
    color: INTENT_FAMILY_COLOR.neutral,
    title: options.title ? resolveLabel(options.title, locale) : undefined,
    message: createElement(
      'span',
      { style: { display: 'inline-flex', alignItems: 'center', gap: 8 } },
      resolveLabel(options.message, locale),
      createElement(
        'button',
        {
          type: 'button',
          onClick: () => {
            options.onUndo()
            notifications.hide(id)
          },
          style: {
            background: 'none',
            border: 'none',
            padding: 0,
            cursor: 'pointer',
            font: 'inherit',
            fontWeight: 700,
            color: 'var(--liro-text-brand)',
            textDecoration: 'underline',
          },
        },
        resolveLabel(UNDO, locale),
      ),
    ),
    autoClose: options.timeout ?? 7000,
    withBorder: true,
    radius: 'md',
  })
}
