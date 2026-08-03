/**
 * Ugovor izmedju komponenti i izvora podataka.
 *
 * Postoji zbog jedne recenice: `AutoTable` u Liro Business App-u zove
 * `supabase.from(tableName)` direktno, pa se ne moze upotrebiti nigde gde
 * Supabase nije baza. Ovaj interfejs je tanak sloj koji to razdvaja.
 *
 * Namerno je uzak. Pet CRUD metoda plus `call` za sve ostalo. Izvestaji,
 * obracuni i integracije ne pripadaju ovde - oni su vezani za konkretan
 * posao aplikacije, a ne za nacin na koji se tabela prikazuje.
 */

export type SortOrder = 'asc' | 'desc'

export interface Sort {
  field: string
  order: SortOrder
}

/** Opseg za datume i iznose - oba kraja su opciona. */
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
  /** Slobodan tekst; pretrazuje se po `searchFields`. */
  search?: string
  searchFields?: string[]
  filters?: Record<string, FilterValue | undefined>
  /**
   * Koje kolone dovuci. Sintaksa je stvar implementacije - Supabase ocekuje
   * svoj `select` string, REST implementacija moze da ga prevede u `?fields=`.
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
   * Vrednost verzije koju je klijent video kada je poceo izmenu.
   *
   * Ako se u medjuvremenu promenila, izmena se odbija umesto da tiho pregazi
   * tudji rad. Dvoje ljudi koji istovremeno otvore isti nalog i sacuvaju
   * redom - drugi bi bez ovoga obrisao izmene prvog i niko ne bi primetio.
   */
  expectedVersion?: string | number
  /** Kolona koja nosi verziju; podrazumevano `updated_at`. */
  versionField?: string
  /**
   * Kada se cita iz view-a sa JOIN-om, upis mora da ide u osnovnu tabelu -
   * Postgres ne dozvoljava izmenu kroz view koji spaja vise tabela.
   */
  into?: string
  idField?: string
  select?: string
}

export interface RemoveOptions {
  /** Isti razlog kao `into` kod izmene. */
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
   * Otvor za sve sto nije CRUD: uskladistene procedure, obracuni, agregacije.
   * Supabase implementacija ovo mapira na `rpc()`, REST na `POST /rpc/:name`.
   */
  call<T = unknown>(name: string, args?: Record<string, unknown>): Promise<T>
}

/**
 * Greska koju implementacije bacaju da bi UI mogao da razlikuje uzrok
 * bez poznavanja konkretne baze.
 */
/** Greska vezana za konkretno polje - dolazi sa servera, prikazuje se uz polje. */
export interface FieldError {
  field: string
  message: string
}

export class DataProviderError extends Error {
  readonly code: DataErrorCode
  readonly cause?: unknown
  /**
   * Greske po poljima.
   *
   * Postoje zato sto klijentska validacija nikada nije potpuna: jedinstvenost
   * PIB-a, poklapanje sa saltererom, pravila koja zna samo baza. Kada server
   * kaze koje polje ne valja, forma to mora da prikaze uz to polje - a ne kao
   * opstu poruku na vrhu koju korisnik ne ume da poveze sa unosom.
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

/** Greska istovremene izmene - zapis je promenjen dok je korisnik unosio. */
export class ConcurrencyError extends DataProviderError {
  /** Trenutno stanje zapisa u bazi, ako ga je provajder mogao dovuci. */
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
