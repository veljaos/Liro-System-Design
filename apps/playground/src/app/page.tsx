'use client'

import Link from 'next/link'
import { Anchor, Box, Code, Group, Paper, SimpleGrid, Stack, Table, Text, Title } from '@mantine/core'
import { liroVar } from '@liro/tokens'
import { ActionButton, ActionGroup, StatusBadge } from '@liro/ui'
import { CATEGORIES } from '@/catalog/registry'
import { DocsPage, DocsShell } from '@/components/DocsShell'
import { Snippet } from '@/components/Snippet'

const PACKAGES = [
  ['@liro/tokens', 'Boje, tipografija, razmaci, senke. Jedini izvor istine.'],
  ['@liro/theme', 'Mantine tema izvedena iz tokena i globalni stilovi.'],
  ['@liro/i18n', 'Lokalizovane labele i formatiranje brojeva i datuma.'],
  ['@liro/ui', 'Komponente. Ne zna za bazu ni za rutiranje.'],
  ['@liro/dates', 'Obračunski periodi, rokovi dospeća, unos datuma.'],
  ['@liro/data', 'Adapter sloj i React kuke nad njim.'],
  ['@liro/data-supabase', 'Supabase implementacija adaptera.'],
  ['@liro/forms', 'Forme opisane šemom.'],
  ['@liro/templates', 'Okvir aplikacije i gotove stranice.'],
  ['@liro/charts', 'Grafikoni sa Liro paletom.'],
  ['@liro/schedule', 'Kalendar obračuna i rokova.'],
  ['@liro/editor', 'Bogati tekst i prikaz koda.'],
  ['@liro/files', 'Prevlačenje i prikaz priloga.'],
]

const EXAMPLE = `import { ListPageTemplate } from '@liro/templates'
import { ActionButton, ActionGroup } from '@liro/ui'
import { ResourceTable } from '@liro/data'

export default function EmployeesPage() {
  return (
    <ListPageTemplate
      title={{ sr: 'Zaposlena lica' }}
      icon={Users}
      actions={
        <ActionGroup>
          <ActionButton intent="excel" />
          <ActionButton intent="create" label={{ sr: 'Novo lice' }} onClick={openForm} />
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
          { id: 'sta-je', title: 'Šta je Liro DS' },
          { id: 'primer', title: 'Primer upotrebe' },
          { id: 'paketi', title: 'Paketi' },
          { id: 'katalog', title: 'Katalog' },
        ]}
      >
        <Stack gap="xl">
          <Stack gap="md" id="sta-je" style={{ scrollMarginTop: 80 }}>
            <Group gap="xs">
              <StatusBadge tone="info" label="v0.1.0" />
              <StatusBadge tone="premium" label="13 paketa" />
            </Group>

            <Title order={1}>Šta je Liro Design System?</Title>

            <Text size="lg" style={{ color: liroVar.text.secondary }}>
              Alat, ne biblioteka predloga. Programer opisuje šta ekran radi — boju, razmak,
              tipografiju i ponašanje bira sistem, i bira ih isto u svakoj Liro aplikaciji.
            </Text>

            <Text>
              Ključni pojam je <strong>namera</strong>. <Code>ActionButton</Code> ne prima{' '}
              <Code>color</Code> ni <Code>variant</Code> — prima <Code>intent</Code>. Dugme „Novo" je
              plavo, PDF ljubičast, potpis tirkizan, i tako u svakom modulu bez dogovaranja.
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
                <ActionButton intent="create" label={{ sr: 'Novi nalog' }} />
              </ActionGroup>
            </Paper>
          </Stack>

          <Stack gap="md" id="primer" style={{ scrollMarginTop: 80 }}>
            <Title order={2}>Primer upotrebe</Title>
            <Text>
              Cela stranica sa spiskom: zaglavlje, radnje, pretraga, sortiranje, paginacija i
              brisanje uz potvrdu. Nema CSS-a, nema heks vrednosti, nema odluka o razmaku.
            </Text>
            <Snippet label="Primer upotrebe">{EXAMPLE}</Snippet>
          </Stack>

          <Stack gap="md" id="paketi" style={{ scrollMarginTop: 80 }}>
            <Title order={2}>Paketi</Title>
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
            <Title order={2}>Katalog</Title>
            <Text>
              {CATEGORIES.length} kategorija, {CATEGORIES.reduce((sum, c) => sum + c.entries.length, 0)}{' '}
              primera. Svaki primer ima sidro, pa se veza može poslati direktno.
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
              Nastavite na <Anchor component={Link} href="/uvod/instalacija">uključivanje u aplikaciju</Anchor>.
            </Text>
          </Stack>
        </Stack>
      </DocsPage>
    </DocsShell>
  )
}
