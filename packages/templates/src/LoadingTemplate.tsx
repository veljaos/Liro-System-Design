'use client'

import { Center, Grid, Group, Loader, SimpleGrid, Skeleton, Stack, Text } from '@mantine/core'
import { liroVar } from '@liro/tokens'
import { useI18n, type LocalizedLabel } from '@liro/i18n'

export type LoadingVariant = 'list' | 'detail' | 'dashboard' | 'form' | 'spinner'

export interface LoadingTemplateProps {
  variant?: LoadingVariant
  /** Prikazuje se samo uz `spinner`. */
  message?: LocalizedLabel
  rows?: number
}

/**
 * Kostur stranice dok se podaci ucitavaju.
 *
 * Kostur koji odgovara stvarnom rasporedu deluje brze od vrteske, jer se
 * sadrzaj ne pomera kada stigne. Vrteska ostaje samo za slucajeve gde se
 * raspored ne zna unapred.
 */
export function LoadingTemplate({ variant = 'list', message, rows = 6 }: LoadingTemplateProps) {
  const { t } = useI18n()

  if (variant === 'spinner') {
    return (
      <Center py="xl" mih={240}>
        <Stack align="center" gap="sm">
          <Loader size="md" />
          {message && (
            <Text size="sm" style={{ color: liroVar.text.secondary }}>{t(message)}</Text>
          )}
        </Stack>
      </Center>
    )
  }

  const header = (
    <Group justify="space-between" mb="lg" wrap="nowrap">
      <Group gap="sm" wrap="nowrap">
        <Skeleton height={40} width={40} radius="md" />
        <Stack gap={6}>
          <Skeleton height={22} width={200} />
          <Skeleton height={12} width={280} />
        </Stack>
      </Group>
      <Skeleton height={34} width={130} radius="md" />
    </Group>
  )

  if (variant === 'form') {
    return (
      <Stack gap="md">
        {Array.from({ length: rows }).map((_, index) => (
          <Stack key={index} gap={6}>
            <Skeleton height={12} width={110} />
            <Skeleton height={36} radius="md" />
          </Stack>
        ))}
        <Group justify="flex-end" mt="sm">
          <Skeleton height={34} width={100} radius="md" />
          <Skeleton height={34} width={100} radius="md" />
        </Group>
      </Stack>
    )
  }

  if (variant === 'detail') {
    return (
      <Stack gap={0}>
        {header}
        <Grid gap="lg">
          <Grid.Col span={{ base: 12, md: 8 }}>
            <Stack gap="md">
              <Skeleton height={180} radius="lg" />
              <Skeleton height={240} radius="lg" />
            </Stack>
          </Grid.Col>
          <Grid.Col span={{ base: 12, md: 4 }}>
            <Skeleton height={200} radius="lg" />
          </Grid.Col>
        </Grid>
      </Stack>
    )
  }

  if (variant === 'dashboard') {
    return (
      <Stack gap={0}>
        {header}
        <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }} spacing="md" mb="xl">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} height={104} radius="lg" />
          ))}
        </SimpleGrid>
        <SimpleGrid cols={{ base: 1, xs: 2, sm: 3 }} spacing="md">
          {Array.from({ length: 6 }).map((_, index) => (
            <Skeleton key={index} height={132} radius="lg" />
          ))}
        </SimpleGrid>
      </Stack>
    )
  }

  return (
    <Stack gap={0}>
      {header}
      <Group gap="sm" mb="md">
        <Skeleton height={34} width={260} radius="md" />
        <Skeleton height={34} width={140} radius="md" />
      </Group>
      <Stack gap="xs">
        <Skeleton height={38} radius="sm" />
        {Array.from({ length: rows }).map((_, index) => (
          <Skeleton key={index} height={34} radius="sm" />
        ))}
      </Stack>
    </Stack>
  )
}
