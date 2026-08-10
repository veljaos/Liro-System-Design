import { mod97, mod97Control } from './mod97'

/**
 * Payment reference under model 97.
 *
 * Used to unmistakably link a payment to the issued invoice. Unlike the
 * payment purpose field, the bank is required to pass this field through in
 * full and visibly on the statement, in its original alphanumeric form.
 *
 * The check number consists of two digits and sits AT THE START of the
 * string — unlike the current account, where it is at the end. That is why
 * the check does not reduce to `mod 97 === 1`, but recomputes the check over
 * the remainder and compares.
 *
 * Letters are allowed and are converted to numbers using the key A=10 ... Z=35,
 * where each letter counts as two digits. Dashes and spaces are ignored, and
 * letter case does not matter.
 *
 * Model 97 catches typing mistakes of up to two digits.
 *
 * VERIFIED against the examples `20-12345`, `28-12345a`, `632001095785`, and
 * `48600276847331`.
 */

/** Maximum allowed number of digits in a payment reference, excluding the check number. */
export const PAYMENT_REFERENCE_MAX_DIGITS = 20

/**
 * Alphanumeric payment reference into plain digits.
 *
 * Returns `null` when the string contains a character that is neither a digit,
 * a letter, a dash, nor a space — or when it exceeds the allowed length.
 */
export function paymentReferenceToDigits(reference: string): string | null {
  let out = ''

  for (const char of reference.trim().toUpperCase()) {
    if (char === '-' || char === ' ') continue

    if (char >= '0' && char <= '9') {
      out += char
      continue
    }

    if (char >= 'A' && char <= 'Z') {
      /* A=10 ... Z=35; each letter gives exactly two digits. */
      out += String(char.charCodeAt(0) - 55)
      continue
    }

    return null
  }

  if (out.length === 0 || out.length > PAYMENT_REFERENCE_MAX_DIGITS) return null
  return out
}

/**
 * Two-digit check number for a given payment reference.
 *
 * The input is the reference WITHOUT the check — the one the application
 * assembles itself (invoice number, client code).
 */
export function paymentReferenceControl(reference: string): string | null {
  const digits = paymentReferenceToDigits(reference)
  if (!digits) return null
  return mod97Control(digits)
}

/**
 * Complete payment reference with the check at the start, in the written form
 * `KK-ref`.
 *
 * The dash is only for readability; it is omitted in electronic exchange.
 */
export function formatPaymentReference(reference: string): string | null {
  const control = paymentReferenceControl(reference)
  if (control === null) return null
  return `${control}-${reference.trim().toUpperCase()}`
}

/**
 * Check of a complete payment reference — the first two digits are the check.
 *
 * Cannot be checked as `mod 97 === 1` because the check sits at the start, not
 * the end; it is recomputed over the remainder and compared.
 */
export function isValidPaymentReference(full: string): boolean {
  const clean = full.trim().replace(/[-\s]/g, '')
  if (clean.length < 3) return false

  const control = clean.slice(0, 2)
  if (!/^\d{2}$/.test(control)) return false

  const digits = paymentReferenceToDigits(clean.slice(2))
  if (!digits) return false

  return mod97Control(digits) === control
}

/**
 * Payment reference check by model.
 *
 * Models 97 and 11 are actually checked. Other models exist, but we have no
 * real examples for them — they pass based on length, since falsely rejecting
 * a valid payment reference is a worse error than letting one through.
 */
export function isValidPaymentReferenceForModel(model: string, full: string): boolean {
  if (model === '97') return isValidPaymentReference(full)
  if (model === '11') return isValidPaymentReferenceModel11(full)
  const digits = full.trim().replace(/[-\s]/g, '')
  return digits.length > 0 && digits.length <= PAYMENT_REFERENCE_MAX_DIGITS + 2
}

/** Remainder when dividing by 97 — exposed for tests and diagnostics. */
export { mod97 }

/**
 * Payment reference under model 11.
 *
 * Structure: `(P1)K-(P2)K-P3`
 *   P1  first segment with its own check digit at the end
 *   P2  second segment with its own check digit; optional
 *   P3  third segment WITHOUT a check; optional
 *
 * Check digit of one segment: weights descend from `body_length + 1` down to 2
 * and cycle back to the start if the body is longer. The sum is taken modulo
 * 11 and subtracted from 11; a result of 10 or 11 becomes 0.
 *
 * VERIFIED against six real payment references — seven (body, check) pairs
 * with five different check values.
 *
 * One unconfirmed point: a remainder of 0 gives check 0 (confirmed by the
 * example `26050`), and a remainder of 1 would under this implementation also
 * give 0. Some interpretations say a number with remainder 1 was never even
 * issued. We choose the looser variant because falsely rejecting a valid
 * payment reference is a worse error than letting one through.
 */
export function mod11Control(body: string): number | null {
  if (!/^\d+$/.test(body)) return null

  const start = body.length + 1
  let sum = 0
  let weight = start

  for (const char of body) {
    sum += Number(char) * weight
    weight -= 1
    /* A body longer than (start - 1) digits cycles the weights back to the start. */
    if (weight < 2) weight = start
  }

  const k = 11 - (sum % 11)
  return k === 10 || k === 11 ? 0 : k
}

/** Check digit for a given segment, as text. `null` when the body is not numeric. */
export function paymentReferenceModel11Control(body: string): string | null {
  const control = mod11Control(body.trim())
  return control === null ? null : String(control)
}

/** Appends the check digit to the end of a segment: `80132678904` -> `801326789042`. */
export function formatPaymentReferenceModel11Part(body: string): string | null {
  const control = paymentReferenceModel11Control(body)
  return control === null ? null : `${body.trim()}${control}`
}

/**
 * Check of a complete payment reference under model 11.
 *
 * The first segment must have a valid check. The second, if present, too. The
 * third is not checked — by structure it has nothing to check against.
 */
export function isValidPaymentReferenceModel11(full: string): boolean {
  const parts = full.trim().replace(/\s/g, '').split('-').filter(Boolean)
  if (parts.length === 0 || parts.length > 3) return false

  /* Segments with a check: first and second. The third has no check. */
  const withControl = parts.slice(0, 2)

  for (const part of withControl) {
    if (!/^\d{2,20}$/.test(part)) return false
    const body = part.slice(0, -1)
    const control = part.slice(-1)
    if (paymentReferenceModel11Control(body) !== control) return false
  }

  /* The third segment may be any numeric string of reasonable length. */
  const third = parts[2]
  if (third !== undefined && !/^\d{1,20}$/.test(third)) return false

  return true
}