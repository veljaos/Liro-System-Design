'use client'

import { useState } from 'react'
import { Box, Select, Stack, Tabs, Text } from '@mantine/core'
import { Building2, Users } from 'lucide-react'
import { ResourceTable } from '@liro/data'
import {
  ActionButton,
  ActionGroup,
  ActiveStatusBadge,
  Callout,
  KeyValueList,
  RecordStatusBadge,
  SectionCard,
} from '@liro/ui'
import {
  DashboardTemplate,
  DetailPageTemplate,
  ForbiddenTemplate,
  ListPageTemplate,
  LoadingTemplate,
  MaintenanceTemplate,
  NotFoundTemplate,
  ServerErrorTemplate,
  SuspendedTemplate,
} from '@liro/templates'
import { DemoAppShell } from '@/components/DemoAppShell'
import { employeeColumns, employeeMobileCard, type Employee } from '@/lib/demo-schemas'

type StatusKey = 'notFound' | 'serverError' | 'forbidden' | 'maintenance' | 'suspended'

const STATUS_OPTIONS: { value: StatusKey; label: string }[] = [
  { value: 'notFound', label: '404 — stranica ne postoji' },
  { value: 'serverError', label: '500 — greška servera' },
  { value: 'forbidden', label: '403 — nema pristupa' },
  { value: 'maintenance', label: '503 — održavanje' },
  { value: 'suspended', label: 'Zaključan nalog' },
]

export default function LayoutsPage() {
  const [status, setStatus] = useState<StatusKey>('notFound')
  const [activeFilter, setActiveFilter] = useState<string | null>(null)
  const [loadingVariant, setLoadingVariant] = useState<string>('list')

  const statusScreen = {
    notFound: <NotFoundTemplate />,
    serverError: <ServerErrorTemplate onRetry={() => {}} />,
    forbidden: <ForbiddenTemplate />,
    maintenance: <MaintenanceTemplate />,
    suspended: <SuspendedTemplate />,
  }[status]

  return (
    <DemoAppShell>
      <ListPageTemplate
        title={{ sr: 'Rasporedi stranica', en: 'Page layouts' }}
        description={{
          sr: 'Pet rasporeda pokriva praktično svaki ekran poslovne aplikacije. Programer bira raspored, ne piše ga.',
          en: 'Five layouts cover practically every screen. Developers pick a layout, they do not build one.',
        }}
        flush
      >
        <Tabs defaultValue="list" keepMounted={false}>
          <Tabs.List mb="lg">
            <Tabs.Tab value="list">Spisak</Tabs.Tab>
            <Tabs.Tab value="detail">Detalji</Tabs.Tab>
            <Tabs.Tab value="dashboard">Pregled</Tabs.Tab>
            <Tabs.Tab value="loading">Učitavanje</Tabs.Tab>
            <Tabs.Tab value="status">Prekinuti ekrani</Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value="list">
            <Stack gap="lg">

              <SectionCard flush>
                <ResourceTable<Employee>
                  resource="employees"
                  columns={employeeColumns}
                  mobile={employeeMobileCard}
                  searchFields={['full_name', 'position']}
                  filters={{ active: activeFilter === null ? undefined : activeFilter === 'true' }}
                  filterControls={
                    <Select
                      placeholder="Status"
                      value={activeFilter}
                      onChange={setActiveFilter}
                      data={[
                        { value: 'true', label: 'Aktivni' },
                        { value: 'false', label: 'Neaktivni' },
                      ]}
                      clearable
                      w={160}
                    />
                  }
                  searchPlaceholder={{ sr: 'Pretraga po imenu…', en: 'Search by name…' }}
                  onEdit={() => {}}
                  allowDelete
                  defaultSort={{ field: 'full_name', order: 'asc' }}
                />
              </SectionCard>

              <Text size="xs" c="dimmed">
                Suzite prozor ispod 768px — tabela prestaje da bude tabela i postaje spisak kartica.
                Horizontalni skrol kroz pet kolona na telefonu niko ne čita.
              </Text>
            </Stack>
          </Tabs.Panel>

          <Tabs.Panel value="detail">
            <DetailPageTemplate
              title="Ana Jovanović"
              description={{ sr: 'Knjigovođa · Konfirs d.o.o.', en: 'Bookkeeper · Konfirs' }}
              icon={Users}
              badge={<ActiveStatusBadge active />}
              onBack={() => {}}
              actions={
                <ActionGroup>
                  <ActionButton intent="pdf" />
                  <ActionButton intent="edit" />
                </ActionGroup>
              }
              aside={
                <SectionCard title={{ sr: 'Stanje zapisa', en: 'Record state' }}>
                  <KeyValueList
                    columns={1}
                    items={[
                      { label: { sr: 'Status', en: 'Status' }, value: <RecordStatusBadge status="approved" /> },
                      { label: { sr: 'Interna oznaka', en: 'Internal ID' }, value: 'e1' },
                      { label: { sr: 'Izvor', en: 'Source' }, value: 'createInMemoryProvider' },
                    ]}
                  />
                </SectionCard>
              }
            >
              <SectionCard title={{ sr: 'Podaci o angažovanju', en: 'Employment' }}>
                <KeyValueList
                  items={[
                    { label: { sr: 'Radno mesto', en: 'Position' }, value: 'Knjigovođa' },
                    { label: { sr: 'Bruto zarada', en: 'Gross salary' }, value: '125.450,00 RSD', numeric: true },
                    { label: { sr: 'Datum zasnivanja', en: 'Start date' }, value: '01.03.2024.' },
                    { label: { sr: 'Poslovnica', en: 'Branch' }, value: 'Centrala' },
                    { label: { sr: 'Adresa', en: 'Address' }, value: 'Bulevar Mihajla Pupina 10ž, Beograd', fullWidth: true },
                  ]}
                />
              </SectionCard>

              <SectionCard title={{ sr: 'Bočna kolona', en: 'The aside column' }}>
                <Text size="sm">
                  Bočna kolona nosi metapodatke i stanje, nikad glavni sadržaj. Na uskim ekranima se
                  spušta ispod — suzite prozor da proverite.
                </Text>
              </SectionCard>
            </DetailPageTemplate>
          </Tabs.Panel>

          <Tabs.Panel value="dashboard">
            <DashboardTemplate
              title={{ sr: 'Pregled modula', en: 'Module overview' }}
              description={{ sr: 'Brojke na vrhu, sadržaj ispod', en: 'Numbers on top, content below' }}
              icon={Building2}
              stats={[
                { title: { sr: 'Zaposlenih', en: 'Employees' }, value: 47, icon: Users, diff: 8 },
                { title: { sr: 'Klijenata', en: 'Clients' }, value: 12, icon: Building2 },
                {
                  title: { sr: 'Masa zarada', en: 'Payroll cost' },
                  value: '4.128.500',
                  diff: 12,
                  invertDiff: true,
                  description: { sr: 'Rast troška u odnosu na prethodni mesec', en: 'Cost growth vs last month' },
                },
                { title: { sr: 'Dokumenata', en: 'Documents' }, value: 318, diff: -4 },
              ]}
            >
              <Callout tone="neutral" title={{ sr: 'invertDiff', en: 'invertDiff' }}>
                Treća kartica raste, ali je crvena. Rast troška nije dobra vest, pa boja prati
                značenje a ne smer strelice.
              </Callout>
            </DashboardTemplate>
          </Tabs.Panel>

          <Tabs.Panel value="loading">
            <Stack gap="lg">
              <Select
                label="Varijanta"
                value={loadingVariant}
                onChange={(value) => setLoadingVariant(value ?? 'list')}
                data={['list', 'detail', 'dashboard', 'form', 'spinner']}
                w={220}
              />
              <SectionCard>
                <LoadingTemplate variant={loadingVariant as 'list'} />
              </SectionCard>
              <Text size="xs" c="dimmed">
                Kostur koji odgovara stvarnom rasporedu deluje brže od vrteške, jer sadržaj ne skače
                kada stigne.
              </Text>
            </Stack>
          </Tabs.Panel>

          <Tabs.Panel value="status">
            <Stack gap="lg">
              <Select
                label="Ekran"
                value={status}
                onChange={(value) => setStatus((value ?? 'notFound') as StatusKey)}
                data={STATUS_OPTIONS}
                w={280}
              />
              <SectionCard flush>
                <Box style={{ transform: 'scale(0.85)', transformOrigin: 'top center' }}>
                  {statusScreen}
                </Box>
              </SectionCard>
            </Stack>
          </Tabs.Panel>
        </Tabs>
      </ListPageTemplate>
    </DemoAppShell>
  )
}
