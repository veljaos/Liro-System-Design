# DetailDrawer

The detail of one record, in a panel beside the list it came from.

## The reason it exists

**Context.** A user reading a hundred invoices clicks one. A full page loses the
table, the scroll position, the filter, and their place in the list — and getting
back costs a navigation.

A panel keeps all of it: look, approve, close, carry on down the table. Or do not
even close it — the arrows move to the next record.

## When to use

- Reviewing a queue: invoices for approval, documents for signing, tickets.
- Anywhere the user's next action is *the next record*, not *this record in
  depth*.

## When not to use

- **Not for editing.** This is a reading view. Its actions can approve, reject,
  post — but the fields are not edited here. When a record needs editing, the
  drawer's action navigates to the page: a long form needs an address, and a
  drawer has none. See [navigation patterns](../navigation-patterns.md).
- **Not for a form.** `FormDrawer` is the form in a drawer, and it validates,
  guards against leaving, and submits. This does none of that.
- **Not for a record with forty fields.** If the panel needs to scroll twice, the
  record wants a page.

## How it behaves

```tsx
<DetailDrawer
  opened={selected !== null}
  onClose={() => setSelected(null)}
  title={record.number}
  subtitle={record.client}
  onPrevious={hasPrevious ? previous : undefined}
  onNext={hasNext ? next : undefined}
  actions={
    <>
      <ActionButton intent="reject" />
      <ActionButton intent="approve" />
    </>
  }
>
  <KeyValueList items={items} />
</DetailDrawer>
```

### Three defaults that are the opposite of a normal drawer

**No overlay.** The point is that the table stays visible and usable behind the
panel. An overlay would dim the very context this component exists to keep, and
would swallow the click that selects the next row.

**Focus is not trapped.** For the same reason: the user must be able to tab back
into the table. `Escape` still closes.

**Scroll is not locked.** The list behind can still be scrolled.

Every one of those is off by default in Mantine's `Drawer` for good reasons — for
a modal drawer. This is not a modal drawer.

### Moving through the list

`onPrevious` and `onNext` are what make the component worth having. Without them
the user closes the panel, finds the next row, and opens it again — which is the
navigation the panel was supposed to remove.

**The up and down arrows do the same**, so someone checking forty invoices never
reaches for the mouse between them. Down and up rather than left and right,
because the movement is through rows of a table.

They are **ignored while the focus is in a field**. Otherwise the arrows would
jump to the next record instead of moving the cursor, which is what a user already
expects from an input.

### Actions stay put

The content scrolls; the actions do not. On a long record the approve button must
not be somewhere below the fold — the same reasoning as
`RecordFormTemplate`, which puts actions at the top and the bottom.

## Related

- `FormDrawer` — the same shape, for a form
- `DataTable` — the list this sits beside
- `BulkActionBar` — when the action is on many records rather than one
- [Navigation patterns](../navigation-patterns.md) — modal, drawer, or page

## Why it is like this

### Why not just a modal

A modal is a decision about one record, in isolation. This is a decision about one
record *in a queue*, and the queue is the context that makes the decision
possible: what came before, what is next, how many are left.

That is why the panel does not dim the list, and why the arrows are on the header
rather than being something the application has to build.

### Why the title takes a plain string as well as a label

`title` accepts `LocalizedLabel | string`, which is unusual in this system.

A record's number is **data** — `2026-0417` — not a system label. Forcing it
through translation would mean wrapping every invoice number in `{ sr: … }`, which
says nothing and reads as noise at the call site.