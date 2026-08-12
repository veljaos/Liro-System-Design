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
  { id: 'vlasnik', label: 'Vlasnik', locked: true },
  { id: 'sef', label: 'Šef računovodstva' },
  { id: 'knjigovodja', label: 'Knjigovođa' },
  { id: 'pripravnik', label: 'Pripravnik' },
  { id: 'klijent', label: 'Klijent' },
]

const groups: PermissionGroup[] = [
  {
    id: 'dokumenti',
    label: { sr: 'Dokumenti', 'sr-Cyrl': 'Документи', en: 'Documents' },
    permissions: [
      { id: 'doc.view', label: { sr: 'Pregled dokumenata', en: 'View documents' } },
      { id: 'doc.create', label: { sr: 'Unos dokumenata', en: 'Create documents' } },
      {
        id: 'doc.post',
        label: { sr: 'Knjiženje', en: 'Post to ledger' },
        description: { sr: 'Nepovratno — storniranje je nov nalog', en: 'Irreversible — reversal is a new entry' },
      },
      { id: 'doc.delete', label: { sr: 'Brisanje neproknjiženih', en: 'Delete unposted' } },
    ],
  },
  {
    id: 'izvestaji',
    label: { sr: 'Izveštaji', 'sr-Cyrl': 'Извештаји', en: 'Reports' },
    permissions: [
      { id: 'rep.view', label: { sr: 'Pregled izveštaja', en: 'View reports' } },
      { id: 'rep.export', label: { sr: 'Izvoz u PDF i Excel', en: 'Export to PDF and Excel' } },
      { id: 'rep.bi', label: { sr: 'BI analitika', en: 'BI analytics' } },
    ],
  },
  {
    id: 'sistem',
    label: { sr: 'Sistem', 'sr-Cyrl': 'Систем', en: 'System' },
    permissions: [
      { id: 'sys.users', label: { sr: 'Upravljanje korisnicima', en: 'Manage users' } },
      { id: 'sys.roles', label: { sr: 'Upravljanje ulogama', en: 'Manage roles' } },
      { id: 'sys.audit', label: { sr: 'Revizorski trag', en: 'Audit trail' } },
      { id: 'sys.integrations', label: { sr: 'Integracije', en: 'Integrations' } },
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

  /* Jedan rukovalac pokriva i pojedinacnu celiju i cekiranje cele grupe -
     grupa samo salje vise identifikatora odjednom. */
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
        title={{ sr: 'Uloge i dozvole', 'sr-Cyrl': 'Улоге и дозволе', en: 'Roles and permissions' }}
        description={{ sr: 'Vlasnik je sistemska uloga i ne menja se', en: 'Owner is a system role' }}
        actions={
          <ActionButton
            intent="save"
            primary
            disabled={!izmenjeno}
            disabledReason={{ sr: 'Nema izmena', en: 'No changes' }}
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
          Čekiranje u redu grupe uključuje ili isključuje sve dozvole te grupe za tu ulogu.
        </Text>
      </Stack>
    </PageContainer>
  )
}