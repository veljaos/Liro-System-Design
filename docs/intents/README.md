# Intent families — documentation

Seven families, 33 intents, defined in `packages/tokens/src/intents.ts`.

All seven families are documented.

For the rules of the system, see [`AGENTS.md`](../../AGENTS.md).

| Family | Colour | Intents | Page |
|---|---|---|---|
| `primary` | `liro-blue` | create, save, submit, confirm, next | [primary.md](primary.md) |
| `verify` | `liro-teal` | verify, sign, send, sync | [verify.md](verify.md) |
| `document` | `liro-violet` | pdf, print, preview, download | [document.md](document.md) |
| `positive` | `liro-green` | approve, post, excel, complete | [positive.md](positive.md) |
| `destructive` | `liro-red` | delete, reject, cancelDocument | [destructive.md](destructive.md) |
| `caution` | `liro-orange` | unlock, revert, void | [caution.md](caution.md) |
| `neutral` | `liro-gray` | edit, view, filter, refresh, back, cancel, duplicate, import, archive, settings, more | [neutral.md](neutral.md) |

---

## The template

Follow the GOV.UK Design System pattern. Its value is not the visuals — it is
that every page answers **when to use**, **when not to use**, and **why it is
like this**. The third one is what stops a rule being undone in six months by
someone who does not know the reason.

Each page has these sections, in this order:

```markdown
# <Family name>

One sentence: what this family is for.

## Intents in this family
A table: intent, default label, weight, confirmation.

## When to use
## When not to use          <- the most useful section; do not skip it
## How it behaves
Weight, confirmation, what the intent decides and what the caller decides.

## Examples
Real code with real names. No `<Button>Button</Button>`.

## Related
Links to the families that get confused with this one.

## Why it is like this
Decisions and their history. Measured numbers where they exist.
```

**Rules for writing these pages:**

- **"When not to use" is where the value is.** A page that only says when to use
  something has not prevented any mistake. Every family has a neighbouring family
  it gets confused with — name it.
- **Never invent a reason.** If you do not know why something is the way it is,
  write "reason not recorded" and ask. A plausible-sounding invented reason is
  worse than an admitted gap, because it will be quoted later.
- **Give the numbers.** "Sufficient contrast" is not documentation. "4.53 with
  white text in both themes" is.
- **Examples use real business names.** The catalog demos already do this and it
  is deliberate: an example with placeholder text shows nothing about how the
  component behaves in use.

---

## The three lines people get wrong

Collected here because each one has already caused a mistake, and each is
explained in full on the page it belongs to.

**`primary` against `positive`** — direction, not importance. `primary` moves a
record *along*; `positive` *closes* it with a favourable outcome. This is the most
common intent mistake in the system.

**`void` against `cancelDocument`** — the family is chosen by the effect on the
system of record, not by how much data disappears. `void` destroys the user's work
and is `caution`; `cancelDocument` destroys nothing, creates a reversing document,
and is `destructive`.

**`cancel` against `cancelDocument`** — English makes these one word and they are
not one action. `cancel` abandons a form; `cancelDocument` voids a document that
is already in the books. In Serbian they are *Odustani* and *Storniraj*, and
nobody confuses them.