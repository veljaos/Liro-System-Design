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
import type { FieldErrorCode } from '@liro/data'

export interface SupabaseProviderOptions {
  client: SupabaseClient
  /** Default name of the primary key column. */
  idField?: string
}

/**
 * Characters PostgREST interprets as syntax inside an `or()` expression.
 *
 * Without stripping them, input like `50%` or `d.o.o. (Belgrade)` produces an
 * invalid query and the table returns an error instead of a result.
 */
function sanitizeSearchTerm(term: string): string {
  return term.replace(/[%,()]/g, '').trim()
}

/**
 * Extracts the column name from a Postgres error message.
 *
 * PostgREST does not return structured errors per field, so the column name
 * is read from `details` or `message`. This is fragile by nature — if it is
 * not recognized, the error stays general instead of being wrongly attached
 * to the wrong field.
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
    /* Convention: constraints are named `table_column_check`. */
    const parts = check.groups.name.split('_')
    if (parts.length >= 3) return parts.slice(1, -1).join('_')
  }
  return null
}

/*
* Postgres error code -> our field error code.
*
* This table used to hold Serbian prose, which is exactly what the code model
* removes: a provider that returns text has to know the user's language, and a
* provider cannot know it. It returns a code and the UI translates.
*/
const FIELD_CODE: Record<string, FieldErrorCode> = {
  '23505': 'already_exists',
  '23502': 'required',
  '23514': 'forbidden_value',
  '23503': 'not_found',
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
    field && FIELD_CODE[error.code]
      ? [{ field, code: FIELD_CODE[error.code] as FieldErrorCode }]
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

      /* `abortSignal` must come before `single()` — after it the query is no
         longer a PostgrestFilterBuilder and the method does not exist. */
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
       * Concurrent-edit check.
       *
       * The condition on the version goes into the same UPDATE, not as a
       * separate read before it — between a read and a write there is always
       * a gap in which someone else can save. This way Postgres decides
       * atomically: either the version matches and the row gets updated, or
       * it does not and nothing is changed.
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

        /* We fetch the current state so the UI can show what changed. */
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
      /* A view with a JOIN does not accept DELETE — Postgres does not know
         which table to delete from. That is why `from` points to the base
         table. */
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
