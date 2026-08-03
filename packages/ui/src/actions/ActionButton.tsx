'use client'

import { Button, Tooltip, type ButtonProps } from '@mantine/core'
import {
  Archive, ArrowLeft, ArrowRight, Ban, Check, CheckCheck, Copy, Download, Eye, FileSpreadsheet,
  FileText, Filter, Pencil, Plus, Printer, RefreshCw, RotateCcw, Save, Send, Settings, Share2,
  ShieldCheck, Trash2, Unlock, Upload, X, type LucideIcon,
} from 'lucide-react'
import type { MouseEventHandler, ReactNode } from 'react'
import { INTENTS, INTENT_FAMILY_COLOR, type ActionIntent } from '@liro/tokens'
import { useI18n, type LocalizedLabel } from '@liro/i18n'
import { ShortcutHint } from '../keyboard/ShortcutHint'

/**
 * Dugme koje se opisuje namerom, ne izgledom.
 *
 * Namerno NE prima `color`, `variant` ni `leftSection`. Ta tri propa su razlog
 * zbog kojeg dva ekrana u istoj aplikaciji izgledaju kao dva proizvoda. Boja,
 * tezina i ikonica su posledica onoga sto dugme radi.
 *
 * Natpis se moze zameniti - "Novo lice" umesto "Novo" je preciznije i korisno.
 * Boja se ne moze.
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

const INTENT_LABEL: Record<ActionIntent, LocalizedLabel> = {
  create: { sr: 'Novo', 'sr-Cyrl': 'Ново', en: 'New' },
  save: { sr: 'Sačuvaj', 'sr-Cyrl': 'Сачувај', en: 'Save' },
  submit: { sr: 'Pošalji', 'sr-Cyrl': 'Пошаљи', en: 'Submit' },
  confirm: { sr: 'Potvrdi', 'sr-Cyrl': 'Потврди', en: 'Confirm' },
  next: { sr: 'Dalje', 'sr-Cyrl': 'Даље', en: 'Next' },

  verify: { sr: 'Overi', 'sr-Cyrl': 'Овери', en: 'Verify' },
  sign: { sr: 'Potpiši', 'sr-Cyrl': 'Потпиши', en: 'Sign' },
  send: { sr: 'Pošalji', 'sr-Cyrl': 'Пошаљи', en: 'Send' },
  sync: { sr: 'Sinhronizuj', 'sr-Cyrl': 'Синхронизуј', en: 'Sync' },

  pdf: { sr: 'PDF', 'sr-Cyrl': 'ПДФ', en: 'PDF' },
  print: { sr: 'Štampa', 'sr-Cyrl': 'Штампа', en: 'Print' },
  preview: { sr: 'Pregled', 'sr-Cyrl': 'Преглед', en: 'Preview' },
  download: { sr: 'Preuzmi', 'sr-Cyrl': 'Преузми', en: 'Download' },

  approve: { sr: 'Odobri', 'sr-Cyrl': 'Одобри', en: 'Approve' },
  post: { sr: 'Proknjiži', 'sr-Cyrl': 'Прокњижи', en: 'Post' },
  excel: { sr: 'Excel', 'sr-Cyrl': 'Excel', en: 'Excel' },
  complete: { sr: 'Završi', 'sr-Cyrl': 'Заврши', en: 'Complete' },

  delete: { sr: 'Obriši', 'sr-Cyrl': 'Обриши', en: 'Delete' },
  reject: { sr: 'Odbij', 'sr-Cyrl': 'Одбиј', en: 'Reject' },
  cancelDocument: { sr: 'Storniraj', 'sr-Cyrl': 'Сторнирај', en: 'Void' },

  unlock: { sr: 'Otključaj', 'sr-Cyrl': 'Откључај', en: 'Unlock' },
  revert: { sr: 'Vrati', 'sr-Cyrl': 'Врати', en: 'Revert' },
  void: { sr: 'Poništi', 'sr-Cyrl': 'Поништи', en: 'Void' },

  edit: { sr: 'Izmeni', 'sr-Cyrl': 'Измени', en: 'Edit' },
  view: { sr: 'Prikaži', 'sr-Cyrl': 'Прикажи', en: 'View' },
  filter: { sr: 'Filteri', 'sr-Cyrl': 'Филтери', en: 'Filters' },
  refresh: { sr: 'Osveži', 'sr-Cyrl': 'Освежи', en: 'Refresh' },
  back: { sr: 'Nazad', 'sr-Cyrl': 'Назад', en: 'Back' },
  cancel: { sr: 'Odustani', 'sr-Cyrl': 'Одустани', en: 'Cancel' },
  duplicate: { sr: 'Kopiraj', 'sr-Cyrl': 'Копирај', en: 'Duplicate' },
  import: { sr: 'Uvezi', 'sr-Cyrl': 'Увези', en: 'Import' },
  archive: { sr: 'Arhiviraj', 'sr-Cyrl': 'Архивирај', en: 'Archive' },
  settings: { sr: 'Podešavanja', 'sr-Cyrl': 'Подешавања', en: 'Settings' },
  more: { sr: 'Više', 'sr-Cyrl': 'Више', en: 'More' },
}

export function intentIcon(intent: ActionIntent): LucideIcon {
  return INTENT_ICON[intent]
}

export function intentColor(intent: ActionIntent): string {
  return INTENT_FAMILY_COLOR[INTENTS[intent].family]
}

export interface ActionButtonProps
  extends Omit<ButtonProps, 'color' | 'variant' | 'leftSection' | 'rightSection' | 'children'> {
  intent: ActionIntent
  /** Precizniji natpis - "Novo lice" umesto "Novo". Boja se ne menja. */
  label?: LocalizedLabel
  onClick?: MouseEventHandler<HTMLButtonElement>
  /** Prikazuje se u opisu i uz natpis; npr. `['Ctrl', 'N']`. */
  shortcut?: string[]
  /** Sakriva natpis i ostavlja samo ikonicu; natpis prelazi u opis. */
  iconOnly?: boolean
  /**
   * Podize tezinu na `filled` bez obzira na podrazumevanu.
   * Koristi se samo za glavnu radnju ekrana.
   */
  primary?: boolean
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
   * Poravnanje. Podrazumevano desno.
   *
   * Glavna radnja stoji desno jer je tamo oko ocekuje na kraju forme, a na
   * telefonu je tamo i palac. Levo se koristi samo kada grupa stoji uz tekst.
   */
  align?: 'left' | 'right'
}

/**
 * Grupa dugmadi sa doslednim razmakom.
 *
 * Postoji da bi razmak izmedju radnji bio isti svuda - ne 4px na jednom ekranu
 * i 12px na drugom zato sto je neko koristio `Group gap="xs"` a neko `"sm"`.
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
