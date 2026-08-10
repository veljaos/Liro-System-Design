# Verify

Actions that involve someone outside your system: certifying, signing, sending to
an authority, synchronising with an external service.

Colour: `liro-teal`. Deliberately close to blue and deliberately not blue — these
actions look like "continue forward" but they have a consequence outside the
application.

## Intents in this family

| Intent | Default label | Weight | Confirms |
|---|---|---|---|
| `verify` | Verify | `filled` | no |
| `sign` | Sign | `filled` | **yes** |
| `send` | Send | `filled` | **yes** |
| `sync` | Sync | `light` | no |

## When to use

- **`verify`** — an internal check or certification that a document is correct
  before it leaves. Nothing leaves the system yet.
- **`sign`** — applying a qualified electronic signature. The signature is a legal
  act.
- **`send`** — the document goes to an external recipient: a client, a tax
  authority, an e-invoicing system.
- **`sync`** — pulls or pushes data against an external service. Repeatable and
  without legal consequence.

## When not to use

- **Not for submitting a form to your own backend.** That is `submit` in
  [primary.md](primary.md). The line is the **destination**: your own system is
  `primary`, someone else's is `verify`.
- **Not for the outcome of sending.** After a document is sent and accepted, the
  state change is `positive` — "Posted", "Approved". `verify` covers the act, not
  the result.
- **Not for printing or exporting.** A PDF that a user downloads has not been sent
  anywhere; that is the `document` family.
- **`sync` is not `refresh`.** `refresh` re-reads your own data and is `neutral`.
  `sync` talks to an external service. If nothing leaves the process, it is
  `refresh`.

## How it behaves

`verify`, `sign` and `send` are `filled`. `sync` is `light`, because it is usually
one of several controls in a toolbar rather than the point of the screen.

**`sign` and `send` set `confirms: true`.** The intent declares that confirmation
is required; the application still has to implement the dialog. The flag is a
statement of policy, not an implementation.

Both are irreversible in practice. A signature cannot be unsigned, and an invoice
delivered to an e-invoicing system cannot be recalled — it can only be voided by a
new document, which is what `cancelDocument` and `void` are for.

## Examples

A document screen where actions unlock in sequence:

```tsx
<ActionGroup>
  <ActionButton intent="pdf" />
  <ActionButton intent="verify" />
  <ActionButton
    intent="sign"
    disabled={document.status !== 'verified'}
    disabledReason={{ en: 'The document must be verified before signing.' }}
  />
</ActionGroup>
```

The disabled state with a reason is doing the teaching here. A user who cannot
sign yet learns *why*, and learns the order of the workflow from the interface
rather than from a manual.

Sending with alternatives that are used rarely:

```tsx
<SplitAction
  intent="send"
  primary
  items={[
    { intent: 'preview' },
    { intent: 'pdf', label: { en: 'Send as PDF' } },
    { intent: 'save', label: { en: 'Save as draft' } },
    { intent: 'cancelDocument' },
  ]}
/>
```

`SplitAction` menu items are intents, not free-form entries, so the menu cannot
show an action that does not exist in `intents.ts`.

Sync as a quiet toolbar control:

```tsx
<ActionGroup>
  <ActionButton intent="sync" loading={syncing} />
  <ActionButton intent="filter" />
</ActionGroup>
```

## Related

- [primary.md](primary.md) — moving a record forward inside your own system
- `positive` (not yet written) — the outcome after sending succeeded
- `caution` (not yet written) — undoing something that was sent

## Why it is like this

**Why teal and not blue.** These actions feel like "continue" to the user, and
that is the danger. Signing and sending have consequences that the application
cannot take back. A separate colour, close enough to blue to belong to the same
forward motion but distinct enough to notice, marks the moment where the
consequence leaves the building.

**Why `verify` does not confirm but `sign` does.** `verify` is internal and
repeatable — you can verify again. `sign` produces a legal artefact. The rule is
the reversibility of the action, not its importance.

**Why `sync` is light while its siblings are filled.** `sync` is not the purpose
of any screen. It appears alongside filters and refresh in a toolbar, and a filled
teal button there would compete with the actual primary action.

**Contrast.** White on `teal[6]` measures **4.57** — it clears 4.5, but with very
little margin. If the teal ramp is ever adjusted, **measure it again**; do not
assume. Teal and blue (4.53) are the two tightest filled colours in the system.

**Domain note.** This family carries the most Serbian-specific reasoning in the
system, because the workflow it describes — verify, sign with a qualified
certificate, send to the e-invoicing system — comes from that market's rules. The
*intents* are generic; the *sequence* is not. When another market is added, expect
the sequence to differ and the intents to stay.