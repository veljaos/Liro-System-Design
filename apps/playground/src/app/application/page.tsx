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
  { value: 'notFound', label: '404 — page not found' },
  { value: 'serverError', label: '500 — server error' },
  { value: 'forbidden', label: '403 — access denied' },
  { value: 'maintenance', label: '503 — maintenance' },
  { value: 'suspended', label: 'Locked account' },
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
        title={{ en: 'Page layouts' }}
        description={{
          en: 'Five layouts cover practically every screen. Developers pick a layout, they do not build one.',
        }}
        flush
      >
        <Tabs defaultValue="list" keepMounted={false}>
          <Tabs.List mb="lg">
            <Tabs.Tab value="list">List</Tabs.Tab>
            <Tabs.Tab value="detail">Detail</Tabs.Tab>
            <Tabs.Tab value="dashboard">Overview</Tabs.Tab>
            <Tabs.Tab value="loading">Loading</Tabs.Tab>
            <Tabs.Tab value="status">Interrupted screens</Tabs.Tab>
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
                        { value: 'true', label: 'Active' },
                        { value: 'false', label: 'Inactive' },
                      ]}
                      clearable
                      w={160}
                    />
                  }
                  searchPlaceholder={{ en: 'Search by name…' }}
                  onEdit={() => {}}
                  allowDelete
                  defaultSort={{ field: 'full_name', order: 'asc' }}
                />
              </SectionCard>

              <Text size="xs" c="dimmed">
                Narrow the window below 768px — the table stops being a table and becomes a list of
                cards. Nobody reads a horizontal scroll through five columns on a phone.
              </Text>
            </Stack>
          </Tabs.Panel>

          <Tabs.Panel value="detail">
            <DetailPageTemplate
              title="Ana Jovanović"
              description={{ en: 'Bookkeeper · Konfirs' }}
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
                <SectionCard title={{ en: 'Record state' }}>
                  <KeyValueList
                    columns={1}
                    items={[
                      { label: { en: 'Status' }, value: <RecordStatusBadge status="approved" /> },
                      { label: { en: 'Internal ID' }, value: 'e1' },
                      { label: { en: 'Source' }, value: 'createInMemoryProvider' },
                    ]}
                  />
                </SectionCard>
              }
            >
              <SectionCard title={{ en: 'Employment' }}>
                <KeyValueList
                  items={[
                    { label: { en: 'Position' }, value: 'Knjigovođa' },
                    { label: { en: 'Gross salary' }, value: '125.450,00 RSD', numeric: true },
                    { label: { en: 'Start date' }, value: '01.03.2024.' },
                    { label: { en: 'Branch' }, value: 'Head office' },
                    { label: { en: 'Address' }, value: 'Bulevar Mihajla Pupina 10ž, Beograd', fullWidth: true },
                  ]}
                />
              </SectionCard>

              <SectionCard title={{ en: 'The aside column' }}>
                <Text size="sm">
                  The aside column carries metadata and state, never the main content. On narrow
                  screens it drops below — narrow the window to check.
                </Text>
              </SectionCard>
            </DetailPageTemplate>
          </Tabs.Panel>

          <Tabs.Panel value="dashboard">
            <DashboardTemplate
              title={{ en: 'Module overview' }}
              description={{ en: 'Numbers on top, content below' }}
              icon={Building2}
              stats={[
                { title: { en: 'Employees' }, value: 47, icon: Users, diff: 8 },
                { title: { en: 'Clients' }, value: 12, icon: Building2 },
                {
                  title: { en: 'Payroll cost' },
                  value: '4.128.500',
                  diff: 12,
                  invertDiff: true,
                  description: { en: 'Cost growth vs last month' },
                },
                { title: { en: 'Documents' }, value: 318, diff: -4 },
              ]}
            >
              <Callout tone="neutral" title={{ en: 'invertDiff' }}>
                The third card is going up, but it is red. Cost growth is not good news, so the
                color follows meaning, not the direction of the arrow.
              </Callout>
            </DashboardTemplate>
          </Tabs.Panel>

          <Tabs.Panel value="loading">
            <Stack gap="lg">
              <Select
                label="Variant"
                value={loadingVariant}
                onChange={(value) => setLoadingVariant(value ?? 'list')}
                data={['list', 'detail', 'dashboard', 'form', 'spinner']}
                w={220}
              />
              <SectionCard>
                <LoadingTemplate variant={loadingVariant as 'list'} />
              </SectionCard>
              <Text size="xs" c="dimmed">
                A skeleton that matches the real layout feels faster than a spinner, because the
                content does not jump when it arrives.
              </Text>
            </Stack>
          </Tabs.Panel>

          <Tabs.Panel value="status">
            <Stack gap="lg">
              <Select
                label="Screen"
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
