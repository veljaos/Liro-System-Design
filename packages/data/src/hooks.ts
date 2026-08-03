'use client'

import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
  type UseMutationOptions,
  type UseQueryOptions,
} from '@tanstack/react-query'
import { useDataProvider } from './context'
import type { GetOneOptions, ListParams, ListResult, MutateOptions, RemoveOptions } from './types'

/**
 * Kljucevi keša. Jedan oblik za ceo sistem, pa `invalidateQueries` iz bilo koje
 * komponente pogadja tacno ono sto treba.
 */
export const dataKeys = {
  all: (resource: string) => [resource] as const,
  lists: (resource: string) => [resource, 'list'] as const,
  list: (resource: string, params: ListParams) => [resource, 'list', params] as const,
  items: (resource: string) => [resource, 'item'] as const,
  item: (resource: string, id: string) => [resource, 'item', id] as const,
}

export interface UseResourceListOptions<T>
  extends Omit<UseQueryOptions<ListResult<T>, Error>, 'queryKey' | 'queryFn'> {}

export function useResourceList<T = Record<string, unknown>>(
  resource: string,
  params: ListParams,
  options?: UseResourceListOptions<T>,
) {
  const provider = useDataProvider()

  return useQuery<ListResult<T>, Error>({
    queryKey: dataKeys.list(resource, params),
    queryFn: ({ signal }) => provider.list<T>(resource, { ...params, signal }),
    /* Stara strana ostaje na ekranu dok stize nova - bez ovoga tabela
       treperi na svaku promenu filtera. */
    placeholderData: keepPreviousData,
    ...options,
  })
}

export function useResourceItem<T = Record<string, unknown>>(
  resource: string,
  id: string | null | undefined,
  itemOptions?: GetOneOptions,
  options?: Omit<UseQueryOptions<T, Error>, 'queryKey' | 'queryFn'>,
) {
  const provider = useDataProvider()

  return useQuery<T, Error>({
    queryKey: dataKeys.item(resource, id ?? ''),
    queryFn: ({ signal }) => provider.getOne<T>(resource, id as string, { ...itemOptions, signal }),
    enabled: Boolean(id),
    ...options,
  })
}

export interface ResourceMutationCallbacks {
  onSuccess?: () => void
  onError?: (error: Error) => void
  /**
   * Odmah primeni izmenu na ucitane liste, pre nego sto server odgovori.
   *
   * Vredi na spiskovima gde korisnik radi u nizu - oznacavanje kao procitano,
   * ukljucivanje prekidaca, brisanje reda. Ne vredi tamo gde server racuna
   * vrednosti koje klijent ne zna (redni broj dokumenta, obracunati iznos),
   * jer bi red na trenutak prikazao pogresne podatke pa se ispravio.
   *
   * Kada zahtev padne, prethodno stanje se vraca.
   */
  optimistic?: boolean
  /** Kolona primarnog kljuca za pronalazenje reda u kesu. */
  idField?: string
}

/**
 * Create, update i delete nad jednim resursom, sa automatskim
 * poništavanjem keša liste posle svake uspešne izmene.
 */
export function useResourceMutations<T = Record<string, unknown>>(
  resource: string,
  callbacks?: ResourceMutationCallbacks,
) {
  const provider = useDataProvider()
  const queryClient = useQueryClient()
  const idField = callbacks?.idField ?? 'id'

  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: dataKeys.all(resource) })
    callbacks?.onSuccess?.()
  }

  /**
   * Primeni izmenu na sve ucitane strane liste i vrati snimak za povratak.
   *
   * Vazno je da se zaustave upiti u letu (`cancelQueries`) - inace odgovor
   * starijeg zahteva stigne posle nase izmene i pregazi je.
   */
  const applyOptimistic = async (
    apply: (rows: Record<string, unknown>[]) => Record<string, unknown>[],
  ) => {
    if (!callbacks?.optimistic) return undefined
    await queryClient.cancelQueries({ queryKey: dataKeys.lists(resource) })
    const snapshot = queryClient.getQueriesData({ queryKey: dataKeys.lists(resource) })

    queryClient.setQueriesData<{ rows: Record<string, unknown>[]; total: number }>(
      { queryKey: dataKeys.lists(resource) },
      (previous) => (previous ? { ...previous, rows: apply(previous.rows) } : previous),
    )

    return snapshot
  }

  const rollback = (snapshot: unknown) => {
    if (!snapshot) return
    for (const [key, value] of snapshot as [readonly unknown[], unknown][]) {
      queryClient.setQueryData(key, value)
    }
  }

  const create = useMutation<T, Error, { data: Record<string, unknown>; options?: MutateOptions }>({
    mutationFn: ({ data, options }) => provider.create<T>(resource, data, options),
    onSuccess: invalidate,
    onError: callbacks?.onError,
  })

  const update = useMutation<
    T,
    Error,
    { id: string; data: Record<string, unknown>; options?: MutateOptions },
    unknown
  >({
    mutationFn: ({ id, data, options }) => provider.update<T>(resource, id, data, options),
    onMutate: ({ id, data }) =>
      applyOptimistic((rows) =>
        rows.map((row) => (String(row[idField]) === String(id) ? { ...row, ...data } : row)),
      ),
    onSuccess: invalidate,
    onError: (error, _variables, context) => {
      rollback(context)
      callbacks?.onError?.(error)
    },
  })

  const remove = useMutation<void, Error, { id: string; options?: RemoveOptions }, unknown>({
    mutationFn: ({ id, options }) => provider.remove(resource, id, options),
    onMutate: ({ id }) =>
      applyOptimistic((rows) => rows.filter((row) => String(row[idField]) !== String(id))),
    onSuccess: invalidate,
    onError: (error, _variables, context) => {
      rollback(context)
      callbacks?.onError?.(error)
    },
  })

  return { create, update, remove }
}

export interface UseCallOptions<T> extends Omit<UseQueryOptions<T, Error>, 'queryKey' | 'queryFn'> {}

/** Citanje kroz proceduru - agregacije, izvedeni pregledi. */
export function useCall<T = unknown>(
  name: string,
  args?: Record<string, unknown>,
  options?: UseCallOptions<T>,
) {
  const provider = useDataProvider()

  return useQuery<T, Error>({
    queryKey: ['rpc', name, args],
    queryFn: () => provider.call<T>(name, args),
    ...options,
  })
}

/** Procedura koja menja stanje - pokretanje obračuna, generisanje dokumenta. */
export function useCallMutation<T = unknown>(
  name: string,
  options?: UseMutationOptions<T, Error, Record<string, unknown> | undefined>,
) {
  const provider = useDataProvider()

  return useMutation<T, Error, Record<string, unknown> | undefined>({
    mutationFn: (args) => provider.call<T>(name, args),
    ...options,
  })
}
