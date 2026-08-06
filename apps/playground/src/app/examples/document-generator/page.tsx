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
    label: { sr: 'Godišnji odmor', 'sr-Cyrl': 'Годишњи одмор', en: 'Annual leave' },
    description: { sr: 'Iz godišnjeg fonda dana', en: 'From the annual allowance' },
    icon: Plane,
    badge: <StatusBadge tone="info" label={{ sr: 'Najčešće', en: 'Most common' }} />,
  },
  {
    value: 'bolovanje',
    label: { sr: 'Bolovanje', 'sr-Cyrl': 'Боловање', en: 'Sick leave' },
    description: { sr: 'Do 30 dana na teret poslodavca', en: 'Up to 30 days, employer paid' },
    icon: Stethoscope,
  },
  {
    value: 'slava',
    label: { sr: 'Krsna slava', 'sr-Cyrl': 'Крсна слава', en: 'Patron saint day' },
    description: { sr: 'Jedan dan godišnje, plaćen', en: 'One paid day per year' },
    icon: Church,
  },
  {
    value: 'porodiljsko',
    label: { sr: 'Porodiljsko odsustvo', 'sr-Cyrl': 'Породиљско одсуство', en: 'Parental leave' },
    icon: Baby,
  },
  {
    value: 'nega',
    label: { sr: 'Nega člana porodice', 'sr-Cyrl': 'Нега члана породице', en: 'Family care' },
    icon: HeartPulse,
  },
]

export default function DocumentGeneratorPage() {
  const [zaposleni, setZaposleni] = useState('')
  const [vrsta, setVrsta] = useState<string | null>(null)
  const [pokusano, setPokusano] = useState(false)

  const greska = pokusano && !vrsta ? 'Izaberite vrstu odsustva' : null

  return (
    <PageContainer width="default">
      <PageHeader
        icon={FileText}
        title={{ sr: 'Generator dokumenata', 'sr-Cyrl': 'Генератор докумената', en: 'Document generator' }}
        description={{ sr: 'Rešenje o odsustvu', en: 'Leave decision' }}
        withDivider
      />

      <Stack gap="md">
        <SectionCard title={{ sr: 'Osnovni podaci', en: 'Details' }}>
          <TextInput
            label="Zaposleno lice"
            placeholder="Ana Jovanović"
            value={zaposleni}
            onChange={(event) => setZaposleni(event.currentTarget.value)}
          />
        </SectionCard>

        <SectionCard title={{ sr: 'Vrsta odsustva', en: 'Leave type' }}>
          <CardSelect
            options={VRSTE}
            value={vrsta}
            onChange={setVrsta}
            error={greska}
            columns={3}
            description={{
              sr: 'Vrsta određuje tekst rešenja i način obračuna.',
              en: 'The type determines the wording and the calculation.',
            }}
          />
        </SectionCard>

        <Group justify="space-between">
          <Text size="xs" c="dimmed">
            Probaj tastaturom: Tab do grupe, pa strelice levo i desno.
          </Text>
          <ActionButton
            intent="pdf"
            primary
            label={{ sr: 'Generiši rešenje', en: 'Generate decision' }}
            onClick={() => setPokusano(true)}
          />
        </Group>
      </Stack>
    </PageContainer>
  )
}