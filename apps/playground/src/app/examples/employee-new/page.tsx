'use client'

import { useState } from 'react'
import { Stack, Text } from '@mantine/core'
import { UserPlus } from 'lucide-react'
import { PageContainer, PageHeader, SectionCard, StatusBadge } from '@liro/ui'
import { FormWizard, type FormWizardStep } from '@liro/forms'
import {
  licniPodaciSchema,
  primanjaSchema,
  radniOdnosSchema,
  zaposleniSchema,
} from '@/lib/employee-schema'

const steps: FormWizardStep[] = [
  {
    id: 'licni',
    label: { sr: 'Lični podaci', 'sr-Cyrl': 'Лични подаци', en: 'Personal' },
    description: { sr: 'Ime, JMBG, kontakt', en: 'Name, ID, contact' },
    validationSchema: licniPodaciSchema,
    schema: [
      {
        type: 'row',
        name: 'r1',
        fields: [
          { type: 'text', name: 'ime', label: { sr: 'Ime', en: 'First name' }, required: true },
          { type: 'text', name: 'prezime', label: { sr: 'Prezime', en: 'Last name' }, required: true },
        ],
      },
      {
        type: 'row',
        name: 'r2',
        fields: [
          {
            type: 'select',
            name: 'vrstaIdentifikatora',
            label: { sr: 'Vrsta identifikatora', 'sr-Cyrl': 'Врста идентификатора', en: 'ID type' },
            required: true,
            options: [
              { value: 'jmbg', label: { sr: 'JMBG', en: 'National ID' } },
              { value: 'eb', label: { sr: 'Evidencioni broj stranca', en: 'Foreigner registration no.' } },
              { value: 'strani', label: { sr: 'Lična karta / pasoš', en: 'ID card / passport' } },
            ],
          },
          {
            type: 'text',
            name: 'identifikator',
            label: { sr: 'Broj', 'sr-Cyrl': 'Број', en: 'Number' },
            required: true,
          },
        ],
      },
      {
        type: 'row',
        name: 'r2b',
        fields: [{ type: 'text', name: 'email', label: { sr: 'E-pošta', en: 'Email' } }],
      },
    ],
  },
  {
    id: 'radni',
    label: { sr: 'Radni odnos', 'sr-Cyrl': 'Радни однос', en: 'Employment' },
    description: { sr: 'Ugovor i datumi', en: 'Contract and dates' },
    validationSchema: radniOdnosSchema,
    schema: [
      {
        type: 'row',
        name: 'r3',
        fields: [
          {
            type: 'select',
            name: 'radnoMesto',
            label: { sr: 'Radno mesto', en: 'Position' },
            required: true,
            options: [
              { value: 'knjigovodja', label: { sr: 'Knjigovođa', en: 'Bookkeeper' } },
              { value: 'revizor', label: { sr: 'Revizor', en: 'Auditor' } },
              { value: 'administrator', label: { sr: 'Administrator', en: 'Administrator' } },
            ],
          },
          {
            type: 'select',
            name: 'vrstaUgovora',
            label: { sr: 'Vrsta ugovora', en: 'Contract type' },
            required: true,
            options: [
              { value: 'neodredjeno', label: { sr: 'Na neodređeno', en: 'Permanent' } },
              { value: 'odredjeno', label: { sr: 'Na određeno', en: 'Fixed term' } },
            ],
          },
        ],
      },
      {
        type: 'row',
        name: 'r4',
        fields: [
          {
            type: 'date',
            name: 'datumZaposlenja',
            label: { sr: 'Datum zaposlenja', en: 'Start date' },
            required: true,
          },
          {
            type: 'date',
            name: 'datumPrestanka',
            label: { sr: 'Datum prestanka', en: 'End date' },
            /* This field only makes sense with a fixed-term contract. */
            condition: (values) => values.vrstaUgovora === 'odredjeno',
            conditionFields: ['vrstaUgovora'],
            required: true,
          },
        ],
      },
    ],
  },
  {
    id: 'primanja',
    label: { sr: 'Primanja', 'sr-Cyrl': 'Примања', en: 'Compensation' },
    validationSchema: primanjaSchema,
    schema: [
      {
        type: 'row',
        name: 'r5',
        fields: [
          { type: 'number', name: 'bruto', label: { sr: 'Bruto zarada', en: 'Gross salary' }, required: true },
          {
            type: 'text',
            name: 'tekuciRacun',
            label: { sr: 'Tekući račun', en: 'Bank account' },
            required: true,
          },
        ],
      },
    ],
  },
]

export default function EmployeeNewPage() {
  const [draftAt, setDraftAt] = useState<Date | null>(null)
  const [dirty, setDirty] = useState(false)
  const [sacuvano, setSacuvano] = useState<string | null>(null)

  return (
    <PageContainer width="narrow">
      <PageHeader
        icon={UserPlus}
        title={{ sr: 'Novi zaposleni', 'sr-Cyrl': 'Нови запослени', en: 'New employee' }}
        badge={
          dirty ? (
            <StatusBadge tone="warning" label={{ sr: 'Nesačuvano', en: 'Unsaved' }} />
          ) : undefined
        }
        withDivider
      />

      <Stack gap="md">
        <SectionCard>
          <FormWizard
            steps={steps}
            validationSchema={zaposleniSchema}
            defaultValues={{ vrstaIdentifikatora: 'jmbg' }}
            draftSavedAt={draftAt}
            onDirtyChange={setDirty}
            /* In a real application, this would write to Supabase or localStorage. */
            onDraftChange={() => setDraftAt(new Date())}
            onSubmit={(values) => {
              setSacuvano(JSON.stringify(values, null, 2))
              setDirty(false)
            }}
            onCancel={() => history.back()}
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