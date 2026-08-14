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
          label={{ en: 'Sign document' }}
          onClick={() => {
            reset()
            setOpened(true)
          }}
        />
      </ActionGroup>

      <StepWizard
        opened={opened}
        onClose={() => setOpened(false)}
        title={{ en: 'Signing the document' }}
        active={active}
        onActiveChange={setActive}
        outcome={outcome}
        size={active === 2 ? 'xl' : 'lg'}
        onFinish={() =>
          setOutcome({
            kind: 'success',
            title: { en: 'The document is signed' },
            description: { en: 'The signed copy has been saved with the record and can be downloaded.' },
            action: { label: { en: 'Open document' }, onClick: () => setOpened(false) },
          })
        }
        steps={[
          {
            id: 'upload',
            label: { en: 'Document' },
            canContinue: file !== null,
            content: (
              <Stack gap="sm">
                <FileInput
                  label="PDF document"
                  placeholder="Choose a file"
                  accept="application/pdf"
                  value={file}
                  onChange={setFile}
                />
                <Text size="xs" c="dimmed">
                  The document is not sent to the server at this step — the preview is drawn in the browser.
                </Text>
              </Stack>
            ),
          },
          {
            id: 'certificate',
            label: { en: 'Certificate' },
            canContinue: certificate !== null,
            content: (
              <Radio.Group value={certificate} onChange={setCertificate} label="Choose a certificate">
                <Stack gap="xs" mt="xs">
                  <Radio value="pki" label="ID card with chip · Veljko Ostojić" />
                  <Radio value="halcom" label="Halcom qualified certificate" />
                  <Radio value="cloud" label="Cloud certificate" disabled />
                </Stack>
              </Radio.Group>
            ),
          },
          {
            id: 'position',
            label: { en: 'Stamp position' },
            nextLabel: { en: 'Sign' },
            content: file ? (
              <PdfPositionPicker
                source={file}
                onConfirm={(position) => {
                  commonNotice.saved({ en: `Position: page ${position.page}, x ${position.x}, y ${position.y}` })
                  setActive(2)
                }}
              />
            ) : (
              <Text size="sm" c="dimmed">First choose a document.</Text>
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
    title: 'Signing and PDF',
    description: 'A step wizard, PDF preview, and stamp position selection by dragging.',
    group: 'blocks',
    icon: FileSignature,
    entries: [
      {
        id: 'step-wizard',
        title: 'Step wizard',
        description: 'A step that talks to the server has no buttons — otherwise „Back" would leave the record half-done.',
        from: '@liro/ui',
        demo: <SigningDemo />,
        code: `<StepWizard
  opened={opened}
  onClose={close}
  title={{ en: 'Signing the document' }}
  active={active}
  onActiveChange={setActive}
  outcome={outcome}
  steps={[
    { id: 'upload', label: { en: 'Document' }, canContinue: Boolean(file), content: <FileInput … /> },
    { id: 'sign', label: { en: 'Signature' }, busy: signing, content: <Certificates /> },
  ]}
/>`,
      },
      {
        id: 'pdf-preview',
        title: 'PDF preview',
        description: 'pdfjs-dist is imported dynamically, inside an effect — a static import breaks SSR.',
        from: '@liro/pdf',
        demo: (
          <SectionCard title={{ en: 'Note' }}>
            <Stack gap="xs">
              <Text size="sm">
                The preview needs a real PDF file, so it is included in the wizard above — choose a
                document and move to the „Stamp position" step.
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
