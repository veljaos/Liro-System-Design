# Destructive

Actions that destroy or refuse: deleting a record, rejecting an approval, voiding
a document.

Colour: `liro-red`. Every intent in this family requires confirmation.

## Intents in this family

| Intent | Default label | Weight | Confirms |
|---|---|---|---|
| `delete` | Delete | **`subtle`** | yes |
| `reject` | Reject | `light` | yes |
| `cancelDocument` | Void | `light` | yes |

Note that the most destructive action has the **quietest** weight. That is
deliberate — see "Why it is like this".

## When to use

- **`delete`** — the record disappears. Use only where deletion is genuinely
  possible; in accounting, most records cannot be deleted once posted.
- **`reject`** — a decision against, inside an approval chain. The record survives
  and carries the refusal.
- **`cancelDocument`** — voiding a document that has already left the system, by
  issuing a counter-document. The original stays untouched, because an audit trail
  requires it.

## When not to use

- **Not for "Cancel" in a dialog.** Closing a form without saving is `cancel` in
  [neutral.md](neutral.md). This is the single most common mistake with this
  family, and it is made worse by English: "Cancel" the button and "cancel" the
  document are different words in most other languages. Serbian has *Odustani*
  (give up) and *Storniraj* (void) — nobody confuses them there.
- **Not for reversing a state.** Reopening something that was closed is `caution`,
  not `destructive`. Nothing is destroyed; a door is unlocked.
- **Not as the primary action on a screen.** If red is the loudest thing on the
  page, the screen is designed around its most dangerous action.
- **Not for the destination of a bulk operation** without a count. "Delete 47
  records" is a different decision from "Delete".

## How it behaves

All three set `confirms: true`. The intent declares that confirmation is required;
the application implements the dialog.

**The colour must survive to the last click.** The confirming button in a deletion
dialog is `delete`, not `confirm`. A blue button in a red dialog reads as safe and
undoes the whole point.

In `SplitAction` menus, destructive items are the only ones that get a colour —
`status.danger.fg`, measured at **7.40** on white and **6.54** on the hovered grey
row. The rest of the menu stays in the default text colour. In a menu, colour
marks danger; it does not decorate.

## Examples

A row menu where deletion is the last item and the only coloured one:

```tsx
<SplitAction
  intent="post"
  items={[
    { intent: 'preview' },
    { intent: 'revert' },
    { intent: 'delete' },
  ]}
/>
```

An approval chain where refusal requires a reason:

```tsx
<ActionGroup>
  <ActionButton intent="reject" />
  <ActionButton intent="approve" />
</ActionGroup>
```

`reject` is placed first. The main action is always last, and here the main action
is the favourable one — the refusal must be reachable but must not be where the
hand lands by default.

A bulk bar that states the number:

```tsx
<BulkActionBar count={selected.length}>
  <ActionButton
    intent="delete"
    label={{ en: `Delete ${selected.length} records` }}
  />
</BulkActionBar>
```

## Related

- [neutral.md](neutral.md) — `cancel`, for giving up on a form
- `caution` (not yet written) — `void`, `revert`, `unlock`: hard to undo but not
  destructive
- `positive` (not yet written) — `approve`, the counterpart to `reject`

## Why it is like this

**Why `delete` is `subtle` and not `filled`.** This is the most counter-intuitive
decision in the intent catalogue, and it is the right one.

A filled red button is the most visually prominent thing that can be put on a
screen. Placing the most dangerous action there means the eye is drawn to it and
the hand follows. `subtle` gives deletion no fill and no border — it is present,
reachable, and never the first thing seen.

The safety comes from the **confirmation**, not from the loudness. Making the
button shout as well would only train users to click through the dialog.

**Why `reject` is `light` and `delete` is not.** `reject` lives in an approval
chain next to `approve`, and two actions presented as a genuine choice must have
comparable weight. If refusal were subtle and approval filled, the interface would
be nudging towards approval — which in a control process is a defect, not a
convenience.

**Why `cancelDocument` exists separately from `delete`.** In accounting a posted
document cannot be deleted. It is voided by issuing a counter-document, and both
remain in the ledger. `delete` and `cancelDocument` describe different events and
must not share an intent, because the wrong one on screen implies a capability the
system does not have.

**Why `cancelDocument` and `void` are in different families.** Both concern
cancelling a document, yet `cancelDocument` is `destructive` and `void` is
`caution`. The distinction is an accounting rule and it is **not fully recorded in
the code**. If you need to document `caution`, ask the owner rather than inferring
it — this is exactly the kind of gap where a plausible guess becomes a quoted
rule.

**A note on the English wording.** `cancelDocument` is labelled `Reverse`, not
`Void`. A storno *is* a reversing document, and the word says so; `void`, in
[caution](caution.md), discards a draft that never entered the books. They once
shared the label `Void` and were indistinguishable in English.