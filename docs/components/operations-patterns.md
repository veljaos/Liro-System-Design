# Operations patterns

Five components for the mechanics of running a business rather than for its
paperwork: `StockLedger`, `RateTable`, `SlotPicker`, `ProcessMap` and
`ItemGallery`.

Grouped for the same reason as the [business patterns](business-patterns.md):
they exist because of one decision, and separating them would repeat it five
times.

## The decision behind all five

**These are patterns, not domains.** The same display serves warehouses, fixed
assets, facility management, manufacturing and services — the configuration and
the labels differ, the shape does not.

| Component | The shape |
|---|---|
| `StockLedger` | Receipts and issues with a running balance |
| `RateTable` | A matrix where the row is the item and the column the condition |
| `SlotPicker` | Picking a free interval on a resource |
| `ProcessMap` | Steps and branches, with a marker for where the record is |
| `ItemGallery` | A set of photos with a caption |

Two of the five carry a rule that is more important than anything about their
appearance: **they do not compute.**

---

## StockLedger

A sequence of receipts and issues with a running balance.

The same display applies to a warehouse, fixed assets, a document archive and raw
materials in production.

### When to use

- Any ledger of movements in and out, where the reader follows a balance down the
  page.

### When not to use

- **Not for a list of documents.** Invoices in a period are a `DataTable`. A
  ledger is about *movements* against one item.
- **Not for a stock level.** The current quantity of an article is a figure —
  `StatCard`. The ledger is how it got there.

### How it behaves

**The balance is not computed here.** It comes from the server, and that is the
rule of the component:

> The only correct balance is the one the database computed at the moment of the
> movement.

Computing it on the client drifts the moment pagination or a filter appears — page
two would start from zero, and a filtered view would show a balance that never
existed.

```tsx
<StockLedger
  movements={movements}        /* each carries its own `balance` from the server */
  itemLabel={{ en: 'Toner HP 26A' }}
  unit={{ en: 'pcs' }}
  onMovementClick={openDocument}
/>
```

`withBalance` turns the column off for a view where the running total means
nothing — a filtered list, or a search across items.

---

## RateTable

Prices and rates as a matrix.

One component covers prices by quantity, by period, by guest category, by sales
channel and by service tier, because all of them are a matrix where the row
carries the item and the column the condition.

### When to use

- Any two-dimensional price or rate list the reader compares across.

### When not to use

- **Not for a single price per item.** That is a column in a `DataTable`.
- **Not for entering prices.** This displays. Editing a price matrix is
  `EditableGrid`.

### How it behaves

**An empty cell is a dash, not a zero.**

> Zero is a price. A dash is the absence of a price. Those are different things.

A zero would say "this costs nothing"; the dash says "this combination is not
offered". Anyone reading a price list acts differently on the two, and the
distinction is the same rule as *an empty value is a dash* in the ten rules of the
system.

---

## SlotPicker

Picking a free interval on a resource.

Reserving a hall, scheduling with an advisor, a machine service slot, assigning a
shift — all of it is the same act.

### When to use

- Choosing a time on something that can only be used by one party at a time.

### When not to use

- **Not for a calendar of events.** Showing what is scheduled is `LiroSchedule`.
  `SlotPicker` is for choosing what is not.
- **Not for a plain date.** A due date is a date field.

### How it behaves

**Availability is not computed here.** Free slots arrive from the server:

> Only the server knows about other users' simultaneous reservations. Computing
> availability on the client would allow double booking.

This is the strictest rule in the family, because the failure is silent — two
clients confirm the same hall and nothing goes wrong until someone arrives.

A component that filtered slots in the browser would look correct in every test,
including a manual one, because a single user never collides with themselves.

---

## ProcessMap

A readable display of steps and branches, with a marker for where a record is.

### When to use

- Explaining a process to someone who has to follow it.
- Showing where a specific record currently sits within it.

### When not to use

- **Not as a BPMN editor.** Deliberately not full BPMN — see below.
- **Not for the state of one record in a straight line.** That is
  `WorkflowStatus`, which is smaller and reads better for four or five states.

### How it behaves

Nodes are laid out **in array order**, and branches are labels on the connections.
There is no free positioning and no layout engine.

`ProcessDiagram` in `@liro/process` is the React Flow one, for when a real diagram
is needed. `ProcessMap` is the readable summary.

---

## ItemGallery

A set of photos with a caption.

An article in a warehouse, a room in facility management, a piece of equipment, a
sample in quality control.

### When to use

- Anywhere a record has photographs and the photograph is what the reader came
  for.

### When not to use

- **Not for attachments.** Documents, PDFs and spreadsheets are `AttachmentList`.
  This is for images that are looked at.
- **Not for a single image.** One photo is an `Image`.

### How it behaves

**Thumbnails are below the main image, not beside it.** On a narrow screen a side
strip cuts the main image in half — and that image is exactly why the gallery was
opened.

`withThumbnails` turns them off entirely when there are only two or three images.

---

## Related

- [Business patterns](business-patterns.md) — the paperwork side of the same idea
- `DataTable` — where a list of records goes
- `EditableGrid` — entering a matrix rather than displaying one
- `LiroSchedule` — what is scheduled, rather than what is free
- `ProcessDiagram` — the full diagram, when `ProcessMap` is not enough

## Why it is like this

### Two of them refuse to compute, and that is the point

`StockLedger` and `SlotPicker` both receive numbers they could plausibly work out
themselves. Both refuse.

The reason is the same in each case: **the client sees a subset and the server
sees the truth.** A balance computed from the visible page is wrong on page two.
Availability computed from the visible bookings is wrong the moment a second user
exists.

Neither failure produces an error. Both produce a number that looks right, and
that is the most expensive kind of bug a business system can have.

When a component in this system could compute something but takes it as data
instead, that is usually the reason — the same one behind `DataTable` taking its
totals from the application.

### Why `ProcessMap` is deliberately not BPMN

Full BPMN needs an editor, node layout, pools and lanes. That is a separate
product, not a component.

`ProcessMap` covers what a process diagram is most often drawn for: seeing who
does what, and where the record is now. When a real BPMN with free layout is
needed, this component gets replaced — and the investment in it is small enough
that replacing it costs nothing.

That is a deliberate trade recorded in the source, and it is worth reading as an
example of scoping: the system did not try to be a diagramming tool, and said so
in writing.

### Why these five are one file and one page

Same reasoning as the business patterns. They share the "pattern, not domain"
decision, and two of them share the "do not compute" rule. Written apart, those
two rules would appear five times and drift.

### A note on `SlotPicker` and `ItemGallery`

**The booking domain does not exist yet.** These two were written ahead of a
product that has not been built.

That is recorded here rather than hidden, because a component written for a
hypothetical use is a component nobody has tested against reality. Treat their
props as a first draft, and expect them to change when the first real screen
appears.