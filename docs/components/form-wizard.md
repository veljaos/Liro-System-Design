# FormWizard

One record filled in over several steps, on a full page — with a draft, a guard
against leaving, and a return to the step that failed.

## When to use

- A record with enough fields that one page would be a wall: a new employee, a
  client with tax details and bank accounts.
- Anywhere the entry is likely to be interrupted and resumed.

## When not to use

- **Not for a process.** Sign, then submit, then wait for the server is
  `StepWizard` in `@liro/ui`. See the difference below — it is the reason both
  exist.
- **Not for a short form.** Four fields split into two steps is ceremony.
- **Not in a modal.** A wizard needs an address; see
  [navigation patterns](../navigation-patterns.md).

## The difference from `StepWizard`

| | `FormWizard` | `StepWizard` |
|---|---|---|
| What the steps are | **one record**, filled in over several sessions | **a process**, several actions in sequence |
| Draft | yes | no |
| Guard on leaving | yes | no |
| Return to a failed step | yes | no |

Two components rather than one prop, because a process has nothing to draft: you
cannot half-sign a document.

## How it behaves

Three rules the component enforces, and each answers a failure mode:

**Only the current step is validated while moving forward.** An error in a step
the user has not reached yet is not an error — it is a field not filled in yet.
Validating everything from the start puts red on fields nobody has seen.

**The whole record is validated on the last step.** Nothing passes unchecked
because the user skipped backward and forward.

**When validation fails on an earlier step, the user is taken there.** A disabled
Submit with no visible reason is the worst possible outcome: the user sees a
button they cannot press and no explanation anywhere on the screen.

### `isDirty` and the trap in it

`isDirty` compares against `defaultValues`. **A field missing from `defaultValues`
is dirty forever** — the guard then fires on a form nobody touched, and the user
learns to dismiss it.

Every field in the schema needs an entry in `defaultValues`, even an empty string.

## Related

- `AutoForm` — the same schema on one page
- `StepWizard` — a process rather than a record
- `RecordFormTemplate` — the page around either of them
- [Navigation patterns](../navigation-patterns.md) — why a full page and not a modal

## Why it is like this

### Why the draft is in the component and not in the application

Because the failure it prevents is invisible until it happens: a browser tab
closed after twenty minutes of typing. An application that has to remember to
implement the draft on every wizard will implement it on some.

### Why leaving is guarded rather than blocked

The user is allowed to leave — they are told what they will lose. Blocking would
mean a form that cannot be escaped, which is worse than losing the entry.