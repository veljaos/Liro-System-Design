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
import { useI18n, type LocalizedLabel, type TranslationKey } from '@liro/i18n'
import { PersonAvatar } from '../primitives/PersonAvatar'

/**
 * Messages.
 *
 * In a business application this is not chat but correspondence with a
 * record: a bookkeeper's question to a client, a tax authority's reply, a
 * support message. That is why every message carries a delivery status — in
 * correspondence about a document, it matters whether the other side even
 * received the message.
 */

export type MessageStatus = 'sending' | 'sent' | 'delivered' | 'read' | 'failed'

export interface MessageAuthor {
  id: string
  name: string
  avatarUrl?: string | null
}

export interface MessageReaction {
  /** Reaction key. Comes from the application. */
  id: string
  icon: LucideIcon
  /** Name for the screen reader: "Confirmed", "Question", "Urgent". */
  label: string
  count: number
  /** Whether the current user has already reacted. */
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
  /** Message text. Supports multiple lines. */
  text: string
  /** Already-formatted time — the component does not decide the format. */
  time: string
  /** The current user's message goes on the right. */
  own?: boolean
  status?: MessageStatus
  /** Attachments, labels, buttons — everything below the text. */
  footer?: ReactNode
  /** Reactions to the message. */
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
  /** Hides the name and picture when the previous message is from the same author. */
  compact?: boolean
  withTail?: boolean
  /** Without this, reactions are display-only, with no buttons. */
  onReact?: (messageId: string, reactionId: string) => void
  /**
   * What can be picked in the picker.
   *
   * Empty means there is no picker — existing reactions are still visible, but
   * a new one cannot be added. The set is deliberately small: correspondence
   * with a record does not need twenty reactions, it needs three that mean
   * something.
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

  // One `borderRadius` with four values, not shorthand + individual ones.
  //
  // Mixing `borderRadius` and `border*Radius` in the same style object gives
  // an unpredictable result — React writes them in key order and issues a
  // warning. `CommentThread` in this repo already uses this form and works
  // correctly.
  //
  // Order is: top-left, top-right, bottom-right, bottom-left.
  // The tail is at the TOP, toward the author. The bottom is always rounded —
  // that is where the reactions sit.
  const XL = 'var(--liro-radius-xl)'
  const TAIL = 'var(--liro-radius-xs)'
  const bubbleRadius = !tail
    ? `${XL} ${XL} ${XL} ${XL}`
    : own
      ? `${XL} ${TAIL} ${XL} ${XL}`
      : `${TAIL} ${XL} ${XL} ${XL}`

  // Reactions OVERLAP the bottom edge of the bubble, they do not sit as a row
  // below it. That is why the bubble and the reactions share a wrapper with
  // `position: relative`, and the wrapper gets bottom padding only when there
  // are reactions — otherwise every message would carry empty space holding
  // nothing.
  const overlap = 11

  const chip = (mine: boolean, tone: StatusToneName = 'neutral') =>
    ({
      display: 'flex',
      alignItems: 'center',
      gap: 3,
      padding: '1px 7px',
      borderRadius: 'var(--liro-radius-full)',
      // The base is OPAQUE, and the tone is painted over it.
      //
      // In the dark theme, `status[tone].bg` is translucent (`rgba(..., 0.20)`)
      // and is computed to sit on `ink`. The chip sits on a BLUE bubble, so the
      // translucent green layer mixed with the blue — measured 2.34 instead of
      // 6.32. `backgroundColor` gives the base, `backgroundImage` a layer above
      // it, so the translucency always mixes with the same thing, regardless of
      // what is under the chip.
      //
      // Your own reaction carries the meaning color, someone else's is muted.
      // If they were all colored, a row of four reactions would be a rainbow
      // that does not say which one is yours.
      backgroundColor: mine ? liroVar.surface.raised : liroVar.surface.sunken,
      backgroundImage: mine
        ? `linear-gradient(${liroVar.status[tone].bg}, ${liroVar.status[tone].bg})`
        : undefined,
      color: mine ? liroVar.status[tone].fg : liroVar.text.secondary,
      // A ring in the color of the surface the correspondence SITS on, and
      // that is `raised` — a `SectionCard`, a panel, a drawer. Not `page`: in
      // the light theme the difference is imperceptible, in the dark one it is
      // `ink` against `inkRaised` and the ring reads as a wrong dark line.
      border: `2px solid ${liroVar.surface.raised}`,
      fontSize: 'var(--liro-font-size-xs)',
      lineHeight: 1.4,
    }) as const

  const trigger = canReact ? (
    <Menu position={own ? 'left' : 'right'} withArrow transitionProps={{ transition: 'pop' }}>
      <Menu.Target>
        {/*
          `className`, not `style`: the button is invisible until the mouse
          gets to it, and that is `:hover` and `:focus-within` on the parent —
          cannot be done inline.

          It stays in the keyboard tab order (`opacity: 0`, not `display: none`)
          and becomes visible when it gets focus. That is one extra stop per
          message, like with comments on GitHub.
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
                insetInlineStart: own ? 10 : undefined,
                insetInlineEnd: own ? undefined : 10,
              }}
              // When you cannot react, the whole row is ONE image with a
              // description. Without this, a screen reader reads out a
              // sequence of bare numbers.
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
                    // Color and border only tell the eye that you already reacted.
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
  /** Day label inserted between groups — already formatted by the application. */
  dayLabelOf?: (message: Message) => string | null
  height?: number | string
  /** Scroll to the bottom when a new message arrives. */
  autoScroll?: boolean
  loading?: boolean
  emptyText?: LocalizedLabel
  onReact?: (messageId: string, reactionId: string) => void
  reactionOptions?: ReactionOption[]
}

const NO_MESSAGES: TranslationKey = 'ui.messages.noMessages'

/**
 * List of messages with scroll.
 *
 * Consecutive messages from the same author merge together — the name and
 * picture are not repeated. Without this, a correspondence of twenty messages
 * looks like twenty separate posts.
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
  /** Buttons to the left of the field — attachment, reply template. */
  actions?: ReactNode
}

const PLACEHOLDER: TranslationKey = 'ui.writeMessage.placeholder'
const SEND: TranslationKey = 'ui.messages.send'

/**
 * Composer field.
 *
 * `Enter` sends, `Shift+Enter` moves to a new line. The reversed behavior is
 * the most common complaint about business applications — someone typing
 * messages all day does not reach for the mouse to find a send button.
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
        color="liro-blue"
        size={36}
        radius="md"
        onClick={send}
        disabled={disabled || value.trim().length === 0}
        loading={sending}
        aria-label={t(SEND)}
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

/** List and composer field as a single unit. */
export function MessageThread({ onSend, composerActions, sending, ...listProps }: MessageThreadProps) {
  return (
    <Stack gap={0}>
      <MessageList {...listProps} />
      {onSend && <MessageComposer onSend={onSend} actions={composerActions} sending={sending} />}
    </Stack>
  )
}