import { toDigits } from './mod11'

/**
 * JMBG i srodni identifikatori lica.
 *
 * JMBG ima trinaest cifara po šablonu DDMMGGGRRBBBK:
 *   DDMMGGG  datum rodjenja (GGG su poslednje tri cifre godine)
 *   RR       registraciono podrucje
 *   BBB      redni broj upisan pri rodjenju
 *   K        kontrolna cifra
 *
 * Kontrola: S = 7A1+6A2+5A3+4A4+3A5+2A6+7A7+6A8+5A9+4A10+3A11+2A12, m = S mod 11.
 *   m = 0  -> K = 0
 *   m = 1  -> broj NE POSTOJI; po propisu se BBB uvecava i racuna ponovo
 *   m > 1  -> K = 11 - m
 *
 * VAZNO: evidencioni broj stranca takodje ima trinaest cifara, ali NE prati
 * ovu kontrolu. Provereno stvarnim brojem: `1004986660315` ima kontrolnu cifru
 * 5, a JMBG algoritam daje 2. Zato ovde nema automatskog prepoznavanja po
 * duzini - aplikacija mora reci koja je vrsta identifikatora. Pogadjanje bi
 * odbilo ispravan broj svakog stranca.
 */

const WEIGHTS = [7, 6, 5, 4, 3, 2, 7, 6, 5, 4, 3, 2]

export function isValidJmbg(value: string): boolean {
  const clean = value.trim()
  if (!/^\d{13}$/.test(clean)) return false

  const digits = toDigits(clean)
  let sum = 0
  for (let i = 0; i < 12; i += 1) sum += WEIGHTS[i]! * digits[i]!

  const m = sum % 11
  /* Trinaestocifreni broj sa m = 1 nikada nije izdat. */
  if (m === 1) return false

  return (m === 0 ? 0 : 11 - m) === digits[12]
}

/**
 * Vrsta identifikatora lica.
 *
 * `jmbg`    domaci JMBG; kontrolna cifra se proverava
 * `eb`      evidencioni broj stranca; trinaest cifara, kontrola nam nije poznata
 * `strani`  broj licne karte, pasosa ili strani poreski broj; samo duzina
 */
export type VrstaLicnogIdentifikatora = 'jmbg' | 'eb' | 'strani'

/**
 * Provera identifikatora lica prema poznatoj vrsti.
 *
 * Vrsta se ne pogadja. Kada aplikacija ne zna koja je, prosledjuje `strani` -
 * blaza provera je uvek bolja od laznog odbijanja ispravnog broja.
 */
export function isValidLicniIdentifikator(
  value: string,
  vrsta: VrstaLicnogIdentifikatora = 'strani',
): boolean {
  const clean = value.trim()

  if (vrsta === 'jmbg') return isValidJmbg(clean)
  if (vrsta === 'eb') return /^\d{13}$/.test(clean)
  return clean.length >= 5
}

/**
 * Datum rođenja iz prvih sedam cifara, kao `YYYY-MM-DD`.
 *
 * Radi i za evidencioni broj stranca — prvih sedam cifara imaju isto znacenje
 * i kada kontrolna cifra ne prati JMBG pravilo. Zato provera validnosti ovde
 * NIJE uslov; proverava se samo oblik i da datum stvarno postoji.
 */
export function datumRodjenjaIzMaticnogBroja(value: string): string | null {
  const clean = value.trim()
  if (!/^\d{13}$/.test(clean)) return null

  const day = Number(clean.slice(0, 2))
  const month = Number(clean.slice(2, 4))
  const short = Number(clean.slice(4, 7))

  /*
   * GGG su poslednje tri cifre godine. Granica 800 razdvaja 1800-1999 od
   * 2000-2799 - ista koja se koristi u zvanicnim tumacenjima.
   */
  const year = short >= 800 ? 1000 + short : 2000 + short

  const candidate = new Date(Date.UTC(year, month - 1, day))
  if (candidate.getUTCMonth() !== month - 1 || candidate.getUTCDate() !== day) return null

  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}

/**
 * Oznaka pola upisana u matičnu knjigu pri rođenju.
 *
 * NE KORISTITI ZA POPUNJAVANJE POLJA „pol" U INTERFEJSU.
 *
 * Ova cifra je administrativni podatak iz registra, a ne izjava osobe o sebi.
 * Osoba u tranziciji, osoba koja je promenila oznaku ali ne i broj, i osoba
 * cija se rodna pripadnost ne poklapa sa upisom - sve tri bi dobile pogresan
 * podatak koji nisu unele.
 *
 * Jedina ispravna upotreba: obrasci i statisticki izvestaji koji izricito
 * traze vrednost iz registra (M-4, statistika zaposlenosti). Za sve ostalo
 * pitaj osobu i ponudi joj izbor.
 */
export function registrovaniPolIzMaticnogBroja(value: string): 'M' | 'Z' | null {
  const clean = value.trim()
  if (!/^\d{13}$/.test(clean)) return null
  return Number(clean.slice(9, 12)) < 500 ? 'M' : 'Z'
}