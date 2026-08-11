# Liro Design System — working rules

Read this file before changing anything in the repository.

## What this repository is

A design system that sits **above Mantine** and **below** the product. It is not
tied to any one application. It exists so that every next product looks and
behaves the same, with no negotiation and no re-deciding.

Seventeen packages and one application (`apps/playground`) which is the living
documentation.

**What does not belong here:**
- Business logic of any product
- Calls to a specific database or API (`@liro/data` defines the *contract*, not
  the implementation; `@liro/data-supabase` is one implementation)
- Screens that only make sense in one product

If you are unsure whether something belongs: ask whether another product would
need it too. If not, it does not belong.

---

## Before you change anything

```bash
pnpm install
pnpm dev        # playground on 3100
```

Before you say you are done, all four must pass:

```bash
pnpm lint       # 0 errors; warnings are allowed
pnpm typecheck
pnpm test
pnpm build
```

Anything that touches tokens, contrast, or colour scales also needs `pnpm a11y`
immediately — that is the one class of problem the eye cannot check.

At the end of a series of changes, also `pnpm e2e`, then `pnpm e2e:update`.

When `pnpm install` changes `node_modules`, restart the TypeScript server in your
editor — otherwise you see errors that are not there.

---

## Layers and the direction of dependencies

Dependencies point **downwards only**. A package never imports a package above
it.

```
tokens          colours, spacing, intents — no React
└── theme       Mantine theme built from tokens
    └── i18n    pure functions in format.ts + React context in i18n.tsx
        └── ui  components
            ├── forms, data, charts, dates, editor, files, pdf, process, schedule
            └── templates
                └── preset

serbia          country package — outside the chain, see below
```

**`@liro/forms` does not depend on `@liro/ui` and we keep that as a rule.** A form
must work in an application that does not use the rest of the system. If you need
`ActionButton` inside `forms`, use a Mantine `Button` — that is what `AutoForm`
does.

**`@liro/preset` depends on everything** and that is fine. It is a meta-package:
the application installs it and gets a configured Next, the correct CSS order,
and the whole provider chain.

**`@liro/serbia` is a COUNTRY package, not part of the core.** It holds Serbian
identifiers: tax number (PIB), personal number (JMBG), company number, bank
account, payment reference. The core must not import it and ESLint enforces that.
Tomorrow `@liro/croatia` sits beside it with no change to the core.

Listing a country package in `transpilePackages` is **not** an import — it is a
path matcher, and Next silently ignores entries that do not resolve. That is why
`LIRO_COUNTRY_PACKAGES` in `@liro/preset/src/next.ts` is allowed to name it.

**`@liro/preset` is NOT the only package an application installs.** The Mantine
set goes in `peerDependencies` because every `@mantine/*` subpackage declares
`@mantine/core` and `@mantine/hooks` as peers with an **exact** version — pinning
them in `dependencies` yields two copies of `core`, two React contexts, the theme
is not applied, and nothing throws.

Repeated versions live in the `catalog:` block in `pnpm-workspace.yaml`. Only
values that are identical everywhere go in there.

---

## The server/client boundary

There are **three** kinds of component, not two.

| Kind | Directive | Where it works | Where it lives |
|---|---|---|---|
| Shared | none, and **no hooks** | both trees | `@liro/ui/primitives` |
| Client | `'use client'` | both (a server tree can render a client component) | `@liro/ui` |
| Server | `await`, `cookies()` | server tree only | in the application, not here |

**Rules for the shared layer** (`packages/ui/src/primitives/**`) — ESLint enforces
them, do not rely on memory:

- No `'use client'`
- No hooks at all
- No functions in props — a function cannot cross the server/client boundary.
  Instead of `onBack: () => void` use a slot, `back?: ReactNode`
- Text arrives as a finished `string`, not as a `LocalizedLabel`. Translation is
  the job of the layer above

**Why:** a component needed by both a server page and a client page must not be a
Server Component — the client page could not use it. The shared layer is the only
shape that works on both sides.

The client `@liro/ui` is a thin wrapper around the shared layer: it accepts
`LocalizedLabel`, resolves the translation through `useI18n()`, and passes
finished text down. When moving a component into the shared layer, **do not change
the public API** — existing screens must not notice.

A server page uses `getServerI18n()` from `@liro/i18n/server`, which deliberately
has the same shape as `useI18n()`:

```ts
const { t, formatCurrency } = useI18n()             // client
const { t, formatCurrency } = await getServerI18n() // server
```

---

## Tokens

**`packages/tokens/src/styles/tokens.css` is a generated file.** After editing
`semantic.ts` you must run `pnpm tokens:build` — otherwise the CSS variables carry
the old value and nothing reports an error.

Three layers: primitives (`gray[3]`) → semantics (`surface.raised`) → usage
(`liroVar.surface.raised`).

- A component uses **only** `liroVar.*` or `var(--liro-*)`
- A hex value in a component is a mistake; ESLint rejects it
- Only `@liro/tokens` may define colours

**`brand.solid` is a background, `text.brand` is text.** They move in opposite
directions between themes — in dark the background must get darker and the text
lighter — and they must never share a token. The resolver maps
`--mantine-primary-color-filled` to `brand.solid`, so any change to that token
changes **every filled button in the system**. This same bug happened twice:
first in the dark theme, then in the light one.

The dark theme works without a single extra rule **because** this is respected.
The first hex that slips through is the first place that will look wrong in dark.

**Translucent dark-theme tokens are computed against `ink`.** `status[tone].bg`
is `rgba(..., 0.20)` and assumes the page background. Placed on a blue bubble it
mixed with blue: measured 2.34 instead of 6.32. When a translucent token lands on
an unknown surface, layer it over an **opaque** base — `backgroundColor` for the
base, `backgroundImage: linear-gradient(token, token)` above it.

---

## Intents instead of colours

`ActionButton` **takes no `color` and no `variant`.** It takes `intent`.

```tsx
<ActionButton intent="delete" />          // correct
<Button color="red">Delete</Button>       // not
```

The intent carries the icon, the colour, the default label, and the weight. That
is why six filled buttons on one screen cannot even be built.

If an action needs a colour that does not exist in the intent catalogue, **the
mistake is in the catalogue, not at the point of use.** Add it to
`packages/tokens/src/intents.ts`, once, and it applies everywhere immediately.

The label changes, the colour does not: `label={{ en: 'New employee' }}` is more
precise and useful. A green "New" is not.

The catalogue must group by the `family` field. It drifted once: `confirm` sat
under the teal heading, `send` and `sync` under blue, `import` under purple — the
buttons were correctly coloured the whole time and only the heading lied. That is
worse than a wrong colour, because the catalog is where people copy from.

See `docs/intents/` for the reasoning behind each family.

---

## Ten rules of the system

The same ones as on the `/uvod/pravila` page. Read once; after that the system
enforces them for you.

1. **`ActionButton` takes no `color` and no `variant`.** Those two props are why
   two screens in one application look like two products.
2. **Components contain no hex values.** Everything goes through `liroVar`.
3. **The label changes, the colour does not.**
4. **One filled button per screen.** The intent carries the default weight.
5. **A table on a phone is not a table.** Nobody reads horizontal scroll through
   five columns — the `mobile` prop describes the card.
6. **An empty value is a dash.** Without it you cannot tell "no data" from "the
   field failed to load".
7. **Modals live outside `Tabs`.** `keepMounted` is `false`, so a modal in an
   inactive panel does not exist.
8. **Hidden fields do not travel to the database.** Otherwise you store a value
   the user never saw.
9. **The error sits next to the field.** A general message at the top does not
   connect to the input.
10. **Success disappears, errors wait.** An error message that vanishes after
    three seconds is the same as no message at all.

### Why the system is deliberately rigid

**The constraints are the product, not an oversight.** A developer should not be
making visual decisions under a deadline. They should describe what a screen
does; the system takes care of how it looks — because technology changes and
human behaviour does not.

If an action needs a colour that does not exist in the intent catalogue, **the
mistake is in the catalogue, not at the point of use.** It is added there, once,
and applies to every application immediately.

---

## How to add a component

1. **Check that it does not already exist.** Search
   `apps/playground/src/catalog/props.index.json` and every
   `packages/*/src/index.ts`. Four components were once proposed that already
   existed. The system also has overlaps (`DataTable` / `ResourceTable`,
   `StatusScreen` / `StatusTemplates`). A new component that does 80% of an
   existing one is debt, not a contribution. If something similar exists, the
   change is a **prop or a variant**.
2. **Decide the layer.** No state and no functions in props → `primitives`.
   Otherwise → the right folder in `@liro/ui`.
3. **One file, one component.** A file with five unrelated components means
   importing one pulls in all five.
4. **Pure functions into their own module with no directive.** `toMinor` and
   `srPlural` live in `money.ts` and `plural.ts` precisely so they can be tested
   without starting React.
5. **Export from `packages/<package>/src/index.ts`**, types included.
6. **Add an example to the catalog** with a `code` block.
7. **Write comments that explain *why*, not *what*.** The code already says what
   it does. The comment should say why it is like this and not otherwise.

Comments are written in English. User-facing text goes through `LocalizedLabel`.

---

## The catalog

`apps/playground/src/catalog/entries/*.tsx`. Every entry:

- `id`, `title`, `description`, `demo`, `from` (where it is imported from)
- `code` — **required.** An example you can see but not copy is half an example
- `props` — the public API table, where one exists

The demo must be realistic. `<Button>Button</Button>` shows nothing; a business
screen with real names shows how the component looks in use.

**A component that is exported but not in the catalog does not exist for any of
the checks.** No props table, no visual baseline, no `axe` pass. `CommentThread`
was in that state. Adding the catalog entry is part of the work, not a follow-up.

A new category means a new route, and the last test in `catalog.spec.ts` checks
the list — add the slug to `CATEGORY_SLUGS` in `e2e/routes.ts`.

---

## i18n

- `LocalizedLabel` is `string | Partial<Record<Locale, string>>`. A plain string
  is allowed when no translation is needed
- Locales: `sr` (Latin script), `sr-Cyrl` (Cyrillic), `en`. This is being
  extended to 43 tags — see `HANDOFF.md` section 8
- Fallback chain: requested → `sr` → `en` → the first non-empty value. Never a
  blank screen
- **Pure functions live in `packages/i18n/src/format.ts`, with no directive.**
  `i18n.tsx` has `'use client'`, and that directive applies to the whole module —
  a function re-exported from there cannot be called from the server
- Plurals are not avoided. `srPlural` exists because `3 stavke` and `5 stavki`
  are not the same form, and `Selected: 3` is dodging the problem

**In this system `sr` means LATIN SCRIPT; to `Intl` it means Cyrillic.** That is
why `LOCALE_TAGS` must name the script: `sr-Latn-RS` and `sr-Cyrl-RS`. While both
were `sr-RS`, a Latin-script user got `авг` and `нед`. Only month and day names
change; numbers, currency, numeric dates and times are identical.

**Always reach `Intl` through `LOCALE_TAGS`, never with a bare `locale`.** A
component that builds `new Intl.DateTimeFormat(locale)` bypasses that table and
brings the bug back.

---

## Dates and money

**Dates are `YYYY-MM-DD` strings**, not `Date` objects. No time zones and no
off-by-one days. `@liro/dates` does not depend on `dayjs`.

`parseSerbianDate` accepts what an operator actually types: `010326`, `1.3.2026`,
`01/03/2026`. Two-digit years: up to 69 is 2000s, from 70 is 1900s.

**Money is compared in minor units, not in decimals.** `0.1 + 0.2 !== 0.3` — a
hundred-line journal entry would go out of balance by one dinar from rounding
alone. Use `toMinor` / `fromMinor` from `@liro/ui`.

`formatCurrency` joins the amount and the currency with a **non-breaking space**
(`U+00A0`). A normal space lets `RSD` break onto the next line.

This is a **display** function. Raw numbers go into CSV and Excel.

---

## Performance — mistakes we already made

**Do not render twice.** Mantine's `hiddenFrom` and `visibleFrom` **hide with
CSS, but both trees are created.** Because of this `DataTable` built both the
table and the mobile cards on every screen. For 932 rows that was 1,592 ms per
interaction. Use `useMediaQuery` and real branching.

**Nothing random and nothing time-dependent during render.** `Math.random()`,
`Date.now()`, `new Date()` give one value on the server and another in the
browser, and React reports a hydration mismatch. For test data use a
deterministic generator from the index. For a ticking clock — `useState(null)`
plus `useEffect`.

The same applies to demo data in the catalog: a non-deterministic generator makes
every `pnpm e2e` produce a different image and the visual regression becomes
useless.

**Define functions in props outside the component or through `useMemo`.**
`getRowId={(row) => row.id}` written inline creates a new function on every
render and breaks every `useMemo` that depends on it.

**Cache `Intl` formatters.** Creating an instance is expensive, using it is
cheap. When an effect depends on an array prop, use a stable key
(`items.map((i) => i.id).join('|')`) rather than the array itself.

**Virtualise both sides.** The table and the mobile cards have the same limit;
one without the other is half a solution.

---

## Accessibility — the minimum

- `aria-sort` on a sortable column. The arrow does not exist for a screen reader
- Anything that responds to a click responds to the keyboard. If an element is a
  `<div>` with `onClick`, turn it into an `UnstyledButton` — you get the role,
  focus, and Enter/Space for free
- `aria-live="polite"` on a counter that changes, `role="status"` on job state.
  Without it a user ticks a row and gets no feedback at all
- Space and Enter are not the same: **Enter opens, Space ticks.** A link opens
  only with Enter by specification — that is not a bug
- A field in an entry grid must have an `aria-label`; the column header is not
  connected to the field
- **Contrast is measured after layers are composited, not from the declared
  colour.** A translucent wash over text changes the effective background.
  `CapacityTimeline` failed with every token correct: the progress wash at 25%
  mixed `tone.solid` into `tone.bg` under the label and pulled info from 5.04 to
  3.65
- **`axe` does not measure text over a `background-image`.** It returns
  `incomplete`, not a violation, and `a11y.spec.ts` counts only violations — so
  the test passes and the problem stays. Arithmetic decides there, against the
  lightest possible image. `surface.scrim` is 55% because 45% gives 3.35 on a
  white image
- **`opacity` on text enters the contrast ratio.** `opacity: 0.85` on a white
  label over a dimmed white photo drops 4.76 to 3.95. Quieter text is made with
  size and weight, never with opacity
- An empty `aria-label` is worse than none. Mantine writes one itself when you
  omit `thumbLabel` on `Slider` — the attribute exists, the name does not
- With Mantine wrappers, check **which node** the attribute actually lands on.
  `tabIndex` on `ScrollArea` goes to the root, but the viewport is what scrolls —
  you need `viewportProps`
- `aria-label` on a `<div>` or a `<pre>` is prohibited (role `generic`). If an
  element needs a name, it first needs a role: `role="group"`

**A data visualisation gets `role="img"` with a summary, not `tabIndex` on every
element.** The heatmap has 365 cells; naming each one means 365 keyboard stops
through a single view, which is worse than inaccessible.

**A prop must not be called `role`.** `jsx-a11y/aria-role` reads every JSX `role`
as an ARIA role, including on our own components — `role="Accountant"` is a lint
error. Job title is `position`.

**Do not mix `borderRadius` with `border*Radius`** in one style object. React
writes them in key order and warns; the result is unpredictable. Use one
`borderRadius` with four values: top-left, top-right, bottom-right, bottom-left.

---

## ESLint

The flat config has one trap with no error message: **a later block replaces
`no-restricted-syntax`, it does not extend it.** This happened here — the block
for `packages/ui/src/primitives/**` dropped `NO_HARDCODED_COLOR`, so hex colours
were unchecked in the shared layer and three components were added while the hole
was open.

Selectors are kept as named constants and every applicable one is always listed.
**If you add a selector to one of those blocks, check that all the others are
still in the list.**

---

## Tests

`pnpm test` runs Vitest over `packages/*/src/**/*.test.ts`.

**Pure functions are tested** — the ones that quietly corrupt data: formatting,
parsing, identifier checks, plural rules, minor-unit arithmetic.

**Components are not unit-tested.** A DOM test of a component mostly verifies
that Mantine still works, which is not our job.

A package with tests must have `vitest` in its own `devDependencies` (through
`catalog:`) — pnpm does not share the root's dependencies.

### What each check actually catches

Measured over one full session of work. This is why the eye is not optional:

| Check | Problems found |
|---|---|
| `pnpm lint` | 2 |
| `pnpm typecheck` | 1 |
| **Owner looking at `pnpm dev`** | **4** |
| `pnpm a11y` | 0 in new code (it found all 57 during the earlier remediation) |
| `pnpm e2e` | 0 — only ever reported stale baselines |

### Visual regression

`pnpm e2e` compares 59 routes × 2 themes against the baselines in
`e2e/catalog.spec.ts-snapshots`. **The threshold and the update mode are one
decision and change together.**

| | Value | Why |
|---|---|---|
| `threshold` | `0.2` | Per-pixel difference. Absorbs antialiasing at glyph edges. |
| `maxDiffPixelRatio` | `0.001` | It was `0.02` — recolouring **every** button in the system is about 0.07% of a `fullPage` shot, so it passed unnoticed on all 118 baselines. |
| `--update-snapshots` | `changed` | Rewrites only what failed. |

**If the threshold is ever raised, `changed` stops working** and `all` must come
back: when real changes do not fail, there is nothing to rewrite and baselines go
stale silently. We hit this — `e2e:update` refused to refresh `/application`.

**Why not `maxDiffPixels: 0`.** Measured: between two machines 36 of 59 routes
differ slightly, almost certainly antialiasing. With zero tolerance every machine
switch would fail 72 tests and you would stop reading the output. `0.001` is
calibrated to catch adding one component while tolerating machine noise.

**Baselines are suffixed `-win32`**, so `pnpm e2e` **does not run in CI** — those
files do not exist on Linux. `pnpm a11y` does, because `axe-core` computes from
resolved CSS and the result is the same on every system.

**Sub-threshold changes accumulate.** A difference below the threshold does not
fail the test, so the baseline stays old. After ten of those, one page fails one
day and the diff shows the sum of ten things, none of them recognisable.
Therefore: **one `--update-snapshots=all` before each release, always on the same
machine.** That way the debt is cleared deliberately.

The `KNOWN` allowlist in `e2e/a11y.spec.ts` records accepted issues per route.
That list is only allowed to shrink.

---

## Domain rules that are never invented

`@liro/serbia` is a standalone package with no dependencies. It contains the
rules of the Serbian business environment. **It is not mandatory** — a product
outside that market does not install it.

Everything in this table is **verified against real data**. Do not change it
without new real data.

| Data | Check | Confirmed against |
|---|---|---|
| Tax number (PIB) | ISO 7064 MOD 11,10 over 8 digits | 3 real |
| Company number | **no check digit** — a serial in the APR register | 4 real + a ~2M-scheme search |
| Personal number (JMBG) | MOD 11, weights 7-6-5-4-3-2 repeated; `m = 1` is invalid | 2 real |
| Foreigner's registration number | 13 digits, **does not follow the JMBG check** | 1 real |
| Bank account | ISO 7064 MOD 97; the full 18-digit string `mod 97 === 1` | 5 real, 5 banks |
| Payment reference, model 97 | MOD 97, check **at the start** of the string | 4 examples |
| Payment reference, model 11 | MOD 11, weights from `body_length + 1` down to 2, per part | 7 pairs, 5 different check values |

**The rule above all others:**

> An algorithm is not written until the sample has **different** check values.

Six examples ending in the same digit prove nothing — any formula that happens to
return that digit "passes". With the company number this rule prevented inventing
a check digit that does not exist.

**The kind of data is never guessed from its shape.** A foreigner's registration
number has thirteen digits like a JMBG but fails its check — a rule saying
"thirteen digits means JMBG" would reject a valid number for every foreigner. The
application must state which kind it is.

**A false rejection is a worse error than a miss.** When you do not know the
rule, let it through and record that you do not know.

**The sex marker in a JMBG is not gender identity.**
`registrovaniPolIzMaticnogBroja` returns an administrative value from the
register. It is not used to prefill an interface field — only for forms that
explicitly require the registry value. For everything else, ask the person.

---

## Never do

- Do not add `color` or `variant` to a `Button` in product code
- Do not write a hex value outside `@liro/tokens`
- Do not add `'use client'` to `primitives`
- Do not import a pure function from a module that has `'use client'` into a
  server component
- Do not change the public API of an existing component without a wrapper that
  preserves the old behaviour
- Do not add a dependency to `@liro/tokens`, `@liro/i18n/format` or
  `@liro/serbia` — those three layers must stay pure
- Do not import `@liro/serbia` from anywhere in `packages/**`
- Do not write product business logic into the design system

---

## When you are not sure

Ask. Three times during the development of this system an assumption about a
domain rule was wrong, and every time the person who knows the domain corrected
it in one sentence.