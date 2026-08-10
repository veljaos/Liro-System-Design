# Intent families — documentation

Seven families, 33 intents, defined in `packages/tokens/src/intents.ts`.

Four families are documented. Three are not — see "Remaining work" below.

For the rules of the system, see [`AGENTS.md`](../../AGENTS.md).

| Family | Colour | Intents | Page |
|---|---|---|---|
| `primary` | `liro-blue` | create, save, submit, confirm, next | [primary.md](primary.md) |
| `verify` | `liro-teal` | verify, sign, send, sync | [verify.md](verify.md) |
| `document` | `liro-violet` | pdf, print, preview, download | not written |
| `positive` | `liro-green` | approve, post, excel, complete | not written |
| `destructive` | `liro-red` | delete, reject, cancelDocument | [destructive.md](destructive.md) |
| `caution` | `liro-orange` | unlock, revert, void | not written |
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

## Remaining work

Three families are undocumented. For each, the non-obvious part is noted so you
do not have to rediscover it — but **verify each one against `intents.ts` and ask
about anything that is not recorded there.**

### `document` — pdf, print, preview, download

The interesting decision is already commented in `intents.ts`: `pdf` and `print`
carry **filled** weight, not light, while `preview` and `download` stay light.
The recorded reason is that in the Liro Business App PDF and print are among the
most frequent actions on a screen — an accountant looks for them before anything
else — and light purple gets lost next to filled blue.

This is the one place where the system has **two filled buttons on one screen** on
purpose, which appears to contradict rule 4 in `AGENTS.md`. That tension is
exactly what the "Why it is like this" section is for.

### `positive` — approve, post, excel, complete

Note that `excel` is `light` while the other three are `filled`, and that
`approve` and `post` require confirmation while `complete` does not. The reason
for `complete` not confirming is **not recorded** — ask before writing it down.

Also worth documenting: the difference between `positive` and `primary` is not
importance but **direction**. `primary` moves a record forward; `positive` closes
it with a favourable outcome. Getting this wrong is the most common intent
mistake.

### `caution` — unlock, revert, void

All three are `light` and all three confirm. The family exists for actions that
are **hard to undo but not destructive** — nothing is deleted, but a state that
was closed becomes open again.

The line against `destructive` needs stating clearly: `void` (Poništi) and
`cancelDocument` (Storniraj) are both about cancelling a document, yet they sit in
different families. Do not guess the distinction — it is an accounting rule and
the owner should confirm it.

Known issue to record on that page: both intents currently have the English label
`Void`, so an English interface shows two identical buttons. In Serbian they are
clearly different. That needs a decision, not a translation fix.