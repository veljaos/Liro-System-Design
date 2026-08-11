# Caution

Actions that are hard to undo but destroy nothing in the system of record:
unlocking a closed state, reverting a step, voiding a draft.

Colour: `liro-orange`. All three require confirmation.

## Intents in this family

| Intent | Default label | Weight | Confirms |
|---|---|---|---|
| `unlock` | Unlock | `light` | yes |
| `revert` | Revert | `light` | yes |
| `void` | Void | `light` | yes |

## When to use

- **`unlock`** — reopens something that was closed: a locked period, a finalised
  record, a field the workflow had frozen.
- **`revert`** — takes a record one step back in its workflow. Posted becomes
  unposted, approved becomes pending.
- **`void`** — discards a document that **has not been finalised**. A draft, an
  unposted entry, a form the user filled in and no longer wants.

## When not to use

- **`void` is not `cancelDocument`.** This is the distinction that matters most in
  this family, and it is an accounting rule rather than a design preference — see
  below.
- **Not for deleting.** Nothing here removes a record from the database.
  `unlock` and `revert` change a state; `void` discards work that never became a
  record in the official sense.
- **Not for "Cancel" in a form.** Abandoning an unsaved form is `cancel`, in
  [neutral.md](neutral.md).
- **Not as a primary action.** If orange is the loudest thing on a screen, the
  screen is built around its most reversible-but-awkward action.

## How it behaves

All three are `light` and all three confirm.

Light rather than filled because none of them is why the user opened the screen —
they are exits from a state the user did not want to be in. Confirming because all
three are awkward to undo: reverting a posted document creates work, and voiding a
draft loses what was typed.

## Examples

Reopening a closed accounting period:

```tsx
<ActionGroup>
  <ActionButton
    intent="unlock"
    disabledReason={{ en: 'Only an administrator can reopen a closed period.' }}
    disabled={!user.can('period.unlock')}
  />
</ActionGroup>
```

A draft the user no longer wants:

```tsx
<ActionGroup>
  <ActionButton intent="void" />
  <ActionButton intent="save" />
</ActionGroup>
```

Stepping a document back, offered next to the action that moved it forward:

```tsx
<SplitAction
  intent="post"
  items={[
    { intent: 'preview' },
    { intent: 'revert' },
  ]}
/>
```

## Related

- [destructive.md](destructive.md) — `cancelDocument`, for a document that is
  already in the books
- [positive.md](positive.md) — `post` and `approve`, the actions `revert` undoes
- [neutral.md](neutral.md) — `cancel`, for abandoning a form

## Why it is like this

### `void` and `cancelDocument` — the line, and why it is not where you expect

Both words mean cancelling a document. They sit in different families, and the
naive reading gets it backwards.

**`void` (Poništi) — `caution`.** Used for a document that has **not yet been
finalised**. Voiding it leaves no trace: nothing was ever in the books, so there is
nothing to correct. It is `caution` because **the user permanently loses the work
they typed**, and the system should say so before it happens.

**`cancelDocument` (Storniraj) — `destructive`.** Used **only** for a document
that has already gone through — finalised, posted, present in the system. Such
documents are almost never deleted, and few people have the right to delete them
at all. To cancel one, a **storno** is issued: the system creates a new, reversing
document, and both remain in the ledger.

Now the part worth reading twice:

> `void` destroys the user's work and creates nothing. `cancelDocument` destroys
> nothing and creates a new document. And yet `void` is `caution` while
> `cancelDocument` is `destructive`.

**The family is chosen by the effect on the system of record, not by how much data
disappears.** `void` throws away a draft — painful for the person, invisible to the
books. `cancelDocument` changes what the books say, and that is what
`destructive` marks.

Anyone who sorts these by "how much is lost" will put them in the wrong families.

**A note on the English wording.** Both intents once carried the label `Void`,
which made them two identical buttons in an English interface. `cancelDocument`
is now labelled **`Reverse`** — a storno *is* a reversing document, so the word
says what happens. The Serbian labels were always distinct: *Poništi* and
*Storniraj*.

### Why all three confirm although nothing is destroyed

A confirmation is not a warning about deletion. It is a pause before an action
whose reversal is **work**.

Reverting a posted entry means the ledger changes, and every report built on it
changes with it. Unlocking a closed period means numbers that were final are
editable again. Voiding a draft means retyping.

None of those loses a record. All three cost someone an afternoon.

### Why light and not filled

These actions appear on screens whose purpose is something else. A user opens a
posted document to look at it, print it, or send it — not to unpost it. Making the
exit from a state as loud as the state's own actions would put the awkward path in
the reader's eye first.