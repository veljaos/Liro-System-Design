import type { FieldErrors, Resolver } from 'react-hook-form'
import { isLayoutField, type FieldSchema } from './types'

/**
 * Validacija na nivou celog zapisa.
 *
 * Namerno bez Zod-a u zavisnostima. `StandardSchemaV1` je zajednicki potpis
 * koji Zod 4, Valibot i ArkType vec implementiraju, pa aplikacija donosi svoj
 * validator, a dizajn sistem ne zna koji je.
 *
 * Vrednost nije u tome sto forma proverava vise, nego sto se ista sema moze
 * izvrsiti i u API ruti i u testu. Pravilo "PIB ima devet cifara" tada postoji
 * na jednom mestu, a ne na tri.
 */

interface StandardIssue {
  readonly message: string
  readonly path?: readonly (PropertyKey | { readonly key: PropertyKey })[] | undefined
}

type StandardResult<Output> =
  | { readonly value: Output; readonly issues?: undefined }
  | { readonly issues: readonly StandardIssue[] }

export interface StandardSchemaV1<Output = unknown> {
  readonly '~standard': {
    readonly version: 1
    readonly vendor: string
    readonly validate: (value: unknown) => StandardResult<Output> | Promise<StandardResult<Output>>
  }
}

/** Poruke koje adapter koristi kada polje nema svoju. */
export interface ValidationMessages {
  required: string
}

/**
 * Prazno je: `null`, `undefined`, prazan tekst, prazan niz, `false`.
 *
 * `false` ulazi u listu zato sto obavezno polje sa kvacicom znaci "mora biti
 * cekirano". `0` NE ulazi - nula je vrednost, a ne odsustvo vrednosti, i to je
 * razlika koja u knjigovodstvu stalno ima znacaj.
 */
function isEmpty(value: unknown): boolean {
  if (value === null || value === undefined) return true
  if (typeof value === 'string') return value.trim() === ''
  if (typeof value === 'boolean') return value === false
  if (Array.isArray(value)) return value.length === 0
  return false
}

function pathToName(path: StandardIssue['path']): string {
  if (!path || path.length === 0) return ''
  return path
    .map((segment) =>
      typeof segment === 'object' && segment !== null && 'key' in segment ? segment.key : segment,
    )
    .join('.')
}

/**
 * Upisuje gresku po tackastoj putanji.
 *
 * `adresa.grad` mora postati `{ adresa: { grad: … } }` - React Hook Form
 * greske cita ugnjezdeno, a ne po ravnom kljucu sa tackom.
 *
 * Prva greska po polju pobedjuje: pravila iz `FieldSchema` idu pre seme, pa
 * korisnik dobije "Polje je obavezno" umesto poruke koju je Zod sam sastavio.
 */
function assignError(
  target: Record<string, unknown>,
  path: string,
  error: { type: string; message: string },
): void {
  const parts = path.split('.')
  let node = target

  for (let index = 0; index < parts.length - 1; index += 1) {
    const key = parts[index]!
    const next = node[key]
    if (typeof next !== 'object' || next === null) node[key] = {}
    node = node[key] as Record<string, unknown>
  }

  const last = parts[parts.length - 1]!
  if (node[last] === undefined) node[last] = error
}

export function createLiroResolver(
  fields: FieldSchema[],
  messages: ValidationMessages,
  schema?: StandardSchemaV1,
): Resolver<Record<string, unknown>> {
  return async (values) => {
    const errors: Record<string, unknown> = {}

    /* 1. Pravila iz seme polja. Idu prva jer su im poruke citljivije. */
    for (const field of fields) {
      if (isLayoutField(field)) continue
      /* Sakriveno polje se ne proverava - inace bi forma trazila unos u polje
         koje korisnik ne vidi i nema kako da popuni. */
      if (field.condition && !field.condition(values)) continue

      const value = values[field.name]

      if (field.required && isEmpty(value)) {
        assignError(errors, field.name, { type: 'required', message: messages.required })
        continue
      }

      if (field.validate) {
        const result = field.validate(value, values)
        if (result !== true) {
          assignError(errors, field.name, { type: 'validate', message: result })
        }
      }
    }

    /* 2. Sema celog zapisa - pravila izmedju polja i sve sto polje ne vidi. */
    if (schema) {
      const result = await schema['~standard'].validate(values)
      if (result.issues) {
        for (const issue of result.issues) {
          const name = pathToName(issue.path)
          /*
           * Greska bez putanje se odnosi na ceo zapis ("period se preklapa sa
           * postojecim"). RHF za to ima `root`, a `AutoForm` ga prikazuje u
           * istoj traci kao i greske sa servera.
           */
          assignError(errors, name || 'root', { type: 'schema', message: issue.message })
        }
      }
    }

    /*
    * Dva odvojena povratka, ne jedan sa ternarnim operatorom: `ResolverResult`
    * je unija dva oblika, pa TypeScript mora videti koji se vraca.
    */
   if (Object.keys(errors).length > 0) {
    /* Kada ima gresaka, RHF ocekuje prazne vrednosti - `onSubmit` se ne poziva. */
    return { values: {}, errors: errors as unknown as FieldErrors<Record<string, unknown>> }
  }

  return { values, errors: {} }

  }
}