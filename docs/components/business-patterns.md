# Business patterns

Four components that cover the shape of almost any business system:
`WorkflowStatus`, `ApprovalChain`, `Checklist` and `ScoreMeter`.

They are grouped on one page because they exist for one shared reason, and
separating them would repeat that reason four times.

## The decision behind all four

**Components are not built by domain.**

Enumerating domains — hospitality, KYC, AML, manufacturing, research — produces a
list that is never finished, and code that gets duplicated because a "KYC check"
was written separately from "quality control" even though they are the same
thing.

What actually repeats is the **pattern**:

| Pattern | Component |
|---|---|
| A status flow — draft → submitted → approved → closed | `WorkflowStatus` |
| An approval chain — who confirmed, who is next, who rejected | `ApprovalChain` |
| A checklist — a set of checks with an outcome and evidence | `Checklist` |
| A score — a number in a range with zones and a decision threshold | `ScoreMeter` |

A hotel reservation, a client KYC check, a manufacturing order and a research
grant application use these same four. Only the configuration and the labels
differ.

That is why all four are **data-driven and know nothing about accounting**:
tomorrow a new domain is *described*, not programmed.

---

## WorkflowStatus

Where a record is in its lifecycle.

### When to use

- Any record that moves through named states, on a detail screen.
- Horizontally when there are up to about five steps; vertically when steps carry
  explanations and timestamps.

### When not to use

- **Not for a form the user is filling in.** That is `FormWizard`, which validates
  each step and guards against leaving. `WorkflowStatus` displays a state; it does
  not drive one.
- **Not for progress in time.** A payroll run that is 68% complete is
  `ProgressCard` or `JobProgress`. A flow has named states, not a percentage.
- **Not for two states.** Draft and posted is a `RecordStatusBadge`. A flow with
  two steps is furniture around a badge.

### How it behaves

`currentId` says where the record is; every earlier step is computed as done and
every later one as upcoming.

`states` overrides that computation, and it exists because **real flows are not
straight lines.** A step can be skipped, and a step can fail while the record
moves on:

```tsx
<WorkflowStatus
  currentId="verification"
  states={{ documents: 'done', screening: 'failed' }}
  steps={[
    { id: 'documents', label: { en: 'Collect documents' }, meta: '02.04.2026 · Ana Jovanović' },
    { id: 'screening', label: { en: 'Sanctions screening' },
      description: { en: 'Match on a sanctions list — further checks needed.' } },
    { id: 'verification', label: { en: 'Beneficial owner' } },
    { id: 'decision', label: { en: 'Decision on the relationship' } },
  ]}
  orientation="vertical"
/>
```

`meta` is **already formatted** by the application. The component does not decide
how a date looks — that belongs to `@liro/i18n` and to the user's format
preferences.

---

## ApprovalChain

Who confirmed, who is next, who rejected and why.

### When to use

- Any record that needs a decision from one or more named people.
- Wherever the *history* of the decision matters as much as the outcome.

### When not to use

- **Not for a single approve/reject pair of buttons.** Those are `ActionButton`
  with `approve` and `reject`. The chain shows the record of decisions, not the
  controls.
- **Not for an audit trail.** Every change to a record is `AuditTrail`. The chain
  is only about decisions.

### How it behaves

`requiresAll` distinguishes the two policies that exist in practice: everyone must
approve, or one approval is enough. Both are common and neither can be the
default — so it is a prop, and the screen states which it is.

A rejection carries `comment`, and the reason for that is a rule rather than a
convenience: **a refusal without a justification is a decision nobody can act
on.** The person whose document was rejected has to know what to fix.

```tsx
<ApprovalChain
  requiresAll
  entries={[
    { id: '1', name: 'Ana Jovanović', role: 'Bookkeeper',
      decision: 'approved', decidedAt: '02.04. 09:14' },
    { id: '2', name: 'Marko Petrović', role: 'Manager', decision: 'rejected',
      decidedAt: '02.04. 11:02', comment: 'The delivery note for line 3 is missing.' },
    { id: '3', name: 'Jelena Nikolić', role: 'Director', decision: 'pending' },
  ]}
/>
```

---

## Checklist

A set of checks, each with an outcome and evidence.

One component covers a client KYC/AML check, quality control on a manufacturing
order, incoming goods inspection and a documentation audit — because in all four
cases it is the same thing.

### When to use

- Any set of checks where each one passes, fails, warns, is pending, or does not
  apply.
- Wherever a check needs evidence attached to it — a document, a date, a source.

### When not to use

- **Not as a to-do list.** These are checks with an *outcome*, not tasks the user
  ticks off. A list of things to do is a table with a checkbox column.
- **Not for form validation.** A field that is filled in wrongly reports next to
  the field. The checklist is about the record as a whole.

### How it behaves

Five outcomes: `pass`, `fail`, `warning`, `pending`, `na`.

`na` — "does not apply" — is not the same as "not yet checked", and mixing the two
is the most common mistake here. A check for legal entities is `na` for a natural
person; it is never going to be answered, and it must not count against the set.

**`blocking` exists because not all checks are equal.** One unfinished blocking
check means the whole set has not passed, regardless of how many others did:

```tsx
<Checklist
  groups={[
    { title: { en: 'Identification' }, items: [
      { id: '1', label: { en: 'Identity document provided' }, outcome: 'pass',
        detail: 'ID card, valid until 2031.', blocking: true },
      { id: '2', label: { en: 'Photograph compared' }, outcome: 'warning',
        detail: 'Poor lighting, needs re-checking.' },
    ]},
    { title: { en: 'Risk screening' }, items: [
      { id: '3', label: { en: 'Sanctions list' }, outcome: 'fail',
        detail: 'Name match — needs manual review.', blocking: true },
      { id: '4', label: { en: 'Corporate checks' }, outcome: 'na',
        detail: 'Not applicable — natural person.' },
    ]},
  ]}
  onItemClick={openEvidence}
/>
```

The summary counts only relevant items — `na` is excluded from both the numerator
and the denominator, because a check that will never be answered must not make the
set look incomplete.

---

## ScoreMeter

A number in a range, with zones and a decision threshold.

Client risk in AML, creditworthiness, a supplier rating, project health in
research — all of them are the same shape.

### When to use

- Any computed number whose *zone* is what the reader acts on.
- Wherever the reader needs to know not just the number but what produced it —
  that is `factors`.

### When not to use

- **Not for a plain figure.** Turnover, a count of employees, a balance — those
  are `StatCard`. A score has thresholds; a figure does not.
- **Not for progress.** 68% of a payroll run is not a score. See `ProgressCard`.
- **Not for a ratio of a whole.** That is a `RingProgress` or a donut.

### How it behaves

**Zones are data, not built in.** The thresholds differ by regulation and by
company, and the component assumes none of them:

```tsx
<ScoreMeter
  value={72}
  label={{ en: 'Client risk level' }}
  description={{ en: 'Computed per the internal methodology, version 3.' }}
  bands={[
    { upTo: 33, label: { en: 'Low' }, tone: 'success' },
    { upTo: 66, label: { en: 'Medium' }, tone: 'warning' },
    { upTo: 100, label: { en: 'High' }, tone: 'danger' },
  ]}
  factors={[
    { label: { en: 'Cash-intensive activity' }, weight: 25 },
    { label: { en: 'Ownership structure outside the EU' }, weight: 18 },
    { label: { en: 'Long-standing relationship' }, weight: -12 },
  ]}
/>
```

**`upTo` is inclusive.** A score of exactly 33 is "Low". This follows the
convention in risk scoring — bands are `[0,33]`, `(33,66]`, `(66,100]` — and it is
the reason the prop is called `upTo` rather than `below`.

`factors` accepts negative weights, because a score is rarely only a sum of bad
things. A long-standing relationship lowers risk, and hiding that would make the
number look arbitrary to the person who has to defend it.

`description` exists for the same reason: a risk score with no stated methodology
is a number somebody will be asked to justify to a regulator.

---

## Related

- `StepWizard` · `FormWizard` — driving a flow rather than displaying one
- `ProgressCard` · `JobProgress` — progress in time, not named states
- `RecordStatusBadge` — a single state, without a flow
- `AuditTrail` — every change, not only decisions
- [Intent families](../intents/README.md) — the buttons these screens carry

## Why it is like this

### Why one file and one page

The four are separate components with separate props, but they answer one
question together: *what shape does a business process have?* Documented apart,
the reason each is data-driven would be written four times — and four copies of a
reason drift until they contradict each other.

The catalog entry `pattern-thinking` says the same thing in one paragraph, and it
is the entry to read before using any of the four.

### Why they know nothing about accounting

Not tidiness. It is the difference between a design system and a product.

The moment `Checklist` knows what a VAT return is, it stops being usable for
incoming goods inspection — and the next domain gets a second component that does
80% of the same thing. `AGENTS.md` names that as debt rather than contribution.

### Why the labels are `LocalizedLabel` and the metadata is a string

`label` and `description` are text of the **system** and go through translation.
`meta`, `decidedAt` and `detail` are **data** — already formatted by the
application, which knows the user's date format and the record's actual content.

The component never formats a date. That belongs to `@liro/i18n`, and doing it
here would produce two different date formats on one screen.