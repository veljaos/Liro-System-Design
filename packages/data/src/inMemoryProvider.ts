import {
  DataProviderError,
  isInFilter,
  isRangeFilter,
  type DataProvider,
  type FilterValue,
  type ListParams,
  type ListResult,
} from './types'

/**
 * Implementation over a plain in-memory array.
 *
 * Serves documentation, examples, and tests - and as a check that the
 * interface isn't secretly shaped around Supabase. If something can't be
 * expressed here, it probably doesn't belong in the interface.
 */
export interface InMemoryProviderOptions {
  /** Initial data per resource. */
  data: Record<string, Record<string, unknown>[]>
  idField?: string
  /** Artificial delay in milliseconds - useful for showing a loading state. */
  delay?: number
  /** Procedures available through `call`. */
  procedures?: Record<string, (args?: Record<string, unknown>) => unknown>
}

export function createInMemoryProvider(options: InMemoryProviderOptions): DataProvider {
  const idField = options.idField ?? 'id'
  const store: Record<string, Record<string, unknown>[]> = {}
  for (const [resource, rows] of Object.entries(options.data)) {
    store[resource] = rows.map((row) => ({ ...row }))
  }

  const wait = () =>
    options.delay ? new Promise<void>((resolve) => setTimeout(resolve, options.delay)) : Promise.resolve()

  const table = (resource: string) => {
    const rows = store[resource]
    if (!rows) throw new DataProviderError(`Resurs "${resource}" ne postoji`, 'not-found')
    return rows
  }

  const matchesFilter = (value: unknown, filter: FilterValue): boolean => {
    if (filter === undefined || filter === null || filter === '') return true

    if (isInFilter(filter)) {
      return filter.in.some((candidate) => String(candidate) === String(value))
    }

    if (isRangeFilter(filter)) {
      if (filter.gte !== undefined && compare(value, filter.gte) < 0) return false
      if (filter.lte !== undefined && compare(value, filter.lte) > 0) return false
      return true
    }

    return String(value) === String(filter)
  }

  const compare = (a: unknown, b: unknown): number => {
    const left = typeof b === 'number' ? Number(a) : String(a)
    const right = typeof b === 'number' ? Number(b) : String(b)
    if (left < right) return -1
    if (left > right) return 1
    return 0
  }

  return {
    async list<T>(resource: string, params: ListParams): Promise<ListResult<T>> {
      await wait()
      let rows = [...table(resource)]

      const term = params.search?.trim().toLowerCase()
      if (term) {
        const fields = params.searchFields ?? Object.keys(rows[0] ?? {})
        rows = rows.filter((row) =>
          fields.some((field) => String(row[field] ?? '').toLowerCase().includes(term)),
        )
      }

      for (const [field, filter] of Object.entries(params.filters ?? {})) {
        if (filter === undefined) continue
        rows = rows.filter((row) => matchesFilter(row[field], filter))
      }

      if (params.sort) {
        const { field, order } = params.sort
        rows.sort((a, b) => {
          const result = compare(a[field], b[field])
          return order === 'asc' ? result : -result
        })
      }

      const total = rows.length
      const start = (params.page - 1) * params.pageSize
      return { rows: rows.slice(start, start + params.pageSize) as T[], total }
    },

    async getOne<T>(resource: string, id: string): Promise<T> {
      await wait()
      const row = table(resource).find((item) => String(item[idField]) === String(id))
      if (!row) throw new DataProviderError(`Zapis ${id} nije pronađen`, 'not-found')
      return row as T
    },

    async create<T>(resource: string, data: Record<string, unknown>): Promise<T> {
      await wait()
      const row = { [idField]: crypto.randomUUID(), ...data }
      table(resource).push(row)
      return row as T
    },

    async update<T>(resource: string, id: string, data: Record<string, unknown>): Promise<T> {
      await wait()
      const rows = table(resource)
      const index = rows.findIndex((item) => String(item[idField]) === String(id))
      if (index === -1) throw new DataProviderError(`Zapis ${id} nije pronađen`, 'not-found')
      const updated = { ...rows[index], ...data }
      rows[index] = updated
      return updated as T
    },

    async remove(resource: string, id: string): Promise<void> {
      await wait()
      const rows = table(resource)
      const index = rows.findIndex((item) => String(item[idField]) === String(id))
      if (index === -1) throw new DataProviderError(`Zapis ${id} nije pronađen`, 'not-found')
      rows.splice(index, 1)
    },

    async call<T>(name: string, args?: Record<string, unknown>): Promise<T> {
      await wait()
      const procedure = options.procedures?.[name]
      if (!procedure) throw new DataProviderError(`Procedura "${name}" nije definisana`, 'not-found')
      return procedure(args) as T
    },
  }
}
