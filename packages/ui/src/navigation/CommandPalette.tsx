'use client'

import { Spotlight, spotlight, type SpotlightActionData } from '@mantine/spotlight'
import { Search } from 'lucide-react'
import { useMemo } from 'react'
import { resolveLabel, useI18n, type LocalizedLabel, type TranslationKey } from '@liro/i18n'
import { INTENT_FAMILY_COLOR, INTENTS, type ActionIntent } from '@liro/tokens'
import { useCan, useLiroAppOptional, type NavItem } from '../app/LiroAppProvider'

/**
 * Command palette - `Ctrl+K`.
 *
 * Exists because human behavior does not change: someone entering data all
 * day does not take their hands off the keyboard to hunt for a menu. The
 * palette brings navigation and actions into one place, so any screen is
 * reached by typing its name.
 *
 * Navigation is taken from `LiroAppProvider` and is already filtered through
 * permissions, so the palette cannot offer a screen the user has no right to.
 */

export interface CommandAction {
  id: string
  label: LocalizedLabel
  description?: LocalizedLabel
  onTrigger: () => void
  /** Color and icon are taken from the intent catalog. */
  intent?: ActionIntent
  /** Group in the palette, e.g. "Actions on this page". */
  group?: LocalizedLabel
  keywords?: string[]
}

export interface CommandPaletteProps {
  /** Actions tied to the current screen. */
  actions?: CommandAction[]
  /** When `false`, navigation is not shown in the palette. */
  withNavigation?: boolean
  onNavigate?: (href: string) => void
}

const NAV_GROUP: TranslationKey = 'nav.commandPalette.goTo'
const ACTIONS_GROUP: TranslationKey = 'nav.commandPalette.actions'
const PLACEHOLDER: TranslationKey = 'nav.commandPalette.placeholder'
const NOTHING: TranslationKey = 'nav.commandPalette.nothingFound'

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

/** Opens the palette from code — e.g. from a search button in the header. */
export const openCommandPalette = () => spotlight.open()
