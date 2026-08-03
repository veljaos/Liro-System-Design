'use client'

import { useEffect, useRef, useState } from 'react'
import { Anchor, Checkbox, Group, PasswordInput, PinInput, Stack, Text, TextInput, Title } from '@mantine/core'
import { liroVar } from '@liro/tokens'
import { useI18n, type LocalizedLabel } from '@liro/i18n'
import { ActionButton } from '../actions/ActionButton'
import { Callout } from '../content/Callout'

export interface LoginFormProps {
  onSubmit: (values: { email: string; password: string; remember: boolean }) => void | Promise<void>
  submitting?: boolean
  /** Poruka o gresci - pogresni podaci, zakljucan nalog, istekla sesija. */
  error?: string | null
  onForgotPassword?: () => void
  forgotPasswordHref?: string
  title?: LocalizedLabel
  /** Sakriva "zapamti me" za aplikacije sa strogom politikom sesija. */
  withRemember?: boolean
  footer?: React.ReactNode
}

/**
 * Prijava.
 *
 * Fokus ide u polje elektronske poste odmah po prikazu - korisnik koji se
 * prijavljuje dvadeset puta dnevno ne treba da trazi kursor misem. Enter u
 * bilo kom polju salje formu.
 */
export function LoginForm({
  onSubmit,
  submitting = false,
  error,
  onForgotPassword,
  forgotPasswordHref,
  title,
  withRemember = true,
  footer,
}: LoginFormProps) {
  const { t } = useI18n()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [remember, setRemember] = useState(false)
  const emailRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    emailRef.current?.focus()
  }, [])

  const submit = () => {
    if (!email || !password || submitting) return
    void onSubmit({ email, password, remember })
  }

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault()
        submit()
      }}
    >
      <Stack gap="md">
        <Title order={3} ta="center">
          {t(title ?? { sr: 'Prijava na sistem', 'sr-Cyrl': 'Пријава на систем', en: 'Sign in' })}
        </Title>

        {error && <Callout tone="danger">{error}</Callout>}

        <TextInput
          ref={emailRef}
          type="email"
          autoComplete="username"
          label={t({ sr: 'Elektronska pošta', 'sr-Cyrl': 'Електронска пошта', en: 'Email' })}
          value={email}
          onChange={(event) => setEmail(event.currentTarget.value)}
          required
        />

        <PasswordInput
          autoComplete="current-password"
          label={t({ sr: 'Lozinka', 'sr-Cyrl': 'Лозинка', en: 'Password' })}
          value={password}
          onChange={(event) => setPassword(event.currentTarget.value)}
          required
        />

        <Group justify="space-between" align="center">
          {withRemember ? (
            <Checkbox
              label={t({ sr: 'Zapamti me', 'sr-Cyrl': 'Запамти ме', en: 'Remember me' })}
              checked={remember}
              onChange={(event) => setRemember(event.currentTarget.checked)}
            />
          ) : (
            <span />
          )}

          {(onForgotPassword || forgotPasswordHref) && (
            <Anchor size="xs" href={forgotPasswordHref} onClick={onForgotPassword}>
              {t({ sr: 'Zaboravljena lozinka?', 'sr-Cyrl': 'Заборављена лозинка?', en: 'Forgot password?' })}
            </Anchor>
          )}
        </Group>

        <ActionButton
          intent="confirm"
          type="submit"
          label={{ sr: 'Prijavi se', 'sr-Cyrl': 'Пријави се', en: 'Sign in' }}
          loading={submitting}
          fullWidth
          size="md"
        />

        {footer}
      </Stack>
    </form>
  )
}

export interface TwoFactorFormProps {
  onSubmit: (code: string) => void | Promise<void>
  submitting?: boolean
  error?: string | null
  /** Broj cifara; TOTP je uvek 6, rezervni kodovi mogu biti duzi. */
  length?: number
  onResend?: () => void
  /** Sekunde do ponovnog slanja; dok traje, dugme je zakljucano. */
  resendIn?: number
  description?: LocalizedLabel
}

/**
 * Potvrda u dva koraka.
 *
 * Kod se salje cim se unese poslednja cifra - dodatno dugme "Potvrdi" je jedan
 * pritisak koji nikome ne treba. Nalepljivanje koda iz aplikacije radi jer
 * `PinInput` prihvata ceo string odjednom.
 */
export function TwoFactorForm({
  onSubmit,
  submitting = false,
  error,
  length = 6,
  onResend,
  resendIn = 0,
  description,
}: TwoFactorFormProps) {
  const { t } = useI18n()
  const [code, setCode] = useState('')

  const handleComplete = (value: string) => {
    setCode(value)
    if (!submitting) void onSubmit(value)
  }

  return (
    <Stack gap="md" align="center">
      <Title order={3} ta="center">
        {t({ sr: 'Potvrda u dva koraka', 'sr-Cyrl': 'Потврда у два корака', en: 'Two-factor verification' })}
      </Title>

      <Text size="sm" ta="center" style={{ color: liroVar.text.secondary }}>
        {t(
          description ?? {
            sr: 'Unesite kod iz aplikacije za potvrdu identiteta.',
            'sr-Cyrl': 'Унесите код из апликације за потврду идентитета.',
            en: 'Enter the code from your authenticator app.',
          },
        )}
      </Text>

      {error && <Callout tone="danger">{error}</Callout>}

      <PinInput
        length={length}
        type="number"
        inputMode="numeric"
        oneTimeCode
        autoFocus
        size="lg"
        value={code}
        onChange={setCode}
        onComplete={handleComplete}
        disabled={submitting}
        error={Boolean(error)}
      />

      {onResend && (
        <ActionButton
          intent="refresh"
          label={
            resendIn > 0
              ? { sr: `Novi kod za ${resendIn}s`, 'sr-Cyrl': `Нови код за ${resendIn}s`, en: `New code in ${resendIn}s` }
              : { sr: 'Pošalji novi kod', 'sr-Cyrl': 'Пошаљи нови код', en: 'Send a new code' }
          }
          onClick={onResend}
          disabled={resendIn > 0 || submitting}
        />
      )}
    </Stack>
  )
}
