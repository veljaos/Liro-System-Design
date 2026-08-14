'use client'

import type { ReactNode } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  Bell,
  Home,
  Receipt,
  ScrollText,
  Settings,
  Users,
} from 'lucide-react'
import { AppShellTemplate, type Crumb } from '@liro/templates'
import { LiroAppProvider, type NavItem } from '@liro/ui'

/**
 * Frame for the demo application.
 *
 * Deliberately different from `DocsShell`: examples should look like a real
 * product, not a documentation page. When a working screen is opened, the
 * header carries the Liro application's navigation, not a list of
 * categories.
 */
const APP_NAV: NavItem[] = [
  { id: 'home', label: { en: 'Home' }, href: '/examples/launchpad', icon: Home },
  { id: 'employees', label: { en: 'Employees' }, href: '/examples/employees', icon: Users },
  { id: 'documents', label: { en: 'Documents' }, href: '/examples/documents', icon: Receipt },
  { id: 'receipts', label: { en: 'Fiscal receipts' }, href: '/examples/fiscal-receipts', icon: ScrollText },
  { id: 'notifications', label: { en: 'Notifications' }, href: '/examples/notifications', icon: Bell },
]

const DEMO_USER = {
  id: 'u1',
  name: 'Veljko Ostojić',
  email: 'veljko@liro.rs',
  role: 'Vlasnik',
}

export function DemoAppShell({
  children,
  breadcrumbs = [],
}: {
  children: ReactNode
  breadcrumbs?: Crumb[]
}) {
  const pathname = usePathname()
  const router = useRouter()

  return (
    <LiroAppProvider
      config={{
        name: 'Liro Business App',
        shortName: 'Liro',
        homeHref: '/examples/launchpad',
        linkComponent: Link,
        navigation: APP_NAV,
      }}
    >
      <AppShellTemplate
        user={DEMO_USER}
        pathname={pathname}
        breadcrumbs={breadcrumbs}
        notificationCount={3}
        onNotificationsClick={() => router.push('/application')}
        userMenuItems={[
          { label: { en: 'Account settings' }, icon: Settings, onClick: () => router.push('/account') },
          { label: { en: 'Notifications' }, icon: Bell, onClick: () => {} },
        ]}
        onLogout={() => router.push('/examples/login')}
      >
        {children}
      </AppShellTemplate>
    </LiroAppProvider>
  )
}
