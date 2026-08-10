import { z } from 'zod'
import { isValidPersonalIdentifier, type PersonalIdentifierKind } from '@liro/serbia'

/**
 * Employee schema, split into steps.
 *
 * Each step has its own partial schema, and `zaposleniSchema` merges them all
 * and adds rules between steps — the ones no single step can see.
 */

export const licniPodaciSchema = z.object({
  ime: z.string().min(2, 'Ime mora imati bar dva znaka'),
  prezime: z.string().min(2, 'Prezime mora imati bar dva znaka'),
  vrstaIdentifikatora: z.enum(['jmbg', 'eb', 'strani']),
  identifikator: z.string().min(1, 'Identifikator je obavezan'),
  email: z.string().email('Neispravna adresa').or(z.literal('')).optional(),
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
    message: 'Identifikator nije ispravan za izabranu vrstu',
    path: ['identifikator'],
  },
  )

export const radniOdnosSchema = z.object({
  radnoMesto: z.string().min(1, 'Izaberite radno mesto'),
  vrstaUgovora: z.string().min(1, 'Izaberite vrstu ugovora'),
  datumZaposlenja: z.string().min(1, 'Datum zaposlenja je obavezan'),
  datumPrestanka: z.string().optional(),
})

export const primanjaSchema = z.object({
  bruto: z.number().positive('Bruto zarada mora biti veća od nule'),
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
    { message: 'Prestanak mora biti posle datuma zaposlenja', path: ['datumPrestanka'] },
  )
  .refine((data) => data.bruto >= 53592, {
    message: 'Bruto zarada je ispod zakonskog minimuma za puno radno vreme',
    path: ['bruto'],
  })