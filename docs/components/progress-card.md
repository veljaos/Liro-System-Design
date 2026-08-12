# ProgressCard

A card for work in progress: how much of a total is done.

## When to use

- A run with a countable total: 32 of 47 people paid, 46 of 47 invoices sent.
- Anywhere the reader needs both the share and the raw counts.

## When not to use

- **Not for a figure.** Turnover, headcount, a balance — those are `StatCard`.
  Progress needs a total to be measured against.
- **Not for a running job.** A job with phases, a log and failures is
  `JobProgress`. This card is a summary of one.
- **Not for a score.** A risk number in a range with zones is `ScoreMeter`. A
  score has thresholds; progress has an end.

## How it behaves

### The percentage is computed, never passed

```tsx
<ProgressCard
  title={{ en: 'Payroll run' }}
  description={{ en: 'March 2026' }}
  done={32}
  total={47}
  unit={{ en: 'people' }}
  badge={{ en: '4 days to the deadline' }}
/>
```

There is no `value` prop, and that is deliberate. If the card took both a
percentage and the counts, the two could disagree — "70%" above "32 of 47", which
is 68.1%. **In a payroll run that is not a cosmetic problem**; it is a card that
lies about work that has to be reported to an authority.

### Rounded down, and 100% means finished

46 of 47 is 97.87%. Rounding to the nearest would print 98%, which is harmless.
But 46.9 of 47 would print 100% on work that is **not** finished — and a person
who sees a hundred percent stops looking.

So the number is floored, with one exception: when `done >= total`, it prints
exactly 100.

### The bar carries the exact value

The bar is drawn from the unrounded percentage while the caption shows the floored
one. The eye sees that the work is nearly done; the number does not claim that it
is.

## Related

- `StatCard` — a figure without a total
- `JobProgress` — a run with phases and failures
- `ScoreMeter` — a number with thresholds
- `Checklist` — checks with outcomes rather than a count

## Why it is like this

### Why it looks like `StatCard`

Same header, same icon position, same frame. Two cards in one row should differ
only in what they carry — a figure or a progress — not in shape.

The Mantine example this replaced has a large circle breaking the top edge, which
looks good alone and wrong beside a `StatGrid`.

### Why the bar colour is not measured for contrast

The 4.5 ratio applies to text. A bar is not text, and the label above it sits on
the card surface rather than on the bar — unlike `CapacityTimeline`, where the
label *is* on the bar and the contrast had to be measured after compositing.