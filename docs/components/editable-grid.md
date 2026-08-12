# EditableGrid

Row-by-row entry with the keyboard: a journal entry, invoice line items,
everything typed rather than picked from a dialogue.

## When to use

- Line items entered one after another, where the operator types and does not
  reach for the mouse.
- Anywhere two columns must balance — debit against credit.

## When not to use

- **Not for displaying rows.** A table the user reads is `DataTable`. This one is
  built for typing and gives up features a display table has.
- **Not for one record with many fields.** That is `AutoForm`. This is many
  records with few fields.
- **Not for editing one cell in a list.** A single inline edit is a field in a
  `DataTable` cell, not a whole grid.

## How it behaves

### The entire entry works without a mouse

| Key | What it does |
|---|---|
| `Enter` | Next row, same column. On the last row, creates a new one |
| `Shift+Enter` | Previous row |
| `Tab` | Next cell — left to the browser |

Creating a row on `Enter` in the last row is the part that matters: an operator
entering forty lines never stops to click "Add row".

### The arrow keys are deliberately not taken over

In a number field they change the value; in text they move the cursor. Taking them
over would remove behaviour the user already expects and has muscle memory for.

This is worth stating because it looks like an omission. It is not — a grid that
hijacks the arrows feels broken to anyone who types numbers for a living.

### Balance is compared in minor units

```tsx
<EditableGrid
  columns={columns}
  rows={lines}
  onChange={setLines}
  balance={{ debit: 'duguje', credit: 'potrazuje' }}
/>
```

The two named columns must be equal, and the comparison happens in **para**, not
in decimals:

> `0.1 + 0.2 !== 0.3`

A hundred-line journal entry would go out of balance by one dinar from rounding
alone, and the operator would spend an afternoon looking for a mistake that is
not there. `toMinor` and `fromMinor` from `@liro/ui` are what make the comparison
exact.

## Related

- `DataTable` — displaying rows rather than entering them
- `AutoForm` — one record with many fields
- `RateTable` — displaying a matrix of prices, not entering one
- `AGENTS.md` — the money rule this component depends on

## Why it is like this

### Why it is a separate component and not a mode on `DataTable`

They optimise for opposite things. `DataTable` virtualises, branches to cards on a
phone, sorts, and paginates — all of which get in the way of typing. A cell that
scrolls out of the DOM mid-edit loses what was typed.

A single component with an `editable` prop would have to be good at both, and
would be good at neither.

### Why balance is a prop and not computed from the column type

The component cannot know which two columns must be equal. In a journal entry it
is debit and credit; in a stock reconciliation it might be counted against
expected. Naming them makes the rule explicit on the screen that has it, rather
than guessed from a type.