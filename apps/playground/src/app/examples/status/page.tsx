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
 * Full-height interstitial screens, without the application frame.
 *
 * Deliberately without `PlaygroundShell`: these screens appear on their own
 * in the product, so they should look exactly like that here too.
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
