# DataTable

A table of records: columns, sorting, selection, row actions, a totals row, and a
card layout on a phone.

The most used component in the system, and the one with the most decisions behind
it. Most of them come from things that went wrong.

## When to use

- A list of records the user reads, sorts and acts on.
- Anywhere a total belongs under the rows — a ledger, a document's line items, a
  payroll run.
- Lists of any size. Above a few hundred rows, turn on `virtualized`.

## When not to use

- **Not for entering data.** A table the user types into is `EditableGrid`, which
  is built for keyboard-only entry and balances debit against credit. `DataTable`
  displays.
- **Not when the data comes from a resource.** `ResourceTable` wraps this one and
  handles fetching, pagination and deletion against a `DataProvider`. Reach for
  `DataTable` directly only when the rows are already in hand.
- **Not for two or three columns of key–value.** That is `KeyValueList`. A table
  header for two columns is furniture.
- **Not on a phone as a table.** It already handles that itself — see below —
  but do not fight it back into a table with horizontal scroll.

## How it behaves

### The application owns the state

`sort`, `selected` and pagination are **controlled**. The table renders them and
reports changes; it does not hold them.

The selection in particular: it survives a page change, because a user ticks three
statements on page one, two on page three, and then runs a bulk action over all
five. A table that held its own selection would lose the first three.

The checkbox column appears only when **both** `selected` and `onSelectionChange`
are given. One without the other is a mistake the type system cannot catch, and
showing checkboxes that report nowhere is worse than showing none.

### Totals come from the application

```tsx
<DataTable
  columns={columns}
  rows={rows}
  getRowId={(row) => row.id}
  footer={{ label: { en: 'Total' }, values: { amount: response.grandTotal } }}
/>
```

The table does not sum the column. As soon as pagination exists, **the total of
the current page is not the total of the account** — and the bookkeeper needs the
latter. The server knows the grand total; the table only knows what was sent to
it.

### Keyboard

**Enter opens a row, Space ticks it.** Those are not interchangeable, and the
difference is not ours to invent — a link opens with Enter only, by specification.

`aria-sort` is on the sorted header. The arrow does not exist for a screen reader.

## Examples

A ledger with a total:

```tsx
const columns: DataTableColumn<Entry>[] = [
  { name: 'date', label: { en: 'Date' }, type: 'date', sortable: true },
  { name: 'description', label: { en: 'Description' } },
  { name: 'debit', label: { en: 'Debit' }, type: 'currency', currencyCode: 'RSD' },
  { name: 'credit', label: { en: 'Credit' }, type: 'currency', currencyCode: 'RSD' },
]

<DataTable
  columns={columns}
  rows={entries}
  getRowId={(row) => row.id}
  sort={sort}
  onSortChange={setSort}
  footer={{ label: { en: 'Total' }, values: { debit: totals.debit, credit: totals.credit } }}
/>
```

Selection feeding a bulk action:

```tsx
<DataTable
  columns={columns}
  rows={invoices}
  getRowId={(row) => row.id}
  selected={selected}
  onSelectionChange={setSelected}
  isRowSelectable={(row) => row.status !== 'posted'}
/>

<BulkActionBar count={selected.length}>
  <ActionButton intent="post" label={{ en: `Post ${selected.length} invoices` }} />
</BulkActionBar>
```

`isRowSelectable` rather than filtering the rows: a posted document must stay
visible, it simply cannot be selected.

A large list:

```tsx
<DataTable
  columns={columns}
  rows={accounts}          /* 932 rows */
  getRowId={getAccountId}  /* defined outside the component - see below */
  virtualized
  maxHeight={600}
  rowHeight={44}
/>
```

## Related

- `EditableGrid` — entering data rather than displaying it
- `ResourceTable` — the same table wired to a `DataProvider`
- `BulkActionBar` — what the selection feeds
- `TablePagination` — pages under the table
- `KeyValueList` — two columns without a header
- [Resizing](resizing.md) — `resizableColumns`, and the split panel it shares its
  mechanics with
- [DetailDrawer](detail-drawer.md) — a record's detail beside the lis

## Why it is like this

### Every table rendered its rows twice

Mantine's `hiddenFrom` and `visibleFrom` **hide with CSS, but both trees are
created.** Because of that, `DataTable` built the table *and* the mobile cards on
every screen, at every size.

Measured on the chart of accounts, 932 rows:

| | INP |
|---|---|
| before | **1,592 ms** |
| after real branching through `useMediaQuery` and virtualisation on both sides | **120 ms** |

This is why the mobile layout is a real branch and not a CSS class, and why
`virtualized` covers the cards as well. Virtualising one side only is half a
solution.

It is also why `AGENTS.md` carries the rule: *do not render twice.*

### A phone is not a narrow desktop

A table with six columns on a 380 px screen is unusable however well it scrolls.
Below `sm` every row becomes a card, and the `mobile` prop describes that card.

Nobody reads horizontal scroll across five columns. Offering it is not
accessibility, it is the appearance of it.

### `virtualized` is off by default

932 rows without it create 932 DOM nodes. Under a few hundred rows, virtualisation
is pure overhead — it adds a scroll container, a fixed row height, and a class of
bug where content wrapping to a second line overlaps the next row.

So it is a decision the application makes, per screen, with a condition attached:
**all rows must be the same height.** If content wraps, raise `rowHeight` or turn
it off.

### `getRowId` must be defined outside the component

```tsx
/* Wrong - a new function on every render */
<DataTable getRowId={(row) => row.id} … />

/* Right */
const getRowId = (row: Account) => row.id
```

Written inline it is a new function on every render, which breaks every `useMemo`
that depends on it. This was a real bug in `ResourceTable`, and it is one of three
of its kind recorded in `AGENTS.md` — the same mistake as the chart formatters and
the effect dependency in `TableOfContents`.

The counting of selectable rows is a single pass without building arrays, for the
same reason: a virtualised table renders on every scroll frame, and two
`filter`+`map` passes over 932 rows per frame are felt.

### An empty value is a dash

Not an empty cell. Without the dash you cannot tell *no data* from *the field
failed to load*, and in a ledger those two are not the same thing at all.