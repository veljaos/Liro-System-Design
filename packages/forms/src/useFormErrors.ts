'use client'

import { useCallback, useMemo, useState } from 'react'
import { DataProviderError, fieldErrorsOf, isConcurrencyError, type FieldError } from '@liro/data'
import { resolveLabel, useI18n, type LocalizedLabel } from '@liro/i18n'

/**
 * Spaja greske sa servera sa `AutoForm`-om.
 *
 * Bez ovoga svaka stranica sama rasclanjuje gresku i odlucuje sta je poruka za
 * polje a sta za ceo zapis - i to se u tridesetom modulu uradi drugacije.
 *
 * @example
 * const { serverErrors, formError, capture, clear } = useFormErrors()
 * const save = () => update.mutate({ id, data }, { onError: capture, onSuccess: clear })
 * <AutoForm serverErrors={serverErrors} formError={formError} … />
 */

const CONFLICT: LocalizedLabel = {
  sr: 'Zapis je u međuvremenu izmenio neko drugi. Osvežite stranicu i pokušajte ponovo — vaše izmene nisu sačuvane.',
  'sr-Cyrl': 'Запис је у међувремену изменио неко други. Освежите страницу и покушајте поново.',
  en: 'Someone else changed this record in the meantime. Refresh and try again — your changes were not saved.',
}

const FORBIDDEN: LocalizedLabel = {
  sr: 'Nemate pravo da izmenite ovaj zapis.',
  'sr-Cyrl': 'Немате право да измените овај запис.',
  en: 'You do not have permission to change this record.',
}

const NETWORK: LocalizedLabel = {
  sr: 'Veza sa serverom nije uspostavljena. Podaci nisu sačuvani.',
  'sr-Cyrl': 'Веза са сервером није успостављена. Подаци нису сачувани.',
  en: 'Could not reach the server. Nothing was saved.',
}

const GENERIC: LocalizedLabel = {
  sr: 'Čuvanje nije uspelo.',
  'sr-Cyrl': 'Чување није успело.',
  en: 'Saving failed.',
}

export interface FormErrorsState {
  serverErrors: FieldError[]
  formError: string | null
  /** Kada je `true`, zapis je izmenjen u međuvremenu. */
  isConflict: boolean
  /** Stanje zapisa u bazi u trenutku sukoba, ako ga je provajder dovukao. */
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

    /* Ako je greska vezana za polje, ne dupliramo je i na vrhu forme -
       korisnik bi video istu stvar dvaput. */
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
