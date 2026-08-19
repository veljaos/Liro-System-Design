'use client'

import { useEffect, useRef, useState } from 'react'
import { Anchor, Checkbox, Group, PasswordInput, PinInput, Stack, Text, TextInput, Title } from '@mantine/core'
import { liroVar } from '@liro/tokens'
import { useI18n, type LocalizedLabel, type TranslationKey } from '@liro/i18n'
import { ActionButton } from '../actions/ActionButton'
import { Callout } from '../content/Callout'

const LOGIN_TITLE: TranslationKey = 'auth.login.title'
const EMAIL: TranslationKey = 'auth.login.email'
const PASSWORD: TranslationKey = 'auth.login.password'
const REMEMBER_ME: TranslationKey = 'auth.login.rememberMe'
const FORGOT_PASSWORD: TranslationKey = 'auth.login.forgotPassword'
const SIGN_IN: TranslationKey = 'auth.login.signIn'
const TWO_FACTOR_TITLE: TranslationKey = 'auth.twoFactor.title'
const TWO_FACTOR_DESCRIPTION: TranslationKey = 'auth.twoFactor.description'
const RESEND_IN: TranslationKey = 'auth.login.resendIn'
const SEND_NEW_CODE: TranslationKey = 'auth.login.sendNewCode'

export interface LoginFormProps {
  onSubmit: (values: { email: string; password: string; remember: boolean }) => void | Promise<void>
  submitting?: boolean
  /** Error message - wrong credentials, locked account, expired session. */
  error?: string | null
  onForgotPassword?: () => void
  forgotPasswordHref?: string
  title?: LocalizedLabel
  /** Hides "remember me" for applications with a strict session policy. */
  withRemember?: boolean
  footer?: React.ReactNode
}

/**
 * Sign in.
 *
 * Focus goes to the email field immediately on display — a user who signs
 * in twenty times a day should not have to hunt for the cursor with the
 * mouse. Enter in any field submits the form.
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
          {t(title ?? LOGIN_TITLE)}
        </Title>

        {error && <Callout tone="danger">{error}</Callout>}

        <TextInput
          ref={emailRef}
          type="email"
          autoComplete="username"
          label={t(EMAIL)}
          value={email}
          onChange={(event) => setEmail(event.currentTarget.value)}
          required
        />

        <PasswordInput
          autoComplete="current-password"
          label={t(PASSWORD)}
          value={password}
          onChange={(event) => setPassword(event.currentTarget.value)}
          required
        />

        <Group justify="space-between" align="center">
          {withRemember ? (
            <Checkbox
              label={t(REMEMBER_ME)}
              checked={remember}
              onChange={(event) => setRemember(event.currentTarget.checked)}
            />
          ) : (
            <span />
          )}

          {(onForgotPassword || forgotPasswordHref) && (
            <Anchor size="xs" href={forgotPasswordHref} onClick={onForgotPassword}>
              {t(FORGOT_PASSWORD)}
            </Anchor>
          )}
        </Group>

        <ActionButton
          intent="confirm"
          type="submit"
          label={SIGN_IN}
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
  /** Number of digits; TOTP is always 6, backup codes can be longer. */
  length?: number
  onResend?: () => void
  /** Seconds until resend is allowed; the button is locked while it counts down. */
  resendIn?: number
  description?: LocalizedLabel
}

/**
 * Two-factor verification.
 *
 * The code is submitted as soon as the last digit is entered — an extra
 * "Confirm" button is one press nobody needs. Pasting the code from an app
 * works because `PinInput` accepts the whole string at once.
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
        {t(TWO_FACTOR_TITLE)}
      </Title>

      <Text size="sm" ta="center" style={{ color: liroVar.text.secondary }}>
        {t(description ?? TWO_FACTOR_DESCRIPTION)}
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
          label={resendIn > 0 ? t(RESEND_IN, undefined, { seconds: resendIn }) : SEND_NEW_CODE}
          onClick={onResend}
          disabled={resendIn > 0 || submitting}
        />
      )}
    </Stack>
  )
}
