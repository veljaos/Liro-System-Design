'use client'

import { Box, Button, Container, Divider, Group, SimpleGrid, Stack, Text, Title } from '@mantine/core'
import type { LucideIcon } from 'lucide-react'
import type { ElementType, ReactNode } from 'react'
import { liroVar } from '@liro/tokens'
import { useI18n, type LocalizedLabel, type TranslationKey } from '@liro/i18n'
import { BrandMark, useLiroAppOptional } from '@liro/ui'

const LAST_UPDATED: TranslationKey = 'templates.landing.lastUpdated'

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
  /** Short tag above the heading - product category or status. */
  eyebrow?: LocalizedLabel
  headline: LocalizedLabel
  subheadline?: LocalizedLabel
  actions?: LandingAction[]
  /** Screenshot, illustration, or live demonstration. */
  visual?: ReactNode
  features?: LandingFeature[]
  featuresTitle?: LocalizedLabel
  /** Free-form sections below the features display. */
  children?: ReactNode
  footer?: ReactNode
  linkComponent?: ElementType
}

/**
 * Public product landing page.
 *
 * The layout is deliberately calm: one heading, one sentence of explanation,
 * two actions. Business software is not sold with exclamation marks but with
 * clarity about what it does - so the heading is the only place with the
 * brand typeface, and everything else is readable text at the same scale as
 * the application itself.
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
  /** Date of the last change - a required field for legal texts. */
  updatedAt?: string
  children: ReactNode
  onBack?: () => void
}

/**
 * Terms of use, privacy policy, and similar documents.
 *
 * A narrow 720px measure and more line spacing - these are the only pages in
 * the system that are actually read from beginning to end.
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
                {t(LAST_UPDATED)}: {updatedAt}
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
