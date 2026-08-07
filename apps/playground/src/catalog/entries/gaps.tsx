'use client'

import { useState } from 'react'
import {
  ActionIcon,
  Autocomplete,
  Button,
  Checkbox,
  ColorInput,
  Divider,
  Fieldset,
  Group,
  JsonInput,
  MultiSelect,
  NumberInput,
  PasswordInput,
  PinInput,
  Progress,
  Radio,
  RangeSlider,
  Rating,
  RingProgress,
  SegmentedControl,
  Select,
  SimpleGrid,
  Slider,
  Stack,
  Switch,
  Table,
  Text,
  Textarea,
  TextInput,
  ThemeIcon,
} from '@mantine/core'
import {
  Banknote,
  Building2,
  FileCheck2,
  Gauge,
  Hash,
  Mail,
  Percent,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  Users,
  Workflow,
} from 'lucide-react'
import {
  ActionButton,
  ActionGroup,
  ApprovalChain,
  Checklist,
  LiroCarousel,
  LiroCarouselSlide,
  ScoreMeter,
  SectionCard,
  PersonCard,
  PersonCell,
  PersonInfo,
  ProgressCard,
  SplitAction,
  StatCard,
  StatGrid,
  StatusBadge,
  WorkflowStatus,
} from '@liro/ui'
import { LiroSparkline } from '@liro/charts'
import type { CatalogCategory } from '../types'

// ---------------------------------------------------------------------------

function InputsDemo() {
  return (
    <SimpleGrid cols={{ base: 1, md: 2 }} spacing="lg">
      <Stack gap="md">
        <TextInput label="Naziv" placeholder="Konfirs d.o.o." />
        <TextInput label="PIB" placeholder="100234567" leftSection={<Hash size={15} />} description="Devet cifara" />
        <TextInput label="Elektronska pošta" placeholder="ime@firma.rs" leftSection={<Mail size={15} />} />
        <PasswordInput label="Lozinka" placeholder="Najmanje 12 znakova" />
        <Textarea label="Napomena" placeholder="Slobodan tekst…" autosize minRows={2} />
      </Stack>
      <Stack gap="md">
        <NumberInput
          label="Bruto zarada"
          placeholder="0,00"
          decimalScale={2}
          fixedDecimalScale
          thousandSeparator="."
          decimalSeparator=","
          suffix=" RSD"
        />
        <NumberInput label="Stopa PDV-a" defaultValue={20} min={0} max={100} suffix=" %" />
        <Select label="Način plaćanja" placeholder="Izaberite" data={['Virman', 'Gotovina', 'Kartica', 'Kompenzacija']} />
        <MultiSelect label="Oznake" placeholder="Dodajte" data={['Hitno', 'Veliki kupac', 'Avans', 'Izvoz']} defaultValue={['Hitno']} />
        <Autocomplete label="Grad" placeholder="Počnite da kucate" data={['Beograd', 'Novi Sad', 'Niš', 'Kragujevac']} />
      </Stack>
    </SimpleGrid>
  )
}

function InputStatesDemo() {
  return (
    <SimpleGrid cols={{ base: 1, md: 3 }} spacing="lg">
      <TextInput label="Obavezno" withAsterisk placeholder="Mora se popuniti" />
      <TextInput label="Sa greškom" defaultValue="123" error="PIB mora imati devet cifara" />
      <TextInput label="Onemogućeno" defaultValue="Ne može se menjati" disabled />
      <TextInput label="Samo za čitanje" defaultValue="Dolazi iz APR-a" readOnly />
      <TextInput label="Sa objašnjenjem" placeholder="0000000000000" description="JMBG, trinaest cifara" />
      <TextInput label="Uspešno provereno" defaultValue="100234567" rightSection={<ThemeIcon size={18} radius="xl" color="liro-green" variant="light"><FileCheck2 size={11} /></ThemeIcon>} />
    </SimpleGrid>
  )
}

function ChoiceDemo() {
  const [value, setValue] = useState('sve')
  const [pin, setPin] = useState('')
  return (
    <SimpleGrid cols={{ base: 1, md: 2 }} spacing="xl">
      <Stack gap="lg">
        <Radio.Group label="Vrsta obveznika" defaultValue="pdv">
          <Stack gap="xs" mt="xs">
            <Radio value="pdv" label="U sistemu PDV-a" />
            <Radio value="nepdv" label="Nije u sistemu PDV-a" />
            <Radio value="pausal" label="Paušalac" />
          </Stack>
        </Radio.Group>

        <Checkbox.Group label="Načini dostave" defaultValue={['email']}>
          <Stack gap="xs" mt="xs">
            <Checkbox value="email" label="Elektronskom poštom" />
            <Checkbox value="sef" label="Preko SEF-a" />
            <Checkbox value="posta" label="Poštom" />
          </Stack>
        </Checkbox.Group>
      </Stack>

      <Stack gap="lg">
        <Stack gap={6}>
          <Text size="sm" fw={500}>Period prikaza</Text>
          <SegmentedControl
            value={value}
            onChange={setValue}
            data={[
              { value: 'sve', label: 'Sve' },
              { value: 'mesec', label: 'Mesec' },
              { value: 'kvartal', label: 'Kvartal' },
            ]}
            size="sm"
          />
        </Stack>

        <Switch label="Automatsko slanje u SEF" description="Šalje se odmah po potpisivanju" defaultChecked />
        <Switch label="Obaveštenja mejlom" />

        <Stack gap={6}>
          <Text size="sm" fw={500}>Kod iz aplikacije</Text>
          <PinInput length={6} value={pin} onChange={setPin} oneTimeCode />
        </Stack>
      </Stack>
    </SimpleGrid>
  )
}

function SlidersDemo() {
  const [rate, setRate] = useState(20)
  const [range, setRange] = useState<[number, number]>([50_000, 180_000])

  return (
    <SimpleGrid cols={{ base: 1, md: 2 }} spacing="xl">
      <Stack gap="xl">
        <Stack gap={6}>
          <Group justify="space-between">
            <Text size="sm" fw={500}>Stopa PDV-a</Text>
            <Text size="sm" fw={700} data-numeric>{rate} %</Text>
          </Group>
          <Slider
            value={rate}
            onChange={setRate}
            thumbLabel="Stopa PDV-a"
            min={0}
            max={25}
            step={1}
            marks={[{ value: 0, label: '0' }, { value: 10, label: '10' }, { value: 20, label: '20' }]}
          />
        </Stack>

        <Stack gap={6}>
          <Group justify="space-between">
            <Text size="sm" fw={500}>Raspon zarade</Text>
            <Text size="sm" fw={700} data-numeric>
              {range[0].toLocaleString('sr-RS')} – {range[1].toLocaleString('sr-RS')}
            </Text>
          </Group>
          <RangeSlider
            value={range}
            onChange={setRange}
            thumbFromLabel="Donja granica zarade"
            thumbToLabel="Gornja granica zarade"
            min={0}
            max={300_000}
            step={5_000}
            label={(value) => value.toLocaleString('sr-RS')}
          />
        </Stack>
      </Stack>

      <Stack gap="xl">
        <Stack gap={6}>
          <Text size="sm" fw={500}>Ocena dobavljača</Text>
          <Rating defaultValue={4} />
        </Stack>

        <Stack gap={6}>
          <Text size="sm" fw={500}>Napredak obračuna</Text>
          <Progress value={68} size="lg" radius="xl" aria-label="Napredak obračuna" />
          <Text size="xs" c="dimmed">32 od 47 lica obračunato</Text>
        </Stack>

        <Group>
          <RingProgress
            size={110}
            thickness={10}
            roundCaps
            sections={[{ value: 68, color: 'liro-blue' }]}
            label={<Text ta="center" size="sm" fw={700}>68%</Text>}
          />
          <Stack gap={2}>
            <Text size="sm" fw={600}>Ispunjenje plana</Text>
            <Text size="xs" c="dimmed">Prsten za jedan udeo, traka za napredak u vremenu.</Text>
          </Stack>
        </Group>
      </Stack>
    </SimpleGrid>
  )
}

function SpecialInputsDemo() {
  return (
    <SimpleGrid cols={{ base: 1, md: 2 }} spacing="lg">
      <Stack gap="md">
        <TextInput label="Pretraga" placeholder="Broj dokumenta ili klijent…" leftSection={<Search size={15} />} />
        <ColorInput label="Boja oznake" defaultValue="#0078D4" format="hex" />
        <Fieldset legend="Adresa" radius="md">
          <Stack gap="sm">
            <TextInput label="Ulica i broj" placeholder="Bulevar Mihajla Pupina 10ž" />
            <Group grow>
              <TextInput label="Poštanski broj" placeholder="11070" />
              <TextInput label="Mesto" placeholder="Beograd" />
            </Group>
          </Stack>
        </Fieldset>
      </Stack>
      <JsonInput
        label="Dodatna svojstva"
        description="Polja koja modul čuva uz zapis"
        formatOnBlur
        autosize
        minRows={10}
        defaultValue={'{\n  "sifra_delatnosti": "6920",\n  "eksterni_id": "CRM-4821"\n}'}
      />
    </SimpleGrid>
  )
}

function ButtonsDemo() {
  return (
    <Stack gap="lg">
      <Stack gap="xs">
        <Text size="xs" fw={700} c="dimmed">GLAVNI TOK — PLAVO</Text>
        <ActionGroup>
          <ActionButton intent="create" />
          <ActionButton intent="save" />
          <ActionButton intent="submit" />
          <ActionButton intent="confirm" />
          <ActionButton intent="next" />
        </ActionGroup>
      </Stack>

      <Stack gap="xs">
        <Text size="xs" fw={700} c="dimmed">OVERA I POTPIS — TIRKIZNO</Text>
        <ActionGroup>
          <ActionButton intent="verify" />
          <ActionButton intent="sign" />
          <ActionButton intent="send" />
          <ActionButton intent="sync" />
        </ActionGroup>
      </Stack>

      <Stack gap="xs">
        <Text size="xs" fw={700} c="dimmed">DOKUMENTI — LJUBIČASTO</Text>
        <ActionGroup>
          <ActionButton intent="pdf" />
          <ActionButton intent="print" />
          <ActionButton intent="preview" />
          <ActionButton intent="download" />
        </ActionGroup>
      </Stack>

      <Stack gap="xs">
        <Text size="xs" fw={700} c="dimmed">ISHOD — ZELENO I NARANDŽASTO</Text>
        <ActionGroup>
          <ActionButton intent="approve" />
          <ActionButton intent="post" />
          <ActionButton intent="complete" />
          <ActionButton intent="excel" />
          <ActionButton intent="revert" />
          <ActionButton intent="unlock" />
          <ActionButton intent="void" />
        </ActionGroup>
      </Stack>

      <Stack gap="xs">
        <Text size="xs" fw={700} c="dimmed">SPOREDNO — SIVO</Text>
        <ActionGroup>
          <ActionButton intent="edit" />
          <ActionButton intent="view" />
          <ActionButton intent="duplicate" />
          <ActionButton intent="filter" />
          <ActionButton intent="refresh" />
          <ActionButton intent="import" />
          <ActionButton intent="archive" />
          <ActionButton intent="back" />
          <ActionButton intent="cancel" />
          <ActionButton intent="settings" />
          <ActionButton intent="more" />
        </ActionGroup>
      </Stack>

      <Stack gap="xs">
        <Text size="xs" fw={700} c="dimmed">DESTRUKTIVNO — CRVENO</Text>
        <ActionGroup>
          <ActionButton intent="reject" />
          <ActionButton intent="delete" />
          <ActionButton intent="cancelDocument" />
        </ActionGroup>
      </Stack>
    </Stack>
  )
}

function ButtonStatesDemo() {
  return (
    <Stack gap="lg">
      <Group gap="md" align="center">
        <ActionButton intent="save" />
        <ActionButton intent="save" loading />
        <ActionButton intent="save" disabled />
        <ActionButton intent="save" iconOnly />
      </Group>
      <Divider />
      <Group gap="md">
        <Button size="xs">xs</Button>
        <Button size="sm">sm</Button>
        <Button size="md">md</Button>
        <Button size="lg">lg</Button>
      </Group>
      <Group gap="md">
        <Button variant="filled">Filled</Button>
        <Button variant="light">Light</Button>
        <Button variant="default">Default</Button>
        <Button variant="subtle">Subtle</Button>
        <Button variant="outline">Outline</Button>
        <ActionIcon variant="subtle" aria-label="Ikonica"><SlidersHorizontal size={17} /></ActionIcon>
      </Group>
      <Text size="xs" c="dimmed">
        Mantine varijante postoje za retke slučajeve van kataloga namera. U aplikaciji se koristi{' '}
        <code>ActionButton</code>.
      </Text>
    </Stack>
  )
}

// ---------------------------------------------------------------------------

const SPARK = [12, 15, 14, 19, 22, 21, 26, 29, 31, 36]

export const gapCategories: CatalogCategory[] = [
  {
    slug: 'form-inputs',
    title: 'Polja za unos',
    description: 'Sve što se pojavljuje u formama, plus stanja i posebni slučajevi.',
    group: 'components',
    icon: SlidersHorizontal,
    entries: [
      { id: 'text-number', title: 'Tekst i brojevi', from: '@mantine/core', demo: <InputsDemo />, code: `<NumberInput label="Bruto zarada" decimalScale={2} fixedDecimalScale thousandSeparator="." decimalSeparator="," suffix=" RSD" />` },
      { id: 'input-states', title: 'Stanja polja', description: 'Obavezno, greška, onemogućeno, samo za čitanje, provereno.', demo: <InputStatesDemo /> },
      { id: 'choice', title: 'Izbor i prekidači', description: 'Radio za jedan izbor, checkbox za više, prekidač za uključeno/isključeno.', demo: <ChoiceDemo /> },
      { id: 'special', title: 'Posebna polja', description: 'Pretraga, boja, grupisana polja, JSON za dodatna svojstva.', demo: <SpecialInputsDemo /> },
      {
        id: 'sliders',
        title: 'Klizači, ocene i napredak',
        description: 'Klizač za jednu vrednost, raspon za dve, prsten za udeo, traka za napredak u vremenu.',
        from: '@mantine/core',
        demo: <SlidersDemo />,
        code: `<Slider value={rate} onChange={setRate} thumbLabel="Stopa PDV-a" min={0} max={25} step={1}
      marks={[{ value: 0, label: '0' }, { value: 10, label: '10' }, { value: 20, label: '20' }]} />

      <RangeSlider value={range} onChange={setRange} thumbFromLabel="Donja granica zarade" thumbToLabel="Gornja granica zarade" min={0} max={300_000} step={5_000}
        label={(value) => value.toLocaleString('sr-RS')} />`,
      },
      {
        id: 'schema-form',
        title: 'Forma iz šeme',
        description: 'U aplikaciji se polja ne pišu ručno — opisuju se šemom.',
        from: '@liro/forms',
        demo: (
          <Text size="sm">
            Živi primer je u kategoriji <code>Polja i forme</code>. Ovde su prikazani pojedinačni
            elementi, tamo ceo motor.
          </Text>
        ),
        code: `const schema: FieldSchema[] = [
  { name: 'pib', type: 'text', label: { sr: 'PIB' }, required: true },
  { name: 'gross', type: 'currency', label: { sr: 'Bruto' }, number: { suffix: ' RSD' } },
]`,
      },
    ],
  },

  {
    slug: 'buttons',
    title: 'Dugmad',
    description: 'Katalog namera u celosti, plus stanja i veličine.',
    group: 'components',
    icon: Workflow,
    entries: [
      { id: 'intents-all', title: 'Sve namere po porodicama', from: '@liro/ui', demo: <ButtonsDemo /> },
      { id: 'button-states', title: 'Stanja i veličine', demo: <ButtonStatesDemo /> },
      {
        id: 'split-action',
        title: 'Deljeno dugme',
        description:
          'Jedna radnja sa nekoliko oblika koji se rade retko. Stavke menija su namere — meni ne može prikazati radnju koja ne postoji u intents.ts.',
        from: '@liro/ui',
        demo: (
          <Group gap="lg">
            <SplitAction
              intent="send"
              primary
              items={[
                { intent: 'preview' },
                { intent: 'pdf', label: { sr: 'Pošalji kao PDF' } },
                { intent: 'save', label: { sr: 'Sačuvaj kao nacrt' } },
                { intent: 'cancelDocument' },
              ]}
            />
            <SplitAction
              intent="post"
              items={[{ intent: 'preview' }, { intent: 'revert' }, { intent: 'delete' }]}
            />
            <SplitAction
              intent="sign"
              disabled
              disabledReason={{ sr: 'Dokument mora prvo biti proknjižen.' }}
              items={[{ intent: 'preview' }, { intent: 'download' }]}
            />
          </Group>
        ),
        code: `<SplitAction
      intent="send"
      primary
      items={[
        { intent: 'preview' },
        { intent: 'pdf', label: { sr: 'Pošalji kao PDF' } },
        { intent: 'cancelDocument' },
      ]}
    />`,
      },
      {
        id: 'button-groups',
        title: 'Rasporedi u traci',
        description: 'Glavna radnja je uvek poslednja — tamo gde je oko očekuje i gde palac stiže.',
        from: '@liro/ui',
        demo: (
          <Stack gap="md">
            <ActionGroup>
              <ActionButton intent="delete" />
              <ActionButton intent="edit" />
              <ActionButton intent="save" />
            </ActionGroup>
            <ActionGroup>
              <ActionButton intent="back" />
            </ActionGroup>
          </Stack>
        ),
      },
    ],
  },

  {
    slug: 'stats',
    title: 'Brojke i pokazatelji',
    description: 'Zbirne kartice, prstenovi, minijaturni grafikoni.',
    group: 'blocks',
    icon: Gauge,
    entries: [
      {
        id: 'stat-grid-full',
        title: 'Red zbirnih kartica',
        from: '@liro/ui',
        demo: (
          <StatGrid
            data={[
              { title: { sr: 'Zaposlenih' }, value: 47, icon: Users, diff: 8 },
              { title: { sr: 'Klijenata' }, value: 12, icon: Building2 },
              { title: { sr: 'Masa zarada' }, value: '4.128.500', icon: Banknote, diff: 12, invertDiff: true },
              { title: { sr: 'Naplativost' }, value: '92%', icon: Percent, diff: 3 },
            ]}
          />
        ),
      },
      {
        id: 'stat-single',
        title: 'Pojedinačna kartica',
        description: 'Sa opisom, sa promenom, bez ikonice, kao dugme.',
        from: '@liro/ui',
        demo: (
          <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }} spacing="md">
            <StatCard title={{ sr: 'Bez ikonice' }} value="318" />
            <StatCard title={{ sr: 'Sa rastom' }} value="4.128.500" diff={12} icon={Banknote} />
            <StatCard title={{ sr: 'Rast je loš' }} value="412.300" diff={9} invertDiff icon={Percent} />
            <StatCard title={{ sr: 'Klikabilna' }} value="47" icon={Users} description={{ sr: 'Otvara spisak' }} onClick={() => {}} />
          </SimpleGrid>
        ),
      },
      {
        id: 'stat-sparkline',
        title: 'Brojka sa trendom',
        from: '@liro/charts',
        demo: (
          <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="lg">
            {[
              { label: 'PRIHOD', value: '3.612.400', invert: false },
              { label: 'TROŠAK', value: '2.180.900', invert: true },
              { label: 'DOCNJA', value: '412.300', invert: true },
            ].map((item) => (
              <Stack key={item.label} gap={4}>
                <Text size="xs" fw={600} c="dimmed">{item.label}</Text>
                <Text size="lg" fw={700} data-numeric>{item.value} RSD</Text>
                <LiroSparkline data={item.invert ? [...SPARK].reverse() : SPARK} trend invert={item.invert} />
              </Stack>
            ))}
          </SimpleGrid>
        ),
      },
      {
        id: 'stat-progress',
        title: 'Napredak i udeo',
        demo: (
          <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="lg">
            <Stack gap={6}>
              <Text size="sm" fw={600}>Obračun</Text>
              <Progress value={68} size="lg" radius="xl" aria-label="Napredak obračuna" />
              <Text size="xs" c="dimmed">32 od 47 lica</Text>
            </Stack>
            <Group>
              <RingProgress size={100} thickness={9} roundCaps sections={[{ value: 68, color: 'liro-blue' }]} label={<Text ta="center" size="sm" fw={700}>68%</Text>} />
            </Group>
            <Group>
              <RingProgress
                size={100}
                thickness={9}
                sections={[
                  { value: 45, color: 'liro-blue' },
                  { value: 30, color: 'liro-teal' },
                  { value: 15, color: 'liro-violet' },
                ]}
              />
            </Group>
          </SimpleGrid>
        ),
      },
      {
        id: 'progress-card',
        title: 'Kartica posla u toku',
        description:
          'Procenat se računa iz done/total, ne prima se odvojeno — dva broja ne mogu da se raziđu. Zaokružuje se naniže, pa 100% znači zaista završeno.',
        from: '@liro/ui',
        demo: (
          <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="md">
            <ProgressCard
              title={{ sr: 'Obračun zarada' }}
              description={{ sr: 'Mart 2026.' }}
              done={32}
              total={47}
              unit={{ sr: 'lica' }}
              icon={Users}
              badge={{ sr: '4 dana do roka' }}
            />
            <ProgressCard
              title={{ sr: 'Slanje u SEF' }}
              done={46}
              total={47}
              unit={{ sr: 'faktura' }}
              tone="warning"
              badge={{ sr: 'Jedna odbijena' }}
              badgeTone="warning"
            />
            <ProgressCard
              title={{ sr: 'Knjiženje izvoda' }}
              done={18}
              total={18}
              unit={{ sr: 'izvoda' }}
              tone="success"
              badge={{ sr: 'Završeno' }}
              badgeTone="success"
            />
          </SimpleGrid>
        ),
        code: `<ProgressCard
    title={{ sr: 'Obračun zarada' }}
    done={run.processed}
    total={run.employees}
    unit={{ sr: 'lica' }}
    badge={{ sr: '4 dana do roka' }}
  />`,
    },
    ],
  },
  {
    slug: 'carousels',
    title: 'Vodoravne liste',
    description: 'Kada red sadržaja ne staje na širinu ekrana.',
    group: 'blocks',
    icon: SlidersHorizontal,
    entries: [
      {
        id: 'carousel-stats',
        title: 'Zbirne kartice',
        from: '@liro/ui',
        demo: (
          <LiroCarousel slideSize={{ base: '80%', sm: '45%', md: '30%' }}>
            {[
              { title: { sr: 'Zaposlenih' }, value: 47 },
              { title: { sr: 'Klijenata' }, value: 12 },
              { title: { sr: 'Dokumenata' }, value: 318 },
              { title: { sr: 'Obračuna' }, value: 24 },
              { title: { sr: 'Priloga' }, value: 1204 },
              { title: { sr: 'Izvoda' }, value: 96 },
            ].map((stat, index) => (
              <LiroCarouselSlide key={index}><StatCard {...stat} /></LiroCarouselSlide>
            ))}
          </LiroCarousel>
        ),
        code: `<LiroCarousel slideSize={{ base: '80%', md: '30%' }}>
  {stats.map((stat) => (
    <LiroCarouselSlide key={stat.id}><StatCard {...stat} /></LiroCarouselSlide>
  ))}
</LiroCarousel>`,
      },
      {
        id: 'carousel-modules',
        title: 'Prečice ka modulima',
        from: '@liro/ui',
        demo: (
          <LiroCarousel slideSize={{ base: '60%', sm: '33%', md: '25%' }} withIndicators>
            {['Zarade', 'Dokumenti', 'Klijenti', 'Izveštaji', 'Osnovna sredstva', 'Putni nalozi'].map((name) => (
              <LiroCarouselSlide key={name}>
                <SectionCard title={{ sr: name }}>
                  <Text size="xs" c="dimmed">Otvori modul</Text>
                </SectionCard>
              </LiroCarouselSlide>
            ))}
          </LiroCarousel>
        ),
      },
    ],
  },

  {
    slug: 'business-patterns',
    title: 'Obrasci poslovnih domena',
    description:
      'Četiri obrasca koja pokrivaju bilo koji poslovni sistem — tok stanja, lanac odobrenja, kontrolna lista, ocena sa zonama.',
    group: 'blocks',
    icon: ShieldCheck,
    entries: [
      {
        id: 'workflow-status',
        title: 'Tok stanja',
        description: 'Isti kod crta odobravanje fakture, KYC proveru i putanju rezervacije.',
        from: '@liro/ui',
        demo: (
          <Stack gap="xl">
            <WorkflowStatus
              currentId="signed"
              steps={[
                { id: 'draft', label: { sr: 'Nacrt' } },
                { id: 'sent', label: { sr: 'Poslato' } },
                { id: 'signed', label: { sr: 'Potpisano' } },
                { id: 'posted', label: { sr: 'Proknjiženo' } },
                { id: 'paid', label: { sr: 'Naplaćeno' } },
              ]}
            />
            <Divider />
            <WorkflowStatus
              orientation="vertical"
              currentId="verification"
              states={{ documents: 'done', screening: 'failed' }}
              steps={[
                { id: 'documents', label: { sr: 'Prikupljanje dokumenata' }, meta: '02.04.2026. · Ana Jovanović' },
                { id: 'screening', label: { sr: 'Provera na listama' }, description: { sr: 'Pogodak na listi sankcija — potrebna dodatna provera.' }, meta: '02.04.2026.' },
                { id: 'verification', label: { sr: 'Utvrđivanje stvarnog vlasnika' }, description: { sr: 'U toku.' } },
                { id: 'decision', label: { sr: 'Odluka o uspostavljanju odnosa' } },
              ]}
            />
          </Stack>
        ),
        code: `<WorkflowStatus
  currentId={record.status}
  steps={[
    { id: 'draft', label: { sr: 'Nacrt' } },
    { id: 'signed', label: { sr: 'Potpisano' } },
    { id: 'posted', label: { sr: 'Proknjiženo' } },
  ]}
/>`,
      },
      {
        id: 'approval-chain',
        title: 'Lanac odobrenja',
        description: 'Ko je potvrdio, ko je na redu, ko je odbio i zašto.',
        from: '@liro/ui',
        demo: (
          <ApprovalChain
            entries={[
              { id: '1', name: 'Ana Jovanović', role: 'Knjigovođa', decision: 'approved', decidedAt: '02.04. 09:14' },
              { id: '2', name: 'Marko Petrović', role: 'Rukovodilac', decision: 'rejected', decidedAt: '02.04. 11:02', comment: 'Nedostaje otpremnica za stavku 3.' },
              { id: '3', name: 'Jelena Nikolić', role: 'Direktor', decision: 'pending' },
            ]}
          />
        ),
        code: `<ApprovalChain entries={record.approvals} requiresAll />`,
      },
      {
        id: 'checklist',
        title: 'Kontrolna lista provera',
        description: 'KYC provera, kontrola kvaliteta, prijemna kontrola robe — isti obrazac.',
        from: '@liro/ui',
        demo: (
          <Checklist
            groups={[
              {
                title: { sr: 'Identifikacija' },
                items: [
                  { id: '1', label: { sr: 'Lični dokument priložen' }, outcome: 'pass', detail: 'Lična karta, važi do 2031.', blocking: true },
                  { id: '2', label: { sr: 'Adresa prebivališta potvrđena' }, outcome: 'pass', detail: 'Račun za struju, mart 2026.' },
                  { id: '3', label: { sr: 'Fotografija upoređena' }, outcome: 'warning', detail: 'Slabo osvetljenje, potrebna ponovna provera.' },
                ],
              },
              {
                title: { sr: 'Provera rizika' },
                items: [
                  { id: '4', label: { sr: 'Lista sankcija' }, outcome: 'fail', detail: 'Pogodak po imenu — traži ručnu proveru.', blocking: true },
                  { id: '5', label: { sr: 'Politički izloženo lice' }, outcome: 'pass' },
                  { id: '6', label: { sr: 'Poreklo sredstava' }, outcome: 'pending' },
                  { id: '7', label: { sr: 'Provera za pravna lica' }, outcome: 'na', detail: 'Ne primenjuje se — fizičko lice.' },
                ],
              },
            ]}
          />
        ),
        code: `<Checklist groups={kycChecks} onItemClick={openEvidence} />`,
      },
      {
        id: 'score-meter',
        title: 'Ocena sa zonama',
        description: 'Rizik, kreditna sposobnost, ocena dobavljača — broj u opsegu sa pragovima.',
        from: '@liro/ui',
        demo: (
          <SimpleGrid cols={{ base: 1, md: 2 }} spacing="xl">
            <ScoreMeter
              value={72}
              label={{ sr: 'Nivo rizika klijenta' }}
              description={{ sr: 'Izračunato po metodologiji iz internog akta, verzija 3.' }}
              bands={[
                { upTo: 33, label: { sr: 'Nizak' }, tone: 'success' },
                { upTo: 66, label: { sr: 'Srednji' }, tone: 'warning' },
                { upTo: 100, label: { sr: 'Visok' }, tone: 'danger' },
              ]}
              factors={[
                { label: { sr: 'Delatnost sa gotovinskim prometom' }, weight: 25 },
                { label: { sr: 'Vlasnička struktura van EU' }, weight: 18 },
                { label: { sr: 'Dugogodišnji odnos' }, weight: -12 },
              ]}
            />
            <ScoreMeter
              value={88}
              label={{ sr: 'Ocena dobavljača' }}
              bands={[
                { upTo: 50, label: { sr: 'Slab' }, tone: 'danger' },
                { upTo: 75, label: { sr: 'Zadovoljava' }, tone: 'warning' },
                { upTo: 100, label: { sr: 'Odličan' }, tone: 'success' },
              ]}
              factors={[
                { label: { sr: 'Poštovanje rokova' }, weight: 30 },
                { label: { sr: 'Reklamacije' }, weight: -8 },
              ]}
            />
          </SimpleGrid>
        ),
        code: `<ScoreMeter
  value={client.riskScore}
  label={{ sr: 'Nivo rizika' }}
  bands={[
    { upTo: 33, label: { sr: 'Nizak' }, tone: 'success' },
    { upTo: 66, label: { sr: 'Srednji' }, tone: 'warning' },
    { upTo: 100, label: { sr: 'Visok' }, tone: 'danger' },
  ]}
/>`,
      },
      {
        id: 'pattern-thinking',
        title: 'Zašto obrasci, a ne domeni',
        demo: (
          <Stack gap="sm">
            <Text size="sm">
              Rezervacija u hotelu, KYC provera, nalog za proizvodnju i prijava istraživačkog
              projekta koriste ista četiri obrasca. Razlikuju se konfiguracija i natpisi.
            </Text>
            <Text size="sm">
              Zato ove komponente ne znaju ništa o domenu — primaju korake, učesnike, provere i zone
              kao podatke. Sutra se novi posao <strong>opisuje</strong>, ne programira.
            </Text>
            <Group gap="xs" mt="xs">
              <StatusBadge tone="info" label="Tok stanja" />
              <StatusBadge tone="info" label="Lanac odobrenja" />
              <StatusBadge tone="info" label="Kontrolna lista" />
              <StatusBadge tone="info" label="Ocena sa zonama" />
            </Group>
          </Stack>
        ),
      },
    ],
  },
  {
      slug: 'people',
      title: 'Lica i kontakti',
      description: 'Prikaz osobe: u redu tabele, kao kontakt blok, kao kartica.',
      group: 'blocks',
      icon: Users,
      entries: [
        {
          id: 'person-cell',
          title: 'Lice u redu tabele',
          description:
            'Ide u renderer kolone DataTable-a. Bez hukova, pa radi i u serverskom stablu.',
          from: '@liro/ui',
          demo: (
            <Table verticalSpacing="md">
              <Table.Tbody>
                {[
                  { name: 'Ana Jovanović', secondary: 'Knjigovođa' },
                  { name: 'Marko Petrović', secondary: 'Rukovodilac obračuna' },
                  { name: 'Jelena Nikolić', secondary: 'Direktor' },
                  { name: 'Đorđe Đurić', secondary: 'Pripravnik' },
                ].map((person) => (
                  <Table.Tr key={person.name}>
                    <Table.Td>
                      <PersonCell name={person.name} secondary={person.secondary} />
                    </Table.Td>
                    <Table.Td>
                      <Text size="sm">Beograd</Text>
                    </Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          ),
          code: `{
    key: 'employee',
    header: { sr: 'Zaposleni' },
    render: (row) => <PersonCell name={row.fullName} secondary={row.position} />,
  }`,
        },
        {
          id: 'person-info',
          title: 'Kontakt blok',
          description:
            'Pošta i telefon su linkovi — mailto: otvara program, tel: pokreće poziv na telefonu.',
          from: '@liro/ui',
          demo: (
            <SimpleGrid cols={{ base: 1, md: 2 }} spacing="xl">
              <PersonInfo
                name="Ana Jovanović"
                position="Knjigovođa"
                email="ana.jovanovic@konfirs.rs"
                phone="+381 (11) 890 56 23"
              />
              <PersonInfo
                name="Đorđe Đurić"
                position="Pripravnik"
                email="djordje@konfirs.rs"
                size={72}
              />
            </SimpleGrid>
          ),
          code: `<PersonInfo
    name={client.contactName}
    role={client.contactRole}
    email={client.email}
    phone={client.phone}
  />`,
        },
        {
          id: 'person-card',
          title: 'Kartica lica',
          description:
            'Zaglavlje je pojas u boji brenda; coverImage postoji kada fotografija zaista treba.',
          from: '@liro/ui',
          demo: (
            <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="lg">
              <PersonCard
                name="Ana Jovanović"
                position="Knjigovođa"
                stats={[
                  { value: 318, label: { sr: 'Dokumenata' } },
                  { value: 24, label: { sr: 'Obračuna' } },
                  { value: 12, label: { sr: 'Klijenata' } },
                ]}
                action={<ActionButton intent="view" label={{ sr: 'Otvori profil' }} />}
              />
              <PersonCard name="Marko Petrović" position="Rukovodilac obračuna" />
              <PersonCard
                name="Jelena Nikolić"
                position="Direktor"
                stats={[{ value: 47, label: { sr: 'Zaposlenih' } }]}
                action={<ActionButton intent="send" label={{ sr: 'Pošalji poruku' }} />}
              />
            </SimpleGrid>
          ),
        },
      ],
    },
  ]   