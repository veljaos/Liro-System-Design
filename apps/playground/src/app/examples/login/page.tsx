'use client'

import { useState } from 'react'
import { Box, Stack, Text } from '@mantine/core'
import { AuthShell, LoginForm, TwoFactorForm } from '@liro/ui'
import { liroVar } from '@liro/tokens'

/**
 * Full-height login.
 *
 * Without the application frame, since the login screen exists before the
 * frame does at all. Two-factor confirmation is the second step of the same
 * flow.
 */
export default function LoginExamplePage() {
  const [step, setStep] = useState<'login' | 'twoFactor'>('login')
  const [loading, setLoading] = useState(false)

  const submit = () => {
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      setStep('twoFactor')
    }, 700)
  }

  return (
    <AuthShell
      caption={{ en: 'Business application' }}
      cover={
        <Box
          style={{
            height: '100%',
            background: `linear-gradient(140deg, ${liroVar.brand.solid}, ${liroVar.brand.accent})`,
          }}
        />
      }
      footer={
        <Text size="xs">
          Terms of use · Privacy policy
        </Text>
      }
    >
      <Stack gap="md">
        {step === 'login' ? (
          <LoginForm
            submitting={loading}
            onSubmit={submit}
            onForgotPassword={() => {}}
          />
        ) : (
          <TwoFactorForm
            submitting={loading}
            onSubmit={() => setStep('login')}
            onResend={() => {}}
          />
        )}
      </Stack>
    </AuthShell>
  )
}
