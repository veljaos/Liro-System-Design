import { z } from 'zod'
import { isValidTaxNumber, isValidSerbianCompanyNumber } from '@liro/serbia'

/**
 * Sema klijenta.
 *
 * Ovaj fajl je jedino mesto na kojem pise sta je ispravan klijent. Ista sema
 * ide u formu, u API rutu i u test. Kada se pravilo promeni, menja se ovde -
 * ne na tri mesta koja se razidju za tri meseca.
 */

export const klijentSchema = z
  .object({
    naziv: z.string().min(2, 'Naziv mora imati bar dva znaka'),
    pib: z.string().refine(isValidTaxNumber, 'PIB nije ispravan — proverite kontrolnu cifru'),
    maticni: z.string().refine(isValidSerbianCompanyNumber, 'Matični broj ima tačno osam cifara, npr. 21603376'),
    email: z.string().email('Neispravna adresa').or(z.literal('')).optional(),
    ugovorOd: z.string().optional(),
    ugovorDo: z.string().optional(),
    mesecnaNaknada: z.number().nonnegative('Naknada ne može biti negativna').optional(),
  })
  /*
   * Pravilo izmedju dva polja - tacno ono sto validacija po polju ne moze.
   * Da je okaceno na `ugovorDo`, ne bi se izvrsilo kada korisnik izmeni
   * `ugovorOd` a `ugovorDo` vise ne dodirne.
   */
  .refine((data) => !data.ugovorOd || !data.ugovorDo || data.ugovorDo >= data.ugovorOd, {
    message: 'Kraj ugovora ne može biti pre početka',
    path: ['ugovorDo'],
  })