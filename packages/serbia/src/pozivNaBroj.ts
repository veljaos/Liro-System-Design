import { mod97, mod97Control } from './mod97'

/**
 * Poziv na broj po modelu 97.
 *
 * Sluzi da se uplata nepogresivo poveze sa izdatim racunom. Za razliku od
 * svrhe uplate, banka je duzna da polje prenese u celosti i vidljivo na izvodu,
 * u prvobitnom alfanumerickom obliku.
 *
 * Kontrolni broj se sastoji od dve cifre i stoji NA POCETKU niza - za razliku
 * od tekuceg racuna, gde je na kraju. Zato se provera ne svodi na `mod 97 === 1`
 * nego na ponovno racunanje kontrole nad ostatkom.
 *
 * Slova su dozvoljena i pretvaraju se u brojeve po kljucu A=10 ... Z=35, pri
 * cemu se svako slovo racuna kao dve cifre. Crtice i razmaci se zanemaruju,
 * velicina slova ne igra ulogu.
 *
 * Model 97 hvata greske do dve cifre pri prekucavanju.
 *
 * PROVERENO nad primerima `20-12345`, `28-12345a`, `632001095785` i
 * `48600276847331`.
 */

/** Najveci dozvoljen broj cifara u pozivu na broj, bez kontrolnog broja. */
export const POZIV_MAX_DIGITS = 20

/**
 * Alfanumericki poziv na broj u ciste cifre.
 *
 * Vraca `null` kada niz sadrzi znak koji nije ni cifra, ni slovo, ni crtica,
 * ni razmak - ili kada premasi dozvoljenu duzinu.
 */
export function pozivNaBrojToDigits(reference: string): string | null {
  let out = ''

  for (const char of reference.trim().toUpperCase()) {
    if (char === '-' || char === ' ') continue

    if (char >= '0' && char <= '9') {
      out += char
      continue
    }

    if (char >= 'A' && char <= 'Z') {
      /* A=10 ... Z=35; svako slovo daje tacno dve cifre. */
      out += String(char.charCodeAt(0) - 55)
      continue
    }

    return null
  }

  if (out.length === 0 || out.length > POZIV_MAX_DIGITS) return null
  return out
}

/**
 * Dvocifreni kontrolni broj za dati poziv na broj.
 *
 * Ulaz je poziv BEZ kontrole - onaj koji aplikacija sama sastavlja (broj
 * fakture, sifra klijenta).
 */
export function pozivNaBrojControl(reference: string): string | null {
  const digits = pozivNaBrojToDigits(reference)
  if (!digits) return null
  return mod97Control(digits)
}

/**
 * Kompletan poziv na broj sa kontrolom na pocetku, u pisanom obliku `KK-ref`.
 *
 * Crtica je samo radi citljivosti; u elektronskoj razmeni se izostavlja.
 */
export function formatPozivNaBroj(reference: string): string | null {
  const control = pozivNaBrojControl(reference)
  if (control === null) return null
  return `${control}-${reference.trim().toUpperCase()}`
}

/**
 * Provera kompletnog poziva na broj — prve dve cifre su kontrola.
 *
 * Ne moze se proveriti kao `mod 97 === 1` jer kontrola stoji na pocetku, a ne
 * na kraju; racuna se iznova nad ostatkom i poredi.
 */
export function isValidPozivNaBroj(full: string): boolean {
  const clean = full.trim().replace(/[-\s]/g, '')
  if (clean.length < 3) return false

  const control = clean.slice(0, 2)
  if (!/^\d{2}$/.test(control)) return false

  const digits = pozivNaBrojToDigits(clean.slice(2))
  if (!digits) return false

  return mod97Control(digits) === control
}

/**
 * Provera poziva na broj prema modelu.
 * 
 * Modeli 97 i 11 se stvarno proveravaju. Ostali modeli postoje, ali za njih
 * nemamo stvarne primere — prolaze na osnovu duzine, jer je lazno odbijanje
 * ispravnog poziva na broj gora greska od propustanja.
 */
export function isValidPozivNaBrojZaModel(model: string, full: string): boolean {
  if (model === '97') return isValidPozivNaBroj(full)
  if (model === '11') return isValidPozivNaBroj11(full)
  const digits = full.trim().replace(/[-\s]/g, '')
  return digits.length > 0 && digits.length <= POZIV_MAX_DIGITS + 2
}

/** Ostatak pri deljenju sa 97 — izlozeno radi testova i dijagnostike. */
export { mod97 }

/**
 * Poziv na broj po modelu 11.
 *
 * Struktura: `(P1)K-(P2)K-P3`
 *   P1  prvi podatak sa sopstvenom kontrolnom cifrom na kraju
 *   P2  drugi podatak sa sopstvenom kontrolnom cifrom; nije obavezan
 *   P3  treci podatak BEZ kontrole; nije obavezan
 *
 * Kontrolna cifra jednog dela: tezine se spustaju od `duzina_tela + 1` do 2 i
 * ciklicno vracaju na pocetak ako je telo duze. Zbir se uzme po modulu 11 i
 * oduzme od 11; rezultat 10 ili 11 postaje 0.
 *
 * PROVERENO nad sest stvarnih poziva na broj — sedam parova (telo, kontrola)
 * sa pet razlicitih kontrolnih vrednosti.
 *
 * Jedna nepotvrdjena tacka: ostatak 0 daje kontrolu 0 (potvrdjeno primerom
 * `26050`), a ostatak 1 bi po ovoj implementaciji takodje dao 0. Neka tumacenja
 * kazu da broj sa ostatkom 1 nije ni izdat. Biramo blazu varijantu jer je
 * lazno odbijanje ispravnog poziva na broj gora greska od propustanja.
 */
export function mod11Control(body: string): number | null {
  if (!/^\d+$/.test(body)) return null

  const start = body.length + 1
  let sum = 0
  let weight = start

  for (const char of body) {
    sum += Number(char) * weight
    weight -= 1
    /* Telo duze od (start - 1) cifara vraca tezine na pocetak. */
    if (weight < 2) weight = start
  }

  const k = 11 - (sum % 11)
  return k === 10 || k === 11 ? 0 : k
}

/** Kontrolna cifra za dati podatak, kao tekst. `null` kada telo nije numericko. */
export function pozivNaBroj11Control(body: string): string | null {
  const control = mod11Control(body.trim())
  return control === null ? null : String(control)
}

/** Dodaje kontrolnu cifru na kraj podatka: `80132678904` -> `801326789042`. */
export function formatPozivNaBroj11Deo(body: string): string | null {
  const control = pozivNaBroj11Control(body)
  return control === null ? null : `${body.trim()}${control}`
}

/**
 * Provera kompletnog poziva na broj po modelu 11.
 *
 * Prvi deo mora imati ispravnu kontrolu. Drugi, ako postoji, takodje. Treci se
 * ne proverava — po strukturi ga i nema cime.
 */
export function isValidPozivNaBroj11(full: string): boolean {
  const parts = full.trim().replace(/\s/g, '').split('-').filter(Boolean)
  if (parts.length === 0 || parts.length > 3) return false

  /* Delovi sa kontrolom: prvi i drugi. Treci nema kontrolu. */
  const withControl = parts.slice(0, 2)

  for (const part of withControl) {
    if (!/^\d{2,20}$/.test(part)) return false
    const body = part.slice(0, -1)
    const control = part.slice(-1)
    if (pozivNaBroj11Control(body) !== control) return false
  }

  /* Treci deo sme biti bilo koji numericki niz razumne duzine. */
  const third = parts[2]
  if (third !== undefined && !/^\d{1,20}$/.test(third)) return false

  return true
}