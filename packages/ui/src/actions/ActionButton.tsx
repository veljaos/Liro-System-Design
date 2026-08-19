'use client'

import { Button, Tooltip, type ButtonProps } from '@mantine/core'
import {
  Archive, ArrowLeft, ArrowRight, Ban, Check, CheckCheck, Copy, Download, Eye, FileSpreadsheet,
  FileText, Filter, Pencil, Plus, Printer, RefreshCw, RotateCcw, Save, Send, Settings, Share2,
  ShieldCheck, Trash2, Unlock, Upload, X, type LucideIcon,
} from 'lucide-react'
import type { MouseEventHandler, ReactNode } from 'react'
import { INTENTS, INTENT_FAMILY_COLOR, type ActionIntent } from '@liro/tokens'
import { useI18n, type LocalizedLabel, type TranslationKey } from '@liro/i18n'
import { ShortcutHint } from '../keyboard/ShortcutHint'

/**
 * A button described by intent, not by appearance.
 *
 * Deliberately does NOT accept `color`, `variant`, or `leftSection`. Those
 * three props are the reason two screens in the same application look like
 * two products. Color, weight, and icon are a consequence of what the button
 * does.
 *
 * The label can be changed — "New person" instead of "New" is more precise
 * and useful. The color cannot.
 */

const INTENT_ICON: Record<ActionIntent, LucideIcon> = {
  create: Plus,
  save: Save,
  submit: Check,
  confirm: Check,
  next: ArrowRight,

  verify: ShieldCheck,
  sign: ShieldCheck,
  send: Send,
  sync: Share2,

  pdf: FileText,
  print: Printer,
  preview: Eye,
  download: Download,

  approve: CheckCheck,
  post: CheckCheck,
  excel: FileSpreadsheet,
  complete: Check,

  delete: Trash2,
  reject: X,
  cancelDocument: Ban,

  unlock: Unlock,
  revert: RotateCcw,
  void: Ban,

  edit: Pencil,
  view: Eye,
  filter: Filter,
  refresh: RefreshCw,
  back: ArrowLeft,
  cancel: X,
  duplicate: Copy,
  import: Upload,
  archive: Archive,
  settings: Settings,
  more: Settings,
}

const INTENT_LABEL: Record<ActionIntent, TranslationKey> = {
  create: 'actions.intent.create',
  save: 'actions.intent.save',
  submit: 'actions.intent.submit',
  confirm: 'actions.intent.confirm',
  next: 'actions.intent.next',

  verify: 'actions.intent.verify',
  sign: 'actions.intent.sign',
  send: 'actions.intent.send',
  sync: 'actions.intent.sync',

  pdf: 'actions.intent.pdf',
  print: 'actions.intent.print',
  preview: 'actions.intent.preview',
  download: 'actions.intent.download',

  approve: 'actions.intent.approve',
  post: 'actions.intent.post',
  excel: 'actions.intent.excel',
  complete: 'actions.intent.complete',

  delete: 'actions.intent.delete',
  reject: 'actions.intent.reject',
  /*
  * `Reverse`, not `Void`.
  *
  * `void` and `cancelDocument` both read as cancelling a document, and in
  * English they had the SAME label - two identical buttons in two different
  * families. In Serbian they never were: `Poništi` discards a draft,
  * `Storniraj` issues a reversing document against one already in the books.
  *
  * `Reverse` says what actually happens: a storno IS a reversing document.
  * See docs/intents/caution.md for the line between the two.
  */
  cancelDocument: 'actions.intent.cancelDocument',

  unlock: 'actions.intent.unlock',
  revert: 'actions.intent.revert',
  void: 'actions.intent.void',

  edit: 'actions.intent.edit',
  view: 'actions.intent.view',
  filter: 'actions.intent.filter',
  refresh: 'actions.intent.refresh',
  back: 'actions.intent.back',
  cancel: 'actions.intent.cancel',
  duplicate: 'actions.intent.duplicate',
  import: 'actions.intent.import',
  archive: 'actions.intent.archive',
  settings: 'actions.intent.settings',
  more: 'actions.intent.more',
}

export function intentIcon(intent: ActionIntent): LucideIcon {
  return INTENT_ICON[intent]
}

export function intentColor(intent: ActionIntent): string {
  return INTENT_FAMILY_COLOR[INTENTS[intent].family]
}

export function intentLabel(intent: ActionIntent): TranslationKey {
  return INTENT_LABEL[intent]
}

export interface ActionButtonProps
  extends Omit<ButtonProps, 'color' | 'variant' | 'leftSection' | 'rightSection' | 'children'> {
  intent: ActionIntent
  /** A more precise label — "New person" instead of "New". The color does not change. */
  label?: LocalizedLabel
  onClick?: MouseEventHandler<HTMLButtonElement>
  /** Shown in the description and next to the label; e.g. `['Ctrl', 'N']`. */
  shortcut?: string[]
  /** Hides the label and leaves only the icon; the label moves into the description. */
  iconOnly?: boolean
  /**
   * Raises the weight to `filled` regardless of the default.
   * Used only for the screen's primary action.
   */
  primary?: boolean
  /**
   * Why the button is disabled.
   *
   * A disabled button with no explanation is a dead end: the user sees they
   * cannot proceed, but does not know what to do. When this is passed, the
   * tooltip also works on the disabled button.
   */
  disabledReason?: LocalizedLabel
  type?: 'button' | 'submit' | 'reset'
  'aria-label'?: string
}

export function ActionButton({
  intent,
  label,
  shortcut,
  iconOnly = false,
  primary = false,
  size = 'sm',
  disabledReason,
  ...rest
}: ActionButtonProps) {
  const { t } = useI18n()
  const definition = INTENTS[intent]
  const Icon = INTENT_ICON[intent]
  const text = t(label ?? INTENT_LABEL[intent])
  const variant = primary ? 'filled' : definition.weight

  const button = (
    <Button
      {...rest}
      size={size}
      color={INTENT_FAMILY_COLOR[definition.family]}
      variant={variant}
      leftSection={iconOnly ? undefined : <Icon size={15} />}
      aria-label={iconOnly ? text : rest['aria-label']}
      px={iconOnly ? 8 : undefined}
    >
      {iconOnly ? <Icon size={16} /> : text}
    </Button>
  )

  /*
   * The explanation of why the button is disabled takes priority over the shortcut.
   *
   * `events` is required: by default, Mantine does not show a tooltip on a
   * disabled element, because such an element does not send mouse events —
   * and that is exactly when the explanation is needed most.
   */
  if (rest.disabled && disabledReason) {
    return (
      <Tooltip
        label={t(disabledReason)}
        withArrow
        multiline
        w={240}
        events={{ hover: true, focus: true, touch: true }}
      >
        <span style={{ display: 'inline-flex' }}>{button}</span>
      </Tooltip>
    )
  }

  if (!shortcut && !iconOnly) return button

  return (
    <Tooltip
      label={
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          {text}
          {shortcut && <ShortcutHint keys={shortcut} inverted />}
        </span>
      }
      withArrow
    >
      {button}
    </Tooltip>
  )
}

export interface ActionGroupProps {
  children: ReactNode
  /**
   * Alignment. Right by default.
   *
   * The primary action sits on the right because that is where the eye
   * expects it at the end of a form, and on a phone that is where the thumb
   * is too. Left is used only when the group sits next to text.
   */
  align?: 'left' | 'right'
}

/**
 * Group of buttons with consistent spacing.
 *
 * Exists so the spacing between actions is the same everywhere — not 4px on
 * one screen and 12px on another because one person used `Group gap="xs"`
 * and another `"sm"`.
 */
export function ActionGroup({ children, align = 'right' }: ActionGroupProps) {
  return (
    <div
      style={{
        display: 'flex',
        gap: 'var(--liro-space-xs)',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: align === 'right' ? 'flex-end' : 'flex-start',
      }}
    >
      {children}
    </div>
  )
}
