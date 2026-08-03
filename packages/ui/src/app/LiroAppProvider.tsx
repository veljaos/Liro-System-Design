'use client'

import { createContext, useContext, useMemo, type ElementType, type ReactNode } from 'react'
import type { LucideIcon } from 'lucide-react'
import type { LocalizedLabel } from '@liro/i18n'

/**
 * Identitet i struktura konkretne aplikacije.
 *
 * Bez ovoga bi svaka komponenta koja prikazuje ime proizvoda ili navigaciju
 * morala da ih primi kao prop kroz tri nivoa, ili bi ih imala upisane u sebi.
 * Upisano ime je razlog zbog kojeg se biblioteka ne moze deliti izmedju
 * Liro Business App-a i Liro ERP-a.
 */

export interface NavItem {
  id: string
  label: LocalizedLabel
  href: string
  icon?: LucideIcon
  /** Podstavke se prikazuju kao ugnjezdena grupa. */
  children?: NavItem[]
  /** Stavka se prikazuje samo ako `can(permission)` vrati `true`. */
  permission?: string
  /** Brojac pored stavke - nepročitane notifikacije i slicno. */
  badge?: number | string
  /** Grupa u kojoj stavka stoji, npr. "Sistem". */
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
  /** Puno ime, npr. "Liro Business App". */
  name: string
  /** Skraceno ime za uske ekrane, npr. "Liro". */
  shortName?: string
  /** Logo umesto tekstualnog wordmark-a. */
  logo?: ReactNode
  /** Gde vodi klik na wordmark. */
  homeHref?: string
  /** Prikazuje se u podnozju ekrana za prijavu i pravnih stranica. */
  legalName?: string
  /** Glavna navigacija. */
  navigation?: NavItem[]
  /**
   * Provera dozvole. Aplikacija zna svoj model uloga; dizajn sistem samo
   * pita. Kada nije prosledjena, sve stavke su vidljive.
   */
  can?: (permission: string) => boolean
  /**
   * Komponenta za linkove - prosledi `next/link` da navigacija ostane
   * klijentska. Bez toga se koristi obican `<a>` i stranica se ponovo ucitava.
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
  if (!ctx) throw new Error('useLiroApp mora biti pozvan unutar <LiroAppProvider>')
  return ctx
}

/** Za komponente koje treba da rade i bez providera (npr. izolovan status ekran). */
export function useLiroAppOptional(): LiroAppConfig | null {
  return useContext(LiroAppContext)
}

/** `can('employees.edit')`; bez definisane provere sve je dozvoljeno. */
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

/** Navigacija prociscena kroz dozvole - stavke bez prava se ne prikazuju. */
export function useNavigation(): NavItem[] {
  const app = useLiroAppOptional()
  const can = useCan()

  return useMemo(() => {
    const filter = (items: NavItem[]): NavItem[] =>
      items
        .filter((item) => can(item.permission))
        .map((item) => (item.children ? { ...item, children: filter(item.children) } : item))
        /* Grupa koja je ostala bez ijedne dozvoljene podstavke nema sta da prikaze. */
        .filter((item) => !item.children || item.children.length > 0 || Boolean(item.href))

    return filter(app?.navigation ?? [])
  }, [app, can])
}
