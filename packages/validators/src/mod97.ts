/**
 * ISO 7064, MODUL 97.
 *
 * Kontrolni broj se dobija tako sto se niz cifara pomnozi sa 100, podeli sa 97,
 * a ostatak oduzme od 98. Rezultat izrazen sa dve cifre je kontrolni broj.
 *
 * Koristi se za tekuci racun (Odluka NBS o jedinstvenoj strukturi tekuceg
 * racuna) i za poziv na broj po modelu 97 (Sl. glasnik RS 55/15, 78/15).
 */

/**
 * Ostatak pri deljenju sa 97, cifru po cifru.
 *
 * Osamnaestocifreni broj prelazi `Number.MAX_SAFE_INTEGER`, pa se ne sme
 * pretvoriti u broj pre deljenja - tiho bi izgubio preciznost. Racunanje po
 * cifri radi za proizvoljnu duzinu.
 */
export function mod97(digits: string): number {
  let remainder = 0
  for (const char of digits) remainder = (remainder * 10 + Number(char)) % 97
  return remainder
}

/** Dvocifreni kontrolni broj za dati niz cifara. */
export function mod97Control(digits: string): string {
  return String(98 - mod97(`${digits}00`)).padStart(2, '0')
}