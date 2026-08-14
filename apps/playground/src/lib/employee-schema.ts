import { z } from 'zod'
import { isValidPersonalIdentifier, type PersonalIdentifierKind } from '@liro/serbia'

/**
 * Employee schema, split into steps.
 *
 * Each step has its own partial schema, and `zaposleniSchema` merges them all
 * and adds rules between steps — the ones no single step can see.
 */

export const licniPodaciSchema = z.object({
  ime: z.string().min(2, 'First name must have at least two characters'),
  prezime: z.string().min(2, 'Last name must have at least two characters'),
  vrstaIdentifikatora: z.enum(['jmbg', 'eb', 'strani']),
  identifikator: z.string().min(1, 'The identifier is required'),
  email: z.string().email('Invalid email address').or(z.literal('')).optional(),
})
/*
* The check depends on the selected kind, so it cannot sit on the field
* itself. A foreigner's registration number has thirteen digits but does
* NOT follow the JMBG check — guessing by length would reject it.
*/
.refine(
  (data) =>
    isValidPersonalIdentifier(
      data.identifikator,
      data.vrstaIdentifikatora as PersonalIdentifierKind,
    ),
  {
    message: 'The identifier is not valid for the selected kind',
    path: ['identifikator'],
  },
  )

export const radniOdnosSchema = z.object({
  radnoMesto: z.string().min(1, 'Choose a position'),
  vrstaUgovora: z.string().min(1, 'Choose a contract type'),
  datumZaposlenja: z.string().min(1, 'The hire date is required'),
  datumPrestanka: z.string().optional(),
})

export const primanjaSchema = z.object({
  bruto: z.number().positive('Gross salary must be greater than zero'),
  tekuciRacun: z.string().regex(/^\d{3}-\d+-\d{2}$/, 'Format: 160-1234567890-12'),
})

export const zaposleniSchema = licniPodaciSchema
  .extend(radniOdnosSchema.shape)
  .extend(primanjaSchema.shape)
  /*
   * A rule that cuts across two steps: the termination date is in the second
   * step, but only makes sense relative to the hire date from the same
   * step — while the minimum wage is a regulation that does not belong to
   * any single field.
   */
  .refine(
    (data) => !data.datumPrestanka || data.datumPrestanka > data.datumZaposlenja,
    { message: 'Termination must be after the hire date', path: ['datumPrestanka'] },
  )
  .refine((data) => data.bruto >= 53592, {
    message: 'Gross salary is below the legal minimum for full-time work',
    path: ['bruto'],
  })