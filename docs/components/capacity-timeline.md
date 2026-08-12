# CapacityTimeline

Who or what is occupied, and when: bars on a date axis, in lanes.

## When to use

- Allocation over time — people on projects, machines on orders, rooms on
  bookings.
- Anywhere the reader's question is *when, exactly*.

## When not to use

- **Not for a calendar of events.** Named events at times are `LiroSchedule`.
  This is about occupancy of a resource.
- **Not for a process.** Steps with states are `WorkflowStatus`.
- **Not for one bar.** A single period is a date range, not a timeline.

## How it behaves

### It takes real dates and computes the layout itself

The previous version took shares from 0 to 1 and had no date axis. That felt
flexible, and it was worse: **it forced every application to compute positions
itself**, and left the user without an answer to the question they came with.

In return for taking dates, the component gained what was missing: an axis with
ticks, a marker for today, a scale switch, horizontal scroll independent of the
label column, and overlaps shown across multiple lanes rather than one bar over
another.

```tsx
<CapacityTimeline
  rows={[
    { id: '1', label: 'Ana Jovanović', bars: [
      { id: 'a', from: '2026-04-01', to: '2026-04-12', label: 'Payroll', tone: 'info', progress: 60 },
    ]},
  ]}
  from="2026-04-01"
  to="2026-04-30"
/>
```

### Progress is a strip at the bottom, not a wash over the bar

This is the accessibility decision that made the component fail its own tests
while every token was correct.

The progress used to be an overlay across the full height of the bar, at 25%
opacity, **underneath the label**. The label is `tone.fg` — but the background
under it was no longer `tone.bg`; it was `tone.bg` with 25% of `tone.solid` mixed
in:

| tone | without the wash | with it |
|---|---|---|
| info | 5.04 | **3.65** |
| success | 4.69 | **3.36** |
| premium | 4.95 | **3.56** |

Lowering the opacity does not fix it — at 0.10, success is still 4.12.

Moving the progress to a 3px strip at the bottom leaves the label on clean
`tone.bg`, and every tone passes.

It is also the better display: a 25% wash across the whole bar reads as a *second
period inside the first*, which is exactly the misreading the catalog entry warns
about — the fill is progress of the task, not time.

## Related

- `LiroSchedule` — named events rather than occupancy
- `ProgressCard` — progress without a time axis
- `SlotPicker` — choosing free time rather than showing taken time

## Why it is like this

### The date arithmetic is local, not from `@liro/dates`

`@liro/dates` already imports `@liro/ui`, because `DueDate` uses `StatusBadge`.
Importing it back would create a circular dependency between packages.

The functions are pure and small. If more components need them, they move into a
`@liro/datemath` package that depends on nothing — which is the shape the token
package already has.

This is recorded in the source as a comment, and it is worth knowing as the one
place where a small duplication was chosen over a dependency cycle.

### The general rule this component produced

**Contrast is measured after layers composite, not from the declared colour.**

Every token here was correct. The failure came from a translucent layer changing
what was underneath the text. That rule is now in `AGENTS.md`, and it came from
this component.