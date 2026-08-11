# Positive

Closing a record with a favourable outcome: approving it, posting it, finishing
it, exporting the result.

Colour: `liro-green`. Green means **an outcome**, not importance and not success
of the click.

## Intents in this family

| Intent | Default label | Weight | Confirms |
|---|---|---|---|
| `approve` | Approve | `filled` | **yes** |
| `post` | Post | `filled` | **yes** |
| `complete` | Complete | `filled` | no |
| `excel` | Excel | `light` | no |

## When to use

- **`approve`** — a decision in favour, inside an approval chain. The record moves
  on to someone else.
- **`post`** — the document enters the general ledger. Balances and stock change.
- **`complete`** — the user is finished entering. The record stops being a draft
  in their own hands.
- **`excel`** — exports the data as a spreadsheet.

## When not to use

- **Not for moving a record forward.** "Save", "Submit", "Next" are `primary`. The
  distinction is **direction, not importance**: `primary` moves a record *along*,
  `positive` *closes* it with a favourable result. This is the most common intent
  mistake in the system.
- **Not for sending to an authority.** That is `verify`. Posting to the ledger is
  internal; filing a VAT return is not.
- **`excel` is not `pdf`.** Excel produces **data** to work on further; PDF
  produces a **document** to read or file. See [document.md](document.md).
- **Not as a colour for "it worked".** Green here marks the *kind of action*, not
  the outcome of a click. Feedback after the fact is a notification, not a button.

## How it behaves

`approve`, `post` and `complete` are `filled`. `excel` is `light`, because
exporting sits in a toolbar next to filters rather than being the point of the
screen.

**`approve` and `post` set `confirms: true`. `complete` does not**, and that
difference is the whole design of this family — see below.

The intent declares that confirmation is required; the application implements the
dialogue.

## Examples

An approval chain, where refusal must be reachable but must not be where the hand
lands:

```tsx
<ActionGroup>
  <ActionButton intent="reject" />
  <ActionButton intent="approve" />
</ActionGroup>
```

A document that can only be posted once it has been checked:

```tsx
<ActionGroup>
  <ActionButton intent="excel" />
  <ActionButton
    intent="post"
    disabled={document.status !== 'verified'}
    disabledReason={{ en: 'The document must be verified before it can be posted.' }}
  />
</ActionGroup>
```

**Posting in bulk — one confirmation, not forty:**

```tsx
<BulkActionBar count={selected.length}>
  <ActionButton
    intent="post"
    label={{ en: `Post ${selected.length} invoices` }}
  />
</BulkActionBar>
```

## Related

- [primary.md](primary.md) — moving a record forward rather than closing it
- [verify.md](verify.md) — sending outside the organisation
- [caution.md](caution.md) — `revert`, undoing what this family did
- [document.md](document.md) — `pdf`, producing a document rather than data

## Why it is like this

### Why `complete` does not confirm and the other two do

**`complete` is a safe action.** It tells the system: *I have finished typing.*
The document does not leave the user's own yard, it does not enter the official
books, and it is usually easy to put back into draft if a mistake is spotted.
There is no permanent consequence, so there is no reason for the system to
interrupt.

**`approve` and `post` are points of no return, or of expensive return.**

`approve` **changes ownership.** You are agreeing that the document moves on to
someone else, and that someone acts on it.

`post` puts the document **into the general ledger.** It affects balances, stock
levels, and every report built on them. A mistake is not a click to undo; it is
real work to correct — and in accounting the correction is itself a new document,
because the original may not be erased. See [caution.md](caution.md) and
[destructive.md](destructive.md).

So the rule in this family is not importance and not colour. It is **how
expensive the mistake is to undo.**

### Confirmation does not scale, and that is a known limit

A serious accountant posting forty invoices cannot be asked forty times. A dialogue
that appears on every item stops being read by the third one, and then it is worse
than no dialogue at all — it trains the user to click through.

The answer is **not** to drop `confirms` from `post`. It is to move the
confirmation up a level: one dialogue for the whole selection, stating the count.
`BulkActionBar` exists for that, and the example above shows the shape — the
button carries the number, so the dialogue that follows is about a specific,
countable act.

Anything larger than a selection — posting a whole period, an overnight run — is
not a button at all. It is a job, with `JobProgress`, a record of what was
processed, and a way to see what failed.

### Why `excel` is light and green rather than filled or violet

Green because it produces an **outcome** — the finished data. Light because it is
never why the user opened the screen. It sits beside `filter` and `refresh`, and a
filled green button there would compete with the action that actually closes the
record.