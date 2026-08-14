import { z } from 'zod'
import { isValidTaxNumber, isValidSerbianCompanyNumber } from '@liro/serbia'

/**
 * Client schema.
 *
 * This file is the only place that states what a valid client is. The same
 * schema goes into the form, into the API route, and into the test. When a
 * rule changes, it changes here — not in three places that drift apart
 * within three months.
 */

export const klijentSchema = z
  .object({
    naziv: z.string().min(2, 'Name must have at least two characters'),
    pib: z.string().refine(isValidTaxNumber, 'PIB is not valid — check the check digit'),
    maticni: z.string().refine(isValidSerbianCompanyNumber, 'Company number must have exactly eight digits, e.g. 21603376'),
    email: z.string().email('Invalid email address').or(z.literal('')).optional(),
    ugovorOd: z.string().optional(),
    ugovorDo: z.string().optional(),
    mesecnaNaknada: z.number().nonnegative('The fee cannot be negative').optional(),
  })
  /*
   * A rule between two fields — exactly what per-field validation cannot do.
   * If it were attached to `ugovorDo`, it would not run when the user edits
   * `ugovorOd` and never touches `ugovorDo` again.
   */
  .refine((data) => !data.ugovorOd || !data.ugovorDo || data.ugovorDo >= data.ugovorOd, {
    message: 'The contract end cannot be before the start',
    path: ['ugovorDo'],
  })