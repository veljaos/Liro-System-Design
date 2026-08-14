'use client'

import { useState } from 'react'
import { Group, Stack, Text, TextInput } from '@mantine/core'
import { Baby, Church, FileText, HeartPulse, Plane, Stethoscope } from 'lucide-react'
import {
  PageContainer,
  PageHeader,
  SectionCard,
  CardSelect,
  ActionButton,
  StatusBadge,
  type CardOption,
} from '@liro/ui'

const VRSTE: CardOption[] = [
  {
    value: 'godisnji',
    label: { en: 'Annual leave' },
    description: { en: 'From the annual allowance' },
    icon: Plane,
    badge: <StatusBadge tone="info" label={{ en: 'Most common' }} />,
  },
  {
    value: 'bolovanje',
    label: { en: 'Sick leave' },
    description: { en: 'Up to 30 days, employer paid' },
    icon: Stethoscope,
  },
  {
    value: 'slava',
    label: { en: 'Patron saint day' },
    description: { en: 'One paid day per year' },
    icon: Church,
  },
  {
    value: 'porodiljsko',
    label: { en: 'Parental leave' },
    icon: Baby,
  },
  {
    value: 'nega',
    label: { en: 'Family care' },
    icon: HeartPulse,
  },
]

export default function DocumentGeneratorPage() {
  const [zaposleni, setZaposleni] = useState('')
  const [vrsta, setVrsta] = useState<string | null>(null)
  const [pokusano, setPokusano] = useState(false)

  const greska = pokusano && !vrsta ? 'Choose a leave type' : null

  return (
    <PageContainer width="default">
      <PageHeader
        icon={FileText}
        title={{ en: 'Document generator' }}
        description={{ en: 'Leave decision' }}
        withDivider
      />

      <Stack gap="md">
        <SectionCard title={{ en: 'Details' }}>
          <TextInput
            label="Employee"
            placeholder="Ana Jovanović"
            value={zaposleni}
            onChange={(event) => setZaposleni(event.currentTarget.value)}
          />
        </SectionCard>

        <SectionCard title={{ en: 'Leave type' }}>
          <CardSelect
            options={VRSTE}
            value={vrsta}
            onChange={setVrsta}
            error={greska}
            columns={3}
            description={{
              en: 'The type determines the wording and the calculation.',
            }}
          />
        </SectionCard>

        <Group justify="space-between">
          <Text size="xs" c="dimmed">
            Try the keyboard: Tab to the group, then arrows left and right.
          </Text>
          <ActionButton
            intent="pdf"
            primary
            label={{ en: 'Generate decision' }}
            onClick={() => setPokusano(true)}
          />
        </Group>
      </Stack>
    </PageContainer>
  )
}
