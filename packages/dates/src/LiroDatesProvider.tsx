'use client'

import { DatesProvider } from '@mantine/dates'
import type { ReactNode } from 'react'
import { DAYJS_LOCALE, useI18n } from '@liro/i18n'

/*
 * dayjs locales must be IMPORTED to exist.
 *
 * `@mantine/dates` hands `settings.locale` to dayjs, and dayjs knows only the
 * locales that have been imported - anything else silently falls back to English.
 * That is why every calendar in this system showed "Mo, Tu, We" whatever the
 * language, while the `Locale` value handed to `Intl` was already correct: the
 * setting was right and nothing was listening.
 *
 * One import per locale; they register themselves as a side effect. When a catalog
 * is added in phase 4, its dayjs locale is added here - one line, and the only
 * place in the system where a language needs more than a file.
 */
import 'dayjs/locale/sr'
import 'dayjs/locale/sr-cyrl'
import 'dayjs/locale/en'
import 'dayjs/locale/hr'
import 'dayjs/locale/bs'
import 'dayjs/locale/mk'
import 'dayjs/locale/sl'
import 'dayjs/locale/pl'
import 'dayjs/locale/cs'
import 'dayjs/locale/sk'
import 'dayjs/locale/ru'
import 'dayjs/locale/uk'
import 'dayjs/locale/be'
import 'dayjs/locale/bg'
import 'dayjs/locale/de'
import 'dayjs/locale/nl'
import 'dayjs/locale/sv'
import 'dayjs/locale/nb'
import 'dayjs/locale/fi'
import 'dayjs/locale/et'
import 'dayjs/locale/fr'
import 'dayjs/locale/es'
import 'dayjs/locale/pt'
import 'dayjs/locale/it'
import 'dayjs/locale/ro'
import 'dayjs/locale/lt'
import 'dayjs/locale/lv'
import 'dayjs/locale/ga'
import 'dayjs/locale/el'
import 'dayjs/locale/tr'
import 'dayjs/locale/zh-cn'  // zh-Hans
import 'dayjs/locale/zh-tw'  // zh-Hant
import 'dayjs/locale/ja'
import 'dayjs/locale/ko'
import 'dayjs/locale/ar'
import 'dayjs/locale/he'

/**
 * Configures all Mantine date components at once.
 *
 * Without it, every calendar in the system starts on Sunday, because that is
 * Mantine's default. The work week in Serbia starts on Monday, and that is a
 * decision that should exist in one place - not as `firstDayOfWeek={1}` in thirty
 * places, where it gets forgotten on the thirty-first.
 *
 * It reads that decision from `preferences` rather than fixing it, because the
 * first day of the week is not a property of the language. A Serbian office runs a
 * Monday week and so does an English-speaking one in Belgrade; a US company on the
 * same product runs a Sunday week. The language decides what is written, the
 * preferences decide how it looks - and which day a calendar starts on is how it
 * looks.
 */
export function LiroDatesProvider({ children }: { children: ReactNode }) {
  const { locale, preferences } = useI18n()

  return (
    <DatesProvider
      settings={{
        locale: DAYJS_LOCALE[locale] ?? 'en',
        firstDayOfWeek: preferences.firstDayOfWeek,
        /*
         * The weekend follows the first day: in a week that starts on Saturday, the
         * weekend is not Saturday and Sunday.
         *
         * Not derived from the locale. `Intl.Locale.weekInfo` would give it, but it
         * is missing in Safari and behind a flag in older Node - and two rules cover
         * every case this product will meet.
         *
         * `as const` because a ternary of arrays infers `number[]`, and Mantine
         * wants the `0|1|...|6` union.
         */
        weekendDays: preferences.firstDayOfWeek === 6 ? ([4, 5] as const) : ([0, 6] as const),
        consistentWeeks: true,
      }}
    >
      {children}
    </DatesProvider>
  )
}