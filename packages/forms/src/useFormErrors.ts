'use client'

import { useCallback, useMemo, useState } from 'react'
import { DATA_ERROR_KEY, DataProviderError, fieldErrorsOf, isConcurrencyError, type FieldError } from '@liro/data'
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
      formError = resolveLabel(DATA_ERROR_KEY.conflict, locale)
    } else if (fields.length === 0) {
      if (error instanceof DataProviderError) {
      /*
      * Every kind of failure has its own sentence.
      *
      * The old branch covered `forbidden` and `network` and fell through to
      * `error.message` for everything else - which is the server's prose, in
      * whatever language the server speaks. An expired session and a missing
      * permission read the same, and those two need opposite handling.
      */
        formError = resolveLabel(DATA_ERROR_KEY[error.code], locale)
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
