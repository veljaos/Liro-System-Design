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
 * Okvir demonstracione aplikacije.
 *
 * Razlikuje se od `DocsShell`-a namerno: primeri treba da izgledaju kao pravi
 * proizvod, ne kao stranica dokumentacije. Kada se otvori radni ekran, u
 * zaglavlju stoji navigacija Liro aplikacije, a ne spisak kategorija.
 */
const APP_NAV: NavItem[] = [
  { id: 'home', label: { sr: 'Početna', en: 'Home' }, href: '/examples/launchpad', icon: Home },
  { id: 'employees', label: { sr: 'Zaposlena lica', en: 'Employees' }, href: '/examples/employees', icon: Users },
  { id: 'documents', label: { sr: 'Dokumenti', en: 'Documents' }, href: '/examples/documents', icon: Receipt },
  { id: 'receipts', label: { sr: 'Fiskalni računi', en: 'Fiscal receipts' }, href: '/examples/fiscal-receipts', icon: ScrollText },
  { id: 'notifications', label: { sr: 'Obaveštenja', en: 'Notifications' }, href: '/examples/notifications', icon: Bell },
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
          { label: { sr: 'Podešavanja naloga', en: 'Account settings' }, icon: Settings, onClick: () => router.push('/account') },
          { label: { sr: 'Obaveštenja', en: 'Notifications' }, icon: Bell, onClick: () => {} },
        ]}
        onLogout={() => router.push('/examples/login')}
      >
        {children}
      </AppShellTemplate>
    </LiroAppProvider>
  )
}
