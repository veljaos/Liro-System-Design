# Feedback and state

`JobProgress`, `ConflictBanner`, `StatCard`, `LiroSchedule` — telling the user
what is happening.

## JobProgress

A job running on the server: phases, progress, and what failed.

### Why it exists

Bulk processing takes minutes. **Without feedback the user does not know whether
the job is working, how much is left, or what to do when it fails — so they start
it again. And again.**

That is the failure this component prevents, and it is expensive: a payroll run
started three times is three times the work on the server and a support call
afterwards.

### It does not call the server

The application decides how to track the job — polling with `useCall`, Supabase
realtime, server-sent events — and passes in the state.

A component that fetched would force one of those three on every application, and
none of them is right everywhere.

### Related

`ProgressCard` is the summary of one job. `JobProgress` is the job itself, with
phases and failures.

---

## ConflictBanner

Two people edited the same record.

### The default way out is reloading, not overwriting

Because at that moment **the user does not know what the other side changed.**
Offering "overwrite" as the obvious button invites someone to destroy a
colleague's work without seeing it.

`onOverwrite` exists for cases where the application knows it is safe. It is never
offered as the first choice and never highlighted — the same reasoning that makes
`delete` `subtle` rather than filled.

---

## StatCard and StatGrid

A figure with an optional change against the previous period.

### `invertDiff`, because growth is not always good news

Turnover up 12% is good. Cost up 12% is not. Without `invertDiff` a cost overrun
would be green, and green means *this is fine*.

The colour is a statement about the business, not about the arithmetic.

### When not to use

- **Not for progress.** A figure against a total is `ProgressCard`.
- **Not for a score.** A number with thresholds is `ScoreMeter`.
- **Not for a chart.** If the shape over time is the point, the figure belongs
  beside a `LiroSparkline`, not alone.

---

## LiroSchedule

A calendar of deadlines and payroll runs.

### The colour comes from `kind`, not from the caller

Mantine's `Schedule` requires a colour for every event. **If that decision is left
to the caller, the calendar gets two different colour schemes in two modules and
stops being readable.**

So `kind` — the type of event — exists here, and the colour is a consequence.
Exactly the same reasoning as `intent` on a button, applied to a calendar.

Only a statutory deadline is a solid block. Everything else is quieter, because a
month with twenty solid blocks tells the reader nothing about which one matters.

### A prop that did nothing

`readOnly` was accepted and ignored. It is worth remembering as one of two inert
props found in this system — `withTooltip` on `LiroHeatmap` was the other.

Both passed every check, because a prop that does nothing breaks no test. **A prop
is verified by using it, not by reading its type.**

## Related

- `ProgressCard` — a summary of a job
- `BulkActionBar` — where a bulk job usually starts
- `CapacityTimeline` — occupancy rather than events
- `notice` — a message about one action, not a running job