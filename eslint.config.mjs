import js from '@eslint/js'
import globals from 'globals'
import tseslint from 'typescript-eslint'
import reactHooks from 'eslint-plugin-react-hooks'
import jsxA11y from 'eslint-plugin-jsx-a11y'
import unusedImports from 'eslint-plugin-unused-imports'

/**
 * Applies everywhere except in `@liro/tokens` (the layer that defines colors).
 */
const NO_HARDCODED_COLOR = {
  selector: 'Literal[value=/^#(?:[0-9a-fA-F]{3,4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/]',
  message:
    'Color written by hand. Use liroVar.* or var(--liro-*) from @liro/tokens — that gets you dark mode for free.',
}

/**
 * Applies ONLY to screens — code that gets copied into real applications.
 *
 * Does not apply to `packages/**` (the library itself IS the layer that
 * translates intent into `variant`/`color`) nor to `catalog/`+`components/`
 * in the playground (that is the documentation framework, not an example).
 */
const NO_BUTTON_COLOR = {
  selector:
    "JSXOpeningElement[name.name=/^(Button|ActionIcon)$/] > JSXAttribute[name.name=/^(color|variant)$/]",
  message:
    'You are not choosing the button color, you are choosing what the button does. Use <ActionButton intent="create|delete|pdf|..."> from @liro/ui.',
}

/**
 * Applies to `packages/**` only, after Phase 3 moved every inline
 * `LocalizedLabel` map into `packages/i18n/locales/*.json`.
 *
 * Matches on the `sr-Cyrl` property key specifically: it is a string literal
 * (not a valid identifier, so always `Property[key.value=...]`) and, of the
 * shape's three fields, the one least likely to appear in unrelated code — a
 * reliable structural signal for "this is a translation map" without
 * type-aware linting, which this config does not run.
 */
const NO_INLINE_LABEL = {
  selector: "ObjectExpression > Property[key.value='sr-Cyrl']",
  message:
    'Inline LocalizedLabel map in packages/**. Add the string(s) to packages/i18n/locales/*.json and reference it by key instead — see PHASE-3-KEYS.md.',
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
       * `interface X extends Y {}` is a deliberate name for a public API — it
       * gives the type a readable name and leaves room for future fields. We
       * only forbid a genuinely empty `interface X {}`, which means nothing.
       */
      '@typescript-eslint/no-empty-object-type': [
        'error',
        { allowInterfaces: 'with-single-extends' },
      ],

      /* Accessibility: these are errors a blind user feels immediately. */
      'jsx-a11y/alt-text': 'error',
      'jsx-a11y/aria-props': 'error',
      'jsx-a11y/aria-role': 'error',
      'jsx-a11y/role-has-required-aria-props': 'error',
      'jsx-a11y/anchor-has-content': 'error',
      /* The rest are warnings until Step 3 cleans up the table and navigation. */
      'jsx-a11y/click-events-have-key-events': 'warn',
      'jsx-a11y/no-static-element-interactions': 'warn',

      'no-restricted-syntax': ['error', NO_HARDCODED_COLOR],
    },
  },

  /*
   * The button rule is turned ON only for screens. This is code someone
   * copies into Liro Business App, so it must be an accurate example.
   */
  {
    files: ['apps/playground/src/app/**/*.tsx'],
    rules: {
      'no-restricted-syntax': ['error', NO_HARDCODED_COLOR, NO_BUTTON_COLOR],
    },
  },

  /*
   * Phase 3: no new inline `LocalizedLabel` map in `packages/**`. `packages/i18n`
   * itself is exempt — it is the layer that defines the shape and resolves it,
   * and its own tests construct label-shaped fixtures.
   *
   * `NO_HARDCODED_COLOR` is repeated here for the same reason the primitives
   * block repeats it below: a later block REPLACES `no-restricted-syntax`
   * rather than extending it.
   */
  {
    files: ['packages/**/*.{ts,tsx}'],
    ignores: ['packages/i18n/**'],
    rules: {
      'no-restricted-syntax': ['error', NO_HARDCODED_COLOR, NO_INLINE_LABEL],
    },
  },

  /*
   * `@liro/tokens` defines colors, and `catalog/entries` displays them as an
   * example — both are allowed raw hex.
   */
  {
    files: [
      'packages/tokens/**',
      'apps/playground/src/catalog/entries/**',
      /* Syntax colours belong to an editor theme, not to the design system.
        The file holds nothing else - see its header. */
      'apps/playground/src/lib/syntax-colors.ts',
    ],
    rules: { 'no-restricted-syntax': 'off' },
  },

  /*
   * The shared layer. This is where the server/client boundary is really
   * enforced: one forgotten `useState` and the whole page falls back to the
   * client.
   */
  {
    files: ['packages/ui/src/primitives/**'],
    rules: {
      'no-restricted-syntax': [
        'error',
        /*
        * `NO_HARDCODED_COLOR` MUST be repeated here.
        *
        * A later block in the flat config REPLACES the rule, it does not
        * extend it. Without this line, hex in the shared layer goes
        * unchecked, and nothing reports that — the rule silently stops
        * working. If you add a new selector here, check that all the others
        * are still in the list.
        */
        NO_HARDCODED_COLOR,
        NO_INLINE_LABEL,
        {
          selector: "ExpressionStatement > Literal[value='use client']",
          message:
            "The shared layer must not have 'use client'. If a component genuinely needs state, it does not belong in primitives — make a client wrapper in @liro/ui.",
        },
        {
          selector: 'CallExpression[callee.name=/^use[A-Z0-9]/]',
          message:
            'Hooks are not allowed in the shared layer. Translation and state are handled by the wrapper in @liro/ui.',
        },
        {
          selector: 'TSPropertySignature > TSTypeAnnotation > TSFunctionType',
          message:
            'A function in a prop cannot cross the server/client boundary. Use a ReactNode slot (e.g. `back`, `actions`) instead of `onBack: () => void`.',
        },
      ],
    },
  },
  {
    /*
     * The core must not import a country package.
     *
     * `@liro/serbia` carries Serbian identifiers. If the core imports it, the
     * system stops working in another market, and that only shows up when it
     * is needed — the most expensive way possible. The application may
     * import it freely.
     *
     * `transpilePackages` in `withLiro` is NOT an import but a path pattern,
     * so it is allowed — see `LIRO_COUNTRY_PACKAGES`.
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
                'The core must not import a country package. Domain rules go in the application or in the package itself.',
            },
          ],
        },
      ],
    },
  },
)