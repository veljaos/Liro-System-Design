# Dates and periods

`DateText`, `DateRangeText`, `DueDate`, `PeriodPicker` and
`AccountingPeriodSelect` — displaying and choosing dates.

## The rule underneath all of them

**A date is a `YYYY-MM-DD` string, not a `Date`.**

No `dayjs`, no time zones, and no off-by-one days. A `Date` created from
`'2026-03-01'` in Belgrade is the 29th of February at 23:00 UTC — send that to a
database and March starts in February.

`@liro/dates` has no date library as a dependency, and that is the reason.

## DateText and DateRangeText

Always `DD.MM.YYYY.` with a **trailing dot**, because that is how a date is
written in a Serbian document.

**An empty value is a dash**, never blank space, so there is a visible difference
between *no date* and *did not load*.

> This is the one place where a format is currently hardcoded. It becomes a user
> preference in the internationalisation work — see the handover. The trailing
> dot is Serbian convention and will not apply to every locale.

## DueDate

A deadline the reader has to act on.

On a list of two hundred invoices, the operator needs to **see** what is overdue,
not calculate it. `DueDate` states the date and its status together, so nobody
subtracts dates in their head down a column.

## PeriodPicker and AccountingPeriodSelect

Two components, and the difference is the reason both exist:

| | |
|---|---|
| `PeriodPicker` | any period — a month, a quarter, a free range |
| `AccountingPeriodSelect` | **the period a payroll run is for** |

They answer different questions. **Payroll is not run for a calendar month** — the
run for March may be paid in April and reported against March, and a calendar
picker cannot express that.

Two components rather than a prop, because merging them would produce one
component that is wrong half the time.

### One thing that is still hardcoded

`PeriodPicker` sets `firstDayOfWeek={1}`. It passes everywhere and disagrees with
the user's preference the moment that preference exists — `LiroDatesProvider`
already says in its own comment that this must not be a fixed value.

It is recorded as open work in the handover.

## Related

- `LiroSchedule` — a calendar of what is scheduled
- `CapacityTimeline` — occupancy over a date axis
- `AutoForm` — a `date` field, which accepts what an operator actually types
- `AGENTS.md` — the date rule this package depends on

## Why parsing is forgiving

`parseSerbianDate` accepts `010326`, `1.3.2026` and `01/03/2026`, because that is
what an operator types. Two-digit years: up to 69 is the 2000s, from 70 the
1900s.

The alternative — rejecting anything that is not the canonical format — makes the
user do the computer's work, on every row of a hundred-line entry.