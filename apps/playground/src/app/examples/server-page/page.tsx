import { Stack } from '@mantine/core'
import { Building2 } from 'lucide-react'
import { getServerI18n } from '@liro/i18n/server'
import { PageContainer, PageHeader, SectionCard, KeyValueList, StatusBadge } from '@liro/ui/primitives'

/**
 * Server page — no `'use client'` anywhere in this file.
 *
 * A check that it is truly server-side: `pnpm build` reports the route with
 * the `ƒ` marker (dynamic, because it reads a cookie), and in the browser's
 * Network -> JS does not contain this page's code. Data fetching here would
 * go directly through `await`, without TanStack Query and without
 * `useEffect`.
 */
export default async function ServerPage() {
  const { t, formatCurrency, formatDate } = await getServerI18n()

  /* Instead of this, `await supabase.from(...)` or `await fetch(...)` would go here. */
  const klijent = {
    naziv: 'Officedirect d.o.o.',
    pib: '101234567',
    maticni: '20123456',
    adresa: 'Bulevar Mihajla Pupina 10ž, 11070 Novi Beograd',
    ugovor: '2024-03-01',
    mesecnaNaknada: 48000,
    aktivan: true,
  }

  return (
    <PageContainer width="default">
      <PageHeader
        icon={Building2}
        title={t({ en: 'Client' })}
        description={klijent.naziv}
        badge={
          <StatusBadge
            tone={klijent.aktivan ? 'success' : 'neutral'}
            label={t(
              klijent.aktivan
                ? { en: 'Active' }
                : { en: 'Inactive' },
            )}
          />
        }
        withDivider
      />

      <Stack gap="md">
        <SectionCard title={t({ en: 'Details' })}>
          <KeyValueList
            columns={2}
            items={[
              { label: t({ en: 'Name' }), value: klijent.naziv },
              { label: 'PIB', value: klijent.pib, numeric: true },
              { label: t({ en: 'Registration no.' }), value: klijent.maticni, numeric: true },
              { label: t({ en: 'Contract from' }), value: formatDate(klijent.ugovor) },
              { label: t({ en: 'Address' }), value: klijent.adresa, fullWidth: true },
              {
                label: t({ en: 'Monthly fee' }),
                value: formatCurrency(klijent.mesecnaNaknada, 'RSD'),
                numeric: true,
              },
            ]}
          />
        </SectionCard>
      </Stack>
    </PageContainer>
  )
}