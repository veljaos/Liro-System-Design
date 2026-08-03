'use client'

import { Ban, Construction, FileQuestion, Lock, ServerCrash } from 'lucide-react'
import type { ElementType } from 'react'
import { StatusScreen, type StatusScreenAction, useLiroAppOptional } from '@liro/ui'
import type { LocalizedLabel } from '@liro/i18n'

/**
 * Prekinuti ekrani. Svi dele isti okvir iz `StatusScreen`-a - wordmark, ikonica
 * u boji stanja, naslov, objasnjenje, jedna ili dve radnje.
 *
 * Tekstovi objasnjavaju sta se desilo i sta korisnik moze da uradi. Ne
 * izvinjavaju se i ne koriste tehnicke izraze: "Stranica ne postoji" je
 * upotrebljivije od "404 Not Found".
 */

interface StatusTemplateProps {
  /** Prosledi `next/link` da povratak na pocetnu ostane klijentski. */
  linkComponent?: ElementType
  /** Nadjacava podrazumevanu glavnu radnju. */
  action?: StatusScreenAction
  secondaryAction?: StatusScreenAction
  title?: LocalizedLabel
  description?: LocalizedLabel
}

const HOME_LABEL: LocalizedLabel = { sr: 'Nazad na početnu', 'sr-Cyrl': 'Назад на почетну', en: 'Back to home' }
const RETRY_LABEL: LocalizedLabel = { sr: 'Pokušaj ponovo', 'sr-Cyrl': 'Покушај поново', en: 'Try again' }

function useHomeAction(): StatusScreenAction {
  const app = useLiroAppOptional()
  return { label: HOME_LABEL, href: app?.homeHref ?? '/' }
}

export function NotFoundTemplate({ linkComponent, action, secondaryAction, title, description }: StatusTemplateProps) {
  const home = useHomeAction()
  return (
    <StatusScreen
      icon={FileQuestion}
      tone="neutral"
      eyebrow="404"
      title={title ?? { sr: 'Stranica nije pronađena', 'sr-Cyrl': 'Страница није пронађена', en: 'Page not found' }}
      description={
        description ?? {
          sr: 'Proverite da li je adresa tačno uneta ili se vratite na početnu stranicu.',
          'sr-Cyrl': 'Проверите да ли је адреса тачно унета или се вратите на почетну страницу.',
          en: 'Check the address, or return to the home page.',
        }
      }
      action={action ?? home}
      secondaryAction={secondaryAction}
      linkComponent={linkComponent}
    />
  )
}

export interface ServerErrorTemplateProps extends StatusTemplateProps {
  onRetry?: () => void
}

export function ServerErrorTemplate({
  linkComponent,
  action,
  secondaryAction,
  title,
  description,
  onRetry,
}: ServerErrorTemplateProps) {
  const home = useHomeAction()
  return (
    <StatusScreen
      icon={ServerCrash}
      tone="danger"
      eyebrow="500"
      title={title ?? { sr: 'Došlo je do greške na serveru', 'sr-Cyrl': 'Дошло је до грешке на серверу', en: 'Server error' }}
      description={
        description ?? {
          sr: 'Problem je do nas i radimo na rešavanju. Molimo Vas da pokušate malo kasnije.',
          'sr-Cyrl': 'Проблем је до нас и радимо на решавању. Молимо Вас да покушате мало касније.',
          en: 'The problem is on our side and we are working on it. Please try again shortly.',
        }
      }
      action={action ?? (onRetry ? { label: RETRY_LABEL, onClick: onRetry } : home)}
      secondaryAction={secondaryAction ?? (onRetry ? home : undefined)}
      linkComponent={linkComponent}
    />
  )
}

export function ForbiddenTemplate({ linkComponent, action, secondaryAction, title, description }: StatusTemplateProps) {
  const home = useHomeAction()
  return (
    <StatusScreen
      icon={Lock}
      tone="warning"
      eyebrow="403"
      title={title ?? { sr: 'Pristup je odbijen', 'sr-Cyrl': 'Приступ је одбијен', en: 'Access denied' }}
      description={
        description ?? {
          sr: 'Nemate ovlašćenja za pregled ovog sadržaja.',
          'sr-Cyrl': 'Немате овлашћења за преглед овог садржаја.',
          en: 'You are not authorised to view this content.',
        }
      }
      action={action ?? home}
      secondaryAction={secondaryAction}
      linkComponent={linkComponent}
    />
  )
}

export function MaintenanceTemplate({ title, description, action, secondaryAction, linkComponent }: StatusTemplateProps) {
  return (
    <StatusScreen
      icon={Construction}
      /* Narandzasto, ne plavo: odrzavanje je smetnja u radu, a plava je boja
         obavestenja bez posledice. */
      tone="warning"
      eyebrow="503"
      title={title ?? { sr: 'Sistem je trenutno nedostupan', 'sr-Cyrl': 'Систем је тренутно недоступан', en: 'System unavailable' }}
      description={
        description ?? {
          sr: 'Radimo na unapređenju sistema. Hvala Vam na strpljenju.',
          'sr-Cyrl': 'Радимо на унапређењу система. Хвала Вам на стрпљењу.',
          en: 'We are improving the system. Thank you for your patience.',
        }
      }
      action={action}
      secondaryAction={secondaryAction}
      linkComponent={linkComponent}
    />
  )
}

export function SuspendedTemplate({ title, description, action, secondaryAction, linkComponent }: StatusTemplateProps) {
  return (
    <StatusScreen
      icon={Ban}
      tone="danger"
      title={title ?? { sr: 'Nalog je privremeno zaključan', 'sr-Cyrl': 'Налог је привремено закључан', en: 'Account locked' }}
      description={
        description ?? {
          sr: 'Pristup Vam je obustavljen. Za više informacija možete kontaktirati podršku.',
          'sr-Cyrl': 'Приступ Вам је обустављен. За више информација можете контактирати подршку.',
          en: 'Your access has been suspended. Contact support for more information.',
        }
      }
      action={action}
      secondaryAction={secondaryAction}
      linkComponent={linkComponent}
    />
  )
}
