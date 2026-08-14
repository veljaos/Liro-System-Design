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
    label: { en: 'Personal' },
    description: { en: 'Name, ID, contact' },
    validationSchema: licniPodaciSchema,
    schema: [
      {
        type: 'row',
        name: 'r1',
        fields: [
          { type: 'text', name: 'ime', label: { en: 'First name' }, required: true },
          { type: 'text', name: 'prezime', label: { en: 'Last name' }, required: true },
        ],
      },
      {
        type: 'row',
        name: 'r2',
        fields: [
          {
            type: 'select',
            name: 'vrstaIdentifikatora',
            label: { en: 'ID type' },
            required: true,
            options: [
              { value: 'jmbg', label: { en: 'National ID' } },
              { value: 'eb', label: { en: 'Foreigner registration no.' } },
              { value: 'strani', label: { en: 'ID card / passport' } },
            ],
          },
          {
            type: 'text',
            name: 'identifikator',
            label: { en: 'Number' },
            required: true,
          },
        ],
      },
      {
        type: 'row',
        name: 'r2b',
        fields: [{ type: 'text', name: 'email', label: { en: 'Email' } }],
      },
    ],
  },
  {
    id: 'radni',
    label: { en: 'Employment' },
    description: { en: 'Contract and dates' },
    validationSchema: radniOdnosSchema,
    schema: [
      {
        type: 'row',
        name: 'r3',
        fields: [
          {
            type: 'select',
            name: 'radnoMesto',
            label: { en: 'Position' },
            required: true,
            options: [
              { value: 'knjigovodja', label: { en: 'Bookkeeper' } },
              { value: 'revizor', label: { en: 'Auditor' } },
              { value: 'administrator', label: { en: 'Administrator' } },
            ],
          },
          {
            type: 'select',
            name: 'vrstaUgovora',
            label: { en: 'Contract type' },
            required: true,
            options: [
              { value: 'neodredjeno', label: { en: 'Permanent' } },
              { value: 'odredjeno', label: { en: 'Fixed term' } },
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
            label: { en: 'Start date' },
            required: true,
          },
          {
            type: 'date',
            name: 'datumPrestanka',
            label: { en: 'End date' },
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
    label: { en: 'Compensation' },
    validationSchema: primanjaSchema,
    schema: [
      {
        type: 'row',
        name: 'r5',
        fields: [
          { type: 'number', name: 'bruto', label: { en: 'Gross salary' }, required: true },
          {
            type: 'text',
            name: 'tekuciRacun',
            label: { en: 'Bank account' },
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
        title={{ en: 'New employee' }}
        badge={
          dirty ? (
            <StatusBadge tone="warning" label={{ en: 'Unsaved' }} />
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
          <SectionCard title={{ en: 'Saved' }}>
            <Text component="pre" size="xs" style={{ whiteSpace: 'pre-wrap' }}>
              {sacuvano}
            </Text>
          </SectionCard>
        )}
      </Stack>
    </PageContainer>
  )
}
