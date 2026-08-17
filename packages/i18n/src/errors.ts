import type { LocalizedLabel } from './format'

/**
 * Translations for field error codes.
 *
 * The CODES themselves live in `@liro/data`, because they are part of the
 * `DataProvider` contract: every provider produces them, and a provider must not
 * depend on this package to do so. `@liro/data-supabase` has no dependency here,
 * and neither will `@liro/data-api`.
 *
 * This table cannot import that type. `@liro/data` depends on `@liro/i18n` and not
 * the other way round - `@liro/i18n` has NO dependencies, deliberately, because it
 * is the lowest layer after the tokens.
 *
 * So the two lists are kept in step by a test rather than by the type system:
 * `packages/data/src/fieldErrors.test.ts`. It lives there because the dependency
 * only runs one way - placed in this package it made a real cycle, and pnpm and
 * turbo do not care that a dependency is dev-only when they build the task graph.
 *
 * That test is the reason a missing translation cannot ship: a code with none would
 * fall back to the server's prose, which in another language means the user reads
 * English, or nothing.
 */
export const FIELD_ERROR_LABELS: Record<string, LocalizedLabel> = {
  required: {
    sr: 'Obavezno polje.',
    'sr-Cyrl': 'Обавезно поље.',
    en: 'This field is required.',
  },
  invalid: {
    sr: 'Vrednost nije ispravna.',
    'sr-Cyrl': 'Вредност није исправна.',
    en: 'This value is not valid.',
  },
  too_short: {
    sr: 'Najmanje {min} znakova.',
    'sr-Cyrl': 'Најмање {min} знакова.',
    en: 'At least {min} characters.',
  },
  too_long: {
    sr: 'Najviše {max} znakova.',
    'sr-Cyrl': 'Највише {max} знакова.',
    en: 'At most {max} characters.',
  },
  out_of_range: {
    sr: 'Vrednost mora biti između {min} i {max}.',
    'sr-Cyrl': 'Вредност мора бити између {min} и {max}.',
    en: 'Must be between {min} and {max}.',
  },
  already_exists: {
    sr: 'Vrednost {value} već postoji.',
    'sr-Cyrl': 'Вредност {value} већ постоји.',
    en: '{value} already exists.',
  },
  not_found: {
    sr: 'Zapis nije nađen.',
    'sr-Cyrl': 'Запис није нађен.',
    en: 'Record not found.',
  },
  immutable: {
    /* An accounting rule, not a permission: a posted document may not be altered,
       and no role changes that. */
    sr: 'Polje se ne može menjati nakon knjiženja.',
    'sr-Cyrl': 'Поље се не може мењати након књижења.',
    en: 'This field cannot be changed once posted.',
  },
  forbidden_value: {
    sr: 'Vrednost nije dozvoljena za ovu ulogu.',
    'sr-Cyrl': 'Вредност није дозвољена за ову улогу.',
    en: 'This value is not allowed for your role.',
  },
  check_digit: {
    /* PIB, JMBG, bank account, payment reference - all of them carry one. */
    sr: 'Kontrolna cifra se ne poklapa.',
    'sr-Cyrl': 'Контролна цифра се не поклапа.',
    en: 'The check digit does not match.',
  },
  period_closed: {
    sr: 'Obračunski period je zatvoren.',
    'sr-Cyrl': 'Обрачунски период је затворен.',
    en: 'The accounting period is closed.',
  },
  reference_in_use: {
    sr: 'Zapis se koristi na drugom mestu i ne može se obrisati.',
    'sr-Cyrl': 'Запис се користи на другом месту и не може се обрисати.',
    en: 'This record is referenced elsewhere and cannot be deleted.',
  },
}