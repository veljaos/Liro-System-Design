import { Stack } from '@mantine/core'
import { Building2 } from 'lucide-react'
import { getServerI18n } from '@liro/i18n/server'
import { PageContainer, PageHeader, SectionCard, KeyValueList, StatusBadge } from '@liro/ui/primitives'

/**
 * Serverska stranica — bez `'use client'` bilo gde u ovom fajlu.
 *
 * Provera da je stvarno serverska: `pnpm build` prijavljuje rutu sa oznakom
 * `ƒ` (dinamicka, jer cita kolacic), a u pregledacu Network -> JS ne sadrzi
 * kod ove stranice. Dohvatanje podataka bi ovde islo direktno kroz `await`,
 * bez TanStack Query i bez `useEffect`.
 */
export default async function ServerPage() {
  const { t, formatCurrency, formatDate } = await getServerI18n()

  /* Umesto ovoga bi ovde stajao `await supabase.from(...)` ili `await fetch(...)`. */
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
        title={t({ sr: 'Klijent', 'sr-Cyrl': 'Клијент', en: 'Client' })}
        description={klijent.naziv}
        badge={
          <StatusBadge
            tone={klijent.aktivan ? 'success' : 'neutral'}
            label={t(
              klijent.aktivan
                ? { sr: 'Aktivan', 'sr-Cyrl': 'Активан', en: 'Active' }
                : { sr: 'Neaktivan', 'sr-Cyrl': 'Неактиван', en: 'Inactive' },
            )}
          />
        }
        withDivider
      />

      <Stack gap="md">
        <SectionCard title={t({ sr: 'Osnovni podaci', 'sr-Cyrl': 'Основни подаци', en: 'Details' })}>
          <KeyValueList
            columns={2}
            items={[
              { label: t({ sr: 'Naziv', en: 'Name' }), value: klijent.naziv },
              { label: 'PIB', value: klijent.pib, numeric: true },
              { label: t({ sr: 'Matični broj', en: 'Registration no.' }), value: klijent.maticni, numeric: true },
              { label: t({ sr: 'Ugovor od', en: 'Contract from' }), value: formatDate(klijent.ugovor) },
              { label: t({ sr: 'Adresa', en: 'Address' }), value: klijent.adresa, fullWidth: true },
              {
                label: t({ sr: 'Mesečna naknada', en: 'Monthly fee' }),
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