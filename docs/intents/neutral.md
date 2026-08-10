# Neutral

Everything that neither advances nor destroys: editing, viewing, filtering,
refreshing, going back, giving up.

Colour: `liro-gray`. The largest family — eleven of the thirty-three intents — and
the one that keeps every other family readable.

## Intents in this family

| Intent | Default label | Weight | Confirms |
|---|---|---|---|
| `edit` | Edit | `default` | no |
| `view` | View | `subtle` | no |
| `filter` | Filters | `default` | no |
| `refresh` | Refresh | `subtle` | no |
| `back` | Back | `subtle` | no |
| `cancel` | Cancel | `default` | no |
| `duplicate` | Duplicate | `default` | no |
| `import` | Import | `default` | no |
| `archive` | Archive | `default` | no |
| `settings` | Settings | `subtle` | no |
| `more` | More | `subtle` | no |

Two weights: `default` (bordered, on a surface) and `subtle` (no fill, no border).
None confirms.

## When to use

Use `neutral` for the actions that surround the point of a screen. The rough test:
if the action changes **what the user sees** rather than **what the record is**, it
is neutral.

- **`edit`** — opens a record for changing. It is neutral because opening a form
  changes nothing yet.
- **`view`** — opens a read-only detail, usually from a table row.
- **`filter`**, **`refresh`** — change the view of a list.
- **`back`**, **`cancel`** — leave without effect. `back` moves a step in a flow;
  `cancel` abandons a form.
- **`duplicate`** — creates a draft from an existing record. Neutral rather than
  primary because the result is a draft, not a committed record.
- **`import`**, **`archive`** — bulk or lifecycle operations that are neither
  favourable nor destructive.
- **`settings`**, **`more`** — entry points to something else, not actions in
  themselves.

## When not to use

- **`cancel` is not `cancelDocument`.** `cancel` closes a form. `cancelDocument`
  voids a document that has already been issued. English makes this dangerous
  because both are "cancel"; in Serbian they are *Odustani* and *Storniraj* and are
  never confused. When in doubt: does anything change in the database? If yes, it
  is not `cancel`.
- **`refresh` is not `sync`.** `refresh` re-reads your own data. `sync` talks to an
  external service — that is `verify`. If nothing leaves the process, it is
  `refresh`.
- **`import` is not `create`.** Bringing a file in produces records but is not the
  "New" button, and it must not carry the primary colour on a list screen where
  `create` already does.
- **Not for the main action of a screen.** If the only thing a user came to do is
  grey, the screen is missing its intent. Look for the action that advances the
  record — it belongs to another family.
- **`archive` is not `delete`.** Archiving hides; deleting destroys. Archive is
  reversible, which is why it is neutral and does not confirm.

## How it behaves

**`default` weight** is Mantine's bordered button: a surface background and a
border. It reads as a real control without competing with a filled one.

**`subtle` weight** has no fill and no border. It is for actions that must be
present but should recede — a row action, a back link, a menu trigger.

None of the eleven asks for confirmation. Nothing here is irreversible.

Every intent still carries an icon and a default label, which is what keeps grey
buttons legible: without the icon, a row of four grey bordered buttons is a wall of
text.

## Examples

A list toolbar. Three neutral actions and one that is not:

```tsx
<ActionGroup>
  <ActionButton intent="filter" />
  <ActionButton intent="refresh" />
  <ActionButton intent="import" />
  <ActionButton intent="create" label={{ en: 'New client' }} />
</ActionGroup>
```

Only the last one is coloured. That is the whole reason this family exists.

A table row, where everything must recede:

```tsx
{
  key: 'actions',
  header: { en: '' },
  render: (row) => (
    <ActionGroup>
      <ActionButton intent="view" iconOnly />
      <ActionButton intent="edit" iconOnly />
    </ActionGroup>
  ),
}
```

`iconOnly` keeps the accessible name from the intent's label, so the button is
still announced as "View" to a screen reader.

A form footer:

```tsx
<ActionGroup>
  <ActionButton intent="cancel" />
  <ActionButton intent="save" />
</ActionGroup>
```

Two buttons, one grey and one blue, in that order. The user can leave, but the
place their hand goes is the one that keeps their work.

## Related

- [primary.md](primary.md) — the action these surround
- [destructive.md](destructive.md) — `cancel` versus `cancelDocument`
- [verify.md](verify.md) — `refresh` versus `sync`

## Why it is like this

**Why this family is the largest.** Most buttons in a business application are
neutral. A screen has one thing it is for and a dozen things you can do around it.
Eleven intents is not sprawl — it is the actual distribution of work, and naming
each one is what prevents someone reaching for a colour to make a filter button
feel important.

**Why two weights instead of one.** A bordered `edit` in a toolbar and a bare
`view` in a table row are the same colour doing different jobs. Without the split,
either the toolbar looks empty or every table row is full of boxes. The intent
decides which, so the decision is made once rather than per screen.

**Why `edit` is neutral and not primary.** Opening a form changes nothing. The
primary action appears **inside** the form, as `save`. Making `edit` blue would put
two blue buttons in the same flow one click apart, and the user could not tell
which one committed.

**Why `duplicate` is neutral.** It creates something, which argues for `primary`.
But what it creates is a draft, and the record is not committed until `save`.
Colouring it primary would promise a completed action.

**Contrast.** Grey text and borders are the tightest thing in the system because
grey has the least room. The relevant measurements after the token corrections:
`text.secondary` at `gray[7]` gives **4.94** on white; `text.tertiary` at
`#6A6866` gives **5.55** on white, **4.91** on `surface.page`, **4.67** on
`surface.sunken`.

`text.tertiary` is deliberately not `gray[6]`: that measured **4.46** on white and
**3.75** on `surface.sunken`, and it was failing in the search field and the
sidebar group headings. `gray[7]` would have passed but would have collapsed into
`text.secondary` and removed the third level of the hierarchy.

**If the grey ramp is ever adjusted, measure all three surfaces.** Grey is where
contrast failures hide, because a grey that is slightly too light looks
intentional.