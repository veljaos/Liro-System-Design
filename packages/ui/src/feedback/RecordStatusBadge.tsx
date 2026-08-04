'use client'

import { RECORD_STATUS_TONE, type RecordStatus } from '@liro/tokens'
import { type LocalizedLabel } from '@liro/i18n'
import { StatusBadge } from './StatusBadge'

/**
 * Oznaka stanja zapisa.
 *
 * Isti princip kao kod dugmadi: programer bira stanje, ne boju. Nacrt je uvek
 * siv, dospelo je uvek crveno, proknjizeno uvek zeleno - u svim modulima i
 * svim aplikacijama.
 */

const STATUS_LABEL: Record<RecordStatus, LocalizedLabel> = {
  draft: { sr: 'Nacrt', 'sr-Cyrl': 'Нацрт', en: 'Draft' },
  pending: { sr: 'Na čekanju', 'sr-Cyrl': 'На чекању', en: 'Pending' },
  inReview: { sr: 'U pregledu', 'sr-Cyrl': 'У прегледу', en: 'In review' },
  approved: { sr: 'Odobreno', 'sr-Cyrl': 'Одобрено', en: 'Approved' },
  posted: { sr: 'Proknjiženo', 'sr-Cyrl': 'Прокњижено', en: 'Posted' },
  signed: { sr: 'Potpisano', 'sr-Cyrl': 'Потписано', en: 'Signed' },
  sent: { sr: 'Poslato', 'sr-Cyrl': 'Послато', en: 'Sent' },
  paid: { sr: 'Plaćeno', 'sr-Cyrl': 'Плаћено', en: 'Paid' },
  partiallyPaid: { sr: 'Delimično plaćeno', 'sr-Cyrl': 'Делимично плаћено', en: 'Partially paid' },
  overdue: { sr: 'Dospelo', 'sr-Cyrl': 'Доспело', en: 'Overdue' },
  rejected: { sr: 'Odbijeno', 'sr-Cyrl': 'Одбијено', en: 'Rejected' },
  cancelled: { sr: 'Stornirano', 'sr-Cyrl': 'Сторнирано', en: 'Cancelled' },
  archived: { sr: 'Arhivirano', 'sr-Cyrl': 'Архивирано', en: 'Archived' },
  active: { sr: 'Aktivan', 'sr-Cyrl': 'Активан', en: 'Active' },
  inactive: { sr: 'Neaktivan', 'sr-Cyrl': 'Неактиван', en: 'Inactive' },
  locked: { sr: 'Zaključano', 'sr-Cyrl': 'Закључано', en: 'Locked' },
  error: { sr: 'Greška', 'sr-Cyrl': 'Грешка', en: 'Error' },
}

export interface RecordStatusBadgeProps {
  status: RecordStatus
  /** Precizniji natpis za konkretan modul; boja se ne menja. */
  label?: LocalizedLabel
  withBorder?: boolean
}

export function RecordStatusBadge({ status, label, withBorder }: RecordStatusBadgeProps) {
  return (
    <StatusBadge
      tone={RECORD_STATUS_TONE[status]}
      label={label ?? STATUS_LABEL[status]}
      withBorder={withBorder}
    />
  )
}

export function recordStatusLabel(status: RecordStatus): LocalizedLabel {
  return STATUS_LABEL[status]
}
