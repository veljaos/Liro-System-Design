'use client'

import { Box, Group, Stack, Text } from '@mantine/core'
import type { LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'
import { liroVar } from '@liro/tokens'
import { useI18n, type LocalizedLabel } from '@liro/i18n'
import { ActionButton, ActionGroup, PageHeader } from '@liro/ui'

/**
 * Puna stranica za unos i izmenu zapisa.
 *
 * Postoji zato sto forma sa cetrdeset polja ne pripada modalu.
 *
 * Pravilo koje ovaj sablon sprovodi:
 *
 *   puna stranica   entitet sa vise od desetak polja, sa tabovima, sa
 *                   prilozima ili sa podacima koji se citaju iz vise izvora -
 *                   zaposleni, klijent, ugovor, nalog
 *   fioka           izmena podskupa polja uz spisak koji ostaje vidljiv -
 *                   brza izmena cene, dodela oznake
 *   modal           kratka radnja sa jednim ishodom - potvrda, jedan unos,
 *                   pregled dokumenta
 *
 * Razlog nije estetika nego to sto modal nema adresu. Dugacak unos koji se
 * prekine ne moze da se nastavi, ne moze da se posalje kolegi i ne prezivljava
 * osvezavanje stranice. Puna stranica sve to ima besplatno.
 */

export interface RecordFormTemplateProps {
  /** Naslov: „Novo lice" ili ime zapisa koji se menja. */
  title: LocalizedLabel | string
  description?: LocalizedLabel
  icon?: LucideIcon
  /** Oznaka stanja pored naslova. */
  badge?: ReactNode
  /** Povratak na spisak. Uvek postoji — korisnik mora znati kako da izađe. */
  onBack: () => void
  onSubmit: () => void
  onCancel?: () => void
  submitting?: boolean
  /** Onemogućava čuvanje dok forma nije ispravna. */
  canSubmit?: boolean
  submitLabel?: LocalizedLabel
  /** Dodatne radnje u zaglavlju — brisanje, umnožavanje, štampa. */
  extraActions?: ReactNode
  /** Tabovi ili traka napretka ispod naslova. */
  subheader?: ReactNode
  children: ReactNode
  /** Sporedni podaci uz formu — istorija izmena, prilozi, pomoć. */
  aside?: ReactNode
  /** Napomena iznad dugmadi — šta se dešava po čuvanju. */
  footnote?: LocalizedLabel
}

const UNSAVED: LocalizedLabel = {
  sr: 'Nesačuvane izmene',
  'sr-Cyrl': 'Несачуване измене',
  en: 'Unsaved changes',
}

export function RecordFormTemplate({
  title,
  description,
  icon,
  badge,
  onBack,
  onSubmit,
  onCancel,
  submitting = false,
  canSubmit = true,
  submitLabel,
  extraActions,
  subheader,
  children,
  aside,
  footnote,
}: RecordFormTemplateProps) {
  const { t } = useI18n()

  const actions = (
    <ActionGroup>
      {extraActions}
      <ActionButton intent="cancel" onClick={onCancel ?? onBack} disabled={submitting} />
      <ActionButton intent="save" label={submitLabel} onClick={onSubmit} loading={submitting} disabled={!canSubmit} />
    </ActionGroup>
  )

  return (
    <Stack gap={0}>
      <PageHeader
        title={title as LocalizedLabel}
        description={description}
        icon={icon}
        badge={badge}
        onBack={onBack}
        actions={actions}
      >
        {subheader}
      </PageHeader>

      <Box style={{ display: 'flex', gap: 'var(--liro-space-lg)', alignItems: 'flex-start' }}>
        <Stack gap="md" style={{ flex: 1, minWidth: 0 }}>
          {children}

          {footnote && (
            <Text size="xs" style={{ color: liroVar.text.tertiary }}>{t(footnote)}</Text>
          )}

          {/*
            Traka sa dugmadima je LEPLJIVA uz dno prozora.
            Na formi koja se skroluje dugme za cuvanje ne sme da se trazi po dnu
            stranice - ostaje vidljivo dok god ima sta da se sacuva.
          */}
          <Group
            justify="space-between"
            align="center"
            p="sm"
            style={{
              position: 'sticky',
              bottom: 0,
              zIndex: 2,
              backgroundColor: liroVar.surface.page,
              borderTop: `1px solid ${liroVar.border.default}`,
              marginInline: 'calc(-1 * var(--liro-space-sm))',
            }}
          >
            <Text size="xs" style={{ color: liroVar.text.tertiary }}>{t(UNSAVED)}</Text>
            {actions}
          </Group>
        </Stack>

        {aside && (
          <Box visibleFrom="lg" style={{ width: 300, flexShrink: 0 }}>
            <Stack gap="md">{aside}</Stack>
          </Box>
        )}
      </Box>
    </Stack>
  )
}
