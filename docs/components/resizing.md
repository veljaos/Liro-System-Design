# Resizing

Two places where the user decides how wide something is: `SplitPanel`, and the
`resizableColumns` prop on `DataTable`.

One page, because they share their mechanics, their accessibility pattern, and the
reason no library was added for either.

## SplitPanel

Two panels with a divider the user drags.

### When to use

- A screen where two things are read together: a PDF on the left and the form
  being filled from it on the right, a document beside its journal entry, a list
  beside a detail.
- Anywhere neither side has an obviously correct width.

### When not to use

- **Not for a detail beside a list.** That is `DetailDrawer`, which keeps the list
  usable and moves through records. A split panel is for two things read at once,
  not for a list and its selection.
- **Not for a sidebar.** Application navigation is `AppShellTemplate`, which
  collapses rather than resizes.
- **Not vertically.** Only horizontal, deliberately — see below.

### How it behaves

```tsx
<SplitPanel
  defaultRatio={0.45}
  minRatio={0.2}
  left={<PdfPreview source={file} />}
  right={<AutoForm fields={schema} onSubmit={save} />}
/>
```

**A ratio, not a width.** One person wants to see the whole document, the next
wants a wide form, and neither is wrong — so the component holds a share of the
container. A fixed pixel width would be right on one screen size and wrong on
every other.

`minRatio` stops either side disappearing. A panel dragged to zero is a panel the
user cannot get back without knowing the divider is still there.

Controlled through `ratio` and `onRatioChange` when the application wants to
remember the split. Uncontrolled by default: remembering it per user needs
somewhere to store it, and that is not the component's business.

## Column resizing

```tsx
<DataTable
  columns={[
    { name: 'code', label: { en: 'Code' }, width: 90, resizable: false },
    { name: 'name', label: { en: 'Account name' }, width: 260, minWidth: 120, maxWidth: 520 },
  ]}
  rows={rows}
  getRowId={getRowId}
  resizableColumns
/>
```

### Off by default, and that is not caution

Resizing needs `table-layout: fixed`, and that changes **how every column is
measured** — not just the one being dragged. With `auto` the browser sizes columns
to their content and overrides the dragged width on the next render.

So it is a decision the screen makes. Useful where one column holds long text the
reader wants to see: an account name, a description, a client. Not useful on a
table of five short columns, where it adds a handle and takes away automatic
sizing.

### Limits are per column

`minWidth`, `maxWidth`, and `resizable: false` to exclude a column entirely.

A code column has a fixed shape and gains nothing from being wider; a description
column might want 520. One global ceiling would be arbitrary for both. Defaults
are 64 and 640 — below 64 the header label is unreadable, and above 640, roughly
ninety characters at 14px, a line of text stops being easy to read.

## What both do the same way

### Pointer events, not a drag-and-drop library

`@dnd-kit` and the rest are 30 KB and solve a harder problem — sortable lists,
collision detection, nested droppables. A divider that moves along one axis needs
none of it.

`setPointerCapture` is what makes it work: it keeps the events arriving once the
cursor leaves the handle, and the cursor always leaves, because the user drags
faster than the layout follows. With plain mouse events the drag silently stops
mid-way.

It also covers touch and pen without a second code path.

### The grab area is bigger than the line

The divider is a hairline; the target is 13 pixels. The column handle is a border;
the target is 9. **A one-pixel target is a miss on every attempt**, and the padding
is transparent so the layout still reads as a line.

### The keyboard moves them too

Both are `role="separator"` with `aria-orientation`, `aria-valuenow` and
`aria-valuemin`/`max`, and both are in the tab order.

| Key | SplitPanel | Column |
|---|---|---|
| `ArrowLeft` / `ArrowRight` | 2% | 10px |
| with `Shift` | 10% | 40px |
| `Home` / `End` | the limits | — |
| `Enter` | back to the middle | — |

**This is not a nice-to-have.** Unlike a button, there is no other route to the
same result — a divider that answers only to a mouse is a feature a keyboard user
simply does not have. `aria-valuenow` matters for the same reason: without it a
screen reader announces a separator that moves and never says where it is.

### The handle is visible

The split divider carries a rounded grip, always. The column handle shows a faint
line when the pointer is anywhere in the header, and turns brand-coloured on the
handle itself.

A control nobody can see is a control nobody uses, and neither of these has
anything else on screen hinting that it can move.

## Related

- `DataTable` — where column resizing lives
- `DetailDrawer` — a detail beside a list, rather than two panels
- `KanbanBoard` — the third component built on the same pointer mechanics
- `PdfPreview` — the usual left-hand side of a split

## Why it is like this

### No vertical split

Horizontal only, because that is what the use cases are: a document beside a form,
a list beside a detail. A vertical split would need a second set of keys, a second
`aria-orientation` branch, and a second grip — for a case that has not appeared.

When it does appear, the prop is `orientation` and the work is a day. Building it
now would be building for a hypothesis.

### Text selection is disabled during a drag

Set on `document.body` rather than on the panels, because pointer capture means
the move events keep arriving even when the cursor is far outside them. Without it
the drag highlights every paragraph it passes over, and the user is left with half
the page selected.

### Column resizing took three attempts

Worth recording, because the first two fixes were the wrong diagnosis.

**First attempt** measured every column's width from the DOM on the first drag.
That was a workaround for a problem that should not exist, and the column still
jumped twenty or thirty pixels on the first move.

**Second attempt** added a ceiling and a visible handle. Both were improvements
and neither was the cause.

**The cause:** with `table-layout: fixed` and explicit widths that sum to **less**
than the table, the browser distributes the difference across all columns. So
shrinking one column handed its space to the others and their content shifted.

**The fix:** every column carries a width from the start, and the table's width
equals their sum. There is then nothing left to distribute — shrinking a column
shrinks the table, and the container scrolls.

The API for the limits comes from `mantine-react-table`, which was considered and
not adopted: it is a full table library with TanStack Table underneath, and
switching would have thrown away the mobile cards, the virtualisation on both
sides, the intents and the localisation. **The API was worth learning from; the
dependency was not worth taking.**