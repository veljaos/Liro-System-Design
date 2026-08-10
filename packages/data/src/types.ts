/**
 * Contract between components and the data source.
 *
 * Exists because of one sentence: `AutoTable` in Liro Business App calls
 * `supabase.from(tableName)` directly, so it cannot be used anywhere Supabase
 * is not the database. This interface is the thin layer that separates that.
 *
 * Deliberately narrow. Five CRUD methods plus `call` for everything else.
 * Reports, calculations, and integrations do not belong here — they are tied
 * to the application's specific business, not to how the table is displayed.
 */

export type SortOrder = 'asc' | 'desc'

export interface Sort {
  field: string
  order: SortOrder
}

/** Range for dates and amounts — both ends are optional. */
export interface RangeFilter {
  gte?: string | number
  lte?: string | number
}

export interface InFilter {
  in: (string | number)[]
}

export type FilterValue = string | number | boolean | null | RangeFilter | InFilter

export function isRangeFilter(value: FilterValue): value is RangeFilter {
  return typeof value === 'object' && value !== null && ('gte' in value || 'lte' in value)
}

export function isInFilter(value: FilterValue): value is InFilter {
  return typeof value === 'object' && value !== null && 'in' in value
}

export interface ListParams {
  page: number
  pageSize: number
  sort?: Sort | null
  /** Free text; searched against `searchFields`. */
  search?: string
  searchFields?: string[]
  filters?: Record<string, FilterValue | undefined>
  /**
   * Which columns to fetch. The syntax is an implementation detail — Supabase
   * expects its own `select` string, a REST implementation may translate it
   * into `?fields=`.
   */
  select?: string
  signal?: AbortSignal
}

export interface ListResult<T> {
  rows: T[]
  total: number
}

export interface GetOneOptions {
  select?: string
  idField?: string
  signal?: AbortSignal
}

export interface MutateOptions {
  /**
   * Version value the client saw when it started the edit.
   *
   * If it changed in the meantime, the edit is rejected instead of silently
   * overwriting someone else's work. Two people who open the same entry at
   * the same time and save one after the other — without this, the second
   * one would erase the first one's changes and no one would notice.
   */
  expectedVersion?: string | number
  /** Column that carries the version; defaults to `updated_at`. */
  versionField?: string
  /**
   * When reading from a view with a JOIN, the write must go to the base
   * table — Postgres does not allow writing through a view that joins
   * multiple tables.
   */
  into?: string
  idField?: string
  select?: string
}

export interface RemoveOptions {
  /** Same reason as `into` for editing. */
  from?: string
  idField?: string
}

export interface DataProvider {
  list<T = Record<string, unknown>>(resource: string, params: ListParams): Promise<ListResult<T>>
  getOne<T = Record<string, unknown>>(resource: string, id: string, options?: GetOneOptions): Promise<T>
  create<T = Record<string, unknown>>(resource: string, data: Record<string, unknown>, options?: MutateOptions): Promise<T>
  update<T = Record<string, unknown>>(resource: string, id: string, data: Record<string, unknown>, options?: MutateOptions): Promise<T>
  remove(resource: string, id: string, options?: RemoveOptions): Promise<void>
  /**
   * An escape hatch for everything that is not CRUD: stored procedures,
   * calculations, aggregations. The Supabase implementation maps this to
   * `rpc()`, REST to `POST /rpc/:name`.
   */
  call<T = unknown>(name: string, args?: Record<string, unknown>): Promise<T>
}

/**
 * Error that implementations throw so the UI can distinguish the cause
 * without knowing the specific database.
 */
/** Error tied to a specific field — comes from the server, shown next to the field. */
export interface FieldError {
  field: string
  message: string
}

export class DataProviderError extends Error {
  readonly code: DataErrorCode
  readonly cause?: unknown
  /**
   * Errors by field.
   *
   * These exist because client-side validation is never complete: PIB
   * uniqueness, matching against a general ledger, rules only the database
   * knows. When the server says which field is wrong, the form must show that
   * next to the field — not as a general message at the top that the user
   * cannot connect to the input.
   */
  readonly fields?: FieldError[]

  constructor(
    message: string,
    code: DataErrorCode = 'unknown',
    cause?: unknown,
    fields?: FieldError[],
  ) {
    super(message)
    this.name = 'DataProviderError'
    this.code = code
    this.cause = cause
    this.fields = fields
  }
}

/** Concurrent-edit error — the record was changed while the user was entering data. */
export class ConcurrencyError extends DataProviderError {
  /** Current state of the record in the database, if the provider could fetch it. */
  readonly current?: Record<string, unknown>

  constructor(message: string, current?: Record<string, unknown>) {
    super(message, 'conflict')
    this.name = 'ConcurrencyError'
    this.current = current
  }
}

export function isConcurrencyError(error: unknown): error is ConcurrencyError {
  return error instanceof ConcurrencyError
}

export function fieldErrorsOf(error: unknown): FieldError[] {
  return error instanceof DataProviderError ? (error.fields ?? []) : []
}

export type DataErrorCode =
  | 'not-found'
  | 'forbidden'
  | 'conflict'
  | 'validation'
  | 'network'
  | 'unknown'
