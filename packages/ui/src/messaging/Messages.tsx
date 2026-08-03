'use client'

import { useEffect, useRef, useState, type ReactNode } from 'react'
import { ActionIcon, Avatar, Box, Group, Loader, ScrollArea, Stack, Text, Textarea } from '@mantine/core'
import { Check, CheckCheck, Clock, Send, TriangleAlert } from 'lucide-react'
import { liroVar } from '@liro/tokens'
import { useI18n, type LocalizedLabel } from '@liro/i18n'

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
}

/**
 * Jedan oblacic.
 *
 * Tudje poruke su na uzdignutoj povrsini sa ivicom, svoje na brend boji.
 * Razlika je i u obliku: ugao prema autoru je ostar, pa se strana vidi i kada
 * su boje slicne - sto je bitno u tamnoj temi.
 */
export function MessageBubble({ message, compact = false }: MessageBubbleProps) {
  const own = message.own ?? false
  const StatusIcon = message.status ? STATUS_ICON[message.status] : null
  const failed = message.status === 'failed'

  return (
    <Group
      gap="xs"
      align="flex-end"
      wrap="nowrap"
      justify={own ? 'flex-end' : 'flex-start'}
      style={{ marginTop: compact ? 2 : 10 }}
    >
      {!own && (
        <Box w={28} style={{ flexShrink: 0 }}>
          {!compact && (
            <Avatar src={message.author.avatarUrl ?? undefined} size={28} radius="xl" color="liro-blue">
              {message.author.name.slice(0, 2).toUpperCase()}
            </Avatar>
          )}
        </Box>
      )}

      <Stack gap={2} style={{ maxWidth: '72%', alignItems: own ? 'flex-end' : 'flex-start' }}>
        {!compact && !own && (
          <Text size="xs" fw={600} style={{ color: liroVar.text.secondary }}>
            {message.author.name}
          </Text>
        )}

        <Box
          px="sm"
          py={8}
          style={{
            backgroundColor: own ? liroVar.brand.solid : liroVar.surface.raised,
            color: own ? liroVar.brand.onSolid : liroVar.text.primary,
            border: own ? '1px solid transparent' : `1px solid ${liroVar.border.default}`,
            borderRadius: 'var(--liro-radius-lg)',
            /* Ostar ugao prema autoru — strana se vidi i bez boje. */
            borderBottomRightRadius: own ? 'var(--liro-radius-xs)' : undefined,
            borderBottomLeftRadius: own ? undefined : 'var(--liro-radius-xs)',
            fontSize: 'var(--liro-font-size-sm)',
            lineHeight: 'var(--liro-line-height-base)',
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
          }}
        >
          {message.text}
          {message.footer && <Box mt={6}>{message.footer}</Box>}
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
              <MessageBubble message={message} compact={compact && !showDay} />
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
