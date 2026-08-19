'use client'

import { Button, Group, Menu, Tooltip } from '@mantine/core'
import { ChevronDown } from 'lucide-react'
import type { MouseEventHandler } from 'react'
import { INTENTS, INTENT_FAMILY_COLOR, liroVar, type ActionIntent } from '@liro/tokens'
import { useI18n, type LocalizedLabel, type TranslationKey } from '@liro/i18n'
import { intentIcon, intentLabel } from './ActionButton'

/**
 * A button with a primary action and a menu of related variants.
 *
 * Exists for the case where one action has several forms that are used
 * rarely: "Send" on the button, and "Send as PDF" and "Save as draft" in the
 * menu. Not a replacement for `ActionGroup` — three equally-weighted actions
 * go in a group, not a menu.
 *
 * Menu items are INTENTS, not free-form entries. An intent carries an icon, a
 * label, and a family; the label can be refined through `label`. That way the
 * menu cannot show an action that does not exist in `intents.ts`.
 */

const MENU_LABEL: TranslationKey = 'actions.splitAction.moreActions'

export interface SplitActionItem {
  intent: ActionIntent
  /** A more precise label - "Send as PDF" instead of "PDF". */
  label?: LocalizedLabel
  onClick?: () => void
  disabled?: boolean
}

export interface SplitActionProps {
  /** The primary action. It sits on the button, not in the menu. */
  intent: ActionIntent
  label?: LocalizedLabel
  items: SplitActionItem[]
  onClick?: MouseEventHandler<HTMLButtonElement>
  size?: 'xs' | 'sm' | 'md' | 'lg'
  /** Raises the main half to `filled`. The menu follows the same weight. */
  primary?: boolean
  disabled?: boolean
  /** Why the primary action is disabled. The menu stays available. */
  disabledReason?: LocalizedLabel
  /** Name of the button that opens the menu. Change it when "More actions" is not clear enough. */
  menuLabel?: LocalizedLabel
}

export function SplitAction({
  intent,
  label,
  items,
  onClick,
  size = 'sm',
  primary = false,
  disabled = false,
  disabledReason,
  menuLabel,
}: SplitActionProps) {
  const { t } = useI18n()
  const definition = INTENTS[intent]
  const Icon = intentIcon(intent)
  const color = INTENT_FAMILY_COLOR[definition.family]
  const variant = primary ? 'filled' : definition.weight
  const text = t(label ?? intentLabel(intent))
  const menuText = t(menuLabel ?? MENU_LABEL)

  /*
   * The two halves are two separate `Button`s, not `Button` + `ActionIcon`.
   *
   * The same `size` and the same `variant` on the same component guarantee
   * the same height and the same color resolution. With `ActionIcon`, the
   * height would come from `--ai-size` instead of `--button-height-*`, so the
   * halves would drift apart on every change to `theme.scale`.
   */
  const main = (
    <Button
      className="liro-split-main"
      size={size}
      color={color}
      variant={variant}
      leftSection={<Icon size={15} />}
      onClick={onClick}
      disabled={disabled}
    >
      {text}
    </Button>
  )

  return (
    <Group wrap="nowrap" gap={0} display="inline-flex">
      {disabled && disabledReason ? (
        <Tooltip
          label={t(disabledReason)}
          withArrow
          multiline
          w={240}
          /* A disabled button does not send mouse events, and that is exactly
             when the explanation is needed most. Same solution as in `ActionButton`. */
          events={{ hover: true, focus: true, touch: true }}
        >
          <span style={{ display: 'inline-flex' }}>{main}</span>
        </Tooltip>
      ) : (
        main
      )}

      <Menu position="bottom-end" withArrow transitionProps={{ transition: 'pop' }}>
        <Menu.Target>
          {/*
            `aria-label` is required: the button contains only an icon, so
            without it a screen reader would read an empty button.
            `aria-haspopup` is added by Mantine itself, and is allowed on
            `<button>` — unlike on `<div>` and `<a>`.
          */}
          <Button
            className="liro-split-menu"
            size={size}
            color={color}
            variant={variant}
            px={8}
            aria-label={`${menuText}: ${text}`}
          >
            <ChevronDown size={16} />
          </Button>
        </Menu.Target>

        <Menu.Dropdown>
          {items.map((item) => {
            const ItemIcon = intentIcon(item.intent)
            const isDestructive = INTENTS[item.intent].family === 'destructive'

            return (
              <Menu.Item
                key={item.intent}
                leftSection={<ItemIcon size={16} />}
                onClick={item.onClick}
                disabled={item.disabled}
                /*
                 * In the menu, color marks DANGER, it does not decorate.
                 *
                 * If every item carried its family's color, the menu would be
                 * a rainbow and harder to read. That is why only destructive
                 * items deviate. `status.danger.fg` is measured: 7.40 on
                 * white, 6.54 on the gray background of a hovered item.
                 */
                style={isDestructive ? { color: liroVar.status.danger.fg } : undefined}
              >
                {t(item.label ?? intentLabel(item.intent))}
              </Menu.Item>
            )
          })}
        </Menu.Dropdown>
      </Menu>
    </Group>
  )
}