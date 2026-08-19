/**
 * dayjs ships no types for its locale files.
 *
 * All 143 of them are plain JavaScript with no `.d.ts`, and they are imported for
 * their SIDE EFFECT - each registers itself with dayjs when evaluated. Nothing is
 * read from the module, so `unknown` is the honest type.
 *
 * At the repository root rather than inside `@liro/i18n`, because packages ship TS
 * source: every package that imports `@liro/i18n` compiles its
 * `locales.generated.ts` too, and a declaration inside one package is invisible to
 * the others.
 */
declare module 'dayjs/locale/*.js' {
  const locale: unknown
  export default locale
}