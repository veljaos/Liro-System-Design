'use client'

import { Ban, Construction, FileQuestion, Lock, ServerCrash } from 'lucide-react'
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
