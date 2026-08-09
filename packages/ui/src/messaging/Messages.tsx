'use client'

import { useEffect, useRef, useState, type ReactNode } from 'react'
import {
  ActionIcon,
  Box,
  Group,
  Loader,
  ScrollArea,
  Stack,
  Text,
  Textarea,
  UnstyledButton,
  Menu,
} from '@mantine/core'
import { Check, CheckCheck, Clock, Send, SmilePlus, TriangleAlert, type LucideIcon } from 'lucide-react'
import { liroVar, type StatusToneName } from '@liro/tokens'
import { useI18n, type LocalizedLabel } from '@liro/i18n'
import { PersonAvatar } from '../primitives/PersonAvatar'

/**
 * Poruke.
 *
 * U poslovnoj aplikaciji ovo nije caskanje nego prepiska uz zapis: pitanje
 * knjigovodje ka klijentu, odgovor poreske, poruka podrske. Zato svaka poruka
 * nosi stanje isporuke - u prepisci o dokumentu je bitno da li je druga strana
 * poruku uopste primila.
 */

export type MessageStatus = 'sending' | 'sent' | 'delivered' | 'read' | 'failed'

export interface MessageAuthor {
  id: string
  name: string
  avatarUrl?: string | null
}

export interface MessageReaction {
  /** Kljuc reakcije. Dolazi iz aplikacije. */
  id: string
  icon: LucideIcon
  /** Ime za citac ekrana: "Potvrdjeno", "Pitanje", "Hitno". */
  label: string
  count: number
  /** Da li je trenutni korisnik vec reagovao. */
  mine?: boolean
  tone?: StatusToneName
}

export interface ReactionOption {
  id: string
  icon: LucideIcon
  label: string
  tone?: StatusToneName
}

export interface Message {
  id: string
  author: MessageAuthor
  /** Tekst poruke. Podrzava vise redova. */
  text: string
  /** Vec formatirano vreme - komponenta ne odlucuje o formatu. */
  time: string
  /** Poruka trenutnog korisnika ide desno. */
  own?: boolean
  status?: MessageStatus
  /** Prilozi, oznake, dugmad - sve ispod teksta. */
  footer?: ReactNode
  /** Reakcije na poruku. */
  reactions?: MessageReaction[]
}

const STATUS_ICON: Record<MessageStatus, typeof Check> = {
  sending: Clock,
  sent: Check,
  delivered: CheckCheck,
  read: CheckCheck,
  failed: TriangleAlert,
}

export interface MessageBubbleProps {
  message: Message
  /** Sakriva ime i sliku kada je prethodna poruka od istog autora. */
  compact?: boolean
  withTail?: boolean
  /** Bez ovoga su reakcije samo prikaz, bez dugmadi. */
  onReact?: (messageId: string, reactionId: string) => void
  /**
   * Sta se moze izabrati u biracu.
   * 
   * Prazno znaci da se biraca nema - postojece reakcije se i dalje vide, ali se
   * nova ne moze dodati. Skup je namerno mali: u prepisci uz zapis ne treba
   * dvadeset reakcija nego tri koje nesto znace.
   */
  reactionOptions?: ReactionOption[]
}

export function MessageBubble({
  message,
  compact = false,
  withTail,
  onReact,
  reactionOptions = [],
}: MessageBubbleProps) {
  const own = message.own ?? false
  const StatusIcon = message.status ? STATUS_ICON[message.status] : null
  const failed = message.status === 'failed'
  const reactions = message.reactions ?? []
  const canReact = Boolean(onReact) && reactionOptions.length > 0
  const tail = withTail ?? !compact

  // Jedan `borderRadius` sa cetiri vrednosti, ne skraceno + pojedinacna.
  //
  // Mesanje `borderRadius` i `border*Radius` u istom objektu stila daje
  // nepredvidiv ishod - React ih upisuje po redu kljuceva i izdaje upozorenje.
  // `CommentThread` u ovom repou vec koristi ovaj oblik i radi ispravno.
  //
  // Redosled je: gore levo, gore desno, dole desno, dole levo.
  // Repic je na VRHU, prema autoru. Dno je uvek okruglo - tamo stoje reakcije.
  const XL = 'var(--liro-radius-xl)'
  const TAIL = 'var(--liro-radius-xs)'
  const bubbleRadius = !tail
    ? `${XL} ${XL} ${XL} ${XL}`
    : own
      ? `${XL} ${TAIL} ${XL} ${XL}`
      : `${TAIL} ${XL} ${XL} ${XL}`

  // Reakcije PREKLAPAJU donju ivicu mehura, ne stoje kao red ispod njega.
  // Zato mehur i reakcije dele omotac sa `position: relative`, a omotac dobija
  // donju popunu samo kada reakcija ima - inace bi svaka poruka nosila prazan
  // prostor koji nista ne drzi.
  const overlap = 11

  const chip = (mine: boolean, tone: StatusToneName = 'neutral') =>
    ({
      display: 'flex',
      alignItems: 'center',
      gap: 3,
      padding: '1px 7px',
      borderRadius: 'var(--liro-radius-full)',
      // Podloga je NEPROZIRNA, a tona se slika preko nje.
      //
      // U tamnoj temi je `status[tone].bg` providan (`rgba(..., 0.20)`) i
      // racunat da stoji na `ink`. Cip stoji na PLAVOM mehuru, pa se providni
      // zeleni sloj mesao sa plavim - izmereno 2.34 umesto 6.32. `backgroundColor`
      // daje osnovu, `backgroundImage` sloj iznad nje, pa se providnost uvek
      // mesa sa istim, bez obzira sta je pod cipom.
      //
      // Sopstvena reakcija nosi boju znacenja, tudja je tiha. Da su sve u boji,
      // red od cetiri reakcije bio bi duga koja ne kaze koja je tvoja.
      backgroundColor: mine ? liroVar.surface.raised : liroVar.surface.sunken,
      backgroundImage: mine
        ? `linear-gradient(${liroVar.status[tone].bg}, ${liroVar.status[tone].bg})`
        : undefined,
      color: mine ? liroVar.status[tone].fg : liroVar.text.secondary,
      // Prsten u boji povrsine na kojoj prepiska STOJI, a to je `raised` -
      // `SectionCard`, panel, fioka. Ne `page`: u svetloj temi je razlika
      // neprimetna, u tamnoj je `ink` naspram `inkRaised` i prsten se vidi kao
      // pogresna tamna linija.
      border: `2px solid ${liroVar.surface.raised}`,
      fontSize: 'var(--liro-font-size-xs)',
      lineHeight: 1.4,
    }) as const

  const trigger = canReact ? (
    <Menu position={own ? 'left' : 'right'} withArrow transitionProps={{ transition: 'pop' }}>
      <Menu.Target>
        {/*
          `className` a ne `style`: dugme je nevidljivo dok mis ne dodje na red,
          a to je `:hover` i `:focus-within` na roditelju - ne moze inline.

          Ostaje u obilasku tastaturom (`opacity: 0`, ne `display: none`) i
          postaje vidljivo kad dobije fokus. To je jedno dodatno zaustavljanje
          po poruci, kao kod komentara na GitHub-u.
        */}
        <ActionIcon
          className="liro-message-react"
          variant="subtle"
          color="gray"
          size="sm"
          aria-label="Dodaj reakciju"
        >
          <SmilePlus size={15} />
        </ActionIcon>
      </Menu.Target>
      <Menu.Dropdown>
        {reactionOptions.map((option) => {
          const OptionIcon = option.icon
          return (
            <Menu.Item
              key={option.id}
              leftSection={<OptionIcon size={15} />}
              onClick={() => onReact?.(message.id, option.id)}
            >
              {option.label}
            </Menu.Item>
          )
        })}
      </Menu.Dropdown>
    </Menu>
  ) : null

  return (
    <Group
      className="liro-message-row"
      gap="xs"
      align="flex-start"
      wrap="nowrap"
      justify={own ? 'flex-end' : 'flex-start'}
    >
      {own && trigger}

      {!own && !compact && (
        <PersonAvatar name={message.author.name} src={message.author.avatarUrl} size={28} />
      )}
      {!own && compact && <Box w={28} style={{ flexShrink: 0 }} />}

      <Stack gap={2} style={{ maxWidth: '72%', alignItems: own ? 'flex-end' : 'flex-start' }}>
        {!compact && !own && (
          <Text size="xs" fw={600} style={{ color: liroVar.text.secondary }}>
            {message.author.name}
          </Text>
        )}

        <Box style={{ position: 'relative', paddingBottom: reactions.length > 0 ? overlap : 0 }}>
          <Box
            px="sm"
            pt={8}
            pb={reactions.length > 0 ? 16 : 8}
            style={{
              backgroundColor: own ? liroVar.brand.solid : liroVar.surface.raised,
              color: own ? liroVar.brand.onSolid : liroVar.text.primary,
              border: own ? '1px solid transparent' : `1px solid ${liroVar.border.default}`,
              borderRadius: bubbleRadius,
              fontSize: 'var(--liro-font-size-sm)',
              lineHeight: 'var(--liro-line-height-base)',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
            }}
          >
            {message.text}
            {message.footer && <Box mt={6}>{message.footer}</Box>}
          </Box>

          {reactions.length > 0 && (
            <Group
              gap={3}
              wrap="nowrap"
              style={{
                position: 'absolute',
                bottom: 0,
                left: own ? 10 : undefined,
                right: own ? undefined : 10,
              }}
              // Kada se ne moze reagovati, ceo red je JEDNA slika sa opisom.
              // Bez toga citac ekrana procita niz golih brojeva.
              role={onReact ? undefined : 'img'}
              aria-label={
                onReact
                  ? undefined
                  : `Reakcije: ${reactions.map((r) => `${r.label} ${r.count}`).join(', ')}`
              }
            >
              {reactions.map((reaction) => {
                const ReactionIcon = reaction.icon
                const mine = reaction.mine ?? false

                if (!onReact) {
                  return (
                    <Box key={reaction.id} style={chip(mine, reaction.tone)}>
                      <ReactionIcon size={11} />
                      <span>{reaction.count}</span>
                    </Box>
                  )
                }

                return (
                  <UnstyledButton
                    key={reaction.id}
                    onClick={() => onReact(message.id, reaction.id)}
                    // Boja i ivica govore samo oku da si vec reagovao.
                    aria-pressed={mine}
                    aria-label={`${reaction.label}, ${reaction.count}`}
                    style={chip(mine, reaction.tone)}
                  >
                    <ReactionIcon size={11} />
                    <span>{reaction.count}</span>
                  </UnstyledButton>
                )
              })}
            </Group>
          )}
        </Box>

        <Group gap={4} wrap="nowrap">
          <Text size="xs" style={{ color: failed ? liroVar.status.danger.fg : liroVar.text.tertiary }}>
            {message.time}
          </Text>
          {StatusIcon && (
            <Box
              style={{
                display: 'flex',
                color:
                  message.status === 'read'
                    ? liroVar.text.brand
                    : failed
                      ? liroVar.status.danger.fg
                      : liroVar.text.tertiary,
              }}
            >
              <StatusIcon size={13} />
            </Box>
          )}
        </Group>
      </Stack>

      {!own && trigger}
    </Group>
  )
}

export interface MessageListProps {
  messages: Message[]
  /** Oznaka dana koja se ubacuje izmedju grupa - aplikacija je već formatirala. */
  dayLabelOf?: (message: Message) => string | null
  height?: number | string
  /** Skrol na dno kada stigne nova poruka. */
  autoScroll?: boolean
  loading?: boolean
  emptyText?: LocalizedLabel
  onReact?: (messageId: string, reactionId: string) => void
  reactionOptions?: ReactionOption[]
}

const NO_MESSAGES: LocalizedLabel = {
  sr: 'Još nema poruka.',
  'sr-Cyrl': 'Још нема порука.',
  en: 'No messages yet.',
}

/**
 * Spisak poruka sa skrolom.
 *
 * Uzastopne poruke istog autora se stapaju - ime i slika se ne ponavljaju.
 * Bez toga prepiska od dvadeset poruka izgleda kao dvadeset odvojenih objava.
 */
export function MessageList({
  messages,
  dayLabelOf,
  height = 380,
  autoScroll = true,
  loading = false,
  emptyText,
  onReact,
  reactionOptions,
}: MessageListProps) {
  const { t } = useI18n()
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (autoScroll) bottomRef.current?.scrollIntoView({ block: 'end' })
  }, [messages.length, autoScroll])

  if (loading) {
    return (
      <Group justify="center" h={height} align="center">
        <Loader size="sm" />
      </Group>
    )
  }

  if (messages.length === 0) {
    return (
      <Group justify="center" h={height} align="center">
        <Text size="sm" c="dimmed">{t(emptyText ?? NO_MESSAGES)}</Text>
      </Group>
    )
  }

  let lastDay: string | null = null

  return (
    <ScrollArea h={height} type="hover" offsetScrollbars>
      <Stack gap={0} px="xs" py="sm">
        {messages.map((message, index) => {
          const previous = messages[index - 1]
          const compact = Boolean(previous && previous.author.id === message.author.id && previous.own === message.own)
          const day = dayLabelOf?.(message) ?? null
          const showDay = day !== null && day !== lastDay
          if (day !== null) lastDay = day

          return (
            <Box key={message.id}>
              {showDay && (
                <Group justify="center" my="sm">
                  <Text
                    size="xs"
                    px="xs"
                    py={2}
                    style={{
                      color: liroVar.text.tertiary,
                      backgroundColor: liroVar.surface.sunken,
                      borderRadius: 'var(--liro-radius-full)',
                    }}
                  >
                    {day}
                  </Text>
                </Group>
              )}
              <MessageBubble
                message={message}
                compact={compact && !showDay}
                onReact={onReact}
                reactionOptions={reactionOptions}
              />
            </Box>
          )
        })}
        <div ref={bottomRef} />
      </Stack>
    </ScrollArea>
  )
}

export interface MessageComposerProps {
  onSend: (text: string) => void
  placeholder?: LocalizedLabel
  disabled?: boolean
  sending?: boolean
  /** Dugmad levo od polja - prilog, šablon odgovora. */
  actions?: ReactNode
}

const PLACEHOLDER: LocalizedLabel = {
  sr: 'Napišite poruku…',
  'sr-Cyrl': 'Напишите поруку…',
  en: 'Write a message…',
}

/**
 * Polje za pisanje.
 *
 * `Enter` salje, `Shift+Enter` prelazi u novi red. Obrnuto ponasanje je najcesca
 * zamerka na poslovne aplikacije - ko celi dan pise poruke ne trazi misem dugme
 * za slanje.
 */
export function MessageComposer({
  onSend,
  placeholder,
  disabled = false,
  sending = false,
  actions,
}: MessageComposerProps) {
  const { t } = useI18n()
  const [value, setValue] = useState('')

  const send = () => {
    const text = value.trim()
    if (!text || disabled) return
    onSend(text)
    setValue('')
  }

  return (
    <Group
      gap="xs"
      align="flex-end"
      wrap="nowrap"
      p="xs"
      style={{ borderTop: `1px solid ${liroVar.border.default}` }}
    >
      {actions}

      <Textarea
        value={value}
        onChange={(event) => setValue(event.currentTarget.value)}
        onKeyDown={(event) => {
          if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault()
            send()
          }
        }}
        placeholder={t(placeholder ?? PLACEHOLDER)}
        autosize
        minRows={1}
        maxRows={5}
        disabled={disabled}
        style={{ flex: 1 }}
      />

      <ActionIcon
        variant="filled"
        size={36}
        radius="md"
        onClick={send}
        disabled={disabled || value.trim().length === 0}
        loading={sending}
        aria-label={t({ sr: 'Pošalji', 'sr-Cyrl': 'Пошаљи', en: 'Send' })}
      >
        <Send size={16} />
      </ActionIcon>
    </Group>
  )
}

export interface MessageThreadProps extends MessageListProps {
  onSend?: (text: string) => void
  composerActions?: ReactNode
  sending?: boolean
}

/** Spisak i polje za pisanje kao jedna celina. */
export function MessageThread({ onSend, composerActions, sending, ...listProps }: MessageThreadProps) {
  return (
    <Stack gap={0}>
      <MessageList {...listProps} />
      {onSend && <MessageComposer onSend={onSend} actions={composerActions} sending={sending} />}
    </Stack>
  )
}
