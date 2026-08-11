# Navigation patterns

When a modal, when a drawer, when a new page.

These rules were **read out of Liro Business App, not invented**. Entities with
many fields already had full routes there (`employees/new`, `employees/[id]`, the
same for clients and other income), and modals were used only for short actions.
The system records what already worked.

## When to use what

| Form | When | Examples |
| --- | --- | --- |
| **Full page** | Creating or editing an entity with more than about ten fields, with tabs, attachments, or data from several sources. | Employee, client, contract, journal entry, other income |
| **Drawer** | Editing a subset of fields while the list behind stays visible. Short, one goal. | Quick price change, assigning a label, a filter with many fields |
| **Modal** | One action with one outcome, or a read-only view. | Delete confirmation, entering a fiscal receipt, previewing a document, choosing a report |

## Why a full page for entities

**The reason is not aesthetics.** A modal is fast for the developer and expensive
for the user. Four things a full page gets for free, which in a modal must either
be built by hand or cannot be done at all:

| | |
| --- | --- |
| **A modal has no address** | A long form that gets interrupted cannot be resumed, cannot be sent to a colleague, and does not survive a refresh. |
| **A modal cannot hold an error** | When the server rejects a record with per-field errors, a modal hides which field is below the fold. |
| **A modal has no room** | Forty fields in a modal means scrolling inside scrolling — the worst possible data entry. |
| **A page has a back button** | The browser's back button does what the user expects, with no code at all. |

## Route shape

The same shape Liro Business App already uses:

| Route | Purpose |
| --- | --- |
| `/employees` | list with filters and search |
| `/employees/new` | create a record |
| `/employees/[id]` | detail and edit |
| `/employees/[id]/payroll` | a subordinate part of the same record |

This is why `ResourceTable` takes `onEdit` as a function instead of opening a form
itself — the application decides whether to navigate to a route or open a drawer.
A table that opened its own modal would make that decision for every screen at
once.

## RecordFormTemplate

The template that enforces this pattern. It carries a header with a back link,
actions at the top **and at the bottom**, an optional side column, and a warning
about unsaved changes.

### Why actions are also at the bottom

On a form that scrolls, the user finishes typing at the bottom of the screen.
Asking them to scroll back up to save is unnecessary — and it is exactly what
most business applications do.

The bottom bar is **sticky** to the window, not to the end of the document, so it
stays visible as long as there is something to save.

## Related

- [Getting started](getting-started.md) — installing and wiring up
- [The rules of the system](../AGENTS.md) — the ten rules, including "modals live
  outside `Tabs`"