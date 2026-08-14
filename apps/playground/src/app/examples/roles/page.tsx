'use client'

import { useState } from 'react'
import { Stack, Text } from '@mantine/core'
import { ShieldCheck } from 'lucide-react'
import {
  PageContainer,
  PageHeader,
  SectionCard,
  PermissionMatrix,
  ActionButton,
  type PermissionGroup,
  type RoleColumn,
} from '@liro/ui'

const roles: RoleColumn[] = [
  { id: 'vlasnik', label: 'Owner', locked: true },
  { id: 'sef', label: 'Head of accounting' },
  { id: 'knjigovodja', label: 'Bookkeeper' },
  { id: 'pripravnik', label: 'Trainee' },
  { id: 'klijent', label: 'Client' },
]

const groups: PermissionGroup[] = [
  {
    id: 'dokumenti',
    label: { en: 'Documents' },
    permissions: [
      { id: 'doc.view', label: { en: 'View documents' } },
      { id: 'doc.create', label: { en: 'Create documents' } },
      {
        id: 'doc.post',
        label: { en: 'Post to ledger' },
        description: { en: 'Irreversible — reversal is a new entry' },
      },
      { id: 'doc.delete', label: { en: 'Delete unposted' } },
    ],
  },
  {
    id: 'izvestaji',
    label: { en: 'Reports' },
    permissions: [
      { id: 'rep.view', label: { en: 'View reports' } },
      { id: 'rep.export', label: { en: 'Export to PDF and Excel' } },
      { id: 'rep.bi', label: { en: 'BI analytics' } },
    ],
  },
  {
    id: 'sistem',
    label: { en: 'System' },
    permissions: [
      { id: 'sys.users', label: { en: 'Manage users' } },
      { id: 'sys.roles', label: { en: 'Manage roles' } },
      { id: 'sys.audit', label: { en: 'Audit trail' } },
      { id: 'sys.integrations', label: { en: 'Integrations' } },
    ],
  },
]

const SVE = groups.flatMap((group) => group.permissions.map((permission) => permission.id))

const POCETNO: Record<string, string[]> = {
  vlasnik: SVE,
  sef: SVE.filter((id) => id !== 'sys.roles'),
  knjigovodja: ['doc.view', 'doc.create', 'doc.post', 'rep.view', 'rep.export'],
  pripravnik: ['doc.view', 'doc.create', 'rep.view'],
  klijent: ['doc.view', 'rep.view'],
}

/*
 * Which permissions apply to which role.
 *
 * Three states, not two. "Klijent" not having `doc.post` is not a decision
 * somebody made and could reverse — a client of an accounting firm is never
 * going to post to the general ledger. The cell is not unchecked, it does not
 * exist.
 *
 * That difference matters when reading the matrix: an empty checkbox invites
 * the question "should this be on?", and a dash answers it.
 */
const isApplicable = (roleId: string, permissionId: string) => {
  /* A client sees their own documents and reports. Nothing else. */
  if (roleId === 'klijent') {
    return permissionId === 'doc.view' || permissionId === 'rep.view'
  }

  /* A trainee enters and prepares; posting and deleting are not theirs. */
  if (roleId === 'pripravnik') {
    return permissionId !== 'doc.post' && permissionId !== 'doc.delete'
  }

  return true
}

export default function RolesPage() {
  const [value, setValue] = useState(POCETNO)
  const [izmenjeno, setIzmenjeno] = useState(false)

  /* One handler covers both a single cell and checking a whole group -
     the group just sends multiple identifiers at once. */
  const handleChange = (roleId: string, permissionIds: string[], granted: boolean) => {
    setValue((current) => {
      const existing = new Set(current[roleId] ?? [])
      for (const id of permissionIds) {
        if (granted) existing.add(id)
        else existing.delete(id)
      }
      return { ...current, [roleId]: [...existing] }
    })
    setIzmenjeno(true)
  }

  return (
    <PageContainer width="wide">
      <PageHeader
        icon={ShieldCheck}
        title={{ en: 'Roles and permissions' }}
        description={{ en: 'Owner is a system role' }}
        actions={
          <ActionButton
            intent="save"
            primary
            disabled={!izmenjeno}
            disabledReason={{ en: 'No changes' }}
            onClick={() => setIzmenjeno(false)}
          />
        }
        withDivider
      />

      <Stack gap="md">
        <SectionCard flush>
          <PermissionMatrix
            groups={groups}
            roles={roles}
            value={value}
            onChange={handleChange}
            isApplicable={isApplicable}
          />
        </SectionCard>

        <Text size="xs" c="dimmed">
          Checking the group row toggles all permissions in that group for that role.
        </Text>
      </Stack>
    </PageContainer>
  )
}
