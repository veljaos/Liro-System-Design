'use client'

import { Box, Group, Stack, Text, Textarea } from '@mantine/core'
import { useState, type ReactNode } from 'react'
import { liroVar } from '@liro/tokens'
import { useI18n, type LocalizedLabel } from '@liro/i18n'
import { ActionButton } from '../actions/ActionButton'
import { PersonAvatar } from '../primitives/PersonAvatar'

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
  /** Poruka koju je napisao trenutni korisnik - poravnava se desno. */
  own?: boolean
  /** Sistemska poruka - bez avatara, centrirana, tisa. */
  system?: boolean
}

export interface CommentThreadProps {
  comments: CommentItem[]
  onSubmit?: (body: string) => void | Promise<void>
  submitting?: boolean
  placeholder?: LocalizedLabel
  emptyState?: ReactNode
}

/**
 * Prepiska uz zapis - komentari na dokumentu, poruke prema klijentu, beleske
 * knjigovodje.
 *
 * Tudje poruke stoje levo, sopstvene desno, sistemske u sredini. Taj raspored
 * ljudi prepoznaju iz svake aplikacije za poruke koju su ikada koristili, pa
 * ga ne treba objasnjavati.
 */
export function CommentThread({
  comments,
  onSubmit,
  submitting = false,
  placeholder,
  emptyState,
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

      <Stack gap="sm">
        {comments.map((comment) => {
          if (comment.system) {
            return (
              <Text key={comment.id} size="xs" ta="center" style={{ color: liroVar.text.tertiary }}>
                {comment.body} · {formatDate(comment.createdAt, { dateStyle: 'short', timeStyle: 'short' })}
              </Text>
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
                    /* Ugao okrenut ka posiljaocu - vizuelni trag ko govori. */
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
            placeholder={t(placeholder ?? { sr: 'Napišite poruku…', 'sr-Cyrl': 'Напишите поруку…', en: 'Write a message…' })}
            autosize
            minRows={2}
            maxRows={6}
            /* Ctrl+Enter salje - ista navika kao u svakom alatu za prepisku. */
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
  /** Sta se desilo - "Dokument proknjižen". */
  action: LocalizedLabel | string
  actor?: string
  at: string | Date
  /** Dodatni opis - stara i nova vrednost, broj naloga. */
  detail?: string
  tone?: 'neutral' | 'success' | 'warning' | 'danger'
}

export interface AuditTrailProps {
  entries: AuditEntry[]
  emptyState?: ReactNode
}

/**
 * Istorija zapisa. U poslovnom softveru je ovo cesto najvazniji panel na
 * ekranu - kada nesto krene naopako, prvo pitanje je ko je i kada sta uradio.
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
