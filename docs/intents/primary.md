# Primary

Actions that move a record forward: create it, save it, submit it, continue.

Colour: `liro-blue`. This is the colour a user learns first, because it is on the
one button they press on most screens.

## Intents in this family

| Intent | Default label | Weight | Confirms |
|---|---|---|---|
| `create` | New | `filled` | no |
| `save` | Save | `filled` | no |
| `submit` | Submit | `filled` | no |
| `confirm` | Confirm | `filled` | no |
| `next` | Next | `filled` | no |

All five are `filled` and none asks for confirmation.

## When to use

- **`create`** — opens a form for a new record. On a list screen this is the one
  action in the top-right corner.
- **`save`** — writes the current form to storage and stays where it is.
- **`submit`** — sends a completed form onward, usually closing it.
- **`confirm`** — the affirmative button inside a dialog the user opened
  themselves.
- **`next`** — the forward step in a `FormWizard` or any multi-step flow.

## When not to use

- **Not for sending to an authority.** "Submit a VAT return to the tax office" is
  `verify`, not `primary`. The distinction is whether the destination is your own
  system or someone else's — see [verify.md](verify.md).
- **Not for a favourable outcome.** "Approve" and "Post" close a record with a
  positive result; they are `positive`. `primary` moves a record *along*,
  `positive` closes it. This is the most common intent mistake in the system.
- **Not for the confirming button of a destructive dialog.** A dialog asking
  "Delete this document?" gets `delete` on its confirming button, not `confirm`.
  The colour must survive to the last click; a blue button in a deletion dialog
  reads as safe.
- **Not more than one on a screen.** Five filled blue buttons in a row is the
  failure this family is designed to prevent. If a screen seems to need two, one
  of them is secondary — reach for `neutral` or a lighter intent.

## How it behaves

`filled` weight means solid background, white text. **The text is always white**,
in both themes — the system does not use dark text on filled buttons. That is why
the background is chosen to carry white text rather than the other way round.

`brand.solid` is `blue[6]` in both themes. White on `blue[6]` measures **4.53**,
which clears the 4.5 threshold for normal text.

The intent decides colour, icon, weight, and default label. The caller may
override **only the label**:

```tsx
<ActionButton intent="create" label={{ en: 'New employee' }} />
```

Overriding the label is encouraged when it makes the action more precise. "New
employee" is better than "New". A colour override is not possible — `ActionButton`
takes no `color` and no `variant`.

## Examples

A list screen. One filled action, everything else quieter:

```tsx
<ActionGroup>
  <ActionButton intent="filter" />
  <ActionButton intent="excel" />
  <ActionButton intent="create" label={{ en: 'New employee' }} />
</ActionGroup>
```

The main action is **last**. That is where the eye expects it and where the thumb
reaches on a phone.

A form with a wizard:

```tsx
<ActionGroup>
  <ActionButton intent="back" />
  <ActionButton intent="next" />
</ActionGroup>
```

A save button that cannot yet be used, with the reason attached:

```tsx
<ActionButton
  intent="save"
  disabled={!form.formState.isValid}
  disabledReason={{ en: 'Fill in the tax number and the company name first.' }}
/>
```

`disabledReason` exists because a disabled button with no explanation is a dead
end. The tooltip is configured with `events={{ hover: true, focus: true, touch:
true }}` — a disabled button does not emit mouse events, and that is exactly when
the explanation is most needed.

## Related

- [verify.md](verify.md) — sending to an external authority
- `positive` (not yet written) — closing a record with a favourable outcome
- [neutral.md](neutral.md) — the secondary actions that sit next to this one

## Why it is like this

**Why all five are filled.** They are never on the same screen together. `create`
belongs to a list, `save` and `submit` to a form, `next` to a wizard, `confirm` to
a dialog. Giving them the same weight is safe because they do not compete, and it
means the primary action always looks the same wherever the user is.

**Why none of them confirms.** None of the five destroys anything. A confirmation
dialog on "Save" trains users to click through dialogs without reading, which is
what makes the dialog on "Delete" useless.

**Why white text and not automatic contrast.** Mantine can compute whether text
should be black or white (`autoContrast`). It is switched off. The owner decided
that letters on a filled button are **always white** — black looks wrong in this
system — so the background is selected to carry white text.

This decision has history worth knowing, because the same bug was made twice:

1. `autoContrast: true` with `luminanceThreshold: 0.35` did not work because our
   `cssVariablesResolver` hard-wrote `--mantine-primary-color-contrast` to white
   and cancelled Mantine's calculation. That line was removed.
2. `primaryShade` was returned to `6` in both themes — `blue[5]` with white text
   measures 3.12 and fails.
3. In the dark theme `brand.solid` had been set to `blue[4]` for the sake of
   `BrandMark`. But the resolver maps `--mantine-primary-color-filled` to
   `brand.solid`, so every filled button got a light blue background with white
   text: **2.53**. Fixed by returning `brand.solid` to `blue[6]` and pointing
   `BrandMark` at `text.brand`.
4. The identical mistake was then found in the **light** theme, where
   `brand.solid` was still `blue[4]`. It had been there the whole time and no
   check caught it, because accessibility testing had only ever been run against
   the dark theme's failures.

The lesson recorded in `AGENTS.md`: **`brand.solid` is a background, `text.brand`
is text.** They move in opposite directions between themes and must never share a
token.