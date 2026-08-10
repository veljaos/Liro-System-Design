'use client'

import { useState } from 'react'
import { FileInput, Radio, Stack, Text } from '@mantine/core'
import { FileSignature } from 'lucide-react'
import { SectionCard, StatusBadge, StepWizard, commonNotice, type WizardOutcome } from '@liro/ui'
import { PdfPositionPicker } from '@liro/pdf'
import { ActionButton, ActionGroup } from '@liro/ui'
import type { CatalogCategory } from '../types'

/**
 * Document signing.
 *
 * Pattern taken from `DocumentSigningWizard` in Liro Business App: a
 * sequence of steps in a modal, certificate selection, position selection by
 * dragging, then the outcome.
 */
function SigningDemo() {
  const [opened, setOpened] = useState(false)
  const [active, setActive] = useState(0)
  const [file, setFile] = useState<File | null>(null)
  const [certificate, setCertificate] = useState<string | null>(null)
  const [outcome, setOutcome] = useState<WizardOutcome | null>(null)

  const reset = () => {
    setActive(0)
    setOutcome(null)
  }

  return (
    <>
      <ActionGroup>
        <ActionButton
          intent="sign"
          label={{ sr: 'Potpiši dokument' }}
          onClick={() => {
            reset()
            setOpened(true)
          }}
        />
      </ActionGroup>

      <StepWizard
        opened={opened}
        onClose={() => setOpened(false)}
        title={{ sr: 'Potpisivanje dokumenta' }}
        active={active}
        onActiveChange={setActive}
        outcome={outcome}
        size={active === 2 ? 'xl' : 'lg'}
        onFinish={() =>
          setOutcome({
            kind: 'success',
            title: { sr: 'Dokument je potpisan' },
            description: { sr: 'Potpisani primerak je sačuvan uz zapis i može se preuzeti.' },
            action: { label: { sr: 'Otvori dokument' }, onClick: () => setOpened(false) },
          })
        }
        steps={[
          {
            id: 'upload',
            label: { sr: 'Dokument' },
            canContinue: file !== null,
            content: (
              <Stack gap="sm">
                <FileInput
                  label="PDF dokument"
                  placeholder="Izaberite fajl"
                  accept="application/pdf"
                  value={file}
                  onChange={setFile}
                />
                <Text size="xs" c="dimmed">
                  Dokument se ne šalje na server u ovom koraku — pregled se crta u pregledaču.
                </Text>
              </Stack>
            ),
          },
          {
            id: 'certificate',
            label: { sr: 'Sertifikat' },
            canContinue: certificate !== null,
            content: (
              <Radio.Group value={certificate} onChange={setCertificate} label="Izaberite sertifikat">
                <Stack gap="xs" mt="xs">
                  <Radio value="pki" label="Lična karta sa čipom · Veljko Ostojić" />
                  <Radio value="halcom" label="Halcom kvalifikovani sertifikat" />
                  <Radio value="cloud" label="Sertifikat u oblaku" disabled />
                </Stack>
              </Radio.Group>
            ),
          },
          {
            id: 'position',
            label: { sr: 'Pozicija pečata' },
            nextLabel: { sr: 'Potpiši' },
            content: file ? (
              <PdfPositionPicker
                source={file}
                onConfirm={(position) => {
                  commonNotice.saved({ sr: `Pozicija: strana ${position.page}, x ${position.x}, y ${position.y}` })
                  setActive(2)
                }}
              />
            ) : (
              <Text size="sm" c="dimmed">Prvo izaberite dokument.</Text>
            ),
          },
        ]}
      />
    </>
  )
}

export const signingCategories: CatalogCategory[] = [
  {
    slug: 'signing',
    title: 'Potpisivanje i PDF',
    description: 'Čarobnjak sa koracima, pregled PDF-a i izbor pozicije pečata prevlačenjem.',
    group: 'blocks',
    icon: FileSignature,
    entries: [
      {
        id: 'step-wizard',
        title: 'Čarobnjak sa koracima',
        description: 'Korak koji radi na serveru nema dugmad — inače bi „Nazad" ostavio zapis na pola.',
        from: '@liro/ui',
        demo: <SigningDemo />,
        code: `<StepWizard
  opened={opened}
  onClose={close}
  title={{ sr: 'Potpisivanje dokumenta' }}
  active={active}
  onActiveChange={setActive}
  outcome={outcome}
  steps={[
    { id: 'upload', label: { sr: 'Dokument' }, canContinue: Boolean(file), content: <FileInput … /> },
    { id: 'sign', label: { sr: 'Potpis' }, busy: signing, content: <Certificates /> },
  ]}
/>`,
      },
      {
        id: 'pdf-preview',
        title: 'Pregled PDF-a',
        description: 'pdfjs-dist se uvozi dinamički, unutar efekta — statičan uvoz obara SSR.',
        from: '@liro/pdf',
        demo: (
          <SectionCard title={{ sr: 'Napomena' }}>
            <Stack gap="xs">
              <Text size="sm">
                Prikaz traži stvaran PDF fajl, pa je uključen u čarobnjaka iznad — izaberite dokument
                i pređite na korak „Pozicija pečata".
              </Text>
              <StatusBadge tone="info" label="PdfPreview · PdfPositionPicker" />
            </Stack>
          </SectionCard>
        ),
        code: `<PdfPreview source={file} width={480} withZoom />

<PdfPositionPicker
  source={file}
  stampWidth={190}
  stampHeight={56}
  onConfirm={({ page, x, y }) => sign({ page, x, y })}
/>`,
      },
    ],
  },
]
