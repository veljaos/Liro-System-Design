'use client'

import { Fragment, useMemo } from 'react'
import { Checkbox, Group, Table, Text, Tooltip } from '@mantine/core'
import { Lock } from 'lucide-react'
import { liroVar } from '@liro/tokens'
import { useI18n, type LocalizedLabel } from '@liro/i18n'

/**
 * Matrica uloga i dozvola.
 *
 * Postoji u svakom ERP-u i svuda se iznova pravi. Dve stvari koje se najcesce
 * propuste, a ovde su ugradjene: cekiranje cele grupe za jednu ulogu (inace se
 * klika cetrdeset puta) i zakljucane sistemske uloge, koje se vide ali se ne
 * mogu menjati.
 *
 * Fiksirana prva kolona koristi iste stilove kao `DataTable` - otuda
 * `className="liro-table"`. Bez toga se pri desetak uloga izgubi koji je red
 * koja dozvola.
 */

export interface PermissionItem {
  id: string
  label: LocalizedLabel
  description?: LocalizedLabel
}

export interface PermissionGroup {
  id: string
  label: LocalizedLabel
  permissions: PermissionItem[]
}

export interface RoleColumn {
  id: string
  label: string
  /** Sistemska uloga - prikazuje se, ali se ne menja. */
  locked?: boolean
}

export interface PermissionMatrixProps {
  groups: PermissionGroup[]
  roles: RoleColumn[]
  /** Dozvole po ulozi: `value[roleId]` je niz identifikatora dozvola. */
  value: Record<string, string[]>
  /** Poziva se za jednu celiju. Grupno cekiranje salje vise poziva odjednom. */
  onChange: (roleId: string, permissionIds: string[], granted: boolean) => void
  readOnly?: boolean
}

const LOCKED_HINT: LocalizedLabel = {
  sr: 'Sistemska uloga — dozvole se ne mogu menjati',
  'sr-Cyrl': 'Системска улога — дозволе се не могу мењати',
  en: 'System role — permissions cannot be changed',
}

const PERMISSION_COL: LocalizedLabel = { sr: 'Dozvola', 'sr-Cyrl': 'Дозвола', en: 'Permission' }

export function PermissionMatrix({
  groups,
  roles,
  value,
  onChange,
  readOnly = false,
}: PermissionMatrixProps) {
  const { t } = useI18n()

  /* Skupovi umesto nizova: provera pripadnosti se radi na svaku celiju, a
     matrica od 12 uloga i 60 dozvola ima 720 celija. */
  const granted = useMemo(() => {
    const result: Record<string, Set<string>> = {}
    for (const role of roles) result[role.id] = new Set(value[role.id] ?? [])
    return result
  }, [roles, value])

  const isGranted = (roleId: string, permissionId: string) =>
    granted[roleId]?.has(permissionId) ?? false

  const groupState = (roleId: string, group: PermissionGroup) => {
    const ids = group.permissions.map((permission) => permission.id)
    const count = ids.filter((id) => isGranted(roleId, id)).length
    return { all: count === ids.length && ids.length > 0, some: count > 0 && count < ids.length, ids }
  }

  return (
    <Table.ScrollContainer minWidth={520}>
      <Table className="liro-table" withColumnBorders highlightOnHover stickyHeader>
        <Table.Thead style={{ backgroundColor: liroVar.surface.sunken }}>
          <Table.Tr>
            <Table.Th data-sticky-col data-sticky-edge style={{ left: 0, minWidth: 260 }}>
              {t(PERMISSION_COL)}
            </Table.Th>
            {roles.map((role) => (
              <Table.Th key={role.id} ta="center" w={110} style={{ whiteSpace: 'nowrap' }}>
                <Group gap={4} justify="center" wrap="nowrap">
                  {role.locked && (
                    <Tooltip label={t(LOCKED_HINT)} withArrow>
                      <span style={{ display: 'flex', color: liroVar.text.tertiary }}>
                        <Lock size={12} />
                      </span>
                    </Tooltip>
                  )}
                  {role.label}
                </Group>
              </Table.Th>
            ))}
          </Table.Tr>
        </Table.Thead>

        <Table.Tbody>
          {groups.map((group) => (
            <Fragment key={group.id}>
              <Table.Tr style={{ backgroundColor: liroVar.surface.sunken }}>
                <Table.Td data-sticky-col data-sticky-edge style={{ left: 0 }}>
                  <Text size="xs" fw={700} tt="uppercase" style={{ letterSpacing: 'var(--liro-tracking-caps)' }}>
                    {t(group.label)}
                  </Text>
                </Table.Td>

                {roles.map((role) => {
                  const state = groupState(role.id, group)
                  const disabled = readOnly || role.locked
                  return (
                    <Table.Td key={role.id} ta="center">
                      <Checkbox
                        size="xs"
                        checked={state.all}
                        indeterminate={state.some}
                        disabled={disabled}
                        onChange={() => onChange(role.id, state.ids, !state.all)}
                        aria-label={`${t(group.label)} — ${role.label}`}
                        style={{ display: 'inline-flex' }}
                      />
                    </Table.Td>
                  )
                })}
              </Table.Tr>

              {group.permissions.map((permission) => (
                <Table.Tr key={permission.id}>
                  <Table.Td data-sticky-col data-sticky-edge style={{ left: 0, paddingLeft: 28 }}>
                    <Text size="sm">{t(permission.label)}</Text>
                    {permission.description && (
                      <Text size="xs" style={{ color: liroVar.text.tertiary }}>
                        {t(permission.description)}
                      </Text>
                    )}
                  </Table.Td>

                  {roles.map((role) => (
                    <Table.Td key={role.id} ta="center">
                      <Checkbox
                        size="xs"
                        checked={isGranted(role.id, permission.id)}
                        disabled={readOnly || role.locked}
                        onChange={(event) =>
                          onChange(role.id, [permission.id], event.currentTarget.checked)
                        }
                        aria-label={`${t(permission.label)} — ${role.label}`}
                        style={{ display: 'inline-flex' }}
                      />
                    </Table.Td>
                  ))}
                </Table.Tr>
              ))}
            </Fragment>
          ))}
        </Table.Tbody>
      </Table>
    </Table.ScrollContainer>
  )
}