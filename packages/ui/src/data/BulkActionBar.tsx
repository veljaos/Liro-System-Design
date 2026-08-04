'use client'

import { Group, Paper, Text, Transition, UnstyledButton } from '@mantine/core'
import { useState } from 'react'
import { liroVar, type ActionIntent } from '@liro/tokens'
import { useI18n, type LocalizedLabel } from '@liro/i18n'
import { ActionButton } from '../actions/ActionButton'
import { ConfirmModal } from '../feedback/ConfirmModal'

/**
 * Traka radnji nad izabranim redovima.
 *
 * Pojavljuje se iznad tabele kada je nesto cekirano i nestaje kada nije.
 * Namerno pomera sadrzaj nadole umesto da lebdi preko njega: traka koja lebdi
 * na dnu ekrana pokriva poslednji red bas kada korisnik proverava sta je
 * izabrao.
 */

export interface BulkAction {
  intent: ActionIntent
  /** Precizniji natpis - "Proknjiži naloge" umesto "Proknjiži". */
  label?: LocalizedLabel
  onClick: (ids: string[]) => void
  /**
   * Razlog zbog kojeg radnja trenutno nije moguca, ili `false` kada jeste.
   *
   * Prima izbor jer ogranicenje po pravilu zavisi od njega - "najvise 100
   * odjednom", "IOS se salje samo kupcima".
   */
  disabledReason?: (ids: string[]) => LocalizedLabel | false
  /** Trazi potvrdu. Podrazumevano prati listu nepovratnih namera. */
  confirm?: boolean
  /** Naslov prozora za potvrdu; podrazumevano prati nameru. */
  confirmTitle?: LocalizedLabel
  /** Prilagođeni tekst u prozoru za potvrdu. */
  confirmText?: LocalizedLabel
}

export interface BulkActionBarProps {
  selected: string[]
  onClear: () => void
  actions: BulkAction[]
  /** Ukupan broj redova koji zadovoljavaju filter - za "izaberi svih N". */
  totalCount?: number
  onSelectAll?: () => void
  loading?: boolean
}

/**
 * Namere posle kojih se ne moze nazad.
 *
 * Masovna radnja se ne ponistava: kada se 200 naloga proknjizi, vracanje je
 * 200 stornacija. Zato potvrda ovde nije formalnost.
 */
const IRREVERSIBLE: ActionIntent[] = [
  'delete',
  'void',
  'reject',
  'cancelDocument',
  'post',
  'approve',
]

/**
 * Srpska pravila mnozine.
 *
 * `3 stavke` i `5 stavki` nisu isti oblik, a `Izabrano: 3` je izbegavanje
 * problema, ne resenje. Pravilo: 1 (osim 11), 2-4 (osim 12-14), ostalo.
 */
function srPlural(n: number, one: string, few: string, many: string): string {
  const mod10 = n % 10
  const mod100 = n % 100
  if (mod10 === 1 && mod100 !== 11) return one
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return few
  return many
}

function countLabel(n: number): LocalizedLabel {
  return {
    sr: `${n} ${srPlural(n, 'stavka izabrana', 'stavke izabrane', 'stavki izabrano')}`,
    'sr-Cyrl': `${n} ${srPlural(n, 'ставка изабрана', 'ставке изабране', 'ставки изабрано')}`,
    en: `${n} ${n === 1 ? 'item' : 'items'} selected`,
  }
}

function selectAllLabel(n: number): LocalizedLabel {
  return {
    sr: `Izaberi svih ${n}`,
    'sr-Cyrl': `Изабери свих ${n}`,
    en: `Select all ${n}`,
  }
}

function defaultConfirm(n: number): LocalizedLabel {
  return {
    sr: `Radnja će se primeniti na ${n} ${srPlural(n, 'stavku', 'stavke', 'stavki')}. Nastaviti?`,
    'sr-Cyrl': `Радња ће се применити на ${n} ${srPlural(n, 'ставку', 'ставке', 'ставки')}. Наставити?`,
    en: `This will be applied to ${n} ${n === 1 ? 'item' : 'items'}. Continue?`,
  }
}

const CLEAR_LABEL: LocalizedLabel = { sr: 'Poništi izbor', 'sr-Cyrl': 'Поништи избор', en: 'Clear selection' }

/*
* Naslov imenuje radnju pre nego sto korisnik procita tekst. "Brisanje" i
* "Knjiženje" nisu ista tezina, a bez naslova oba prozora izgledaju isto.
*/
const CONFIRM_TITLE: Partial<Record<ActionIntent, LocalizedLabel>> = {
  delete: { sr: 'Brisanje', 'sr-Cyrl': 'Брисање', en: 'Delete' },
  post: { sr: 'Knjiženje', 'sr-Cyrl': 'Књижење', en: 'Post' },
  approve: { sr: 'Odobravanje', 'sr-Cyrl': 'Одобравање', en: 'Approve' },
  reject: { sr: 'Odbijanje', 'sr-Cyrl': 'Одбијање', en: 'Reject' },
  void: { sr: 'Storniranje', 'sr-Cyrl': 'Сторнирање', en: 'Void' },
  cancelDocument: { sr: 'Otkazivanje', 'sr-Cyrl': 'Отказивање', en: 'Cancel' },
}

const CONFIRM_FALLBACK: LocalizedLabel = { sr: 'Potvrda', 'sr-Cyrl': 'Потврда', en: 'Confirm' }

export function BulkActionBar({
  selected,
  onClear,
  actions,
  totalCount,
  onSelectAll,
  loading = false,
}: BulkActionBarProps) {
  const { t } = useI18n()
  const [pending, setPending] = useState<BulkAction | null>(null)

  const count = selected.length
  const canSelectAll = Boolean(onSelectAll && totalCount && totalCount > count)

  const run = (action: BulkAction) => {
    const needsConfirm = action.confirm ?? IRREVERSIBLE.includes(action.intent)
    if (needsConfirm) setPending(action)
    else action.onClick(selected)
  }

  const confirmPending = () => {
    pending?.onClick(selected)
    setPending(null)
  }

  return (
    <>
      <Transition mounted={count > 0} transition="slide-down" duration={140}>
        {(styles) => (
          <Paper
            withBorder
            radius="md"
            p="xs"
            style={{
              ...styles,
              backgroundColor: liroVar.brand.subtle,
              borderColor: liroVar.border.brand,
            }}
          >
            <Group justify="space-between" wrap="wrap" gap="xs">
              <Group gap="sm" wrap="nowrap">
                <ActionButton
                  intent="cancel"
                  iconOnly
                  size="xs"
                  label={CLEAR_LABEL}
                  onClick={onClear}
                />

                {/*
                  `aria-live` je jedini nacin da citac ekrana sazna da se broj
                  promenio. Bez njega korisnik cekira red i ne dobije nikakvu
                  povratnu informaciju.
                */}
                <Text size="sm" fw={600} aria-live="polite" style={{ color: liroVar.text.brand }}>
                  {t(countLabel(count))}
                </Text>

                {canSelectAll && totalCount && (
                  <UnstyledButton onClick={onSelectAll}>
                    <Text size="xs" td="underline" style={{ color: liroVar.text.brand }}>
                      {t(selectAllLabel(totalCount))}
                    </Text>
                  </UnstyledButton>
                )}
              </Group>

              <Group gap="xs" wrap="wrap">
                {actions.map((action, index) => {
                  const reason = action.disabledReason?.(selected)
                  return (
                    <ActionButton
                      key={`${action.intent}-${index}`}
                      intent={action.intent}
                      label={action.label}
                      size="xs"
                      disabled={Boolean(reason) || loading}
                      disabledReason={reason || undefined}
                      onClick={() => run(action)}
                    />
                  )
                })}
              </Group>
            </Group>
          </Paper>
        )}
      </Transition>

      <ConfirmModal
        opened={pending !== null}
        onClose={() => setPending(null)}
        onConfirm={confirmPending}
        loading={loading}
        title={
          pending
            ? (pending.confirmTitle ?? CONFIRM_TITLE[pending.intent] ?? CONFIRM_FALLBACK)
            : CONFIRM_FALLBACK
        }
        tone={pending && IRREVERSIBLE.includes(pending.intent) ? 'danger' : 'info'}
        text={pending?.confirmText ?? defaultConfirm(count)}
      />
    </>
  )
}