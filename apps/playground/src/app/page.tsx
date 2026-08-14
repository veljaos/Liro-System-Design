'use client'

import Link from 'next/link'
import { Anchor, Box, Code, Group, Paper, SimpleGrid, Stack, Table, Text, Title } from '@mantine/core'
import { liroVar } from '@liro/tokens'
import { ActionButton, ActionGroup, StatusBadge } from '@liro/ui'
import { CATEGORIES } from '@/catalog/registry'
import { DocsPage, DocsShell } from '@/components/DocsShell'
import { Snippet } from '@/components/Snippet'

const PACKAGES = [
  ['@liro/tokens', 'Colors, typography, spacing, shadows. The single source of truth.'],
  ['@liro/theme', 'Mantine theme derived from tokens, plus global styles.'],
  ['@liro/i18n', 'Localized labels and number/date formatting.'],
  ['@liro/ui', 'Components. Knows nothing about the database or routing.'],
  ['@liro/dates', 'Accounting periods, due dates, date entry.'],
  ['@liro/data', 'Adapter layer and React hooks on top of it.'],
  ['@liro/data-supabase', 'Supabase implementation of the adapter.'],
  ['@liro/forms', 'Forms described by a schema.'],
  ['@liro/templates', 'Application shell and ready-made pages.'],
  ['@liro/charts', 'Charts with the Liro palette.'],
  ['@liro/schedule', 'Calendar of payroll runs and deadlines.'],
  ['@liro/editor', 'Rich text and code display.'],
  ['@liro/files', 'Drag-and-drop and attachment display.'],
]

const EXAMPLE = `import { ListPageTemplate } from '@liro/templates'
import { ActionButton, ActionGroup } from '@liro/ui'
import { ResourceTable } from '@liro/data'

export default function EmployeesPage() {
  return (
    <ListPageTemplate
      title={{ en: 'Employees' }}
      icon={Users}
      actions={
        <ActionGroup>
          <ActionButton intent="excel" />
          <ActionButton intent="create" label={{ en: 'New employee' }} onClick={openForm} />
        </ActionGroup>
      }
    >
      <ResourceTable resource="employees" columns={columns} allowDelete />
    </ListPageTemplate>
  )
}`

export default function IntroPage() {
  return (
    <DocsShell>
      <DocsPage
        toc={[
          { id: 'sta-je', title: 'What is Liro DS' },
          { id: 'primer', title: 'Usage example' },
          { id: 'paketi', title: 'Packages' },
          { id: 'katalog', title: 'Catalog' },
        ]}
      >
        <Stack gap="xl">
          <Stack gap="md" id="sta-je" style={{ scrollMarginTop: 80 }}>
            <Group gap="xs">
              <StatusBadge tone="info" label="v0.1.0" />
              <StatusBadge tone="premium" label="13 packages" />
            </Group>

            <Title order={1}>What is the Liro Design System?</Title>

            <Text size="lg" style={{ color: liroVar.text.secondary }}>
              A tool, not a library of suggestions. The developer describes what the screen does —
              the system chooses the color, spacing, typography and behavior, and chooses them the
              same way in every Liro application.
            </Text>

            <Text>
              The key concept is <strong>intent</strong>. <Code>ActionButton</Code> takes no{' '}
              <Code>color</Code> and no <Code>variant</Code> — it takes <Code>intent</Code>. The
              "New" button is blue, PDF is purple, signing is teal, and so on in every module
              without anyone agreeing on it.
            </Text>

            <Paper
              withBorder
              radius="lg"
              p="md"
              style={{ backgroundColor: liroVar.surface.raised, borderColor: liroVar.border.default }}
            >
              <ActionGroup>
                <ActionButton intent="pdf" />
                <ActionButton intent="print" />
                <ActionButton intent="sign" />
                <ActionButton intent="create" label={{ en: 'New order' }} />
              </ActionGroup>
            </Paper>
          </Stack>

          <Stack gap="md" id="primer" style={{ scrollMarginTop: 80 }}>
            <Title order={2}>Usage example</Title>
            <Text>
              A whole list page: header, actions, search, sorting, pagination and delete with
              confirmation. No CSS, no hex values, no spacing decisions.
            </Text>
            <Snippet label="Usage example">{EXAMPLE}</Snippet>
          </Stack>

          <Stack gap="md" id="paketi" style={{ scrollMarginTop: 80 }}>
            <Title order={2}>Packages</Title>
            <Table fz="sm">
              <Table.Tbody>
                {PACKAGES.map(([name, role]) => (
                  <Table.Tr key={name}>
                    <Table.Td w={180}><Code>{name}</Code></Table.Td>
                    <Table.Td c="dimmed">{role}</Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          </Stack>

          <Stack gap="md" id="katalog" style={{ scrollMarginTop: 80 }}>
            <Title order={2}>Catalog</Title>
            <Text>
              {CATEGORIES.length} categories, {CATEGORIES.reduce((sum, c) => sum + c.entries.length, 0)}{' '}
              examples. Every example has an anchor, so the link can be sent directly.
            </Text>

            <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="sm">
              {CATEGORIES.map((category) => {
                const Icon = category.icon
                return (
                  <Paper
                    key={category.slug}
                    component={Link}
                    href={`/category/${category.slug}`}
                    withBorder
                    radius="md"
                    p="sm"
                    className="liro-module-card"
                    style={{
                      backgroundColor: liroVar.surface.raised,
                      borderColor: liroVar.border.default,
                      textDecoration: 'none',
                      color: 'inherit',
                      display: 'block',
                    }}
                  >
                    <Group gap="xs" wrap="nowrap">
                      <Box style={{ color: liroVar.text.secondary, display: 'flex', flexShrink: 0 }}>
                        <Icon size={16} />
                      </Box>
                      <Text size="sm" fw={600} style={{ flex: 1 }}>{category.title}</Text>
                      <Text size="xs" style={{ color: liroVar.text.tertiary }}>
                        {category.entries.length}
                      </Text>
                    </Group>
                  </Paper>
                )
              })}
            </SimpleGrid>

            <Text size="sm" style={{ color: liroVar.text.secondary }}>
              Continue to <Anchor component={Link} href="/uvod/instalacija">including it in an application</Anchor>.
            </Text>
          </Stack>
        </Stack>
      </DocsPage>
    </DocsShell>
  )
}
