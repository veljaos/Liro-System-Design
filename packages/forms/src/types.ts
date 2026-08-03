import type { ReactNode } from 'react'
import type { LocalizedLabel, Locale } from '@liro/i18n'
import type { FilterValue } from '@liro/data'

/**
 * Opis forme kao podatak.
 *
 * Razlog je isti kao kod tabela: ekran za unos zaposlenog ima cetrdesetak
 * polja, i pisati ih rucno znaci cetrdeset prilika da se razmak, velicina ili
 * nacin prikaza greske razlikuju od susednog ekrana. Šema to svodi na jedan
 * niz koji se moze citati, testirati i generisati.
 */

export type FieldType =
  | 'text'
  | 'email'
  | 'password'
  | 'textarea'
  | 'number'
  | 'currency'
  | 'date'
  | 'select'
  | 'multi-select'
  | 'checkbox'
  | 'switch'
  | 'relation'
  | 'multi-relation'
  | 'localized-text'
  | 'upload'
  | 'custom'
  /** Rasporedi - nemaju svoju vrednost. */
  | 'row'
  | 'section'
  | 'tabs'

export interface FieldOption {
  value: string
  label: LocalizedLabel
  disabled?: boolean
}

export interface RelationConfig {
  /** Tabela ili view iz kojeg se biraju vrednosti. */
  resource: string
  /** Kolona koja se prikazuje korisniku. */
  labelField: string
  /** Kolona koja se cuva; podrazumevano `id`. */
  valueField?: string
  select?: string
  /** Kolone po kojima radi pretraga u padajucoj listi. */
  searchFields?: string[]
  /** Nepromenljivi filteri - npr. samo aktivni partneri. */
  filters?: Record<string, FilterValue | undefined>
  /**
   * Vezuje listu za vrednost drugog polja: kada se promeni `field`,
   * lista se filtrira po `column`. Tipicno klijent -> njegove poslovnice.
   */
  dependsOn?: { field: string; column: string }
  /** Kada oznaka treba da spoji vise kolona, npr. "PIB - Naziv". */
  format?: (row: Record<string, unknown>) => string
}

export interface NumberConfig {
  min?: number
  max?: number
  step?: number
  decimalScale?: number
  prefix?: string
  suffix?: string
  /** Razdvaja hiljade - podrazumevano ukljuceno za `currency`. */
  thousandSeparator?: boolean
}

export interface UploadConfig {
  bucket?: string
  folder?: string
  /** MIME tipovi ili ekstenzije, npr. `application/pdf,.docx`. */
  accept?: string
  /** Najveca dozvoljena velicina u bajtovima. */
  maxSize?: number
}

export interface TabConfig {
  label: LocalizedLabel
  fields: FieldSchema[]
}

export interface FieldSchema {
  /** Kljuc u podacima forme. Za rasporede sluzi samo kao React kljuc. */
  name: string
  type: FieldType
  label?: LocalizedLabel
  /** Pomocni tekst ispod polja. */
  description?: LocalizedLabel
  placeholder?: LocalizedLabel
  required?: boolean
  disabled?: boolean
  /** Vrednost se prikazuje ali se ne salje pri cuvanju. */
  readOnly?: boolean

  options?: FieldOption[]
  relation?: RelationConfig
  number?: NumberConfig
  upload?: UploadConfig
  /** Broj redova za `textarea`. */
  rows?: number
  /** Jezici koje `localized-text` prikazuje; podrazumevano sva tri. */
  locales?: Locale[]

  /** Polja unutar `row` i `section`. */
  fields?: FieldSchema[]
  tabs?: TabConfig[]
  /** Naslov `section` rasporeda. */
  title?: LocalizedLabel

  /**
   * Prikazuje polje samo kada uslov vazi. Prima trenutne vrednosti cele forme.
   * Sakriveno polje ne ucestvuje u proveri obaveznosti.
   */
  condition?: (values: Record<string, unknown>) => boolean
  /**
   * Polja koja `condition` cita. Bez ovoga forma bi morala da prati svaku
   * promenu svakog polja, sto na velikim formama primetno usporava unos.
   */
  conditionFields?: string[]

  /** Dodatna provera; vrati `true` ili poruku o gresci. */
  validate?: (value: unknown, values: Record<string, unknown>) => true | string

  /** Koliko kolona polje zauzima unutar `row`. */
  span?: number

  /** Za `type: 'custom'` - potpuna kontrola nad prikazom. */
  render?: (props: CustomFieldProps) => ReactNode
}

export interface CustomFieldProps {
  value: unknown
  onChange: (value: unknown) => void
  onBlur: () => void
  error?: string
  disabled?: boolean
}

/** Svi cvorovi šeme, ukljucujuci rasporede - za skupljanje uslova. */
export function collectAllNodes(schema: FieldSchema[]): FieldSchema[] {
  const out: FieldSchema[] = []
  for (const field of schema) {
    out.push(field)
    if (field.type === 'tabs') {
      for (const tab of field.tabs ?? []) out.push(...collectAllNodes(tab.fields))
    } else if (field.fields) {
      out.push(...collectAllNodes(field.fields))
    }
  }
  return out
}

/** Polja koja nose vrednost - za razliku od rasporeda. */
export const LAYOUT_TYPES: FieldType[] = ['row', 'section', 'tabs']

export function isLayoutField(field: FieldSchema): boolean {
  return LAYOUT_TYPES.includes(field.type)
}

/** Ravna lista svih polja sa vrednoscu, ukljucujuci ugnjezdena. */
export function flattenFields(schema: FieldSchema[]): FieldSchema[] {
  const out: FieldSchema[] = []
  for (const field of schema) {
    if (field.type === 'tabs') {
      for (const tab of field.tabs ?? []) out.push(...flattenFields(tab.fields))
    } else if (isLayoutField(field)) {
      out.push(...flattenFields(field.fields ?? []))
    } else {
      out.push(field)
    }
  }
  return out
}
