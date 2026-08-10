'use client'

import { useState } from 'react'
import { Stack, Text } from '@mantine/core'
import { Building2 } from 'lucide-react'
import { PageContainer, PageHeader, SectionCard } from '@liro/ui'
import { AutoForm, type FieldSchema } from '@liro/forms'
import { klijentSchema } from '@/lib/client-schema'

const schema: FieldSchema[] = [
  {
    type: 'section',
    name: 'osnovno',
    label: { sr: 'Osnovni podaci', 'sr-Cyrl': 'Основни подаци', en: 'Details' },
    fields: [
      {
        type: 'row',
        name: 'red1',
        fields: [
          { type: 'text', name: 'naziv', label: { sr: 'Naziv', en: 'Name' }, required: true, span: 2 },
          { type: 'text', name: 'pib', label: { sr: 'PIB', en: 'Tax ID' }, required: true },
        ],
      },
      {
        type: 'row',
        name: 'red2',
        fields: [
          { type: 'text', name: 'maticni', label: { sr: 'Matični broj', en: 'Registration no.' }, required: true },
          { type: 'text', name: 'email', label: { sr: 'E-pošta', en: 'Email' } },
        ],
      },
    ],
  },
  {
    type: 'section',
    name: 'ugovor',
    label: { sr: 'Ugovor', 'sr-Cyrl': 'Уговор', en: 'Contract' },
    fields: [
      {
        type: 'row',
        name: 'red3',
        fields: [
          { type: 'date', name: 'ugovorOd', label: { sr: 'Od', en: 'From' } },
          { type: 'date', name: 'ugovorDo', label: { sr: 'Do', en: 'To' } },
          { type: 'number', name: 'mesecnaNaknada', label: { sr: 'Mesečna naknada', en: 'Monthly fee' } },
        ],
      },
    ],
  },
]

export default function ClientFormPage() {
  const [sacuvano, setSacuvano] = useState<string | null>(null)

  return (
    <PageContainer width="narrow">
      <PageHeader
        icon={Building2}
        title={{ sr: 'Novi klijent', 'sr-Cyrl': 'Нови клијент', en: 'New client' }}
        description={{ sr: 'Ista šema važi i u API ruti', en: 'The same schema runs in the API route' }}
        withDivider
      />

      <Stack gap="md">
        <SectionCard>
          <AutoForm
            schema={schema}
            validationSchema={klijentSchema}
            onSubmit={(values) => setSacuvano(JSON.stringify(values, null, 2))}
          />
        </SectionCard>

        {sacuvano && (
          <SectionCard title={{ sr: 'Sačuvano', en: 'Saved' }}>
            <Text component="pre" size="xs" style={{ whiteSpace: 'pre-wrap' }}>
              {sacuvano}
            </Text>
          </SectionCard>
        )}
      </Stack>
    </PageContainer>
  )
}