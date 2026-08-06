'use client'

import {
  Banknote,
  Bell,
  Building2,
  Calculator,
  CalendarClock,
  FileStack,
  Landmark,
  Receipt,
  ScrollText,
  Settings,
  ShieldCheck,
  Users,
} from 'lucide-react'
import { Kbd, Group, Stack, Text } from '@mantine/core'
import { useState } from 'react'
import { ActionButton, ActionGroup, Launchpad, SectionCard, type LaunchpadTile } from '@liro/ui'
import { DemoAppShell } from '@/components/DemoAppShell'

/**
 * Ulazna tabla aplikacije.
 *
 * Ovako izgleda pocetna strana Liro proizvoda: mreza plocica, svaka sa imenom
 * posla i jednom brojkom koja govori da li tamo ima sta da se radi.
 *
 * Poenta je da korisnik ne mora da otvori ekran da bi saznao da li ga nesto
 * ceka. „Dokumenti · 11 u docnji" je odgovor koji meni ne moze da da.
 */

const TILES: LaunchpadTile[] = [
  {
    id: 'payroll',
    title: { sr: 'Obračun zarada' },
    subtitle: { sr: 'Zarade, olakšice i poreske prijave' },
    icon: Banknote,
    href: '/examples/employees',
  },
  {
    id: 'documents',
    title: { sr: 'Dokumenti' },
    subtitle: { sr: 'Fakture, otpremnice i knjižna odobrenja' },
    icon: Receipt,
    href: '/examples/documents',
  },
  {
    id: 'receipts',
    title: { sr: 'Fiskalni računi' },
    subtitle: { sr: 'Promet sa fiskalnih uređaja po mestima' },
    icon: ScrollText,
    href: '/examples/fiscal-receipts',
  },
  {
    id: 'notifications',
    title: { sr: 'Obaveštenja' },
    subtitle: { sr: 'Rokovi, dokumenti i poruke sistema' },
    icon: Bell,
    href: '/examples/notifications',
  },
  {
    id: 'clients',
    title: { sr: 'Klijenti' },
    subtitle: { sr: 'Šifarnik pravnih lica i preduzetnika' },
    icon: Building2,
    href: '/application',
  },
  {
    id: 'employees',
    title: { sr: 'Zaposlena lica' },
    subtitle: { sr: 'Evidencija radno angažovanih lica' },
    icon: Users,
    href: '/examples/employees',
  },
  {
    id: 'calendar',
    title: { sr: 'Rokovi i obaveze' },
    subtitle: { sr: 'Kalendar obračuna i zakonskih rokova' },
    icon: CalendarClock,
    href: '/category/schedule',
  },
  {
    id: 'reports',
    title: { sr: 'Izveštaji' },
    subtitle: { sr: 'Bruto bilans, kartice konta i IOS' },
    icon: FileStack,
    href: '/category/charts',
  },
  {
    id: 'vat',
    title: { sr: 'PDV evidencija' },
    subtitle: { sr: 'Knjige ulaznih i izlaznih računa' },
    icon: Calculator,
    href: '/application',
  },
  {
    id: 'signing',
    title: { sr: 'Elektronski potpis' },
    subtitle: { sr: 'Potpisivanje dokumenata sertifikatom' },
    icon: Landmark,
    href: '/category/signing',
  },
  {
    id: 'settings',
    title: { sr: 'Podešavanja' },
    subtitle: { sr: 'Nalog, uloge i integracije' },
    icon: Settings,
    href: '/account',
  },
  {
    id: 'audit',
    title: { sr: 'Interna kontrola' },
    subtitle: { sr: 'Revizija zapisa i tragovi izmena' },
    icon: ShieldCheck,
    href: '/category/business-patterns',
    permission: 'audit.view',
    tier: 'enterprise',
  },
]

export default function LaunchpadScreen() {
  const [editing, setEditing] = useState(false)

  return (
    <DemoAppShell>
      {/*
        Bez zaglavlja.

        U Liro Business App-u je pocetna stranica bukvalno `<ModuleGrid />` -
        ni naslova ni pozdrava. Mreza plocica je sama sebi zaglavlje.
      */}
      <Stack gap="lg">
        <ActionGroup>
          <ActionButton
            intent={editing ? 'save' : 'edit'}
            label={editing ? { sr: 'Sačuvaj raspored' } : { sr: 'Uredi raspored' }}
            onClick={() => setEditing((state) => !state)}
          />
        </ActionGroup>

        <Launchpad tiles={TILES} columns={3} editing={editing} />

        <SectionCard title={{ sr: 'Rad tastaturom' }}>
          <Group gap="lg" wrap="wrap">
            <Group gap={6}>
              <Kbd>1</Kbd>–<Kbd>9</Kbd>
              <Text size="sm" c="dimmed">otvara pločicu po redu</Text>
            </Group>
            <Group gap={6}>
              <Kbd>↑</Kbd><Kbd>↓</Kbd><Kbd>←</Kbd><Kbd>→</Kbd>
              <Text size="sm" c="dimmed">pomera izbor</Text>
            </Group>
            <Group gap={6}>
              <Kbd>Enter</Kbd>
              <Text size="sm" c="dimmed">otvara izabranu</Text>
            </Group>
            <Group gap={6}>
              <Kbd>Ctrl</Kbd>+<Kbd>K</Kbd>
              <Text size="sm" c="dimmed">komandna paleta</Text>
            </Group>
            <Group gap={6}>
              <Text size="sm" c="dimmed">
                Prevlačenje radi samo u režimu uređivanja — inače biste pločicu povukli umesto da je
                otvorite.
              </Text>
            </Group>
          </Group>
          <Text size="xs" c="dimmed" mt="sm">
            Kliknite bilo gde u mrežu pločica pa probajte strelice. Ko ceo dan radi u aplikaciji ne
            traži mišem pločicu koju otvara pedeset puta dnevno.
          </Text>
        </SectionCard>
      </Stack>
    </DemoAppShell>
  )
}
