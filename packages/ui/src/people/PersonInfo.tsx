'use client'

import { Anchor, Group, Stack, Text, VisuallyHidden } from '@mantine/core'
import { AtSign, Phone } from 'lucide-react'
import type { ReactNode } from 'react'
import { liroVar } from '@liro/tokens'
import { useI18n, type TranslationKey } from '@liro/i18n'
import { PersonAvatar } from '../primitives/PersonAvatar'

/**
 * A person with contact details: avatar, role, name, email, and phone.
 *
 * Contact info is a LINK, not text. A written-out address the user has to
 * copy by hand is work a computer can do — `mailto:` and `tel:` open the
 * appropriate app, and on a phone they start a call.
 */

const EMAIL_LABEL: TranslationKey = 'ui.personInfo.email'
const PHONE_LABEL: TranslationKey = 'ui.personInfo.phone'

/**
 * `tel:` only accepts digits and a leading plus.
 *
 * "+381 (11) 890 56 23" does not work in an href — the spaces and
 * parentheses are there for the eye, not for the dialer. What is passed in
 * is displayed; what is called is cleaned up.
 */
function telHref(phone: string): string {
  return `tel:${phone.replace(/[^\d+]/g, '')}`
}

export interface PersonInfoProps {
  name: string
  /**
   * Job title or role. Sits ABOVE the name, in caps.
   *
   * NOT `role`: in JSX that prop means an ARIA role, and `jsx-a11y/aria-role`
   * rejects it on every element — including our own components, not just
   * the DOM.
   */
  position?: string
  email?: string
  phone?: string
  avatarUrl?: string | null
  size?: number
  /** Extra rows below the contact info. */
  extra?: ReactNode
}

export function PersonInfo({
  name,
  position,
  email,
  phone,
  avatarUrl,
  size = 94,
  extra,
}: PersonInfoProps) {
  const { t } = useI18n()

  return (
    <Group wrap="nowrap" gap="md" align="flex-start">
      <PersonAvatar name={name} src={avatarUrl} size={size} radius="md" />

      <Stack gap={2} style={{ minWidth: 0 }}>
        {position && (
          <Text size="xs" tt="uppercase" fw={700} style={{ color: liroVar.text.tertiary }}>
            {position}
          </Text>
        )}

        <Text size="lg" fw={500} truncate>
          {name}
        </Text>

        {email && (
          <Group gap={8} wrap="nowrap" mt={4}>
            <AtSign size={16} aria-hidden style={{ color: liroVar.text.tertiary, flexShrink: 0 }} />
            <Anchor
              href={`mailto:${email}`}
              size="xs"
              underline="hover"
              truncate
              style={{ color: liroVar.text.link }}
            >
              {/*
                The icon tells the EYE this is an email; it tells a screen
                reader nothing, since it is `aria-hidden`. Without this
                prefix, the link is read as a string of characters with no
                context — and for a phone number, that is just a number.
              */}
              <VisuallyHidden>{t(EMAIL_LABEL)} </VisuallyHidden>
              {email}
            </Anchor>
          </Group>
        )}

        {phone && (
          <Group gap={8} wrap="nowrap" mt={2}>
            <Phone size={16} aria-hidden style={{ color: liroVar.text.tertiary, flexShrink: 0 }} />
            <Anchor
              href={telHref(phone)}
              size="xs"
              underline="hover"
              truncate
              style={{ color: liroVar.text.link }}
            >
              <VisuallyHidden>{t(PHONE_LABEL)} </VisuallyHidden>
              {phone}
            </Anchor>
          </Group>
        )}

        {extra}
      </Stack>
    </Group>
  )
}