'use client'

import { notifications } from '@mantine/notifications'
import { AlertTriangle, CheckCircle2, CircleX, Info } from 'lucide-react'
import { createElement } from 'react'
import { resolveLabel, type Locale, type LocalizedLabel } from '@liro/i18n'
import { INTENT_FAMILY_COLOR } from '@liro/tokens'

/**
 * Obavestenja.
 *
 * Isti razlog kao kod dugmadi: programer bira sta se desilo, ne kako izgleda.
 * Uspeh je uvek zelen i nestaje sam, greska je uvek crvena i ceka da je
 * korisnik zatvori - jer poruka o gresci koja nestane za tri sekunde je isto
 * sto i poruka koje nije bilo.
 */

export type NoticeKind = 'success' | 'error' | 'warning' | 'info'

interface NoticeStyle {
  color: string
  icon: typeof CheckCircle2
  /** `false` znaci da obavestenje ostaje dok ga korisnik ne zatvori. */
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
  /** Jezik za razresavanje natpisa; podrazumevano srpski. */
  locale?: Locale
  /** Isti `id` zamenjuje prethodno obavestenje umesto da doda novo. */
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

  /** Obavestenje koje ceka ishod - zameni ga sa `success` ili `error` istim `id`. */
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
 * Tri najcesca ishoda kao gotove poruke.
 *
 * Postoje da se u trideset modula ne bi pojavilo trideset razlicitih tekstova
 * za istu stvar - "Uspesno sacuvano!", "Podaci su sacuvani", "Sacuvano je".
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
