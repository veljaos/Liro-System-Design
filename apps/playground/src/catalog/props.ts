import names from './props.index.json'
import type { CatalogEntry } from './types'

/**
 * API reference, generated from the source code.
 *
 * Not edited by hand. After changing a public API, run `pnpm props`.
 *
 * The full reference is NOT imported statically. With 124 components that is
 * a few hundred kilobytes the browser would download even on pages where no
 * table is opened. Only the list of names is imported statically; the rest
 * arrives on click.
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

/** Cache after loading — the full reference is downloaded at most once per session. */
let cache: Record<string, ComponentApi> | null = null

/**
 * Names of components that have a documented API.
 *
 * `entry.component` is explicit; when it is absent, a match by title is
 * attempted. That way a large part of the catalog gets a table with no
 * changes at all, and where the title differs from the component name,
 * `component` is added.
 */
export function apiNamesForEntry(entry: CatalogEntry): string[] {
  if (entry.component) {
    const explicit = Array.isArray(entry.component) ? entry.component : [entry.component]
    return explicit.filter((name) => KNOWN.has(name))
  }

  /*
  * The component name is read from the `code` block.
  *
  * Example titles are descriptive phrases ("Buttons by intent"), so matching
  * by title does not work. The example code, however, contains exactly what
  * is used — `<ActionButton …>`. That way the catalog gets tables with no
  * manual changes at all, and `component` is left for cases where the code is
  * ambiguous.
  */
 const found = new Set<string>()

 for (const match of (entry.code ?? '').matchAll(/<([A-Z][A-Za-z0-9]*)/g)) {
  const name = match[1]
  if (name && KNOWN.has(name)) found.add(name)
  }

  /* Title as a last resort — rare, but occasionally matches. */
  if (found.size === 0 && KNOWN.has(entry.title)) found.add(entry.title)

  /* At most three tables per example; more than that is not read. */
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