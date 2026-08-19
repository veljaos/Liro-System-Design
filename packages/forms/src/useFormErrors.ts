'use client'

import { useCallback, useMemo, useState } from 'react'
import { DataProviderError, fieldErrorsOf, isConcurrencyError, type FieldError } from '@liro/data'
import { resolveLabel, useI18n, type TranslationKey } from '@liro/i18n'

/**
 * Connects server errors with `AutoForm`.
 *
 * Without this, every page parses the error itself and decides what is a
 * field message versus a whole-record message — and by the thirtieth module
 * it is done differently.
 *
 * @example
 * const { serverErrors, formError, capture, clear } = useFormErrors()
 * const save = () => update.mutate({ id, data }, { onError: capture, onSuccess: clear })
 * <AutoForm serverErrors={serverErrors} formError={formError} … />
 */

const CONFLICT: TranslationKey = 'forms.errors.conflict'
const FORBIDDEN: TranslationKey = 'forms.errors.forbidden'
const NETWORK: TranslationKey = 'forms.errors.network'
const GENERIC: TranslationKey = 'forms.errors.generic'

export interface FormErrorsState {
  serverErrors: FieldError[]
  formError: string | null
  /** When `true`, the record was changed in the meantime. */
  isConflict: boolean
  /** State of the record in the database at the moment of conflict, if the provider fetched it. */
  conflictCurrent?: Record<string, unknown>
  capture: (error: unknown) => void
  clear: () => void
}

export function useFormErrors(): FormErrorsState {
  const { locale } = useI18n()
  const [error, setError] = useState<unknown>(null)

  const capture = useCallback((next: unknown) => setError(next), [])
  const clear = useCallback(() => setError(null), [])

  return useMemo(() => {
    if (!error) {
      return { serverErrors: [], formError: null, isConflict: false, capture, clear }
    }

    const fields = fieldErrorsOf(error)

    /* If the error is tied to a field, we do not duplicate it at the top of
       the form too — the user would see the same thing twice. */
    let formError: string | null = null

    if (isConcurrencyError(error)) {
      formError = resolveLabel(CONFLICT, locale)
    } else if (fields.length === 0) {
      if (error instanceof DataProviderError) {
        formError =
          error.code === 'forbidden'
            ? resolveLabel(FORBIDDEN, locale)
            : error.code === 'network'
              ? resolveLabel(NETWORK, locale)
              : error.message || resolveLabel(GENERIC, locale)
      } else {
        formError = error instanceof Error ? error.message : resolveLabel(GENERIC, locale)
      }
    }

    return {
      serverErrors: fields,
      formError,
      isConflict: isConcurrencyError(error),
      conflictCurrent: isConcurrencyError(error) ? error.current : undefined,
      capture,
      clear,
    }
  }, [error, locale, capture, clear])
}
