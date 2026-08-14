'use client'

import { useMemo, useState } from 'react'
import { Group, Stack } from '@mantine/core'
import { BookOpen } from 'lucide-react'
import {
  PageContainer,
  PageHeader,
  SectionCard,
  EditableGrid,
  ActionButton,
  type EditableColumn,
} from '@liro/ui'

interface Stavka extends Record<string, unknown> {
  id: string
  konto: string | null
  opis: string
  duguje: number | null
  potrazuje: number | null
}

/* Excerpt from the chart of accounts; in the application it comes from a registry. */
const KONTA = [
  { value: '2020', label: '2020 — Kupci u zemlji' },
  { value: '2700', label: '2700 — PDV u primljenim fakturama' },
  { value: '4330', label: '4330 — Dobavljači u zemlji' },
  { value: '4700', label: '4700 — Obaveze za PDV' },
  { value: '5130', label: '5130 — Troškovi materijala' },
  { value: '6140', label: '6140 — Prihodi od prodaje usluga' },
]

let brojac = 0
const noviRed = (): Stavka => ({
  id: `red-${++brojac}`,
  konto: null,
  opis: '',
  duguje: null,
  potrazuje: null,
})

export default function JournalEntryPage() {
  const [stavke, setStavke] = useState<Stavka[]>(() => [noviRed(), noviRed()])
  const [uRavnotezi, setURavnotezi] = useState(true)

  const columns: EditableColumn<Stavka>[] = useMemo(
    () => [
      {
        name: 'konto',
        label: { en: 'Account' },
        type: 'select',
        options: KONTA,
        width: 260,
        placeholder: { en: 'Type code…' },
        validate: (value) => (value ? false : { en: 'Required' }),
      },
      {
        name: 'opis',
        label: { en: 'Description' },
        type: 'text',
      },
      {
        name: 'duguje',
        label: { en: 'Debit' },
        type: 'currency',
        width: 150,
        total: true,
      },
      {
        name: 'potrazuje',
        label: { en: 'Credit' },
        type: 'currency',
        width: 150,
        total: true,
      },
    ],
    [],
  )

  const prazan = stavke.every((s) => !s.duguje && !s.potrazuje)

  return (
    <PageContainer width="wide">
      <PageHeader
        icon={BookOpen}
        title={{ en: 'Journal entry' }}
        description={{ en: 'Keyboard-only entry' }}
        actions={
          <Group gap="xs">
            <ActionButton
              intent="save"
              primary
              disabled={!uRavnotezi || prazan}
              disabledReason={
                prazan
                  ? { en: 'Entry is empty' }
                  : { en: 'Debit and credit differ' }
              }
              onClick={() => console.info('saved', stavke)}
            />
          </Group>
        }
        withDivider
      />

      <Stack gap="md">
        <SectionCard flush>
          <EditableGrid<Stavka>
            columns={columns}
            rows={stavke}
            onChange={setStavke}
            createRow={noviRed}
            getRowId={(row) => row.id}
            balance={{ debit: 'duguje', credit: 'potrazuje' }}
            onBalanceChange={setURavnotezi}
            minRows={2}
          />
        </SectionCard>
      </Stack>
    </PageContainer>
  )
}