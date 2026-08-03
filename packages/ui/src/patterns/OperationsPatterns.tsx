'use client'

import { Fragment, useMemo, useState } from 'react'
import {
  Badge,
  Box,
  Button,
  Group,
  Image,
  SimpleGrid,
  Stack,
  Table,
  Text,
  ThemeIcon,
  Tooltip,
  UnstyledButton,
} from '@mantine/core'
import {
  ArrowDownLeft,
  ArrowUpRight,
  ArrowLeftRight,
  RotateCcw,
  Scale,
  type LucideIcon,
} from 'lucide-react'
import { liroVar, type StatusToneName } from '@liro/tokens'
import { useI18n, type LocalizedLabel } from '@liro/i18n'

/**
 * Obrasci poslovanja — drugi sloj.
 *
 * Nastavak iste ideje: ne pravimo komponente po industrijama nego po obrascima.
 * Ovih pet pokriva ono sto prvi sloj nije:
 *
 *   kretanje stanja   zalihe, oprema, dokumenti u arhivi, sirovine
 *   tarifa            cene po periodu, kolicini, kategoriji, kanalu
 *   rezervacija       soba, sala, masina, covek, termin
 *   galerija stavke   fotografije artikla, prostora, opreme, uzorka
 *   mapa procesa      koraci i grananja - laka BPMN zamena
 *
 * Supply chain, proizvodnja, facility management, hospitality, R&D i quality
 * control koriste iste ove komponente. Magacin i rezervacija sale se razlikuju
 * u nazivima, ne u obliku podataka.
 */

// ---------------------------------------------------------------------------
// Kretanje stanja
// ---------------------------------------------------------------------------

export type MovementKind = 'in' | 'out' | 'transfer' | 'adjustment' | 'count'

export interface StockMovement {
  id: string
  kind: MovementKind
  /** Već formatiran datum. */
  date: string
  /** Osnov: broj otpremnice, naloga, popisne liste. */
  reference?: string
  /** Odakle — magacin, dobavljač, odeljenje. */
  from?: string
  /** Kuda. */
  to?: string
  /** Uvek pozitivna količina; smer nosi `kind`. */
  quantity: number
  unit?: string
  /** Stanje posle ovog kretanja. */
  balance?: number
  note?: string
}

export interface StockLedgerProps {
  movements: StockMovement[]
  /** Naziv stavke — artikal, oprema, sirovina. */
  itemLabel?: string
  unit?: string
  /** Prikazuje kolonu sa saldom posle svakog kretanja. */
  withBalance?: boolean
  onMovementClick?: (movement: StockMovement) => void
}

const MOVEMENT_ICON: Record<MovementKind, LucideIcon> = {
  in: ArrowDownLeft,
  out: ArrowUpRight,
  transfer: ArrowLeftRight,
  adjustment: RotateCcw,
  count: Scale,
}

const MOVEMENT_TONE: Record<MovementKind, StatusToneName> = {
  in: 'success',
  out: 'danger',
  transfer: 'info',
  adjustment: 'warning',
  count: 'neutral',
}

const MOVEMENT_LABEL: Record<MovementKind, LocalizedLabel> = {
  in: { sr: 'Ulaz', 'sr-Cyrl': 'Улаз', en: 'Receipt' },
  out: { sr: 'Izlaz', 'sr-Cyrl': 'Излаз', en: 'Issue' },
  transfer: { sr: 'Prenos', 'sr-Cyrl': 'Пренос', en: 'Transfer' },
  adjustment: { sr: 'Ispravka', 'sr-Cyrl': 'Исправка', en: 'Adjustment' },
  count: { sr: 'Popis', 'sr-Cyrl': 'Попис', en: 'Stock count' },
}

/** Znak uz količinu. Prenos ne menja ukupno stanje, pa nema znak. */
function movementSign(kind: MovementKind): '' | '+' | '−' {
  if (kind === 'in') return '+'
  if (kind === 'out') return '−'
  return ''
}

/**
 * Kartica kretanja stanja.
 *
 * Isti prikaz vazi za magacin, osnovna sredstva, arhivu dokumenata i sirovine u
 * proizvodnji - svugde je rec o nizu ulaza i izlaza sa saldom.
 *
 * Saldo se NE racuna ovde. Dolazi sa servera, jer je jedini tacan saldo onaj
 * koji je baza izracunala u trenutku kretanja; racunanje na klijentu bi se
 * razislo cim se pojavi paginacija ili filter.
 */
export function StockLedger({
  movements,
  itemLabel,
  unit,
  withBalance = true,
  onMovementClick,
}: StockLedgerProps) {
  const { t, formatQuantity } = useI18n()

  return (
    <Stack gap="xs">
      {itemLabel && (
        <Group justify="space-between">
          <Text size="sm" fw={600}>{itemLabel}</Text>
          {withBalance && movements.length > 0 && (
            <Group gap={4} align="baseline">
              <Text size="xs" style={{ color: liroVar.text.tertiary }}>
                {t({ sr: 'Trenutno stanje', en: 'Current balance' })}
              </Text>
              <Text size="sm" fw={700} data-numeric>
                {formatQuantity(movements[movements.length - 1]?.balance ?? 0)} {unit}
              </Text>
            </Group>
          )}
        </Group>
      )}

      <Table.ScrollContainer minWidth={620}>
        <Table>
          <Table.Thead style={{ backgroundColor: liroVar.surface.sunken }}>
            <Table.Tr>
              <Table.Th w={130}>{t({ sr: 'Vrsta' })}</Table.Th>
              <Table.Th w={110}>{t({ sr: 'Datum' })}</Table.Th>
              <Table.Th>{t({ sr: 'Osnov' })}</Table.Th>
              <Table.Th>{t({ sr: 'Odakle → kuda' })}</Table.Th>
              <Table.Th ta="right" w={120}>{t({ sr: 'Količina' })}</Table.Th>
              {withBalance && <Table.Th ta="right" w={110}>{t({ sr: 'Saldo' })}</Table.Th>}
            </Table.Tr>
          </Table.Thead>

          <Table.Tbody>
            {movements.map((movement) => {
              const Icon = MOVEMENT_ICON[movement.kind]
              const tone = liroVar.status[MOVEMENT_TONE[movement.kind]]
              const sign = movementSign(movement.kind)

              return (
                <Table.Tr
                  key={movement.id}
                  onClick={onMovementClick ? () => onMovementClick(movement) : undefined}
                  style={{ cursor: onMovementClick ? 'pointer' : 'default' }}
                >
                  <Table.Td>
                    <Group gap={6} wrap="nowrap">
                      <ThemeIcon size={20} radius="xl" variant="light" color="gray" style={{ backgroundColor: tone.bg, color: tone.fg }}>
                        <Icon size={12} />
                      </ThemeIcon>
                      <Text size="sm">{t(MOVEMENT_LABEL[movement.kind])}</Text>
                    </Group>
                  </Table.Td>

                  <Table.Td><Text size="sm" data-numeric>{movement.date}</Text></Table.Td>

                  <Table.Td>
                    <Text size="sm">{movement.reference ?? '—'}</Text>
                    {movement.note && (
                      <Text size="xs" style={{ color: liroVar.text.tertiary }}>{movement.note}</Text>
                    )}
                  </Table.Td>

                  <Table.Td>
                    <Text size="sm" style={{ color: liroVar.text.secondary }}>
                      {[movement.from, movement.to].filter(Boolean).join(' → ') || '—'}
                    </Text>
                  </Table.Td>

                  <Table.Td ta="right" data-numeric>
                    <Text size="sm" fw={600} style={{ color: sign ? tone.fg : liroVar.text.primary }}>
                      {sign}{formatQuantity(movement.quantity)} {movement.unit ?? unit}
                    </Text>
                  </Table.Td>

                  {withBalance && (
                    <Table.Td ta="right" data-numeric>
                      <Text size="sm">{movement.balance !== undefined ? formatQuantity(movement.balance) : '—'}</Text>
                    </Table.Td>
                  )}
                </Table.Tr>
              )
            })}
          </Table.Tbody>
        </Table>
      </Table.ScrollContainer>
    </Stack>
  )
}

// ---------------------------------------------------------------------------
// Tarifa
// ---------------------------------------------------------------------------

export interface RateRow {
  id: string
  /** Naziv usluge, artikla ili kategorije. */
  label: string
  /** Dodatno objašnjenje — jedinica mere, uslov primene. */
  detail?: string
  /** Cene po kolonama; ključ odgovara `columns[].id`. */
  prices: Record<string, number | null>
  /** Ističe red — preporučeni paket, osnovna tarifa. */
  highlighted?: boolean
}

export interface RateColumn {
  id: string
  label: string
  /** Period ili uslov: „1–9 kom", „vikend", „preko 12 meseci". */
  caption?: string
}

export interface RateTableProps {
  columns: RateColumn[]
  rows: RateRow[]
  currency?: string
  decimals?: number
  /** Napomena ispod tabele — od kada važi, šta nije uključeno. */
  footnote?: LocalizedLabel
  onCellClick?: (row: RateRow, column: RateColumn) => void
}

/**
 * Cenovnik i tarifa.
 *
 * Jedna komponenta za cene po kolicini, po periodu, po kategoriji gosta, po
 * kanalu prodaje i po nivou usluge - jer su sve to matrice gde red nosi stavku
 * a kolona uslov.
 *
 * Prazna celija znaci „ne primenjuje se", i prikazuje se kao crtica, ne kao
 * nula. Nula je cena, crtica je odsustvo cene, i to su razlicite stvari.
 */
export function RateTable({
  columns,
  rows,
  currency = 'RSD',
  decimals = 2,
  footnote,
  onCellClick,
}: RateTableProps) {
  const { t, formatDecimal } = useI18n()

  return (
    <Stack gap="xs">
      <Table.ScrollContainer minWidth={560}>
        <Table withColumnBorders>
          <Table.Thead style={{ backgroundColor: liroVar.surface.sunken }}>
            <Table.Tr>
              <Table.Th />
              {columns.map((column) => (
                <Table.Th key={column.id} ta="right">
                  <Stack gap={0} align="flex-end">
                    <Text size="sm" fw={600}>{column.label}</Text>
                    {column.caption && (
                      <Text size="xs" fw={400} style={{ color: liroVar.text.tertiary }}>
                        {column.caption}
                      </Text>
                    )}
                  </Stack>
                </Table.Th>
              ))}
            </Table.Tr>
          </Table.Thead>

          <Table.Tbody>
            {rows.map((row) => (
              <Table.Tr
                key={row.id}
                style={{ backgroundColor: row.highlighted ? liroVar.brand.subtle : undefined }}
              >
                <Table.Td>
                  <Stack gap={0}>
                    <Text size="sm" fw={row.highlighted ? 700 : 500}>{row.label}</Text>
                    {row.detail && (
                      <Text size="xs" style={{ color: liroVar.text.tertiary }}>{row.detail}</Text>
                    )}
                  </Stack>
                </Table.Td>

                {columns.map((column) => {
                  const price = row.prices[column.id]
                  return (
                    <Table.Td
                      key={column.id}
                      ta="right"
                      data-numeric
                      onClick={onCellClick ? () => onCellClick(row, column) : undefined}
                      style={{ cursor: onCellClick ? 'pointer' : 'default' }}
                    >
                      {price === null || price === undefined ? (
                        <Text size="sm" style={{ color: liroVar.text.tertiary }}>—</Text>
                      ) : (
                        <Text size="sm" fw={row.highlighted ? 700 : 400}>
                          {formatDecimal(price, decimals)}
                        </Text>
                      )}
                    </Table.Td>
                  )
                })}
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      </Table.ScrollContainer>

      <Group justify="space-between">
        <Text size="xs" style={{ color: liroVar.text.tertiary }}>
          {t({ sr: 'Iznosi u', en: 'Amounts in' })} {currency}
        </Text>
        {footnote && (
          <Text size="xs" style={{ color: liroVar.text.tertiary }}>{t(footnote)}</Text>
        )}
      </Group>
    </Stack>
  )
}

// ---------------------------------------------------------------------------
// Rezervacija termina
// ---------------------------------------------------------------------------

export interface TimeSlot {
  /** `HH:mm` — komponenta ne računa vreme, samo prikazuje. */
  time: string
  available: boolean
  /** Zauzeto od koga — vidljivo samo kada aplikacija to dozvoli. */
  takenBy?: string
}

export interface SlotDay {
  /** `YYYY-MM-DD`. */
  date: string
  /** Već formatirana oznaka — „pon 06.04." */
  label: string
  slots: TimeSlot[]
}

export interface SlotPickerProps {
  days: SlotDay[]
  value?: { date: string; time: string } | null
  onChange: (value: { date: string; time: string }) => void
  /** Naziv resursa — soba, sala, mašina, savetnik. */
  resourceLabel?: string
  /** Trajanje termina, već formatirano: „30 min", „1 h". */
  duration?: string
  onConfirm?: () => void
  confirmLabel?: LocalizedLabel
}

const NO_SLOTS: LocalizedLabel = {
  sr: 'Nema slobodnih termina',
  'sr-Cyrl': 'Нема слободних термина',
  en: 'No free slots',
}

/**
 * Izbor slobodnog termina.
 *
 * Rezervacija sale, zakazivanje kod savetnika, termin servisa masine, dodela
 * radnog mesta - sve je izbor slobodnog intervala nad resursom.
 *
 * Komponenta NE racuna dostupnost. Slobodni termini stizu sa servera, jer samo
 * server zna za istovremene rezervacije drugih korisnika; racunanje na klijentu
 * bi dozvolilo dvostruko zakazivanje.
 */
export function SlotPicker({
  days,
  value,
  onChange,
  resourceLabel,
  duration,
  onConfirm,
  confirmLabel,
}: SlotPickerProps) {
  const { t } = useI18n()
  const [activeDate, setActiveDate] = useState(value?.date ?? days[0]?.date ?? '')

  const activeDay = useMemo(() => days.find((day) => day.date === activeDate), [days, activeDate])
  const free = activeDay?.slots.filter((slot) => slot.available) ?? []

  return (
    <Stack gap="md">
      {(resourceLabel || duration) && (
        <Group justify="space-between">
          {resourceLabel && <Text size="sm" fw={600}>{resourceLabel}</Text>}
          {duration && <Badge variant="light" color="liro-gray" radius="sm">{duration}</Badge>}
        </Group>
      )}

      {/* Dani vodoravno — kalendar je preterivanje za nedelju dana unapred. */}
      <Group gap={6} wrap="nowrap" style={{ overflowX: 'auto' }}>
        {days.map((day) => {
          const active = day.date === activeDate
          const count = day.slots.filter((slot) => slot.available).length

          return (
            <UnstyledButton
              key={day.date}
              onClick={() => setActiveDate(day.date)}
              disabled={count === 0}
              style={{
                flexShrink: 0,
                padding: '8px 12px',
                borderRadius: 'var(--liro-radius-md)',
                border: `1px solid ${active ? liroVar.border.brand : liroVar.border.default}`,
                backgroundColor: active ? liroVar.brand.subtle : liroVar.surface.raised,
                opacity: count === 0 ? 0.45 : 1,
                cursor: count === 0 ? 'not-allowed' : 'pointer',
              }}
            >
              <Stack gap={0} align="center">
                <Text size="sm" fw={active ? 700 : 500} style={{ color: active ? liroVar.text.brand : undefined }}>
                  {day.label}
                </Text>
                <Text size="xs" style={{ color: liroVar.text.tertiary }}>
                  {count} {t({ sr: 'slobodno', en: 'free' })}
                </Text>
              </Stack>
            </UnstyledButton>
          )
        })}
      </Group>

      {free.length === 0 ? (
        <Text size="sm" c="dimmed">{t(NO_SLOTS)}</Text>
      ) : (
        <SimpleGrid cols={{ base: 3, sm: 4, md: 6 }} spacing="xs">
          {activeDay?.slots.map((slot) => {
            const selected = value?.date === activeDate && value.time === slot.time

            /*
             * Svaki termin je u omotacu iste sirine.
             *
             * Ranije su zauzeti termini isli kroz `Tooltip` > `Box`, a slobodni
             * direktno u mrezu - pa se zauzeti skupljao na sirinu teksta i red
             * je izgledao razbijeno. Sada omotac uvek postoji.
             */
            const button = (
              <UnstyledButton
                key={slot.time}
                onClick={() => slot.available && onChange({ date: activeDate, time: slot.time })}
                disabled={!slot.available}
                style={{
                  width: '100%',
                  padding: '8px 0',
                  textAlign: 'center',
                  borderRadius: 'var(--liro-radius-md)',
                  border: `1px solid ${selected ? 'transparent' : liroVar.border.default}`,
                  backgroundColor: selected
                    ? liroVar.brand.solid
                    : slot.available
                      ? liroVar.surface.raised
                      : liroVar.surface.sunken,
                  color: selected
                    ? liroVar.brand.onSolid
                    : slot.available
                      ? liroVar.text.primary
                      : liroVar.text.tertiary,
                  fontSize: 'var(--liro-font-size-sm)',
                  fontWeight: selected ? 700 : 400,
                  cursor: slot.available ? 'pointer' : 'not-allowed',
                  /* Bez precrtavanja: nedostupnost vec nose boja i kursor,
                     a precrtan tekst na dugmetu izgleda kao greska u prikazu. */
                  opacity: slot.available ? 1 : 0.55,
                }}
              >
                {slot.time}
              </UnstyledButton>
            )

            return (
              <Tooltip
                key={slot.time}
                label={slot.takenBy ?? ''}
                withArrow
                disabled={!slot.takenBy}
              >
                <Box w="100%">{button}</Box>
              </Tooltip>
            )
          })}
        </SimpleGrid>
      )}

      {onConfirm && (
        <Button onClick={onConfirm} disabled={!value} fullWidth>
          {t(confirmLabel ?? { sr: 'Potvrdi termin', en: 'Confirm slot' })}
        </Button>
      )}
    </Stack>
  )
}

// ---------------------------------------------------------------------------
// Galerija stavke
// ---------------------------------------------------------------------------

export interface GalleryImage {
  src: string
  alt?: string
  caption?: string
}

export interface ItemGalleryProps {
  images: GalleryImage[]
  height?: number
  /** Prikazuje sličice ispod glavne slike. */
  withThumbnails?: boolean
  emptyText?: LocalizedLabel
}

const NO_IMAGES: LocalizedLabel = {
  sr: 'Nema fotografija',
  'sr-Cyrl': 'Нема фотографија',
  en: 'No photos',
}

/**
 * Fotografije uz stavku.
 *
 * Artikal u magacinu, prostorija u facility management-u, oprema, uzorak u
 * kontroli kvaliteta - svugde je rec o skupu fotografija sa opisom.
 *
 * Sličice su ispod, ne sa strane: na uskom ekranu bocni niz odseca glavnu sliku
 * na polovinu, a upravo je ona ono zbog cega se galerija otvara.
 */
export function ItemGallery({ images, height = 280, withThumbnails = true, emptyText }: ItemGalleryProps) {
  const { t } = useI18n()
  const [index, setIndex] = useState(0)
  const active = images[index]

  if (images.length === 0) {
    return (
      <Box
        h={height}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: liroVar.surface.sunken,
          borderRadius: 'var(--liro-radius-lg)',
          border: `1px solid ${liroVar.border.default}`,
        }}
      >
        <Text size="sm" c="dimmed">{t(emptyText ?? NO_IMAGES)}</Text>
      </Box>
    )
  }

  return (
    <Stack gap="xs">
      <Box
        style={{
          borderRadius: 'var(--liro-radius-lg)',
          overflow: 'hidden',
          border: `1px solid ${liroVar.border.default}`,
          backgroundColor: liroVar.surface.sunken,
        }}
      >
        <Image src={active?.src} alt={active?.alt ?? ''} h={height} fit="contain" />
      </Box>

      {active?.caption && (
        <Text size="xs" style={{ color: liroVar.text.secondary }}>{active.caption}</Text>
      )}

      {withThumbnails && images.length > 1 && (
        <Group gap={6} wrap="nowrap" style={{ overflowX: 'auto' }}>
          {images.map((image, imageIndex) => (
            <UnstyledButton
              key={imageIndex}
              onClick={() => setIndex(imageIndex)}
              style={{
                flexShrink: 0,
                width: 56,
                height: 56,
                borderRadius: 'var(--liro-radius-md)',
                overflow: 'hidden',
                border: `2px solid ${imageIndex === index ? liroVar.border.brand : liroVar.border.default}`,
              }}
            >
              <Image src={image.src} alt={image.alt ?? ''} h={52} fit="cover" />
            </UnstyledButton>
          ))}
        </Group>
      )}
    </Stack>
  )
}

// ---------------------------------------------------------------------------
// Mapa procesa
// ---------------------------------------------------------------------------

export type ProcessNodeKind = 'start' | 'task' | 'decision' | 'end'

export interface ProcessNode {
  id: string
  label: string
  kind: ProcessNodeKind
  /** Ko izvršava korak — uloga, odeljenje, sistem. */
  lane?: string
  /** Ističe trenutni korak. */
  active?: boolean
  /** Korak je završen. */
  done?: boolean
}

export interface ProcessEdge {
  from: string
  to: string
  /** Natpis na grani — „da", „ne", „iznad 100.000". */
  label?: string
}

export interface ProcessMapProps {
  nodes: ProcessNode[]
  edges: ProcessEdge[]
  onNodeClick?: (node: ProcessNode) => void
}

const NODE_TONE: Record<ProcessNodeKind, StatusToneName> = {
  start: 'info',
  task: 'neutral',
  decision: 'warning',
  end: 'success',
}

/**
 * Mapa procesa.
 *
 * Namerno NIJE puni BPMN. Puni BPMN trazi urednik, raspored cvorova, bazene i
 * staze - to je zaseban proizvod. Ovde je citljiv prikaz koraka i grananja koji
 * pokriva ono zbog cega se dijagram najcesce crta: da se vidi ko sta radi i
 * gde je zapis trenutno.
 *
 * Cvorovi se rasporedjuju po redosledu u nizu, a grananja se prikazuju kao
 * natpisi na vezama. Kada zatreba pravi BPMN sa slobodnim rasporedom, ova
 * komponenta se zamenjuje - potrosnja je mala.
 */
export function ProcessMap({ nodes, edges, onNodeClick }: ProcessMapProps) {
  const { t } = useI18n()

  const lanes = useMemo(() => {
    const grouped = new Map<string, ProcessNode[]>()
    for (const node of nodes) {
      const lane = node.lane ?? ''
      grouped.set(lane, [...(grouped.get(lane) ?? []), node])
    }
    return [...grouped.entries()]
  }, [nodes])

  const edgeLabel = (nodeId: string) =>
    edges.filter((edge) => edge.from === nodeId && edge.label).map((edge) => edge.label)

  return (
    <Stack gap="lg">
      {lanes.map(([lane, laneNodes]) => (
        <Stack key={lane || 'default'} gap="xs">
          {lane && (
            <Text
              size="xs"
              fw={700}
              style={{
                color: liroVar.text.tertiary,
                textTransform: 'uppercase',
                letterSpacing: 'var(--liro-tracking-caps)',
              }}
            >
              {lane}
            </Text>
          )}

          <Group gap={0} wrap="wrap" align="center">
            {laneNodes.map((node, index) => {
              const tone = liroVar.status[NODE_TONE[node.kind]]
              const labels = edgeLabel(node.id)
              const isDecision = node.kind === 'decision'
              const isTerminal = node.kind === 'start' || node.kind === 'end'

              return (
                <Fragment key={node.id}>
                  {index > 0 && (
                    <Box
                      style={{
                        width: 28,
                        height: 2,
                        backgroundColor: liroVar.border.strong,
                        flexShrink: 0,
                      }}
                    />
                  )}

                  <Stack gap={2} align="center" style={{ flexShrink: 0 }}>
                    <UnstyledButton
                      onClick={onNodeClick ? () => onNodeClick(node) : undefined}
                      style={{
                        padding: isTerminal ? '6px 16px' : '10px 14px',
                        minWidth: 110,
                        textAlign: 'center',
                        border: `2px solid ${node.active ? tone.fg : liroVar.border.default}`,
                        backgroundColor: node.active
                          ? tone.bg
                          : node.done
                            ? liroVar.surface.sunken
                            : liroVar.surface.raised,
                        /* Oblik nosi značenje: zaobljeno je početak/kraj,
                           pravougaono je zadatak, zakošeno je odluka. */
                        borderRadius: isTerminal
                          ? 'var(--liro-radius-full)'
                          : isDecision
                            ? 'var(--liro-radius-xs)'
                            : 'var(--liro-radius-md)',
                        transform: isDecision ? 'skewX(-8deg)' : undefined,
                        cursor: onNodeClick ? 'pointer' : 'default',
                        opacity: node.done && !node.active ? 0.65 : 1,
                      }}
                    >
                      <Text
                        size="xs"
                        fw={node.active ? 700 : 500}
                        style={{ transform: isDecision ? 'skewX(8deg)' : undefined }}
                      >
                        {node.label}
                      </Text>
                    </UnstyledButton>

                    {labels.length > 0 && (
                      <Text size="xs" style={{ color: liroVar.text.tertiary }}>
                        {labels.join(' / ')}
                      </Text>
                    )}
                  </Stack>
                </Fragment>
              )
            })}
          </Group>
        </Stack>
      ))}

      <Group gap="md">
        {(['start', 'task', 'decision', 'end'] as ProcessNodeKind[]).map((kind) => (
          <Group key={kind} gap={4}>
            <Box
              w={12}
              h={12}
              style={{
                backgroundColor: liroVar.status[NODE_TONE[kind]].bg,
                border: `1px solid ${liroVar.status[NODE_TONE[kind]].border}`,
                borderRadius: kind === 'start' || kind === 'end' ? '50%' : 2,
              }}
            />
            <Text size="xs" style={{ color: liroVar.text.tertiary }}>
              {t({
                start: { sr: 'Početak' },
                task: { sr: 'Zadatak' },
                decision: { sr: 'Odluka' },
                end: { sr: 'Kraj' },
              }[kind])}
            </Text>
          </Group>
        ))}
      </Group>
    </Stack>
  )
}
