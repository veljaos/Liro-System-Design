import { z } from 'zod'

/**
 * Sema klijenta.
 *
 * Ovaj fajl je jedino mesto na kojem pise sta je ispravan klijent. Ista sema
 * ide u formu, u API rutu i u test. Kada se pravilo promeni, menja se ovde -
 * ne na tri mesta koja se razidju za tri meseca.
 */

/**
 * Kontrolna cifra PIB-a (ISO 7064, MOD 11,10).
 *
 * Devet cifara nije dovoljna provera: `123456789` ima devet cifara i nije
 * validan PIB. Poreska uprava racuna kontrolnu cifru, pa je i mi racunamo -
 * time se greska u kucanju uhvati pre nego sto zapis ode u bazu.
 */
export function isValidPib(pib: string): boolean {
  if (!/^\d{9}$/.test(pib)) return false

  let k = 10
  for (let i = 0; i < 8; i += 1) {
    k = (k + Number(pib[i])) % 10
    if (k === 0) k = 10
    k = (k * 2) % 11
  }

  const control = 11 - k
  return (control === 10 ? 0 : control) === Number(pib[8])
}

export const klijentSchema = z
  .object({
    naziv: z.string().min(2, 'Naziv mora imati bar dva znaka'),
    pib: z.string().refine(isValidPib, 'PIB nije ispravan — proverite kontrolnu cifru'),
    /*
    * Maticni broj nema kontrolnu cifru - to je redni broj u registru APR-a,
    * a ne kodirani identifikator kao PIB ili JMBG. Duzina je jedino sto se
    * moze proveriti bez upita ka registru.
    */ 
    maticni: z.string().regex(/^\d{8}$/, 'Matični broj ima tačno osam cifara'),
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