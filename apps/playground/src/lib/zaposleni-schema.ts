import { z } from 'zod'
import { isValidLicniIdentifikator, type VrstaLicnogIdentifikatora } from '@liro/validators'

/**
 * Sema zaposlenog, podeljena na korake.
 *
 * Svaki korak ima svoju delimicnu semu, a `zaposleniSchema` spaja sve i dodaje
 * pravila izmedju koraka - ona koja nijedan pojedinacan korak ne moze da vidi.
 */

export const licniPodaciSchema = z.object({
  ime: z.string().min(2, 'Ime mora imati bar dva znaka'),
  prezime: z.string().min(2, 'Prezime mora imati bar dva znaka'),
  vrstaIdentifikatora: z.enum(['jmbg', 'eb', 'strani']),
  identifikator: z.string().min(1, 'Identifikator je obavezan'),
  email: z.string().email('Neispravna adresa').or(z.literal('')).optional(),
})
/*
* Provera zavisi od izabrane vrste, pa ne moze stajati na samom polju.
* Evidencioni broj stranca ima trinaest cifara ali NE prati JMBG kontrolu —
* pogadjanje po duzini bi ga odbilo.
*/
.refine(
  (data) =>
    isValidLicniIdentifikator(
      data.identifikator,
      data.vrstaIdentifikatora as VrstaLicnogIdentifikatora,
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
   * Pravilo koje presece dva koraka: datum prestanka je u drugom koraku, ali
   * ima smisla samo u odnosu na datum zaposlenja iz istog koraka - a minimalna
   * zarada je propis koji ne pripada nijednom polju.
   */
  .refine(
    (data) => !data.datumPrestanka || data.datumPrestanka > data.datumZaposlenja,
    { message: 'Prestanak mora biti posle datuma zaposlenja', path: ['datumPrestanka'] },
  )
  .refine((data) => data.bruto >= 53592, {
    message: 'Bruto zarada je ispod zakonskog minimuma za puno radno vreme',
    path: ['bruto'],
  })