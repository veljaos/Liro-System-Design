/**
 * Ciste funkcije formatiranja. Namerno bez `'use client'`.
 *
 * Direktiva oznacava ceo fajl, pa bi njeno prisustvo ovde znacilo da serverska
 * komponenta, API ruta ili PDF generator ne mogu pozvati `formatCurrency`.
 * React sloj (`i18n.tsx`) uvozi odavde, ne obrnuto.
 */

export type Locale = 'sr' | 'sr-Cyrl' | 'en'

/** Ili gotov string (kada prevod nije potreban) ili mapa po jeziku. */
export type LocalizedLabel = string | Partial<Record<Locale, string>>

/**
 * BCP 47 oznake za `Intl` API.
 * 
 * NIJE `sr-RS` za oba. U ovom sistemu `sr` znaci LATINICU, a za `Intl` `sr-RS`
 * znaci cirilicu - pa je latinicni korisnik dobijao "авг" i "нед" umesto "avg"
 * i "ned". Pismo se mora reci izricito.
 */
export const LOCALE_TAGS: Record<Locale, string> = {
  sr: 'sr-Latn-RS',
  'sr-Cyrl': 'sr-Cyrl-RS',
  en: 'en-US',
}

export const LOCALES: Locale[] = ['sr', 'sr-Cyrl', 'en']

export function isLocale(value: unknown): value is Locale {
  return typeof value === 'string' && (LOCALES as string[]).includes(value)
}

/*
* `Intl.NumberFormat` je skup za pravljenje, a jeftin za koriscenje. Tabela sa
* dve novcane kolone pravila je dve instance po redu, na svaki render - u
* virtuelizovanoj tabeli to je na svaki kadar skrola. Kes ih pravi jednom po
* kombinaciji jezika i opcija.
*/
const numberFormatters = new Map<string, Intl.NumberFormat>()
const dateFormatters = new Map<string, Intl.DateTimeFormat>()

function numberFormatter(tag: string, options?: Intl.NumberFormatOptions): Intl.NumberFormat {
  const key = options ? `${tag}|${JSON.stringify(options)}` : tag
  const cached = numberFormatters.get(key)
  if (cached) return cached
  const created = new Intl.NumberFormat(tag, options)
  numberFormatters.set(key, created)
  return created
}

function dateFormatter(tag: string, options: Intl.DateTimeFormatOptions): Intl.DateTimeFormat {
  const key = `${tag}|${JSON.stringify(options)}`
  const cached = dateFormatters.get(key)
  if (cached) return cached
  const created = new Intl.DateTimeFormat(tag, options)
  dateFormatters.set(key, created)
  return created
}

/**
 * Fallback lanac: trazeni jezik -> srpski -> engleski -> prva neprazna
 * vrednost. Poslednji korak postoji da nedostajuci prevod nikada ne
 * proizvede prazan ekran.
 */
export function resolveLabel(label: LocalizedLabel | undefined, locale: Locale): string {
  if (!label) return ''
  if (typeof label === 'string') return label
  return label[locale] || label.sr || label.en || Object.values(label).find(Boolean) || ''
}

export function formatNumber(
  value: number | string | null | undefined,
  locale: Locale,
  options?: Intl.NumberFormatOptions,
): string {
  const num = typeof value === 'string' ? Number(value) : value
  if (num === null || num === undefined || Number.isNaN(num)) return '—'
  return numberFormatter(LOCALE_TAGS[locale], options).format(num)
}

/**
 * Iznos plus oznaka valute kao sufiks, jer je to format koji se koristi na
 * srpskim izvodima i fakturama - `1.234,56 RSD`, ne `RSD 1.234,56`.
 */
export function formatCurrency(
  value: number | string | null | undefined,
  currencyCode: string,
  locale: Locale,
  decimals = 2,
): string {
  const formatted = formatDecimal(value, locale, decimals)
/*
* Nedeljivi razmak (U+00A0), ne obican.
*
* Obican razmak je mesto na kojem pregledac sme da prelomi red, pa se u uskoj
* koloni dobije "1.240.000,00" u jednom redu i "RSD" u sledecem. Iznos i
* valuta su jedna celina i ne smeju se razdvojiti - ni u tabeli, ni u
* recenici, ni u PDF-u.
* 
* Napomena za izvoz: ovo je funkcija za PRIKAZ. U CSV i Excel idu sirovi
* brojevi, ne rezultat ove funkcije - inace bi nedeljivi razmak zavrsio u
* podacima.
*/
return formatted === '—' ? formatted : `${formatted}\u00A0${currencyCode}`
}

/**
 * Broj sa tackom kao razdvajacem hiljada i zarezom za decimale: `1.234.567,89`.
 *
 * Broj decimala je podesiv jer se u knjigovodstvu ne koristi jedan: iznosi idu
 * na dve, kursevi NBS-a na cetiri, koeficijenti ponekad na sest.
 */
export function formatDecimal(
  value: number | string | null | undefined,
  locale: Locale,
  decimals = 2,
): string {
  return formatNumber(value, locale, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })
}

/** Broj bez nametnutih decimala - koliko ih vrednost stvarno ima. */
export function formatQuantity(
  value: number | string | null | undefined,
  locale: Locale,
  maxDecimals = 3,
): string {
  return formatNumber(value, locale, { maximumFractionDigits: maxDecimals })
}

export function formatDate(
  value: Date | string | number | null | undefined,
  locale: Locale,
  options: Intl.DateTimeFormatOptions = { day: '2-digit', month: '2-digit', year: 'numeric' },
): string {
  if (value === null || value === undefined || value === '') return '—'
  const date = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(date.getTime())) return '—'
  return dateFormatter(LOCALE_TAGS[locale], options).format(date)
}

/** Podrazumevano ime kolacica u kojem zivi izbor jezika. */
export const LOCALE_COOKIE = 'liro-locale'