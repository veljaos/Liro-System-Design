'use client'

import { ServerErrorTemplate } from '@liro/templates'

export default function Error({ reset }: { error: Error; reset: () => void }) {
  return <ServerErrorTemplate onRetry={reset} />
}
