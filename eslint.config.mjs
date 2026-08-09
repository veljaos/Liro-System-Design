import js from '@eslint/js'
import globals from 'globals'
import tseslint from 'typescript-eslint'
import reactHooks from 'eslint-plugin-react-hooks'
import jsxA11y from 'eslint-plugin-jsx-a11y'
import unusedImports from 'eslint-plugin-unused-imports'

/**
 * Vazi svuda osim u `@liro/tokens` (sloj koji boje i definise).
 */
const NO_HARDCODED_COLOR = {
  selector: 'Literal[value=/^#(?:[0-9a-fA-F]{3,4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/]',
  message:
    'Boja upisana rukom. Koristi liroVar.* ili var(--liro-*) iz @liro/tokens — time dobijas dark rezim besplatno.',
}

/**
 * Vazi SAMO za ekrane — kod koji se kopira u prave aplikacije.
 *
 * Ne vazi za `packages/**` (biblioteka JESTE sloj koji nameru prevodi u
 * `variant`/`color`) ni za `catalog/`+`components/` u playground-u (to je
 * okvir dokumentacije, ne primer).
 */
const NO_BUTTON_COLOR = {
  selector:
    "JSXOpeningElement[name.name=/^(Button|ActionIcon)$/] > JSXAttribute[name.name=/^(color|variant)$/]",
  message:
    'Ne biras boju dugmeta nego sta dugme radi. Koristi <ActionButton intent="create|delete|pdf|..."> iz @liro/ui.',
}

export default tseslint.config(
  {
    ignores: [
      '**/node_modules/**',
      '**/.next/**',
      '**/.turbo/**',
      '**/dist/**',
      '**/*.d.ts',
      'packages/tokens/src/styles/**',
    ],
  },

  js.configs.recommended,
  ...tseslint.configs.recommended,

  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      globals: { ...globals.browser, ...globals.node },
    },
    plugins: { 'react-hooks': reactHooks, 'jsx-a11y': jsxA11y, 'unused-imports': unusedImports },
    rules: {
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',

      'unused-imports/no-unused-imports': 'error',

      '@typescript-eslint/no-unused-vars': [
        'warn',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/consistent-type-imports': 'warn',

      /*
       * `interface X extends Y {}` je namerno ime za javni API — daje tipu
       * citljivo ime i ostavlja mesto za buduca polja. Zabranjujemo samo
       * stvarno prazan `interface X {}`, koji ne znaci nista.
       */
      '@typescript-eslint/no-empty-object-type': [
        'error',
        { allowInterfaces: 'with-single-extends' },
      ],

      /* Pristupacnost: greske su one koje slepi korisnik odmah oseti. */
      'jsx-a11y/alt-text': 'error',
      'jsx-a11y/aria-props': 'error',
      'jsx-a11y/aria-role': 'error',
      'jsx-a11y/role-has-required-aria-props': 'error',
      'jsx-a11y/anchor-has-content': 'error',
      /* Ostalo je upozorenje dok Korak 3 ne raščisti tabelu i navigaciju. */
      'jsx-a11y/click-events-have-key-events': 'warn',
      'jsx-a11y/no-static-element-interactions': 'warn',

      'no-restricted-syntax': ['error', NO_HARDCODED_COLOR],
    },
  },

  /*
   * Pravilo o dugmadima se UKLJUCUJE samo na ekranima. To je kod koji neko
   * kopira u Liro Business App, pa mora biti tacan primer.
   */
  {
    files: ['apps/playground/src/app/**/*.tsx'],
    rules: {
      'no-restricted-syntax': ['error', NO_HARDCODED_COLOR, NO_BUTTON_COLOR],
    },
  },

  /*
   * `@liro/tokens` boje i definise, a `catalog/entries` ih prikazuje kao
   * primer — oba imaju pravo na sirov hex.
   */
  {
    files: ['packages/tokens/**', 'apps/playground/src/catalog/entries/**'],
    rules: { 'no-restricted-syntax': 'off' },
  },

  /*
   * Deljeni sloj. Ovde se granica server/klijent stvarno sprovodi:
   * jedan zaboravljen `useState` i cela stranica se vraca na klijent.
   */
  {
    files: ['packages/ui/src/primitives/**'],
    rules: {
      'no-restricted-syntax': [
        'error',
        /*
        * `NO_HARDCODED_COLOR` se MORA ponoviti.
        * 
        * Kasniji blok u flat konfiguraciji ZAMENJUJE pravilo, ne dopunjuje ga.
        * Bez ovog reda heks u deljenom sloju nije proveravan, a nista to ne
        * prijavljuje - pravilo tiho ne radi. Ako ovde dodas novi selektor,
        * proveri da su svi ostali jos u listi.
        */
        NO_HARDCODED_COLOR,
        {
          selector: "ExpressionStatement > Literal[value='use client']",
          message:
            "Deljeni sloj ne sme imati 'use client'. Ako komponenti stvarno treba stanje, ne pripada u primitives — napravi klijentski omotac u @liro/ui.",
        },
        {
          selector: 'CallExpression[callee.name=/^use[A-Z0-9]/]',
          message:
            'Hukovi nisu dozvoljeni u deljenom sloju. Prevod i stanje resava omotac u @liro/ui.',
        },
        {
          selector: 'TSPropertySignature > TSTypeAnnotation > TSFunctionType',
          message:
            'Funkcija u propu ne moze preci granicu server/klijent. Koristi slot tipa ReactNode (npr. `back`, `actions`) umesto `onBack: () => void`.',
        },
      ],
    },
  },
  {
    /*
     * Jezgro ne sme uvoziti paket po drzavi.
     *
     * `@liro/serbia` nosi srpske identifikatore. Ako ga jezgro uveze, sistem
     * prestaje da radi u drugom domenu, a to se vidi tek kad zatreba - dakle
     * najskuplje moguce. Aplikacija ga sme uvoziti slobodno.
     *
     * `transpilePackages` u `withLiro` NIJE uvoz nego uzorak za putanje, pa je
     * dozvoljen - vidi `LIRO_COUNTRY_PACKAGES`.
     */
    files: ['packages/**/*.{ts,tsx}'],
    ignores: ['packages/serbia/**'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['@liro/serbia', '@liro/serbia/*'],
              message:
                'Jezgro ne sme uvoziti paket po drzavi. Domensko pravilo ide u aplikaciju ili u sam paket.',
            },
          ],
        },
      ],
    },
  },
)