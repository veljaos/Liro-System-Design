import { mod97, mod97Control } from './mod97'

/**
 * Tekući račun u domaćem platnom prometu.
 *
 * Struktura po Odluci Narodne banke Srbije o jedinstvenoj strukturi tekuceg
 * racuna - osamnaest cifara u tri dela:
 *
 *   BBB              fiksni broj pruzaoca platnih usluga (banke), tri cifre
 *   PPPPPPPPPPPPP    broj racuna koji odredjuje banka, trinaest cifara
 *   KK               kontrolni broj, dve cifre
 *
 * Kontrolni broj se racuna po ISO 7064 MODUL 97 nad prvih sesnaest cifara:
 * niz se pomnozi sa 100, podeli sa 97, a ostatak oduzme od 98.
 *
 * U elektronskom obliku racun je iskljucivo niz od osamnaest cifara. Na
 * stampanim dokumentima se pise u tri dela odvojena crtama, pri cemu se vodece
 * nule u srednjem delu mogu izostaviti - zato se srednji deo pri normalizaciji
 * dopunjava do trinaest cifara.
 *
 * PROVERENO nad pet stvarnih racuna razlicitih banaka (160, 155, 105, 340).
 */

const RACUN_PARTS = /^(\d{3})-(\d{1,13})-(\d{2})$/
const RACUN_FLAT = /^\d{18}$/

/**
 * Racun u elektronskom obliku: tacno osamnaest cifara.
 *
 * Prihvata i pisani oblik sa crtama i vec sazet niz od osamnaest cifara.
 * Vraca `null` kada oblik ne odgovara - to jos ne znaci da je kontrolni broj
 * pogresan, samo da broj nije prepoznat kao racun.
 */
export function normalizeBankAccount(value: string): string | null {
  const clean = value.trim().replace(/\s/g, '')

  if (RACUN_FLAT.test(clean)) return clean

  const parts = RACUN_PARTS.exec(clean)
  if (!parts) return null

  const [, bank, account, control] = parts
  return `${bank}${account!.padStart(13, '0')}${control}`
}

/** Racun u pisanom obliku `BBB-PPPPPPPPPPPPP-KK`. */
export function formatBankAccount(value: string): string | null {
  const normalized = normalizeBankAccount(value)
  if (!normalized) return null
  return `${normalized.slice(0, 3)}-${normalized.slice(3, 16)}-${normalized.slice(16)}`
}

/**
 * Kontrolni broj za dati fiksni broj banke i broj racuna.
 *
 * Sluzi za generisanje i za proveru; aplikacija je moze koristiti da sama
 * dopuni racun kada joj banka posalje samo prva dva dela.
 */
export function bankAccountControlDigit(bank: string, account: string): string | null {
  if (!/^\d{3}$/.test(bank) || !/^\d{1,13}$/.test(account)) return null
  return mod97Control(`${bank}${account.padStart(13, '0')}`)
}

/** Samo oblik, bez provere kontrolnog broja. */
export function isValidBankAccountFormat(value: string): boolean {
  return normalizeBankAccount(value) !== null
}

/**
 * Oblik i kontrolni broj.
 *
 * Provera se svodi na to da ceo osamnaestocifreni niz po modulu 97 daje 1 -
 * sto je ekvivalentno pravilu "98 minus ostatak" iz Odluke, i jeftinije za
 * racunanje.
 */
export function isValidBankAccount(value: string): boolean {
  const normalized = normalizeBankAccount(value)
  if (!normalized) return false
  return mod97(normalized) === 1
}

/** Fiksni broj banke iz racuna, ili `null` kada racun nije ispravan. */
export function bankCodeFromAccount(value: string): string | null {
  const normalized = normalizeBankAccount(value)
  return normalized ? normalized.slice(0, 3) : null
}