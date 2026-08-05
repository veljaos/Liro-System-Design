import names from './props.index.json'
import type { CatalogEntry } from './types'

/**
 * API referenca, generisana iz izvornog koda.
 *
 * Ne uredjuje se rucno. Posle izmene javnog API-ja pokreni `pnpm props`.
 *
 * Puna referenca se NE uvozi staticki. Sa 124 komponente to je nekoliko stotina
 * kilobajta koje bi pregledac skidao i na stranicama gde nijedna tabela nije
 * otvorena. Staticki se uvozi samo spisak imena; ostalo stize na klik.
 */

export interface PropDoc {
  name: string
  type: string
  required: boolean
  defaultValue: string | null
  description: string
}

export interface ComponentApi {
  name: string
  package: string
  file: string
  description: string
  props: PropDoc[]
}

const KNOWN = new Set(names as string[])

/** Kes po ucitavanju - puna referenca se skida najvise jednom po sesiji. */
let cache: Record<string, ComponentApi> | null = null

/**
 * Imena komponenti za koje postoji dokumentovan API.
 *
 * `entry.component` je izricit; kada ga nema, pokusava se poklapanje po
 * naslovu. Time veliki deo kataloga dobija tabelu bez ijedne izmene, a gde se
 * naslov razlikuje od imena komponente dopise se `component`.
 */
export function apiNamesForEntry(entry: CatalogEntry): string[] {
  if (entry.component) {
    const explicit = Array.isArray(entry.component) ? entry.component : [entry.component]
    return explicit.filter((name) => KNOWN.has(name))
  }

  /*
  * Ime komponente se cita iz `code` bloka.
  *
  * Naslovi primera su opisne fraze („Dugmad po nameri"), pa poklapanje po
  * naslovu ne radi. Kod primera, medjutim, sadrzi tacno ono sto se koristi -
  * `<ActionButton …>`. Time katalog dobija tabele bez ijedne rucne izmene, a
  * `component` ostaje za slucajeve gde je kod nejasan.
  */
 const found = new Set<string>()

 for (const match of (entry.code ?? '').matchAll(/<([A-Z][A-Za-z0-9]*)/g)) {
  const name = match[1]
  if (name && KNOWN.has(name)) found.add(name)
  }

  /* Naslov kao poslednja mogucnost — retko, ali ponegde se poklopi. */
  if (found.size === 0 && KNOWN.has(entry.title)) found.add(entry.title)

  /* Najvise tri tabele po primeru; duze od toga se ne cita. */
  return [...found].slice(0, 3)
  }

export async function loadApis(wanted: string[]): Promise<ComponentApi[]> {
  if (!cache) {
    const module = await import('./props.generated.json')
    cache = (module.default ?? module) as unknown as Record<string, ComponentApi>
  }

  const loaded = cache
  return wanted
    .map((name) => loaded[name])
    .filter((api): api is ComponentApi => api !== undefined)
}