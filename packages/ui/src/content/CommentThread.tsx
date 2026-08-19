'use client'

import { Box, Group, Stack, Text, Textarea } from '@mantine/core'
import { useState, type ReactNode } from 'react'
import { liroVar } from '@liro/tokens'
import { useI18n, type LocalizedLabel, type TranslationKey } from '@liro/i18n'
import { ActionButton } from '../actions/ActionButton'
import { PersonAvatar } from '../primitives/PersonAvatar'

const DEFAULT_PLACEHOLDER: TranslationKey = 'ui.writeMessage.placeholder'

export interface CommentAuthor {
  id: string
  name: string
  avatarUrl?: string | null
}

export interface CommentItem {
  id: string
  author: CommentAuthor
  body: string
  createdAt: string | Date
  /** Message written by the current user — aligned to the right. */
  own?: boolean
  /** System message — no avatar, centered, muted. */
  system?: boolean
}

export interface CommentThreadProps {
  comments: CommentItem[]
  onSubmit?: (body: string) => void | Promise<void>
  submitting?: boolean
  placeholder?: LocalizedLabel
  /**
   * `bubbles` is a conversation: sides left and right, a corner toward the
   * sender. `flat` is a remark on a document: no bubble, the body indented
   * under the name.
   *
   * In the `flat` form, `own` does NOT align right. In correspondence, who is
   * speaking matters; in a list of remarks, what is written matters — and a
   * long remark aligned right is harder to read for no benefit.
   */
  layout?: 'bubbles' | 'flat'
  emptyState?: ReactNode
}

/**
 * Correspondence attached to a record — comments on a document, messages to
 * a client, a bookkeeper's notes.
 *
 * Other people's messages sit on the left, your own on the right, system
 * messages in the middle. People recognize this layout from every messaging
 * application they have ever used, so it needs no explanation.
 */
export function CommentThread({
  comments,
  onSubmit,
  submitting = false,
  placeholder,
  emptyState,
  layout = 'bubbles',
}: CommentThreadProps) {
  const { t, formatDate } = useI18n()
  const [draft, setDraft] = useState('')

  const send = async () => {
    const body = draft.trim()
    if (!body || !onSubmit) return
    await onSubmit(body)
    setDraft('')
  }

  return (
    <Stack gap="md">
      {comments.length === 0 && emptyState}

      <Stack gap={layout === 'flat' ? 'lg' : 'sm'}>
        {comments.map((comment) => {
          if (comment.system) {
            return (
              <Text key={comment.id} size="xs" ta="center" style={{ color: liroVar.text.tertiary }}>
                {comment.body} · {formatDate(comment.createdAt, { dateStyle: 'short', timeStyle: 'short' })}
              </Text>
            )
          }

          if (layout === 'flat') {
            return (
              <Box key={comment.id}>
                <Group gap="xs" wrap="nowrap">
                  <PersonAvatar name={comment.author.name} src={comment.author.avatarUrl} size="sm" />
                  <Box style={{ minWidth: 0 }}>
                    <Text size="sm" fw={500} truncate>
                      {comment.author.name}
                    </Text>
                    <Text size="xs" style={{ color: liroVar.text.tertiary }}>
                      {formatDate(comment.createdAt, { dateStyle: 'short', timeStyle: 'short' })}
                    </Text>
                  </Box>
                </Group>
                <Text
                  size="sm"
                  mt={6}
                  /* 36px = avatar `sm` (26) + `gap="xs"` (10). The body starts
                  exactly under the name, not under the avatar. */
                  pl={36}
                  style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}
                >
                  {comment.body}
                </Text>
              </Box>
            )
          }

          return (
            <Group
              key={comment.id}
              align="flex-start"
              gap="xs"
              wrap="nowrap"
              justify={comment.own ? 'flex-end' : 'flex-start'}
            >
              {!comment.own && (
                <PersonAvatar name={comment.author.name} src={comment.author.avatarUrl} size="sm" />
              )}

              <Stack gap={2} style={{ maxWidth: '72%' }} align={comment.own ? 'flex-end' : 'flex-start'}>
                <Box
                  px="sm"
                  py={8}
                  style={{
                    backgroundColor: comment.own ? liroVar.brand.subtle : liroVar.surface.sunken,
                    border: `1px solid ${comment.own ? liroVar.border.brand : liroVar.border.subtle}`,
                    /* Corner turned toward the sender — a visual cue for who is speaking. */
                    borderRadius: comment.own
                      ? 'var(--liro-radius-lg) var(--liro-radius-xs) var(--liro-radius-lg) var(--liro-radius-lg)'
                      : 'var(--liro-radius-xs) var(--liro-radius-lg) var(--liro-radius-lg) var(--liro-radius-lg)',
                  }}
                >
                  <Text size="sm" style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                    {comment.body}
                  </Text>
                </Box>
                <Text size="xs" style={{ color: liroVar.text.tertiary }}>
                  {comment.own ? '' : `${comment.author.name} · `}
                  {formatDate(comment.createdAt, { dateStyle: 'short', timeStyle: 'short' })}
                </Text>
              </Stack>
            </Group>
          )
        })}
      </Stack>

      {onSubmit && (
        <Stack gap="xs">
          <Textarea
            value={draft}
            onChange={(event) => setDraft(event.currentTarget.value)}
            placeholder={t(placeholder ?? DEFAULT_PLACEHOLDER)}
            autosize
            minRows={2}
            maxRows={6}
            /* Ctrl+Enter sends — the same habit as in every messaging tool. */
            onKeyDown={(event) => {
              if (event.key === 'Enter' && (event.ctrlKey || event.metaKey)) {
                event.preventDefault()
                void send()
              }
            }}
          />
          <Group justify="flex-end">
            <ActionButton
              intent="send"
              onClick={() => void send()}
              loading={submitting}
              disabled={!draft.trim()}
              shortcut={['Ctrl', 'Enter']}
            />
          </Group>
        </Stack>
      )}
    </Stack>
  )
}

export interface AuditEntry {
  id: string
  /** What happened - "Document posted". */
  action: LocalizedLabel | string
  actor?: string
  at: string | Date
  /** Extra description - old and new value, entry number. */
  detail?: string
  tone?: 'neutral' | 'success' | 'warning' | 'danger'
}

export interface AuditTrailProps {
  entries: AuditEntry[]
  emptyState?: ReactNode
}

/**
 * Record history. In business software this is often the most important
 * panel on screen — when something goes wrong, the first question is who
 * did what and when.
 */
export function AuditTrail({ entries, emptyState }: AuditTrailProps) {
  const { t, formatDate } = useI18n()

  if (entries.length === 0 && emptyState) return <>{emptyState}</>

  const toneColor = {
    neutral: liroVar.border.strong,
    success: liroVar.status.success.solid,
    warning: liroVar.status.warning.solid,
    danger: liroVar.status.danger.solid,
  }

  return (
    <Stack gap={0}>
      {entries.map((entry, index) => (
        <Group key={entry.id} align="flex-start" gap="sm" wrap="nowrap">
          <Stack gap={0} align="center" style={{ flexShrink: 0, alignSelf: 'stretch' }}>
            <Box
              w={9}
              h={9}
              mt={5}
              style={{
                borderRadius: '50%',
                backgroundColor: toneColor[entry.tone ?? 'neutral'],
                flexShrink: 0,
              }}
            />
            {index < entries.length - 1 && (
              <Box w={1} style={{ flex: 1, backgroundColor: liroVar.border.default, minHeight: 20 }} />
            )}
          </Stack>

          <Stack gap={2} pb={index < entries.length - 1 ? 'md' : 0} style={{ minWidth: 0 }}>
            <Text size="sm" fw={500}>
              {typeof entry.action === 'string' ? entry.action : t(entry.action)}
            </Text>
            <Text size="xs" style={{ color: liroVar.text.tertiary }}>
              {entry.actor ? `${entry.actor} · ` : ''}
              {formatDate(entry.at, { dateStyle: 'medium', timeStyle: 'short' })}
            </Text>
            {entry.detail && (
              <Text size="xs" style={{ color: liroVar.text.secondary }}>{entry.detail}</Text>
            )}
          </Stack>
        </Group>
      ))}
    </Stack>
  )
}
