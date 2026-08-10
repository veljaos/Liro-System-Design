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
 * Cache keys. One shape for the whole system, so `invalidateQueries` from any
 * component hits exactly what it should.
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
    /* The old page stays on screen while the new one arrives — without this
       the table flickers on every filter change. */
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
   * Apply the change to the loaded lists immediately, before the server
   * responds.
   *
   * Worth it on lists where the user works in a sequence — marking as read,
   * flipping a switch, deleting a row. Not worth it where the server
   * computes values the client does not know (a document's sequence number,
   * a calculated amount), because the row would briefly show wrong data and
   * then correct itself.
   *
   * When the request fails, the previous state is restored.
   */
  optimistic?: boolean
  /** Primary key column for finding the row in the cache. */
  idField?: string
}

/**
 * Create, update, and delete over a single resource, with automatic
 * invalidation of the list cache after every successful change.
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
   * Applies the change to all loaded pages of the list and returns a
   * snapshot for rollback.
   *
   * It is important to stop in-flight queries (`cancelQueries`) — otherwise
   * an older request's response arrives after our change and overwrites it.
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

/** Reading through a stored procedure — aggregations, derived views. */
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

/** A procedure that changes state — running a calculation, generating a document. */
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
