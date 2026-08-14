'use client'

import { use, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Text } from '@mantine/core'
import { Users } from 'lucide-react'
import { ActiveStatusBadge, KeyValueList, SectionCard, commonNotice } from '@liro/ui'
import { AutoForm, useFormErrors } from '@liro/forms'
import { RecordFormTemplate } from '@liro/templates'
import { DemoAppShell } from '@/components/DemoAppShell'
import { formSchema } from '@/lib/demo-schemas'

/**
 * Employee entry and edit — full page.
 *
 * `new` is the same screen without a loaded record, exactly as in Liro
 * Business App.
 */
export default function EmployeeRecordPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const errors = useFormErrors()
  const [submitting, setSubmitting] = useState(false)

  const isNew = id === 'new'
  const back = () => router.push('/examples/employees')

  const save = () => {
    setSubmitting(true)
    setTimeout(() => {
      setSubmitting(false)
      commonNotice.saved()
      back()
    }, 600)
  }

  return (
    <DemoAppShell
      breadcrumbs={[
        { label: { en: 'Employees' }, href: '/examples/employees' },
        { label: { en: isNew ? 'New employee' : 'Edit' } },
      ]}
    >
      <RecordFormTemplate
        title={isNew ? { en: 'New employee' } : 'Ana Jovanović'}
        description={{ en: isNew ? 'Entering a new employee' : 'Knjigovođa · Konfirs d.o.o.' }}
        icon={Users}
        badge={isNew ? undefined : <ActiveStatusBadge active />}
        onBack={back}
        onSubmit={save}
        submitting={submitting}
        footnote={{ en: 'After saving, the record appears in the list and can be included in a payroll run.' }}
        aside={
          !isNew ? (
            <SectionCard title={{ en: 'Record state' }}>
              <KeyValueList
                columns={1}
                items={[
                  { label: { en: 'Modified by' }, value: 'Ana Jovanović' },
                  { label: { en: 'Version' }, value: '7', numeric: true },
                  { label: { en: 'Internal ID' }, value: id },
                ]}
              />
            </SectionCard>
          ) : (
            <SectionCard title={{ en: 'Help' }}>
              <Text size="sm">
                Required fields are marked with an asterisk. The branch unlocks once a client is chosen.
              </Text>
            </SectionCard>
          )
        }
      >
        <SectionCard title={{ en: 'Personal details' }}>
          <AutoForm
            schema={formSchema}
            defaultValues={isNew ? undefined : { first_name: 'Ana', last_name: 'Jovanović', client_id: 'c1' }}
            serverErrors={errors.serverErrors}
            formError={errors.formError}
            onSubmit={save}
            withoutActions
          />
        </SectionCard>
      </RecordFormTemplate>
    </DemoAppShell>
  )
}
