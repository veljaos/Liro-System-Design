'use client'

import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'
import {
  ForbiddenTemplate,
  LoadingTemplate,
  MaintenanceTemplate,
  NotFoundTemplate,
  ServerErrorTemplate,
  SuspendedTemplate,
} from '@liro/templates'

/**
 * Prekinuti ekrani u punoj visini, bez okvira aplikacije.
 *
 * Namerno bez `PlaygroundShell`-a: ovi ekrani se u proizvodu prikazuju sami,
 * pa i ovde treba da izgledaju tacno tako.
 */
function StatusScreenPreview() {
  const params = useSearchParams()
  const screen = params.get('screen') ?? 'notFound'

  switch (screen) {
    case 'serverError':
      return <ServerErrorTemplate onRetry={() => window.location.reload()} />
    case 'forbidden':
      return <ForbiddenTemplate />
    case 'maintenance':
      return <MaintenanceTemplate />
    case 'suspended':
      return <SuspendedTemplate />
    default:
      return <NotFoundTemplate />
  }
}

export default function StatusExamplePage() {
  return (
    <Suspense fallback={<LoadingTemplate variant="spinner" />}>
      <StatusScreenPreview />
    </Suspense>
  )
}
