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
 * Unos i izmena zaposlenog — puna stranica.
 *
 * `new` je isti ekran bez ucitanog zapisa, tacno kao u Liro Business App-u.
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
        { label: { sr: 'Zaposlena lica' }, href: '/examples/employees' },
        { label: { sr: isNew ? 'Novo lice' : 'Izmena' } },
      ]}
    >
      <RecordFormTemplate
        title={isNew ? { sr: 'Novo lice', en: 'New employee' } : 'Ana Jovanović'}
        description={{ sr: isNew ? 'Unos novog radno angažovanog lica' : 'Knjigovođa · Konfirs d.o.o.' }}
        icon={Users}
        badge={isNew ? undefined : <ActiveStatusBadge active />}
        onBack={back}
        onSubmit={save}
        submitting={submitting}
        footnote={{ sr: 'Po čuvanju se zapis pojavljuje u spisku i može se uključiti u obračun.' }}
        aside={
          !isNew ? (
            <SectionCard title={{ sr: 'Stanje zapisa' }}>
              <KeyValueList
                columns={1}
                items={[
                  { label: { sr: 'Izmenio' }, value: 'Ana Jovanović' },
                  { label: { sr: 'Verzija' }, value: '7', numeric: true },
                  { label: { sr: 'Interna oznaka' }, value: id },
                ]}
              />
            </SectionCard>
          ) : (
            <SectionCard title={{ sr: 'Pomoć' }}>
              <Text size="sm">
                Obavezna polja su označena zvezdicom. Poslovnica se otključava po izboru klijenta.
              </Text>
            </SectionCard>
          )
        }
      >
        <SectionCard title={{ sr: 'Podaci o licu' }}>
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
