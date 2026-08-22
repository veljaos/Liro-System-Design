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
  /**
   * The item is shown only if the module is enabled for the tenant.
   * 
   * Separate from `permission`: a user may have every right in the payroll module
   * and still not see it, because the tenant did not buy it. Permission answers
   * "may this person", `module` answers "does this customer have it".
   */
  module?: string
  /**
   * The tier the item requires, if any.
   * 
   * When set and the tenant is below it, the item is shown DISABLED with a hint
   * rather than hidden - the difference between "not for you" and "not in your
   * plan" is the difference between confusion and an upgrade.
   */
  tier?: string
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

/**
 * Why the tenant cannot be written to, or that it can.
 * 
 * `read_only` is deliberately not `suspended`: a tenant in a closed accounting
 * period is working normally and simply cannot post to a period that is shut. A
 * suspended one cannot do anything.
 */
export type TenantState = 'active' | 'read_only' | 'suspended' | 'archived'

export interface ReadOnlyState {
  readOnly: boolean
  /** Why, for the message. `undefined` when writing is allowed. */
  reason?: Exclude<TenantState, 'active'>
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
   * State of the tenant this session belongs to.
   * 
   * Not a boolean, because the reason decides the screen: an unpaid tenant, an
   * archived one and a closed accounting period all block writing and each needs
   * different words. `limits.readOnly` from `/me` is the derived value; this is
   * what it was derived from.
   */
  tenantState?: TenantState
  /** Modules the tenant has. When absent, every item is shown. */
  modules?: string[]
  /** Plan the tenant is on, for items that declare a `tier`. */
  tier?: string
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

/**
 * Whether anything may be written, and why not.
 * 
 * A first-class concept rather than a prop each screen passes, for the same reason
 * `intent` is: solved per screen, it gets forgotten on the thirty-first. A tenant
 * that has not paid must not be able to post an invoice from the one screen
 * somebody missed.
 * 
 * `ActionButton` reads this itself, so an application gets the behaviour without
 * doing anything. The hook is for the rare screen that needs to explain the state
 * rather than just obey it.
 */
export function useReadOnly(): ReadOnlyState {
  const app = useLiroAppOptional()

  return useMemo(() => {
    const state = app?.tenantState ?? 'active'
    if (state === 'active') return { readOnly: false }
    return { readOnly: true, reason: state }
  }, [app])
}

/** Navigation filtered through permissions — items without rights are not shown. */
export function useNavigation(): NavItem[] {
  const app = useLiroAppOptional()
  const can = useCan()

  return useMemo(() => {
    const filter = (items: NavItem[]): NavItem[] =>
      items
        /* Permission and module are two different questions, and both must pass:
           the right to do it, and the customer having bought it. */
        .filter((item) => can(item.permission))
        .filter((item) => !item.module || !app?.modules || app.modules.includes(item.module))
        .map((item) => (item.children ? { ...item, children: filter(item.children) } : item))
        /* A group left with no allowed sub-item has nothing to show. */
        .filter((item) => !item.children || item.children.length > 0 || Boolean(item.href))

    return filter(app?.navigation ?? [])
  }, [app, can])
}