'use client'

import { Fragment, useMemo } from 'react'
import { Checkbox, CheckIcon, Group, Table, Text, Tooltip, VisuallyHidden } from '@mantine/core'
import { Lock } from 'lucide-react'
import { liroVar } from '@liro/tokens'
import { useI18n, type LocalizedLabel } from '@liro/i18n'

/**
 * Roles and permissions matrix.
 *
 * Exists in every ERP and gets built from scratch everywhere. Two things
 * that are most often missed, and are built in here: checking a whole group
 * for one role (otherwise you click forty times) and locked system roles,
 * which are visible but cannot be changed.
 *
 * The sticky first column uses the same styles as `DataTable` — hence
 * `className="liro-table"`. Without it, with about ten roles you lose track
 * of which row is which permission.
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
  /** System role — shown, but not editable. */
  locked?: boolean
}

export interface PermissionMatrixProps {
  groups: PermissionGroup[]
  roles: RoleColumn[]
  /** Permissions by role: `value[roleId]` is an array of permission IDs. */
  value: Record<string, string[]>
  /** Called for a single cell. Group checking sends multiple calls at once. */
  onChange: (roleId: string, permissionIds: string[], granted: boolean) => void
  readOnly?: boolean
  /**
   * Whether a permission applies to a role at all.
   *
   * Three states, not two: **granted**, **denied**, and **not applicable**.
   * "Denied" means the role could have this and does not; "not applicable"
   * means the combination does not exist — deleting a client is not something
   * a read-only auditor role is ever going to be given.
   *
   * This is NOT part of `value`. `value` records who may do what; whether a
   * combination exists is a property of the matrix, derived from the role.
   * Storing it alongside the grants would mean persisting a fact that is
   * computed.
   *
   * A cell that does not apply renders as a dash, never as a disabled
   * checkbox: a screen reader announces a disabled checkbox as "not granted,
   * locked", which claims the permission could be granted if something were
   * unlocked. It cannot. The same rule as "an empty value is a dash" in the
   * ten rules.
   *
   * Omitting this means every permission applies to every role.
   */
  isApplicable?: (roleId: string, permissionId: string) => boolean
}

const LOCKED_HINT: LocalizedLabel = {
  sr: 'Sistemska uloga — dozvole se ne mogu menjati',
  'sr-Cyrl': 'Системска улога — дозволе се не могу мењати',
  en: 'System role — permissions cannot be changed',
}

const NOT_APPLICABLE: LocalizedLabel = {
  sr: 'Ne odnosi se',
  'sr-Cyrl': 'Не односи се',
  en: 'Not applicable',
}

/**
 * Checkbox mark: a check when fully granted, a square when partly.
 *
 * Mantine's default for the indeterminate state is a wide dash — and a dash
 * already means something else in this table: a cell that does not apply renders
 * as `—`. Two marks that both read as "dash" and mean different things would sit
 * side by side in the same column.
 *
 * `icon` receives `indeterminate` and decides; the shape is the whole point, so
 * the square is drawn rather than imported.
 */
function GroupCheckIcon({ indeterminate, ...rest }: { indeterminate?: boolean } & React.ComponentPropsWithoutRef<'svg'>) {
  if (indeterminate) {
    return (
      <svg viewBox="0 0 10 10" fill="none" aria-hidden {...rest}>
        <rect x="1.5" y="1.5" width="7" height="7" rx="1.5" fill="currentColor" />
      </svg>
    )
  }

  return <CheckIcon {...rest} />
}

const PERMISSION_COL: LocalizedLabel = { sr: 'Dozvola', 'sr-Cyrl': 'Дозвола', en: 'Permission' }

export function PermissionMatrix({
  groups,
  roles,
  value,
  onChange,
  readOnly = false,
  isApplicable,
}: PermissionMatrixProps) {
  const { t } = useI18n()

  /* Sets instead of arrays: the membership check runs for every cell, and a
     matrix of 12 roles and 60 permissions has 720 cells. */
  const granted = useMemo(() => {
    const result: Record<string, Set<string>> = {}
    for (const role of roles) result[role.id] = new Set(value[role.id] ?? [])
    return result
  }, [roles, value])

  const isGranted = (roleId: string, permissionId: string) =>
    granted[roleId]?.has(permissionId) ?? false

  const applies = (roleId: string, permissionId: string) =>
    isApplicable?.(roleId, permissionId) ?? true

  const groupState = (roleId: string, group: PermissionGroup) => {
    /* Only applicable permissions count. Otherwise the group checkbox reports
       "partly checked" forever, because the inapplicable ones can never be. */
    const ids = group.permissions
      .map((permission) => permission.id)
      .filter((id) => applies(roleId, id))
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
                      {/*
                        When no permission in the group applies to this role,
                        there is nothing to check — the group checkbox would be
                        permanently unchecked and clicking it would do nothing.
                      */}
                      {state.ids.length > 0 && (
                        <Checkbox
                          size="xs"
                          checked={state.all}
                          indeterminate={state.some}
                          disabled={disabled}
                          onChange={() => onChange(role.id, state.ids, !state.all)}
                          aria-label={`${t(group.label)} — ${role.label}`}
                          style={{ display: 'inline-flex' }}
                          icon={GroupCheckIcon}
                          color={state.some ? 'liro-gray' : undefined}
                        />
                      )}
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
                      {applies(role.id, permission.id) ? (
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
                      ) : (
                        /*
                          A dash, not a control. `aria-label` on a `<span>` is
                          prohibited (role `generic`), so the meaning goes in a
                          visually hidden word instead.
                        */
                        <Text component="span" size="sm" style={{ color: liroVar.text.tertiary }}>
                          <VisuallyHidden>
                            {`${t(NOT_APPLICABLE)}: ${t(permission.label)} — ${role.label}`}
                          </VisuallyHidden>
                          <span aria-hidden>—</span>
                        </Text>
                      )}
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