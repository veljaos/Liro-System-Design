# SplitAction

A button with a primary action and a menu of related variants.

## When to use

- One action with several forms that are used rarely: **Send** on the button,
  with *Send as PDF* and *Save as draft* in the menu.
- Anywhere the main action is obvious and the alternatives are not worth a
  toolbar slot each.

## When not to use

- **Not as a replacement for `ActionGroup`.** Three equally weighted actions go in
  a group, side by side. Hiding one of three in a menu makes it invisible.
- **Not for unrelated actions.** The menu holds variants of the main action, not
  everything else the screen can do. A menu of unrelated items is `more`.
- **Not for a destructive main action.** `delete` is `subtle` for a reason — see
  [destructive](../intents/destructive.md). A split button makes it prominent.

## How it behaves

### Menu items are intents

```tsx
<SplitAction
  intent="send"
  primary
  items={[
    { intent: 'preview' },
    { intent: 'pdf', label: { en: 'Send as PDF' } },
    { intent: 'save', label: { en: 'Save as draft' } },
    { intent: 'cancelDocument' },
  ]}
/>
```

Not free-form entries. An intent carries an icon, a label and a family, so **the
menu cannot show an action that does not exist in `intents.ts`**. The label can be
refined — *Send as PDF* is more precise than *PDF* — but the colour cannot.

### The disabled main half keeps its menu working

```tsx
<SplitAction
  intent="sign"
  disabled
  disabledReason={{ en: 'The document must be posted first.' }}
  items={[{ intent: 'preview' }, { intent: 'download' }]}
/>
```

Not being able to sign does not mean not being able to look. Disabling the whole
control would take away actions that are still valid.

### Colour in the menu marks danger, nothing else

Only destructive items are coloured — `status.danger.fg`, measured at **7.40** on
white and **6.54** on a hovered row. If every item carried its family colour, the
menu would be a rainbow that is harder to read, and the one item that should stop
the reader would stop looking special.

## Related

- `ActionButton` · `ActionGroup` — the ordinary cases
- [Intent families](../intents/README.md) — what the menu items are drawn from
- `BulkActionBar` — actions over a selection rather than one record

## Why it is like this

### Two `Button`s, not `Button` + `ActionIcon`

The same `size` and the same `variant` on the same component guarantee the same
height and the same colour resolution. With an `ActionIcon` the height would come
from `--ai-size` rather than `--button-height-*`, and the two halves would drift
apart on any change to `theme.scale`.

### The seam is an inset shadow with `currentColor`

```css
box-shadow: inset 1px 0 0 0 color-mix(in srgb, currentColor 30%, transparent);
```

An inset shadow does not enter the width calculation, so the halves cannot
separate by a pixel. `currentColor` means the seam is white on a filled button,
the family colour on a light one, and grey on a default one — one line for seven
families and every weight, with no hex value anywhere.

`margin-left: -1px` on the right half overlaps the borders, because two adjacent
1px borders read as a 2px line on `default` and `outline`.