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
 * Okvir playground-a - kartice u zaglavlju, bez bočne trake.
 *
 * Ovde se vidi tačno koliko aplikacija mora da uradi da bi koristila
 * `AppShellTemplate`: da pročita putanju iz svog rutera i prosledi je dalje.
 * Šablon o rutiranju ne zna ništa.
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
      onSearch={() => window.alert('Ovde aplikacija otvara svoju pretragu.')}
      notificationCount={3}
      onNotificationsClick={() => {}}
      onLogout={() => window.alert('Odjava je posao aplikacije, ne šablona.')}
    >
      {children}
    </AppShellTemplate>
    </>
  )
}
