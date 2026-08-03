'use client'

import { Box, Button, Container, Divider, Group, SimpleGrid, Stack, Text, Title } from '@mantine/core'
import type { LucideIcon } from 'lucide-react'
import type { ElementType, ReactNode } from 'react'
import { liroVar } from '@liro/tokens'
import { useI18n, type LocalizedLabel } from '@liro/i18n'
import { BrandMark, useLiroAppOptional } from '@liro/ui'

export interface LandingAction {
  label: LocalizedLabel
  href?: string
  onClick?: () => void
  variant?: 'filled' | 'default'
}

export interface LandingFeature {
  icon?: LucideIcon
  title: LocalizedLabel
  description: LocalizedLabel
}

export interface LandingTemplateProps {
  /** Kratka oznaka iznad naslova - kategorija proizvoda ili status. */
  eyebrow?: LocalizedLabel
  headline: LocalizedLabel
  subheadline?: LocalizedLabel
  actions?: LandingAction[]
  /** Snimak ekrana, ilustracija ili živa demonstracija. */
  visual?: ReactNode
  features?: LandingFeature[]
  featuresTitle?: LocalizedLabel
  /** Slobodne sekcije ispod prikaza mogućnosti. */
  children?: ReactNode
  footer?: ReactNode
  linkComponent?: ElementType
}

/**
 * Javna pocetna strana proizvoda.
 *
 * Raspored je namerno miran: jedan naslov, jedna recenica objasnjenja, dve
 * radnje. Poslovni softver se ne prodaje uzvicnicima nego jasnocom o tome sta
 * radi - pa je naslov jedino mesto sa brend pismom, a sve ostalo je citljiv
 * tekst u istoj skali kao i sama aplikacija.
 */
export function LandingTemplate({
  eyebrow,
  headline,
  subheadline,
  actions = [],
  visual,
  features = [],
  featuresTitle,
  children,
  footer,
  linkComponent,
}: LandingTemplateProps) {
  const { t } = useI18n()
  const app = useLiroAppOptional()
  const Link = (linkComponent ?? app?.linkComponent ?? 'a') as ElementType

  const renderAction = (action: LandingAction, index: number) => {
    const label = t(action.label)
    const variant = action.variant ?? (index === 0 ? 'filled' : 'default')

    if (action.href) {
      return (
        <Button
          key={index}
          size="md"
          variant={variant}
          renderRoot={(props) => <Link href={action.href} {...props} />}
        >
          {label}
        </Button>
      )
    }

    return (
      <Button key={index} size="md" variant={variant} onClick={action.onClick}>
        {label}
      </Button>
    )
  }

  return (
    <Box style={{ backgroundColor: liroVar.surface.raised, minHeight: '100dvh' }}>
      <Container size="lg" py="xl">
        <Group justify="space-between" mb={64}>
          <BrandMark size="md" responsive={false} />
        </Group>

        <Stack gap="xl" align="center" maw={720} mx="auto" ta="center">
          {eyebrow && (
            <Text
              size="sm"
              fw={700}
              style={{
                color: liroVar.text.brand,
                textTransform: 'uppercase',
                letterSpacing: 'var(--liro-tracking-caps)',
              }}
            >
              {t(eyebrow)}
            </Text>
          )}

          <Title
            order={1}
            style={{
              fontFamily: 'var(--liro-font-brand)',
              fontSize: 'clamp(32px, 5vw, 52px)',
              lineHeight: 1.15,
              letterSpacing: 'var(--liro-tracking-heading)',
            }}
          >
            {t(headline)}
          </Title>

          {subheadline && (
            <Text size="lg" style={{ color: liroVar.text.secondary, maxWidth: 560 }}>
              {t(subheadline)}
            </Text>
          )}

          {actions.length > 0 && (
            <Group justify="center" gap="sm">
              {actions.map(renderAction)}
            </Group>
          )}
        </Stack>

        {visual && (
          <Box
            mt={64}
            style={{
              borderRadius: 'var(--liro-radius-xl)',
              border: `1px solid ${liroVar.border.default}`,
              overflow: 'hidden',
              backgroundColor: liroVar.surface.sunken,
            }}
          >
            {visual}
          </Box>
        )}

        {features.length > 0 && (
          <Stack gap="xl" mt={96}>
            {featuresTitle && (
              <Title order={2} ta="center">{t(featuresTitle)}</Title>
            )}
            <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="xl">
              {features.map((feature, index) => {
                const Icon = feature.icon
                return (
                  <Stack key={index} gap="xs" align="flex-start">
                    {Icon && (
                      <Box
                        p={10}
                        style={{
                          borderRadius: 'var(--liro-radius-md)',
                          backgroundColor: liroVar.brand.subtle,
                          color: liroVar.text.brand,
                          display: 'flex',
                        }}
                      >
                        <Icon size={20} />
                      </Box>
                    )}
                    <Text fw={600} mt={4}>{t(feature.title)}</Text>
                    <Text size="sm" style={{ color: liroVar.text.secondary }}>
                      {t(feature.description)}
                    </Text>
                  </Stack>
                )
              })}
            </SimpleGrid>
          </Stack>
        )}

        {children && <Box mt={96}>{children}</Box>}

        {footer && (
          <>
            <Divider mt={96} mb="lg" />
            <Box style={{ color: liroVar.text.tertiary, fontSize: 'var(--liro-font-size-xs)' }}>
              {footer}
            </Box>
          </>
        )}
      </Container>
    </Box>
  )
}

export interface LegalPageTemplateProps {
  title: LocalizedLabel
  /** Datum poslednje izmene - kod pravnih tekstova je obavezan podatak. */
  updatedAt?: string
  children: ReactNode
  onBack?: () => void
}

/**
 * Uslovi koriscenja, politika privatnosti i slicni dokumenti.
 *
 * Uza mera od 720px i veci prored - ovo su jedine stranice u sistemu koje se
 * zaista citaju od pocetka do kraja.
 */
export function LegalPageTemplate({ title, updatedAt, children }: LegalPageTemplateProps) {
  const { t } = useI18n()

  return (
    <Box style={{ backgroundColor: liroVar.surface.raised, minHeight: '100dvh' }}>
      <Container size={720} py="xl">
        <Stack gap="xl">
          <Stack gap="xs">
            <BrandMark size="md" responsive={false} />
            <Title order={1} mt="md">{t(title)}</Title>
            {updatedAt && (
              <Text size="xs" style={{ color: liroVar.text.tertiary }}>
                {t({ sr: 'Poslednja izmena', 'sr-Cyrl': 'Последња измена', en: 'Last updated' })}: {updatedAt}
              </Text>
            )}
          </Stack>

          <Divider />

          <Box style={{ lineHeight: 'var(--liro-line-height-relaxed)' }}>{children}</Box>
        </Stack>
      </Container>
    </Box>
  )
}
