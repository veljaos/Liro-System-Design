/**
 * The date parser moved to `@liro/dates`, since it's also used by components
 * that have nothing to do with forms - table columns, due dates, period pickers.
 *
 * This file stays as a redirect so existing imports don't break.
 */
export { parseSerbianDate, formatSerbianDate, type DateString } from '@liro/dates'
