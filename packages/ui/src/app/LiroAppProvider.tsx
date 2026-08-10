'use client'

import { createContext, useContext, useMemo, type ElementType, type ReactNode } from 'react'
import type { LucideIcon } from 'lucide-react'
import type { LocalizedLabel } from '@liro/i18n'

/**
 * Identity and structure of the specific application.
 *
 * Without this, every component that displays the product name or navigation
 * would have to receive them as a prop through three levels, or have them
 * hardcoded. A hardcoded name is the reason a library cannot be shared
 * between Liro Business App and Liro ERP.
 */

export interface NavItem {
  id: string
  label: LocalizedLabel
  href: string
  icon?: LucideIcon
  /** Sub-items are shown as a nested group. */
  children?: NavItem[]
  /** The item is shown only if `can(permission)` returns `true`. */
  permission?: string
  /** Counter next to the item — unread notifications and the like. */
  badge?: number | string
  /** Group the item sits in, e.g. "System". */
  group?: LocalizedLabel
}

export interface AppUser {
  id: string
  name: string
  email?: string
  avatarUrl?: string | null
  role?: string | null
}

export interface LiroAppConfig {
  /** Full name, e.g. "Liro Business App". */
  name: string
  /** Short name for narrow screens, e.g. "Liro". */
  shortName?: string
  /** Logo instead of a text wordmark. */
  logo?: ReactNode
  /** Where clicking the wordmark leads. */
  homeHref?: string
  /** Shown in the footer of the login screen and legal pages. */
  legalName?: string
  /** Main navigation. */
  navigation?: NavItem[]
  /**
   * Permission check. The application knows its own role model; the design
   * system only asks. When not passed, all items are visible.
   */
  can?: (permission: string) => boolean
  /**
   * Component for links — pass `next/link` so navigation stays client-side.
   * Without it, a plain `<a>` is used and the page reloads.
   */
  linkComponent?: ElementType
}

const LiroAppContext = createContext<LiroAppConfig | null>(null)

export interface LiroAppProviderProps {
  config: LiroAppConfig
  children: ReactNode
}

export function LiroAppProvider({ config, children }: LiroAppProviderProps) {
  const value = useMemo(
    () => ({ homeHref: '/', shortName: config.name, ...config }),
    [config],
  )
  return <LiroAppContext.Provider value={value}>{children}</LiroAppContext.Provider>
}

export function useLiroApp(): LiroAppConfig {
  const ctx = useContext(LiroAppContext)
  if (!ctx) throw new Error('useLiroApp must be called within <LiroAppProvider>')
  return ctx
}

/** For components that need to work without a provider too (e.g. an isolated status screen). */
export function useLiroAppOptional(): LiroAppConfig | null {
  return useContext(LiroAppContext)
}

/** `can('employees.edit')`; with no check defined, everything is allowed. */
export function useCan(): (permission?: string) => boolean {
  const app = useLiroAppOptional()
  return useMemo(() => {
    const check = app?.can
    return (permission?: string) => {
      if (!permission) return true
      return check ? check(permission) : true
    }
  }, [app])
}

/** Navigation filtered through permissions — items without rights are not shown. */
export function useNavigation(): NavItem[] {
  const app = useLiroAppOptional()
  const can = useCan()

  return useMemo(() => {
    const filter = (items: NavItem[]): NavItem[] =>
      items
        .filter((item) => can(item.permission))
        .map((item) => (item.children ? { ...item, children: filter(item.children) } : item))
        /* A group left with no allowed sub-item has nothing to show. */
        .filter((item) => !item.children || item.children.length > 0 || Boolean(item.href))

    return filter(app?.navigation ?? [])
  }, [app, can])
}
