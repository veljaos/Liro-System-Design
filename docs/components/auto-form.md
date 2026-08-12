# AutoForm

A form described as data: an array of fields in, a rendered form out — with
validation, layout, conditional fields and error handling.

## When to use

- Any entry or edit screen with more than a handful of fields.
- Wherever the same record is edited from more than one place. The schema is
  written once and both screens get the same form.
- When the fields are not known at build time — configurable forms, per-tenant
  fields, forms generated from a table definition.

## When not to use

- **Not for two or three fields.** A login form is three inputs and a button;
  describing it as data costs more than it saves. `LoginForm` is written by hand
  for that reason.
- **Not for a table of rows.** Entering many rows of the same shape is
  `EditableGrid`, which is built for keyboard-only entry.
- **Not when the layout is the point.** A screen whose arrangement is the design —
  a dashboard, a wizard step with an illustration — is written directly.
  `FormWizard` exists for the multi-step case.

## How it behaves

### The schema is the form

```ts
const schema: FieldSchema[] = [
  { name: 'pib', type: 'text', label: { en: 'Tax number' }, required: true },
  { name: 'name', type: 'text', label: { en: 'Company name' }, required: true },
  { name: 'gross', type: 'currency', label: { en: 'Gross' }, number: { suffix: ' RSD' } },
]
```

Field types cover text, email, password, textarea, number, currency, date,
select, multi-select, checkbox, switch, relation, multi-relation, localised text,
upload and custom — plus three **layout** types that have no value of their own:
`row`, `section` and `tabs`.

Layout is part of the schema rather than a wrapper around it, so the whole form
stays one array that can be read, tested, and generated.

### Validation is brought by the application

`@liro/forms` **does not depend on Zod**. It accepts any validator implementing
`StandardSchemaV1` — the shared signature Zod 4, Valibot and ArkType already
support.

```tsx
<AutoForm
  fields={schema}
  schema={clientSchema}      /* Zod, Valibot, whatever the app uses */
  onSubmit={save}
/>
```

The value is not that the form validates more. It is that **the same schema runs
in the API route and in a test**. The rule "a tax number has nine digits" then
exists in one place instead of three.

### Rule order is not accidental

`createLiroResolver` runs the rules from `FieldSchema` — `required` and
`validate` — **before** the schema, and this ordering is load-bearing: **React
Hook Form skips its own field rules the moment a resolver is present.** Without
the adapter running them first, `required: true` in the schema would silently do
nothing.

Field rules also come first because their messages are more readable: "Company
name is required" beats a validator's path-based output.

### A hidden field is not validated and does not travel

A field whose `condition` is false is skipped in validation — otherwise the form
would demand input in a field the user cannot see and has no way to fill.

It is also **stripped from the payload before saving.** Without that, the record
would carry a value the user never saw, and nobody could explain where it came
from later.

### Errors sit next to the field

Both from the client and from the server. A general message at the top does not
connect to the input that caused it, and on a form of forty fields it is useless.

## Examples

Sections and a two-column row:

```ts
const schema: FieldSchema[] = [
  { type: 'section', label: { en: 'Identification' }, fields: [
    { type: 'row', fields: [
      { name: 'pib', type: 'text', label: { en: 'Tax number' }, required: true },
      { name: 'companyNumber', type: 'text', label: { en: 'Company number' } },
    ]},
    { name: 'name', type: 'text', label: { en: 'Company name' }, required: true },
  ]},
]
```

A field that appears only when another has a value:

```ts
{
  name: 'vatNumber',
  type: 'text',
  label: { en: 'VAT number' },
  condition: (values) => values.vatRegistered === true,
}
```

A relation with server-side search:

```ts
{
  name: 'clientId',
  type: 'relation',
  label: { en: 'Client' },
  relation: { resource: 'clients', labelField: 'name', searchFields: ['name', 'pib'] },
}
```

The dropdown searches on the server with a debounce, because a client list is not
something to load into the browser in full. Relations also support dependency:
selecting a value in one field filters the options in another.

Field-level validation with a domain rule:

```ts
{
  name: 'account',
  type: 'text',
  label: { en: 'Bank account' },
  validate: (value) =>
    isValidBankAccount(String(value)) ? true : 'Check the control digits',
}
```

`isValidBankAccount` comes from `@liro/serbia`. **The design system does not
import it** — the application does. See the country-package rule in `AGENTS.md`.

## Related

- `FormWizard` — the same schema across several steps, with per-step validation
- `FormDrawer` · `FormModal` — the same form in a drawer or a modal; see
  [navigation patterns](../navigation-patterns.md) for which to use
- `EditableGrid` — many rows of the same shape, entered by keyboard
- `RecordFormTemplate` — the page around the form, with actions top and bottom

## Why it is like this

### Forty fields, forty chances to differ

The reason is the same as with tables. An employee entry screen has about forty
fields. Writing them by hand means forty chances for the spacing, the size, or the
way an error is shown to drift from the screen next door — and the drift is
invisible until someone puts the two screens side by side.

The schema reduces that to one array that can be read, tested, and generated.

### Why no Zod in the dependencies

Picking a validator for every application that uses the design system is exactly
the kind of decision this system exists to *avoid* making on someone's behalf. It
is also the kind that ages: Zod 3 to Zod 4 was a breaking change, and a design
system that pinned it would have dragged every consumer through that migration.

`StandardSchemaV1` is the signature the validators agreed on. The application
brings its own; the design system does not know which.

### Conditional logic is mapped to fields, not evaluated globally

A condition is attached to the field it governs. Evaluating every condition on
every keystroke would re-render a forty-field form on each character typed.

### `@liro/forms` does not depend on `@liro/ui`

Deliberate, and enforced. A form must work in an application that does not use the
rest of the system. Where `AutoForm` needs a button it uses a Mantine `Button`
rather than `ActionButton` — the one place in the repository where that is correct.

### File storage is separate from the data provider

An `upload` field writes through `LiroFileStorageProvider`, not through the data
provider. Databases and file storage are different services and are routinely
different vendors; tying them together would force one choice on both.