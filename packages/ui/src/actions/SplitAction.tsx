'use client'

import { Button, Group, Menu, Tooltip } from '@mantine/core'
import { ChevronDown } from 'lucide-react'
import type { MouseEventHandler } from 'react'
import { INTENTS, INTENT_FAMILY_COLOR, liroVar, type ActionIntent } from '@liro/tokens'
import { useI18n, type LocalizedLabel } from '@liro/i18n'
import { intentIcon, intentLabel } from './ActionButton'

/**
 * Dugme sa glavnom radnjom i menijem srodnih varijanti.
 *
 * Postoji za slucaj kada jedna radnja ima nekoliko oblika koji se rade retko:
 * "Posalji" na dugmetu, a "Posalji kao PDF" i "Sacuvaj kao nacrt" u meniju.
 * Nije zamena za `ActionGroup` - tri ravnopravne radnje idu u grupu, ne u meni.
 *
 * Stavke menija su NAMERE, ne slobodne stavke. Namera nosi ikonicu, natpis i
 * porodicu; natpis se moze precizirati kroz `label`. Time meni ne moze da
 * prikaze radnju koja ne postoji u `intents.ts`.
 */

const MENU_LABEL: LocalizedLabel = {
  sr: 'Još radnji',
  'sr-Cyrl': 'Још радњи',
  en: 'More actions',
}

export interface SplitActionItem {
  intent: ActionIntent
  /** Precizniji natpis - "Posalji kao PDF" umesto "PDF". */
  label?: LocalizedLabel
  onClick?: () => void
  disabled?: boolean
}

export interface SplitActionProps {
  /** Glavna radnja. Ona je na dugmetu, ne u meniju. */
  intent: ActionIntent
  label?: LocalizedLabel
  items: SplitActionItem[]
  onClick?: MouseEventHandler<HTMLButtonElement>
  size?: 'xs' | 'sm' | 'md' | 'lg'
  /** Podize glavnu polovinu na `filled`. Meni prati istu tezinu. */
  primary?: boolean
  disabled?: boolean
  /** Zasto je glavna radnja onemogucena. Meni ostaje dostupan. */
  disabledReason?: LocalizedLabel
  /** Ime dugmeta koje otvara meni. Menja se kada "Još radnji" nije dovoljno jasno. */
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
   * Dve polovine su dva odvojena `Button`-a, ne `Button` + `ActionIcon`.
   *
   * Isti `size` i isti `variant` na istoj komponenti garantuju istu visinu i
   * isti nacin razresavanja boje. Sa `ActionIcon` bi visina dolazila iz
   * `--ai-size` a ne iz `--button-height-*`, pa bi se polovine razisle na
   * svakoj promeni `theme.scale`.
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
          /* Onemoguceno dugme ne salje dogadjaje misa, a tada je objasnjenje
             najpotrebnije. Isto resenje kao u `ActionButton`. */
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
            `aria-label` je obavezan: dugme sadrzi samo ikonicu, pa bi bez njega
            citac ekrana procitao prazno dugme. `aria-haspopup` Mantine dodaje
            sam, i na `<button>` je dozvoljen - za razliku od `<div>` i `<a>`.
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
                 * U meniju boja oznacava OPASNOST, ne ukrasava.
                 *
                 * Da svaka stavka nosi boju svoje porodice, meni bi bio duga i
                 * teze bi se citao. Zato samo destruktivne stavke odstupaju.
                 * `status.danger.fg` je izmereno: 7.40 na beloj, 6.54 na sivoj
                 * pozadini stavke pod misem.
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