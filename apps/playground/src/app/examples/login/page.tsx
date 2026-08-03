'use client'

import { useState } from 'react'
import { Box, Stack, Text } from '@mantine/core'
import { AuthShell, LoginForm, TwoFactorForm } from '@liro/ui'
import { liroVar } from '@liro/tokens'

/**
 * Prijava u punoj visini.
 *
 * Bez okvira aplikacije, jer ekran za prijavu stoji pre nego sto okvir uopste
 * postoji. Dvofaktorna potvrda je drugi korak istog toka.
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
      caption={{ sr: 'Poslovna aplikacija', en: 'Business application' }}
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
          Uslovi korišćenja · Politika privatnosti
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
