import type { PostgrestError, SupabaseClient } from '@supabase/supabase-js'
import {
  ConcurrencyError,
  DataProviderError,
  isInFilter,
  isRangeFilter,
  type DataErrorCode,
  type DataProvider,
  type GetOneOptions,
  type ListParams,
  type ListResult,
  type MutateOptions,
  type RemoveOptions,
} from '@liro/data'

export interface SupabaseProviderOptions {
  client: SupabaseClient
  /** Podrazumevani naziv kolone primarnog ključa. */
  idField?: string
}

/**
 * Znakovi koje PostgREST tumaci kao sintaksu unutar `or()` izraza.
 *
 * Bez uklanjanja, unos `50%` ili `d.o.o. (Beograd)` proizvodi neispravan
 * upit i tabela vrati gresku umesto rezultata.
 */
function sanitizeSearchTerm(term: string): string {
  return term.replace(/[%,()]/g, '').trim()
}

/**
 * Izvlaci naziv kolone iz Postgres poruke o gresci.
 *
 * PostgREST ne vraca strukturirane greske po poljima, pa se ime kolone cita iz
 * `details` ili `message`. Ovo je krhko po prirodi - ako se ne prepozna, greska
 * ostaje opsta umesto da se pogresno zakaci za pogresno polje.
 */
function extractField(error: PostgrestError): string | null {
  const unique = /Key \((?<column>[^)]+)\)=/.exec(error.details ?? '')
  if (unique?.groups?.column) {
    const first = unique.groups.column.split(',')[0]?.trim()
    return first || null
  }
  const notNull = /null value in column "(?<column>[^"]+)"/.exec(error.message)
  if (notNull?.groups?.column) return notNull.groups.column
  const check = /violates check constraint "(?<name>[^"]+)"/.exec(error.message)
  if (check?.groups?.name) {
    /* Konvencija: ograničenja se imenuju `tabela_kolona_check`. */
    const parts = check.groups.name.split('_')
    if (parts.length >= 3) return parts.slice(1, -1).join('_')
  }
  return null
}

const FIELD_MESSAGE: Record<string, string> = {
  '23505': 'Vrednost već postoji.',
  '23502': 'Polje je obavezno.',
  '23514': 'Vrednost nije dozvoljena.',
  '23503': 'Povezani zapis ne postoji.',
}

function mapError(error: PostgrestError): DataProviderError {
  const code: DataErrorCode =
    error.code === 'PGRST116'
      ? 'not-found'
      : error.code === '23505'
        ? 'conflict'
        : error.code === '42501' || error.code === 'PGRST301'
          ? 'forbidden'
          : error.code?.startsWith('23')
            ? 'validation'
            : 'unknown'

  const field = extractField(error)
  const fields =
    field && FIELD_MESSAGE[error.code]
      ? [{ field, message: FIELD_MESSAGE[error.code] as string }]
      : undefined

  return new DataProviderError(error.message, code, error, fields)
}

export function createSupabaseProvider(options: SupabaseProviderOptions): DataProvider {
  const { client } = options
  const defaultIdField = options.idField ?? 'id'

  return {
    async list<T>(resource: string, params: ListParams): Promise<ListResult<T>> {
      let query = client.from(resource).select(params.select ?? '*', { count: 'exact' })

      const term = params.search ? sanitizeSearchTerm(params.search) : ''
      if (term && params.searchFields?.length) {
        query = query.or(params.searchFields.map((field) => `${field}.ilike.%${term}%`).join(','))
      }

      for (const [field, filter] of Object.entries(params.filters ?? {})) {
        if (filter === undefined || filter === null || filter === '') continue

        if (isInFilter(filter)) {
          query = query.in(field, filter.in)
        } else if (isRangeFilter(filter)) {
          if (filter.gte !== undefined) query = query.gte(field, filter.gte)
          if (filter.lte !== undefined) query = query.lte(field, filter.lte)
        } else {
          query = query.eq(field, filter)
        }
      }

      if (params.sort) {
        query = query.order(params.sort.field, { ascending: params.sort.order === 'asc' })
      }

      const from = (params.page - 1) * params.pageSize
      query = query.range(from, from + params.pageSize - 1)

      if (params.signal) query = query.abortSignal(params.signal)

      const { data, error, count } = await query
      if (error) throw mapError(error)

      return { rows: (data ?? []) as T[], total: count ?? 0 }
    },

    async getOne<T>(resource: string, id: string, getOptions?: GetOneOptions): Promise<T> {
      const idField = getOptions?.idField ?? defaultIdField
      let query = client
        .from(resource)
        .select(getOptions?.select ?? '*')
        .eq(idField, id)

      /* `abortSignal` mora pre `single()` - posle njega upit vise nije
         PostgrestFilterBuilder i metoda ne postoji. */
      if (getOptions?.signal) query = query.abortSignal(getOptions.signal)

      const { data, error } = await query.single()
      if (error) throw mapError(error)
      return data as T
    },

    async create<T>(resource: string, values: Record<string, unknown>, mutateOptions?: MutateOptions): Promise<T> {
      const { data, error } = await client
        .from(mutateOptions?.into ?? resource)
        .insert(values)
        .select(mutateOptions?.select ?? '*')
        .single()

      if (error) throw mapError(error)
      return data as T
    },

    async update<T>(
      resource: string,
      id: string,
      values: Record<string, unknown>,
      mutateOptions?: MutateOptions,
    ): Promise<T> {
      const idField = mutateOptions?.idField ?? defaultIdField
      const table = mutateOptions?.into ?? resource
      const versionField = mutateOptions?.versionField ?? 'updated_at'

      let query = client.from(table).update(values).eq(idField, id)

      /*
       * Provera istovremene izmene.
       *
       * Uslov na verziju ide u isti UPDATE, ne kao zasebno citanje pre njega -
       * izmedju citanja i upisa uvek postoji procep u kojem neko drugi moze da
       * sacuva. Ovako Postgres odlucuje atomski: ili je verzija ista pa red
       * bude izmenjen, ili nije pa se ne izmeni nijedan.
       */
      if (mutateOptions?.expectedVersion !== undefined) {
        query = query.eq(versionField, mutateOptions.expectedVersion)
      }

      const { data, error } = await query.select(mutateOptions?.select ?? '*').maybeSingle()
      if (error) throw mapError(error)

      if (!data) {
        if (mutateOptions?.expectedVersion === undefined) {
          throw new DataProviderError(`Zapis ${id} nije pronađen`, 'not-found')
        }

        /* Dovlacimo trenutno stanje da bi UI mogao da pokaze sta se promenilo. */
        const { data: current } = await client
          .from(table)
          .select(mutateOptions?.select ?? '*')
          .eq(idField, id)
          .maybeSingle()

        throw new ConcurrencyError(
          'Zapis je u međuvremenu izmenjen.',
          (current as Record<string, unknown> | null) ?? undefined,
        )
      }

      return data as T
    },

    async remove(resource: string, id: string, removeOptions?: RemoveOptions): Promise<void> {
      const idField = removeOptions?.idField ?? defaultIdField
      /* View sa JOIN-om ne prima DELETE - Postgres ne zna iz koje tabele da
         brise. Zato `from` pokazuje na osnovnu tabelu. */
      const { error } = await client
        .from(removeOptions?.from ?? resource)
        .delete()
        .eq(idField, id)

      if (error) throw mapError(error)
    },

    async call<T>(name: string, args?: Record<string, unknown>): Promise<T> {
      const { data, error } = await client.rpc(name, args)
      if (error) throw mapError(error)
      return data as T
    },
  }
}
