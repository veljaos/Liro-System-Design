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
  ArticleCard,
} from '@liro/ui'
import { LiroSparkline } from '@liro/charts'
import type { CatalogCategory } from '../types'

// ---------------------------------------------------------------------------

function InputsDemo() {
  return (
    <SimpleGrid cols={{ base: 1, md: 2 }} spacing="lg">
      <Stack gap="md">
        <TextInput label="Name" placeholder="Konfirs d.o.o." />
        <TextInput label="Tax number" placeholder="100234567" leftSection={<Hash size={15} />} description="Nine digits" />
        <TextInput label="Email address" placeholder="name@company.rs" leftSection={<Mail size={15} />} />
        <PasswordInput label="Password" placeholder="At least 12 characters" />
        <Textarea label="Note" placeholder="Free text…" autosize minRows={2} />
      </Stack>
      <Stack gap="md">
        <NumberInput
          label="Gross salary"
          placeholder="0,00"
          decimalScale={2}
          fixedDecimalScale
          thousandSeparator="."
          decimalSeparator=","
          suffix=" RSD"
        />
        <NumberInput label="VAT rate" defaultValue={20} min={0} max={100} suffix=" %" />
        <Select label="Payment method" placeholder="Select" data={['Bank transfer', 'Cash', 'Card', 'Offset']} />
        <MultiSelect label="Tags" placeholder="Add" data={['Urgent', 'Key account', 'Advance', 'Export']} defaultValue={['Urgent']} />
        <Autocomplete label="City" placeholder="Start typing" data={['Beograd', 'Novi Sad', 'Niš', 'Kragujevac']} />
      </Stack>
    </SimpleGrid>
  )
}

function InputStatesDemo() {
  return (
    <SimpleGrid cols={{ base: 1, md: 3 }} spacing="lg">
      <TextInput label="Required" withAsterisk placeholder="Must be filled in" />
      <TextInput label="With error" defaultValue="123" error="Tax number must have nine digits" />
      <TextInput label="Disabled" defaultValue="Cannot be changed" disabled />
      <TextInput label="Read only" defaultValue="Comes from the APR" readOnly />
      <TextInput label="With explanation" placeholder="0000000000000" description="JMBG, thirteen digits" />
      <TextInput label="Successfully verified" defaultValue="100234567" rightSection={<ThemeIcon size={18} radius="xl" color="liro-green" variant="light"><FileCheck2 size={11} /></ThemeIcon>} />
    </SimpleGrid>
  )
}

function ChoiceDemo() {
  const [value, setValue] = useState('sve')
  const [pin, setPin] = useState('')
  return (
    <SimpleGrid cols={{ base: 1, md: 2 }} spacing="xl">
      <Stack gap="lg">
        <Radio.Group label="Taxpayer type" defaultValue="pdv">
          <Stack gap="xs" mt="xs">
            <Radio value="pdv" label="In the VAT system" />
            <Radio value="nepdv" label="Not in the VAT system" />
            <Radio value="pausal" label="Flat-rate taxpayer" />
          </Stack>
        </Radio.Group>

        <Checkbox.Group label="Delivery methods" defaultValue={['email']}>
          <Stack gap="xs" mt="xs">
            <Checkbox value="email" label="By email" />
            <Checkbox value="sef" label="Via SEF" />
            <Checkbox value="posta" label="By mail" />
          </Stack>
        </Checkbox.Group>
      </Stack>

      <Stack gap="lg">
        <Stack gap={6}>
          <Text size="sm" fw={500}>Display period</Text>
          <SegmentedControl
            value={value}
            onChange={setValue}
            data={[
              { value: 'sve', label: 'All' },
              { value: 'mesec', label: 'Month' },
              { value: 'kvartal', label: 'Quarter' },
            ]}
            size="sm"
          />
        </Stack>

        <Switch label="Automatic sending to SEF" description="Sent immediately after signing" defaultChecked />
        <Switch label="Email notifications" />

        <Stack gap={6}>
          <Text size="sm" fw={500}>Code from the app</Text>
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
            <Text size="sm" fw={500}>VAT rate</Text>
            <Text size="sm" fw={700} data-numeric>{rate} %</Text>
          </Group>
          <Slider
            value={rate}
            onChange={setRate}
            thumbLabel="VAT rate"
            min={0}
            max={25}
            step={1}
            marks={[{ value: 0, label: '0' }, { value: 10, label: '10' }, { value: 20, label: '20' }]}
          />
        </Stack>

        <Stack gap={6}>
          <Group justify="space-between">
            <Text size="sm" fw={500}>Salary range</Text>
            <Text size="sm" fw={700} data-numeric>
              {range[0].toLocaleString('sr-RS')} – {range[1].toLocaleString('sr-RS')}
            </Text>
          </Group>
          <RangeSlider
            value={range}
            onChange={setRange}
            thumbFromLabel="Lower salary limit"
            thumbToLabel="Upper salary limit"
            min={0}
            max={300_000}
            step={5_000}
            label={(value) => value.toLocaleString('sr-RS')}
          />
        </Stack>
      </Stack>

      <Stack gap="xl">
        <Stack gap={6}>
          <Text size="sm" fw={500}>Supplier rating</Text>
          <Rating defaultValue={4} />
        </Stack>

        <Stack gap={6}>
          <Text size="sm" fw={500}>Payroll run progress</Text>
          <Progress value={68} size="lg" radius="xl" aria-label="Payroll run progress" />
          <Text size="xs" c="dimmed">32 of 47 people processed</Text>
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
            <Text size="sm" fw={600}>Plan completion</Text>
            <Text size="xs" c="dimmed">A ring for a single share, a bar for progress over time.</Text>
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
        <TextInput label="Search" placeholder="Document number or client…" leftSection={<Search size={15} />} />
        <ColorInput label="Tag color" defaultValue="#0078D4" format="hex" />
        <Fieldset legend="Address" radius="md">
          <Stack gap="sm">
            <TextInput label="Street and number" placeholder="Bulevar Mihajla Pupina 10ž" />
            <Group grow>
              <TextInput label="Postal code" placeholder="11070" />
              <TextInput label="City" placeholder="Beograd" />
            </Group>
          </Stack>
        </Fieldset>
      </Stack>
      <JsonInput
        label="Additional properties"
        description="Fields the module stores alongside the record"
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
        <Text size="xs" fw={700} c="dimmed">MAIN FLOW — BLUE</Text>
        <ActionGroup>
          <ActionButton intent="create" />
          <ActionButton intent="save" />
          <ActionButton intent="submit" />
          <ActionButton intent="confirm" />
          <ActionButton intent="next" />
        </ActionGroup>
      </Stack>

      <Stack gap="xs">
        <Text size="xs" fw={700} c="dimmed">VERIFICATION AND SIGNING — TEAL</Text>
        <ActionGroup>
          <ActionButton intent="verify" />
          <ActionButton intent="sign" />
          <ActionButton intent="send" />
          <ActionButton intent="sync" />
        </ActionGroup>
      </Stack>

      <Stack gap="xs">
        <Text size="xs" fw={700} c="dimmed">DOCUMENTS — PURPLE</Text>
        <ActionGroup>
          <ActionButton intent="pdf" />
          <ActionButton intent="print" />
          <ActionButton intent="preview" />
          <ActionButton intent="download" />
        </ActionGroup>
      </Stack>

      <Stack gap="xs">
        <Text size="xs" fw={700} c="dimmed">OUTCOME — GREEN AND ORANGE</Text>
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
        <Text size="xs" fw={700} c="dimmed">SECONDARY — GRAY</Text>
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
        <Text size="xs" fw={700} c="dimmed">DESTRUCTIVE — RED</Text>
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
        <ActionIcon variant="subtle" aria-label="Icon"><SlidersHorizontal size={17} /></ActionIcon>
      </Group>
      <Text size="xs" c="dimmed">
        Mantine variants exist for rare cases outside the intent catalog. The application uses{' '}
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
    title: 'Form fields',
    description: 'Everything that appears in forms, plus states and special cases.',
    group: 'components',
    icon: SlidersHorizontal,
    entries: [
      { id: 'text-number', title: 'Text and numbers', from: '@mantine/core', demo: <InputsDemo />, code: `<NumberInput label="Gross salary" decimalScale={2} fixedDecimalScale thousandSeparator="." decimalSeparator="," suffix=" RSD" />` },
      { id: 'input-states', title: 'Field states', description: 'Required, error, disabled, read-only, verified.', demo: <InputStatesDemo /> },
      { id: 'choice', title: 'Choices and toggles', description: 'Radio for a single choice, checkbox for multiple, a switch for on/off.', demo: <ChoiceDemo /> },
      { id: 'special', title: 'Special fields', description: 'Search, color, grouped fields, JSON for additional properties.', demo: <SpecialInputsDemo /> },
      {
        id: 'sliders',
        title: 'Sliders, ratings and progress',
        description: 'A slider for a single value, a range for two, a ring for a share, a bar for progress over time.',
        from: '@mantine/core',
        demo: <SlidersDemo />,
        code: `<Slider value={rate} onChange={setRate} thumbLabel="VAT rate" min={0} max={25} step={1}
      marks={[{ value: 0, label: '0' }, { value: 10, label: '10' }, { value: 20, label: '20' }]} />

      <RangeSlider value={range} onChange={setRange} thumbFromLabel="Lower salary limit" thumbToLabel="Upper salary limit" min={0} max={300_000} step={5_000}
        label={(value) => value.toLocaleString('sr-RS')} />`,
      },
       {
        id: 'slider-labels',
        title: 'Slider with persistent labels',
        description:
          'labelAlwaysOn keeps the value visible. For a range it is almost mandatory — without it the user does not know where the limit is until they grab the handle.',
        from: '@mantine/core',
        demo: (
          <Stack gap="xl" maw={480} pt={28}>
            <RangeSlider
              labelAlwaysOn
              defaultValue={[50_000, 180_000]}
              thumbFromLabel="Lower salary limit"
              thumbToLabel="Upper salary limit"
              min={0}
              max={300_000}
              step={5_000}
              label={(value) => value.toLocaleString('sr-RS')}
            />
            <Slider
              labelAlwaysOn
              defaultValue={20}
              thumbLabel="VAT rate"
              min={0}
              max={25}
              label={(value) => `${value} %`}
            />
          </Stack>
        ),
        code: `<RangeSlider labelAlwaysOn thumbFromLabel="From" thumbToLabel="To"
  label={(value) => value.toLocaleString('sr-RS')} />`,
      },
      {
        id: 'schema-form',
        title: 'Form from a schema',
        description: 'In the application, fields are not written by hand — they are described by a schema.',
        from: '@liro/forms',
        demo: (
          <Text size="sm">
            A live example is in the <code>Fields and forms</code> category. Here the individual
            elements are shown, there the whole engine.
          </Text>
        ),
        code: `const schema: FieldSchema[] = [
  { name: 'pib', type: 'text', label: { en: 'Tax number' }, required: true },
  { name: 'gross', type: 'currency', label: { en: 'Gross' }, number: { suffix: ' RSD' } },
]`,
      },
    ],
  },

  {
    slug: 'buttons',
    title: 'Buttons',
    description: 'The full intent catalog, plus states and sizes.',
    group: 'components',
    icon: Workflow,
    entries: [
      { id: 'intents-all', title: 'All intents by family', from: '@liro/ui', demo: <ButtonsDemo /> },
      { id: 'button-states', title: 'States and sizes', demo: <ButtonStatesDemo /> },
      {
        id: 'split-action',
        title: 'Split button',
        description:
          'One action with a few variants that are done rarely. Menu items are intents — the menu cannot show an action that does not exist in intents.ts.',
        from: '@liro/ui',
        demo: (
          <Group gap="lg">
            <SplitAction
              intent="send"
              primary
              items={[
                { intent: 'preview' },
                { intent: 'pdf', label: { en: 'Send as PDF' } },
                { intent: 'save', label: { en: 'Save as draft' } },
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
              disabledReason={{ en: 'The document must be posted first.' }}
              items={[{ intent: 'preview' }, { intent: 'download' }]}
            />
          </Group>
        ),
        code: `<SplitAction
      intent="send"
      primary
      items={[
        { intent: 'preview' },
        { intent: 'pdf', label: { en: 'Send as PDF' } },
        { intent: 'cancelDocument' },
      ]}
    />`,
      },
      {
        id: 'button-groups',
        title: 'Toolbar layouts',
        description: 'The primary action is always last — where the eye expects it and where the thumb reaches.',
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
    title: 'Numbers and indicators',
    description: 'Summary cards, rings, mini charts.',
    group: 'blocks',
    icon: Gauge,
    entries: [
      {
        id: 'stat-grid-full',
        title: 'Row of summary cards',
        from: '@liro/ui',
        demo: (
          <StatGrid
            data={[
              { title: { en: 'Employees' }, value: 47, icon: Users, diff: 8 },
              { title: { en: 'Clients' }, value: 12, icon: Building2 },
              { title: { en: 'Payroll total' }, value: '4.128.500', icon: Banknote, diff: 12, invertDiff: true },
              { title: { en: 'Collection rate' }, value: '92%', icon: Percent, diff: 3 },
            ]}
          />
        ),
      },
      {
        id: 'stat-single',
        title: 'Single card',
        description: 'With a description, with a change, without an icon, as a button.',
        from: '@liro/ui',
        demo: (
          <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }} spacing="md">
            <StatCard title={{ en: 'No icon' }} value="318" />
            <StatCard title={{ en: 'With growth' }} value="4.128.500" diff={12} icon={Banknote} />
            <StatCard title={{ en: 'Growth is bad' }} value="412.300" diff={9} invertDiff icon={Percent} />
            <StatCard title={{ en: 'Clickable' }} value="47" icon={Users} description={{ en: 'Opens the list' }} onClick={() => {}} />
          </SimpleGrid>
        ),
      },
      {
        id: 'stat-sparkline',
        title: 'Number with a trend',
        from: '@liro/charts',
        demo: (
          <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="lg">
            {[
              { label: 'REVENUE', value: '3.612.400', invert: false },
              { label: 'EXPENSE', value: '2.180.900', invert: true },
              { label: 'OVERDUE', value: '412.300', invert: true },
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
        title: 'Progress and share',
        demo: (
          <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="lg">
            <Stack gap={6}>
              <Text size="sm" fw={600}>Payroll run</Text>
              <Progress value={68} size="lg" radius="xl" aria-label="Payroll run progress" />
              <Text size="xs" c="dimmed">32 of 47 people</Text>
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
        title: 'Card for work in progress',
        description:
          'The percentage is computed from done/total, not received separately — the two numbers cannot drift apart. It rounds down, so 100% means truly finished.',
        from: '@liro/ui',
        demo: (
          <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="md">
            <ProgressCard
              title={{ en: 'Payroll run' }}
              description={{ en: 'March 2026.' }}
              done={32}
              total={47}
              unit={{ en: 'people' }}
              icon={Users}
              badge={{ en: '4 days to deadline' }}
            />
            <ProgressCard
              title={{ en: 'Sending to SEF' }}
              done={46}
              total={47}
              unit={{ en: 'invoices' }}
              tone="warning"
              badge={{ en: 'One rejected' }}
              badgeTone="warning"
            />
            <ProgressCard
              title={{ en: 'Posting bank statements' }}
              done={18}
              total={18}
              unit={{ en: 'statements' }}
              tone="success"
              badge={{ en: 'Done' }}
              badgeTone="success"
            />
          </SimpleGrid>
        ),
        code: `<ProgressCard
    title={{ en: 'Payroll run' }}
    done={run.processed}
    total={run.employees}
    unit={{ en: 'people' }}
    badge={{ en: '4 days to deadline' }}
  />`,
    },
    ],
  },
  {
    slug: 'carousels',
    title: 'Horizontal lists',
    description: 'When a row of content does not fit the screen width.',
    group: 'blocks',
    icon: SlidersHorizontal,
    entries: [
      {
        id: 'carousel-stats',
        title: 'Summary cards',
        from: '@liro/ui',
        demo: (
          <LiroCarousel slideSize={{ base: '80%', sm: '45%', md: '30%' }}>
            {[
              { title: { en: 'Employees' }, value: 47 },
              { title: { en: 'Clients' }, value: 12 },
              { title: { en: 'Documents' }, value: 318 },
              { title: { en: 'Payroll runs' }, value: 24 },
              { title: { en: 'Attachments' }, value: 1204 },
              { title: { en: 'Statements' }, value: 96 },
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
        title: 'Shortcuts to modules',
        from: '@liro/ui',
        demo: (
          <LiroCarousel slideSize={{ base: '60%', sm: '33%', md: '25%' }} withIndicators>
            {['Payroll', 'Documents', 'Clients', 'Reports', 'Fixed assets', 'Travel orders'].map((name) => (
              <LiroCarouselSlide key={name}>
                <SectionCard title={{ en: name }}>
                  <Text size="xs" c="dimmed">Open module</Text>
                </SectionCard>
              </LiroCarouselSlide>
            ))}
          </LiroCarousel>
        ),
      },
       {
        id: 'carousel-articles',
        title: 'Article cards',
        description: 'LiroCarousel and ArticleCard together — no new component.',
        from: '@liro/ui',
        demo: (
          <LiroCarousel slideSize={{ base: '85%', sm: '50%', md: '40%' }} withIndicators>
            {[
              { image: '/cover-mid.svg', category: 'Guide', title: 'Starting a project on @liro/preset' },
              { image: '/cover-dark.svg', category: 'Release', title: "What's new in version 0.1.0" },
              { image: '/cover-light.svg', category: 'Rules', title: 'Intents instead of colors' },
              { image: '/cover-mid.svg', category: 'Domain', title: 'Check digits of Serbian identifiers' },
            ].map((article) => (
              <LiroCarouselSlide key={article.title}>
                <ArticleCard {...article} href="#carousel-articles" height={200} />
              </LiroCarouselSlide>
            ))}
          </LiroCarousel>
        ),
      },
    ],
  },

  {
    slug: 'business-patterns',
    title: 'Business domain patterns',
    description:
      'Four patterns that cover any business system — workflow status, approval chain, checklist, score with bands.',
    group: 'blocks',
    icon: ShieldCheck,
    entries: [
      {
        id: 'workflow-status',
        title: 'Workflow status',
        description: 'The same code draws invoice approval, a KYC check, and a booking path.',
        from: '@liro/ui',
        demo: (
          <Stack gap="xl">
            <WorkflowStatus
              currentId="signed"
              steps={[
                { id: 'draft', label: { en: 'Draft' } },
                { id: 'sent', label: { en: 'Sent' } },
                { id: 'signed', label: { en: 'Signed' } },
                { id: 'posted', label: { en: 'Posted' } },
                { id: 'paid', label: { en: 'Paid' } },
              ]}
            />
            <Divider />
            <WorkflowStatus
              orientation="vertical"
              currentId="verification"
              states={{ documents: 'done', screening: 'failed' }}
              steps={[
                { id: 'documents', label: { en: 'Collecting documents' }, meta: '02.04.2026. · Ana Jovanović' },
                { id: 'screening', label: { en: 'List screening' }, description: { en: 'A hit on the sanctions list — additional review required.' }, meta: '02.04.2026.' },
                { id: 'verification', label: { en: 'Determining the beneficial owner' }, description: { en: 'In progress.' } },
                { id: 'decision', label: { en: 'Decision on establishing the relationship' } },
              ]}
            />
          </Stack>
        ),
        code: `<WorkflowStatus
  currentId={record.status}
  steps={[
    { id: 'draft', label: { en: 'Draft' } },
    { id: 'signed', label: { en: 'Signed' } },
    { id: 'posted', label: { en: 'Posted' } },
  ]}
/>`,
      },
      {
        id: 'approval-chain',
        title: 'Approval chain',
        description: 'Who confirmed, who is next, who rejected and why.',
        from: '@liro/ui',
        demo: (
          <ApprovalChain
            entries={[
              { id: '1', name: 'Ana Jovanović', role: 'Bookkeeper', decision: 'approved', decidedAt: '02.04. 09:14' },
              { id: '2', name: 'Marko Petrović', role: 'Manager', decision: 'rejected', decidedAt: '02.04. 11:02', comment: 'Missing delivery note for item 3.' },
              { id: '3', name: 'Jelena Nikolić', role: 'Director', decision: 'pending' },
            ]}
          />
        ),
        code: `<ApprovalChain entries={record.approvals} requiresAll />`,
      },
      {
        id: 'checklist',
        title: 'Verification checklist',
        description: 'KYC check, quality control, goods receiving inspection — the same pattern.',
        from: '@liro/ui',
        demo: (
          <Checklist
            groups={[
              {
                title: { en: 'Identification' },
                items: [
                  { id: '1', label: { en: 'ID document attached' }, outcome: 'pass', detail: 'ID card, valid until 2031.', blocking: true },
                  { id: '2', label: { en: 'Residential address confirmed' }, outcome: 'pass', detail: 'Electricity bill, March 2026.' },
                  { id: '3', label: { en: 'Photo compared' }, outcome: 'warning', detail: 'Poor lighting, re-check required.' },
                ],
              },
              {
                title: { en: 'Risk assessment' },
                items: [
                  { id: '4', label: { en: 'Sanctions list' }, outcome: 'fail', detail: 'Name match — requires manual review.', blocking: true },
                  { id: '5', label: { en: 'Politically exposed person' }, outcome: 'pass' },
                  { id: '6', label: { en: 'Source of funds' }, outcome: 'pending' },
                  { id: '7', label: { en: 'Legal entity check' }, outcome: 'na', detail: 'Not applicable — natural person.' },
                ],
              },
            ]}
          />
        ),
        code: `<Checklist groups={kycChecks} onItemClick={openEvidence} />`,
      },
      {
        id: 'score-meter',
        title: 'Score with bands',
        description: 'Risk, creditworthiness, supplier rating — a number in a range with thresholds.',
        from: '@liro/ui',
        demo: (
          <SimpleGrid cols={{ base: 1, md: 2 }} spacing="xl">
            <ScoreMeter
              value={72}
              label={{ en: 'Client risk level' }}
              description={{ en: 'Calculated per the methodology in internal policy, version 3.' }}
              bands={[
                { upTo: 33, label: { en: 'Low' }, tone: 'success' },
                { upTo: 66, label: { en: 'Medium' }, tone: 'warning' },
                { upTo: 100, label: { en: 'High' }, tone: 'danger' },
              ]}
              factors={[
                { label: { en: 'Cash-intensive business activity' }, weight: 25 },
                { label: { en: 'Ownership structure outside the EU' }, weight: 18 },
                { label: { en: 'Long-standing relationship' }, weight: -12 },
              ]}
            />
            <ScoreMeter
              value={88}
              label={{ en: 'Supplier rating' }}
              bands={[
                { upTo: 50, label: { en: 'Poor' }, tone: 'danger' },
                { upTo: 75, label: { en: 'Satisfactory' }, tone: 'warning' },
                { upTo: 100, label: { en: 'Excellent' }, tone: 'success' },
              ]}
              factors={[
                { label: { en: 'On-time delivery' }, weight: 30 },
                { label: { en: 'Complaints' }, weight: -8 },
              ]}
            />
          </SimpleGrid>
        ),
        code: `<ScoreMeter
  value={client.riskScore}
  label={{ en: 'Risk level' }}
  bands={[
    { upTo: 33, label: { en: 'Low' }, tone: 'success' },
    { upTo: 66, label: { en: 'Medium' }, tone: 'warning' },
    { upTo: 100, label: { en: 'High' }, tone: 'danger' },
  ]}
/>`,
      },
      {
        id: 'pattern-thinking',
        title: 'Why patterns, not domains',
        demo: (
          <Stack gap="sm">
            <Text size="sm">
              A hotel booking, a KYC check, a production order and a research project application
              use the same four patterns. What differs is the configuration and the labels.
            </Text>
            <Text size="sm">
              That is why these components know nothing about the domain — they receive steps,
              participants, checks and bands as data. Tomorrow a new business case is{' '}
              <strong>described</strong>, not coded.
            </Text>
            <Group gap="xs" mt="xs">
              <StatusBadge tone="info" label="Workflow status" />
              <StatusBadge tone="info" label="Approval chain" />
              <StatusBadge tone="info" label="Checklist" />
              <StatusBadge tone="info" label="Score with bands" />
            </Group>
          </Stack>
        ),
      },
    ],
  },
  {
      slug: 'people',
      title: 'People and contacts',
      description: 'Displaying a person: in a table row, as a contact block, as a card.',
      group: 'blocks',
      icon: Users,
      entries: [
        {
          id: 'person-cell',
          title: 'Person in a table row',
          description:
            'Goes into a DataTable column renderer. No hooks, so it also works in a server tree.',
          from: '@liro/ui',
          demo: (
            <Table verticalSpacing="md">
              <Table.Tbody>
                {[
                  { name: 'Ana Jovanović', secondary: 'Bookkeeper' },
                  { name: 'Marko Petrović', secondary: 'Payroll manager' },
                  { name: 'Jelena Nikolić', secondary: 'Director' },
                  { name: 'Đorđe Đurić', secondary: 'Trainee' },
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
    header: { en: 'Employee' },
    render: (row) => <PersonCell name={row.fullName} secondary={row.position} />,
  }`,
        },
        {
          id: 'person-info',
          title: 'Contact block',
          description:
            'Email and phone are links — mailto: opens the mail app, tel: starts a call on the phone.',
          from: '@liro/ui',
          demo: (
            <SimpleGrid cols={{ base: 1, md: 2 }} spacing="xl">
              <PersonInfo
                name="Ana Jovanović"
                position="Bookkeeper"
                email="ana.jovanovic@konfirs.rs"
                phone="+381 (11) 890 56 23"
              />
              <PersonInfo
                name="Đorđe Đurić"
                position="Trainee"
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
          title: 'Person card',
          description:
            'The header is a strip in the brand color; coverImage exists for when a photo is really needed.',
          from: '@liro/ui',
          demo: (
            <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="lg">
              <PersonCard
                name="Ana Jovanović"
                position="Bookkeeper"
                stats={[
                  { value: 318, label: { en: 'Documents' } },
                  { value: 24, label: { en: 'Payroll runs' } },
                  { value: 12, label: { en: 'Clients' } },
                ]}
                action={<ActionButton intent="view" label={{ en: 'Open profile' }} />}
              />
              <PersonCard name="Marko Petrović" position="Payroll manager" />
              <PersonCard
                name="Jelena Nikolić"
                position="Director"
                stats={[{ value: 47, label: { en: 'Employees' } }]}
                action={<ActionButton intent="send" label={{ en: 'Send message' }} />}
              />
            </SimpleGrid>
          ),
        },
      ],
    },
  ]