'use client'

import { Spotlight, spotlight, type SpotlightActionData } from '@mantine/spotlight'
import { Search } from 'lucide-react'
import { useMemo } from 'react'
import { resolveLabel, useI18n, type LocalizedLabel } from '@liro/i18n'
import { INTENT_FAMILY_COLOR, INTENTS, type ActionIntent } from '@liro/tokens'
import { useCan, useLiroAppOptional, type NavItem } from '../app/LiroAppProvider'

/**
 * Komandna paleta - `Ctrl+K`.
 *
 * Postoji zato sto se ljudsko ponasanje ne menja: ko ceo dan unosi podatke,
 * ne skida ruke sa tastature da bi trazio meni. Paleta spaja navigaciju i
 * radnje na jedno mesto, pa se do bilo kog ekrana stize kucanjem imena.
 *
 * Navigacija se uzima iz `LiroAppProvider`-a i vec je prociscena kroz dozvole,
 * pa paleta ne moze da ponudi ekran do kojeg korisnik nema pravo.
 */

export interface CommandAction {
  id: string
  label: LocalizedLabel
  description?: LocalizedLabel
  onTrigger: () => void
  /** Boja i ikonica se preuzimaju iz kataloga namera. */
  intent?: ActionIntent
  /** Grupa u paleti, npr. "Radnje na ovoj stranici". */
  group?: LocalizedLabel
  keywords?: string[]
}

export interface CommandPaletteProps {
  /** Radnje vezane za trenutni ekran. */
  actions?: CommandAction[]
  /** Kada je `false`, navigacija se ne prikazuje u paleti. */
  withNavigation?: boolean
  onNavigate?: (href: string) => void
}

const NAV_GROUP: LocalizedLabel = { sr: 'Idi na', 'sr-Cyrl': 'Иди на', en: 'Go to' }
const ACTIONS_GROUP: LocalizedLabel = { sr: 'Radnje', 'sr-Cyrl': 'Радње', en: 'Actions' }
const PLACEHOLDER: LocalizedLabel = {
  sr: 'Pretraži ekrane i radnje…',
  'sr-Cyrl': 'Претражи екране и радње…',
  en: 'Search screens and actions…',
}
const NOTHING: LocalizedLabel = { sr: 'Nema rezultata', 'sr-Cyrl': 'Нема резултата', en: 'Nothing found' }

function flattenNav(items: NavItem[]): NavItem[] {
  const out: NavItem[] = []
  for (const item of items) {
    out.push(item)
    if (item.children) out.push(...flattenNav(item.children))
  }
  return out
}

export function CommandPalette({ actions = [], withNavigation = true, onNavigate }: CommandPaletteProps) {
  const { t, locale } = useI18n()
  const app = useLiroAppOptional()
  const can = useCan()

  const data = useMemo<SpotlightActionData[]>(() => {
    const navActions: SpotlightActionData[] =
      withNavigation && onNavigate
        ? flattenNav(app?.navigation ?? [])
            .filter((item) => can(item.permission))
            .map((item) => ({
              id: `nav:${item.id}`,
              label: resolveLabel(item.label, locale),
              group: resolveLabel(NAV_GROUP, locale),
              onClick: () => onNavigate(item.href),
              leftSection: item.icon ? <item.icon size={17} /> : undefined,
            }))
        : []

    const commandActions: SpotlightActionData[] = actions.map((action) => {
      const definition = action.intent ? INTENTS[action.intent] : undefined
      return {
        id: action.id,
        label: resolveLabel(action.label, locale),
        description: action.description ? resolveLabel(action.description, locale) : undefined,
        group: resolveLabel(action.group ?? ACTIONS_GROUP, locale),
        keywords: action.keywords,
        onClick: action.onTrigger,
        leftSection: definition ? (
          <span style={{ color: `var(--mantine-color-${INTENT_FAMILY_COLOR[definition.family]}-6)`, display: 'flex' }}>
            <Search size={17} />
          </span>
        ) : undefined,
      }
    })

    return [...commandActions, ...navActions]
  }, [actions, app, can, locale, onNavigate, withNavigation])

  return (
    <Spotlight
      actions={data}
      shortcut={['mod + K', 'mod + P']}
      nothingFound={t(NOTHING)}
      highlightQuery
      radius="lg"
      searchProps={{
        leftSection: <Search size={18} />,
        placeholder: t(PLACEHOLDER),
      }}
    />
  )
}

/** Otvara paletu iz koda - npr. sa dugmeta za pretragu u zaglavlju. */
export const openCommandPalette = () => spotlight.open()
