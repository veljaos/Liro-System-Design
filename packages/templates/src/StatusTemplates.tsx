'use client'

import { Ban, Construction, CreditCard, FileQuestion, Lock, LogIn, ServerCrash } from 'lucide-react'
import type { ElementType } from 'react'
import { StatusScreen, type StatusScreenAction, useLiroAppOptional } from '@liro/ui'
import type { LocalizedLabel, TranslationKey } from '@liro/i18n'

/**
 * Interrupted screens. All of them share the same frame from
 * `StatusScreen` — wordmark, icon in the status color, title, explanation,
 * one or two actions.
 *
 * The texts explain what happened and what the user can do. They do not
 * apologize and do not use technical terms: "The page does not exist" is
 * more usable than "404 Not Found".
 */

interface StatusTemplateProps {
  /** Pass `next/link` so returning home stays client-side. */
  linkComponent?: ElementType
  /** Overrides the default primary action. */
  action?: StatusScreenAction
  secondaryAction?: StatusScreenAction
  title?: LocalizedLabel
  description?: LocalizedLabel
}

const HOME_LABEL: TranslationKey = 'templates.status.home'
const RETRY_LABEL: TranslationKey = 'templates.status.retry'

const NOT_FOUND_TITLE: TranslationKey = 'templates.status.notFound.title'
const NOT_FOUND_DESCRIPTION: TranslationKey = 'templates.status.notFound.description'
const SERVER_ERROR_TITLE: TranslationKey = 'templates.status.serverError.title'
const SERVER_ERROR_DESCRIPTION: TranslationKey = 'templates.status.serverError.description'
const FORBIDDEN_TITLE: TranslationKey = 'templates.status.forbidden.title'
const FORBIDDEN_DESCRIPTION: TranslationKey = 'templates.status.forbidden.description'
const MAINTENANCE_TITLE: TranslationKey = 'templates.status.maintenance.title'
const MAINTENANCE_DESCRIPTION: TranslationKey = 'templates.status.maintenance.description'
const SUSPENDED_TITLE: TranslationKey = 'templates.status.suspended.title'
const SUSPENDED_DESCRIPTION: TranslationKey = 'templates.status.suspended.description'
const SESSION_EXPIRED_TITLE: TranslationKey = 'templates.status.sessionExpired.title'
const SESSION_EXPIRED_DESCRIPTION: TranslationKey = 'templates.status.sessionExpired.description'
const PAYMENT_REQUIRED_TITLE: TranslationKey = 'templates.status.paymentRequired.title'
const PAYMENT_REQUIRED_DESCRIPTION: TranslationKey = 'templates.status.paymentRequired.description'
const SIGN_IN_LABEL: TranslationKey = 'templates.status.signIn'

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
      title={title ?? NOT_FOUND_TITLE}
      description={description ?? NOT_FOUND_DESCRIPTION}
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
      title={title ?? SERVER_ERROR_TITLE}
      description={description ?? SERVER_ERROR_DESCRIPTION}
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
      title={title ?? FORBIDDEN_TITLE}
      description={description ?? FORBIDDEN_DESCRIPTION}
      action={action ?? home}
      secondaryAction={secondaryAction}
      linkComponent={linkComponent}
    />
  )
}

export interface SessionExpiredTemplateProps extends StatusTemplateProps {
  /** Where the sign-in page lives. Defaults to `/login`. */
  signInHref?: string
}

/**
 * The session ended.
 *
 * Separate from `ForbiddenTemplate`, and the difference is the reason
 * `DataErrorCode` grew: the two need OPPOSITE handling. This user should sign in
 * again; that one should not, and redirecting someone who is already signed in
 * produces a loop, because the API sends them straight back.
 *
 * Until the provider could tell 401 from 403, both arrived as `forbidden` and
 * this screen could not exist.
 */
export function SessionExpiredTemplate({
  linkComponent,
  action,
  secondaryAction,
  title,
  description,
  signInHref = '/login',
}: SessionExpiredTemplateProps) {
  return (
    <StatusScreen
      icon={LogIn}
      /* Orange, not red: nothing is broken and nothing was lost. A session ending
         is the system working as designed. */
      tone="warning"
      eyebrow="401"
      title={title ?? SESSION_EXPIRED_TITLE}
      description={description ?? SESSION_EXPIRED_DESCRIPTION}
      action={action ?? { label: SIGN_IN_LABEL, href: signInHref }}
      secondaryAction={secondaryAction}
      linkComponent={linkComponent}
    />
  )
}

/**
 * The tenant has not paid, or the subscription lapsed.
 *
 * Not `ForbiddenTemplate` either: the user has every right, and nothing they do
 * changes it. That is why there is no default action - the one who can act is
 * whoever administers the account, and the application knows how to reach them.
 */
export function PaymentRequiredTemplate({
  linkComponent,
  action,
  secondaryAction,
  title,
  description,
}: StatusTemplateProps) {
  return (
    <StatusScreen
      icon={CreditCard}
      tone="warning"
      eyebrow="402"
      title={title ?? PAYMENT_REQUIRED_TITLE}
      description={description ?? PAYMENT_REQUIRED_DESCRIPTION}
      action={action}
      secondaryAction={secondaryAction}
      linkComponent={linkComponent}
    />
  )
}

export function MaintenanceTemplate({ title, description, action, secondaryAction, linkComponent }: StatusTemplateProps) {
  return (
    <StatusScreen
      icon={Construction}
      /* Orange, not blue: maintenance is a disruption, and blue is the color
         of a notification with no consequence. */
      tone="warning"
      eyebrow="503"
      title={title ?? MAINTENANCE_TITLE}
      description={description ?? MAINTENANCE_DESCRIPTION}
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
      title={title ?? SUSPENDED_TITLE}
      description={description ?? SUSPENDED_DESCRIPTION}
      action={action}
      secondaryAction={secondaryAction}
      linkComponent={linkComponent}
    />
  )
}