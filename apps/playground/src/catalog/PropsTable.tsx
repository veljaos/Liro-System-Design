'use client'

import { Badge, Group, Stack, Table, Text } from '@mantine/core'
import { liroVar } from '@liro/tokens'
import type { ComponentApi } from './props'

/**
 * Javni API jedne komponente.
 *
 * Obavezni propovi stoje prvi, jer je to prvo pitanje programera koji tek
 * uzima komponentu: sta MORAM da prosledim.
 */
export function PropsTable({ api }: { api: ComponentApi }) {
  return (
    <Stack gap="xs">
      <Group gap="xs" wrap="nowrap">
        <Text size="sm" fw={600} ff="monospace">{api.name}</Text>
        <Text size="xs" ff="monospace" style={{ color: liroVar.text.tertiary }}>{api.package}</Text>
      </Group>

      {api.description && (
        <Text size="xs" style={{ color: liroVar.text.secondary, whiteSpace: 'pre-line' }}>
          {api.description}
        </Text>
      )}

      <Table.ScrollContainer minWidth={560}>
        <Table fz="xs" verticalSpacing={6} withRowBorders>
          <Table.Thead style={{ backgroundColor: liroVar.surface.sunken }}>
            <Table.Tr>
              <Table.Th w="20%">Prop</Table.Th>
              <Table.Th w="28%">Tip</Table.Th>
              <Table.Th w="12%">Podrazumevano</Table.Th>
              <Table.Th>Opis</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {api.props.map((prop) => (
              <Table.Tr key={prop.name}>
                <Table.Td>
                  <Group gap={4} wrap="nowrap">
                    <Text size="xs" ff="monospace" fw={600}>{prop.name}</Text>
                    {prop.required && (
                      <Badge size="xs" variant="light" color="red" radius="sm">obavezno</Badge>
                    )}
                  </Group>
                </Table.Td>
                <Table.Td>
                  <Text size="xs" ff="monospace" style={{ color: liroVar.text.brand, wordBreak: 'break-word' }}>
                    {prop.type}
                  </Text>
                </Table.Td>
                <Table.Td>
                  <Text size="xs" ff="monospace" style={{ color: liroVar.text.tertiary }}>
                    {prop.defaultValue ?? '—'}
                  </Text>
                </Table.Td>
                <Table.Td>
                  <Text size="xs" style={{ color: liroVar.text.secondary, whiteSpace: 'pre-line' }}>
                    {prop.description || '—'}
                  </Text>
                </Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      </Table.ScrollContainer>
    </Stack>
  )
}