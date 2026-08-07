'use client'

import { Anchor, Group, Stack, Text, VisuallyHidden } from '@mantine/core'
import { AtSign, Phone } from 'lucide-react'
import type { ReactNode } from 'react'
import { liroVar } from '@liro/tokens'
import { useI18n, type LocalizedLabel } from '@liro/i18n'
import { PersonAvatar } from '../primitives/PersonAvatar'

/**
 * Lice sa kontakt podacima: avatar, uloga, ime, posta i telefon.
 *
 * Kontakt je LINK, ne tekst. Napisana adresa koju korisnik mora da prekopira
 * rukom je posao koji racunar moze da uradi - `mailto:` i `tel:` otvaraju
 * program, a na telefonu pokrecu poziv.
 */

const EMAIL_LABEL: LocalizedLabel = {
  sr: 'Elektronska pošta:',
  'sr-Cyrl': 'Електронска пошта:',
  en: 'Email:',
}

const PHONE_LABEL: LocalizedLabel = {
  sr: 'Telefon:',
  'sr-Cyrl': 'Телефон:',
  en: 'Phone:',
}

/**
 * `tel:` prima samo cifre i vodeci plus.
 *
 * "+381 (11) 890 56 23" u href-u ne radi - razmaci i zagrade su tu za oko,
 * ne za birac. Prikazuje se ono sto je prosledjeno, poziva se ocisceno.
 */
function telHref(phone: string): string {
  return `tel:${phone.replace(/[^\d+]/g, '')}`
}

export interface PersonInfoProps {
  name: string
  /**
   * Radno mesto ili zvanje. Stoji NAD imenom, verzalom.
   * 
   * NIJE `role`: u JSX-u taj prop znaci ARIA ulogu, i `jsx-a11y/aria-role` ga
   * odbija na svakom elementu - i na nasim komponentama, ne samo na DOM-u.
   */
  position?: string
  email?: string
  phone?: string
  avatarUrl?: string | null
  size?: number
  /** Dodatni redovi ispod kontakta. */
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
                Ikonica kaze OKU da je ovo posta; citacu ekrana ne kaze nista,
                jer je `aria-hidden`. Bez ovog prefiksa link se procita kao niz
                znakova bez konteksta - a kod telefona je to samo broj.
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