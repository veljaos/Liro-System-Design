'use client'

import { useEffect, useMemo } from 'react'
import { useWatch, type UseFormReturn } from 'react-hook-form'
import { collectAllNodes, flattenFields, type FieldSchema } from './types'

/**
 * Delovi koje `AutoForm` i `FormWizard` dele.
 *
 * Izvuceno pre nego sto je nastao drugi potrosac, a ne posle: dve kopije ove
 * logike bi se razisle prvi put kada neko popravi samo jednu.
 */

/**
 * Vrednosti koje citaju `condition` funkcije.
 *
 * Prate se ciljano - `conditionFields` kaze koja polja `condition` cita, pa se
 * forma ne prerenderuje na svaki pritisak tastera. Ako neko polje ima
 * `condition` bez `conditionFields`, ne mozemo da pogodimo sta cita, pa pratimo
 * celu formu. Radi ispravno, samo sporije - zato `conditionFields` vredi
 * navesti na velikim formama.
 */
export function useConditionValues(
  nodes: FieldSchema[],
  form: UseFormReturn<Record<string, unknown>>,
): Record<string, unknown> {
  const needsFullWatch = useMemo(
    () => nodes.some((field) => field.condition && !field.conditionFields?.length),
    [nodes],
  )

  const conditionFields = useMemo(() => {
    const names = new Set<string>()
    for (const field of nodes) {
      for (const name of field.conditionFields ?? []) names.add(name)
    }
    return [...names]
  }, [nodes])

  const allValues = useWatch({ control: form.control, disabled: !needsFullWatch })

  const watched = useWatch({
    control: form.control,
    name: conditionFields.length > 0 ? conditionFields : ['__liro_no_conditions__'],
    disabled: needsFullWatch || conditionFields.length === 0,
  })

  return useMemo(() => {
    if (needsFullWatch) return (allValues ?? {}) as Record<string, unknown>
    const values: Record<string, unknown> = {}
    conditionFields.forEach((name, index) => {
      values[name] = (watched as unknown[])?.[index]
    })
    return values
  }, [needsFullWatch, allValues, conditionFields, watched])
}

/**
 * Upisuje greske sa servera u stanje forme.
 *
 * Ne prikazuju se posebno nego se ponasaju isto kao lokalne: nestaju kada
 * korisnik ispravi polje i blokiraju ponovno slanje dok stoje.
 */
export function useServerErrorSync(
  serverErrors: { field: string; message: string }[] | undefined,
  schema: FieldSchema[],
  form: UseFormReturn<Record<string, unknown>>,
): void {
  useEffect(() => {
    if (!serverErrors?.length) return
    const known = new Set(flattenFields(schema).map((field) => field.name))
    for (const error of serverErrors) {
      if (known.has(error.field)) {
        form.setError(error.field, { type: 'server', message: error.message })
      }
    }
    /* Fokusiramo prvo pogodjeno polje - na formi sa cetrdeset polja greska
       ispod pregiba se inace ne primeti. */
    const first = serverErrors.find((error) => known.has(error.field))
    if (first) form.setFocus(first.field)
  }, [serverErrors, schema, form])
}

/**
 * Vrednosti spremne za slanje.
 *
 * Polja koja su sakrivena uslovom ne treba da putuju u bazu - inace se cuva
 * vrednost koju korisnik nije ni video.
 */
export function buildPayload(
  schema: FieldSchema[],
  values: Record<string, unknown>,
  conditionValues: Record<string, unknown>,
): Record<string, unknown> {
  const visible = new Set(
    flattenFields(schema)
      .filter((field) => !field.condition || field.condition(conditionValues))
      .filter((field) => !field.readOnly)
      .map((field) => field.name),
  )

  const payload: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(values)) {
    if (visible.has(key)) payload[key] = value
  }
  return payload
}

/** Da li greska postoji na tackastoj putanji (`adresa.grad`). */
export function hasErrorAt(errors: unknown, path: string): boolean {
  let node: unknown = errors
  for (const part of path.split('.')) {
    if (typeof node !== 'object' || node === null) return false
    node = (node as Record<string, unknown>)[part]
  }
  return node !== undefined
}

export { collectAllNodes }