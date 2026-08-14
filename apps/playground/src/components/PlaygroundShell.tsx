'use client'

import type { ReactNode } from 'react'
import { usePathname } from 'next/navigation'
import { AppShellTemplate, RouteProgress } from '@liro/templates'
import type { PageWidth } from '@liro/ui'

const DEMO_USER = {
  id: 'u1',
  name: 'Veljko Ostojić',
  email: 'veljko@liro.rs',
  role: 'admin',
}

/**
 * Playground frame - tabs in the header, no sidebar.
 *
 * This shows exactly how much an application must do to use
 * `AppShellTemplate`: read the pathname from its own router and pass it
 * along. The template knows nothing about routing.
 */
export function PlaygroundShell({
  children,
  width = 'wide',
}: {
  children: ReactNode
  width?: PageWidth
}) {
  const pathname = usePathname()

  return (
    <>
    <RouteProgress pathname={pathname} />
    <AppShellTemplate
      user={DEMO_USER}
      pathname={pathname}
      navigationMode="tabs"
      contentWidth={width}
      onSearch={() => window.alert('This is where the application opens its own search.')}
      notificationCount={3}
      onNotificationsClick={() => {}}
      onLogout={() => window.alert('Logout is the application\'s job, not the template\'s.')}
    >
      {children}
    </AppShellTemplate>
    </>
  )
}
