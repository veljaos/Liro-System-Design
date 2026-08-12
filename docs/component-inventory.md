# Component documentation — inventory

**What this is.** All 124 components in the generated API reference, sorted into
four groups by whether the *reason behind them* is recorded anywhere. It exists
so that whoever writes the pages knows where to look, what to ask, and what not
to write at all.

**Why it exists.** The rule in [`docs/intents/README.md`](intents/README.md) is absolute:

> Never invent a reason. A plausible-sounding invented reason is worse than an
> admitted gap, because it will be quoted later.

An agent asked to "document `DataTable`" will read the source, see what the code
does, and fill the *why* with something convincing — that is the only way the task
can be completed without knowledge that is not in the file. This inventory
replaces that guess with a citation.

## How the sorting was made

Three sources, in order of trust:

1. **Read in this work.** Reasons established while fixing or building the thing.
   The strongest — they come with measurements.
2. **Recorded in a comment.** Measured mechanically: 68 of 124 components have no
   sentence explaining a decision in the comment above them. That count is
   reliable; the per-component score was not, because a component that sits last
   in a large file picks up everything above it.
3. **The nature of the component.** A `PageContainer` that sets a max width has no
   decision behind it, and no measurement is needed to know that.

**Group A does not mean "write it from the name".** Each entry carries where the
reason lives. If the citation does not hold up when opened, the component moves to
group B.

---

## Group A — the reason is recorded (37)

Ready to write. Each line: what the page must explain, and where the reason is.

### The ones with measurements

These have numbers attached, and the numbers are the point of the page.

| Component | What the page must carry, and where the reason lives |
|---|---|
| `DataTable` | Both trees are built when `hiddenFrom`/`visibleFrom` hide with CSS. 932 rows gave INP 1,592 ms; real branching plus virtualisation on both sides brought it to 120 ms. Totals come from the application, not computed by the table — with pagination the table only sees a page. Enter opens a row, Space ticks it. <br>*[`AGENTS.md`](../AGENTS.md) performance section; `DataTable.tsx:57`, `:213`* |
| `CapacityTimeline` | The progress wash at 25% mixed `tone.solid` into `tone.bg` *under the label* and pulled info from 5.04 to 3.65 — every token was correct and the contrast still failed. It became a strip at the bottom. Contrast is measured after layers composite. <br>*`CapacityTimeline.tsx`; `AGENTS.md` accessibility* |
| `ArticleCard` | Text over a `background-image` is not measured by `axe` — it returns `incomplete`, so the test passes and the problem stays. `surface.scrim` is 55% because 45% gives 3.35 on a white image. `opacity` on text enters the ratio: 0.85 dropped 4.76 to 3.95. <br>*`ArticleCard.tsx` header* |
| `LiroBarsList` | `variant="light"` with an explicit shade is a Mantine trap: it returns a solid background with the text colour meant for a tint. `variant="filled"` plus a palette whose every colour carries white text — `orange[6]` measured 3.18 and is not in it. <br>*`series.ts` `BAR_COLORS`; `charts.tsx`* |
| `LiroHeatmap` | `withTooltip` was a prop that did nothing — Mantine renders a tooltip only when `getTooltipLabel` is also given. 365 cells get `role="img"` with a summary, not `tabIndex` each. Month names come through `LOCALE_TAGS`. <br>*`moreCharts.tsx`* |
| `TableOfContents` | Three separate bugs, all found by measuring. Heading ids from escaped HTML against slugs from markdown source. `window.scrollY` reporting 0 where `scrollingElement.scrollTop` was 1526. The document growing 2127 → 2441 px after first paint with nothing firing. <br>*`TableOfContents.tsx`* |
| `ProgressCard` | The percentage is computed from `done`/`total`, never passed — two numbers that can disagree is a card that lies. Rounded **down**: 46 of 47 shows 97%, and 100% means finished. <br>*`ProgressCard.tsx:52`* |
| `MessageBubble` `MessageList` `MessageThread` `MessageComposer` | One page for the family. Tail at the top, on the first message of a run. Reactions overlap the bottom edge on the side *opposite* the tail — placed over it, both bubbles looked flat. Translucent `status[tone].bg` on a blue bubble measured 2.34; it needs an opaque base with the tone painted over it. Enter sends, Shift+Enter breaks the line. <br>*`Messages.tsx`; this work* |
| `PersonAvatar` `PersonCell` `PersonInfo` `PersonCard` | One page for the family. `name.slice(0, 2)` gives the first two *characters*: "Ana Jovanović" → `AN`, not `AJ`. The avatar is decorative by default because the name is always beside it. Contact details are `mailto:`/`tel:` links, not text. The card's header is a colour band, not a photograph — visual baselines must not depend on the network. <br>*`PersonAvatar.tsx`; this work* |
| `ColorSchemeToggle` | `getInitialValueInEffect` is not enough: `ColorSchemeScript` writes the scheme before hydration, so the client knows it on the first render and the server did not. Hence the `mounted` dance. <br>*`ColorSchemeToggle.tsx`* |
| `LocalePicker` | A menu, not a toggle — three locales today, forty-three planned. Endonyms from CLDR, so adding a locale stays one file. Deliberately no `mounted` dance: the locale arrives as `initialLocale` from the same cookie the server read. <br>*`LocalePicker.tsx`* |

### The ones where the reason is written but unmeasured

| Component | What the page must carry, and where the reason lives |
|---|---|
| `ActionButton` `ActionGroup` | Already covered by `docs/intents/`. The component page should be short and point there. The main action is last — where the eye expects it and the thumb reaches. <br>*`docs/intents/`* |
| `SplitAction` | Menu items are intents, so the menu cannot show an action that does not exist in `intents.ts`. Two `Button`s of the same size, not `Button` + `ActionIcon` — height comes from `--button-height-*` either way. Colour marks danger in a menu, it does not decorate. <br>*`SplitAction.tsx`* |
| `EditableGrid` | A journal entry is entered without a mouse. Debit/credit balance is compared in minor units because `0.1 + 0.2 !== 0.3`. <br>*`EditableGrid.tsx`; `AGENTS.md` money* |
| `FormWizard` | Per-step validation, a draft, and a guard on leaving. `isDirty` compares against `defaultValues`, so a field missing there is dirty forever. <br>*`FormWizard.tsx:131`, `:149`* |
| `AutoForm` `FormField` `FieldList` | A form is data. `createLiroResolver` runs `required` and `validate` from `FieldSchema` *before* the schema, because React Hook Form skips those rules once a resolver exists. Hidden fields are stripped before saving. <br>*`AGENTS.md`; `validation.ts:12`; `docs/architecture.md`* |
| `ResourceTable` | `rowId` written inline breaks memoisation — a new function on every render. <br>*`ResourceTable.tsx:150`* |
| `WorkflowStatus` `ApprovalChain` `Checklist` `ScoreMeter` | One page for the four. A hotel booking, a KYC check, a production order and a research application use the same four patterns; only the configuration and the labels differ. That is why they know nothing about the domain. <br>*`BusinessPatterns.tsx`; catalog entry `pattern-thinking`* |
| `StockLedger` `RateTable` `SlotPicker` `ProcessMap` `ItemGallery` | One page. The balance is **not** computed here — it comes from the server, because the only correct balance is the one the database held at the moment of the movement. Availability likewise: only the server knows about other users' simultaneous bookings. <br>*`OperationsPatterns.tsx:124`, `:397`* |
| `ProcessDiagram` | The application must not compute coordinates. It describes what happens; the component lays it out. <br>*`ProcessDiagram.tsx:200`* |
| `FileDropzone` `AttachmentList` | Uploads run in sequence, not in parallel. `withButton` adds a named path to the same dialogue — the hidden `input[type=file]` is announced as a field with no name. <br>*`FileDropzone.tsx`; this work* |
| `RichTextField` `RichTextView` | ProseMirror sets `role="textbox"` on the `contenteditable` and adds no name. `useEditor` without deps builds the editor once and ignores later option changes. <br>*`RichTextField.tsx`* |
| `CommentThread` | `bubbles` is a conversation; `flat` is a list of notes on a document, where the side does not matter and a long note aligned right is harder to read for no gain. <br>*`CommentThread.tsx`* |
| `PeriodPicker` `AccountingPeriodSelect` | Separate components because they answer different questions: payroll is not run for a calendar month. <br>*`PeriodPicker.tsx:196`* |
| `DueDate` `DateText` `DateRangeText` | One page. On a list of two hundred invoices the operator needs to *see* what is overdue, not calculate it. <br>*`DateText.tsx:81`* |
| `Launchpad` `ModuleGrid` `ModuleCard` | One page. The home page is a grid of tiles, not a menu; the figure on a tile says whether there is work there. Keyboard: 1–9 open, arrows move, Enter confirms. <br>*catalog entry `launchpad`* |
| `LiroSchedule` | `readOnly` used to be a prop that did nothing — worth keeping in the page as the example of why a prop must be verified, not assumed. <br>*`LiroSchedule.tsx`* |
| `ConflictBanner` | What happens when two people edit the same record. <br>*`ConflictBanner.tsx`* |
| `StatCard` `StatGrid` | `invertDiff` exists because growth is not always good news: rising cost is not a success. <br>*`StatCard.tsx`* |
| `TargetBar` | Colour comes from the deviation from target, not from the value. Bands are quiet because they are context, not data. <br>*catalog entry `target-bar`* |
| `JobProgress` `StepWizard` `BulkActionBar` | One page. Confirmation does not scale: posting forty invoices cannot ask forty times, so it moves up to `BulkActionBar` with the count, and anything larger is a job. <br>*`docs/intents/positive.md`* |
| `CommandPalette` `ShortcutHint` | One page. Ctrl+K, and why the shortcut is shown rather than hidden. <br>*`useShortcuts.ts`* |
| `LiroCarousel` | When a row of content does not fit the screen width. <br>*`LiroCarousel.tsx`* |
| `LiroProviders` `LiroAppProvider` `LiroDataProvider` `LiroFileStorageProvider` `I18nProvider` `LiroThemeProvider` | One page — the provider chain and why the order is what it is. <br>*`docs/getting-started.md` appendix* |
| `AppShellTemplate` `ListPageTemplate` `DetailPageTemplate` `RecordFormTemplate` `DashboardTemplate` | One page. Actions at the top **and** at the bottom, because on a scrolling form the user finishes at the bottom of the screen. <br>*`docs/navigation-patterns.md`* |

---

## Group B — answered, now recorded (12)

Twelve questions were put to the owner and answered. **The answers are the record**
— these components now belong to group A and their pages carry the reasoning
below. Two items remain open, and both are code changes rather than pages.

| Component | The recorded rule |
|---|---|
| `ScoreMeter` | Bands are inclusive at the upper bound: `[0,33]`, `(33,66]`, `(66,100]`, which is the convention in risk scoring, so `upTo` is the right name. **The convention is the reason; the methodology is not written yet.** Revisit when it is. |
| `DangerZoneCard` | Only rare, system-critical actions: closing an account, deleting an organisation. Deleting a single client is an ordinary destructive button on its page, not a danger zone. |
| `SessionsCard` `TwoFactorCard` `PasswordChangeCard` `TwoFactorForm` `LoginForm` | A user may end their own session on another device. Two-factor is mandatory for sensitive roles and optional for the rest. **Verified in code: `onRevoke` and `onRevokeAll` already exist.** |
| `VersionCompare` | For the user, to see what changed. Only changes that alter the meaning of the document. |
| `AuditTrail` | For system audit. Records **every** change — posting, a permission change, a typo fix in a note. History is never deletable from the interface; archiving is an administrator's database operation. **Verified in code: no delete exists.** |
| `AttachmentList` | An attachment may not be deleted once the document is posted — it becomes accounting evidence. **Open: today the rule is enforced by the application omitting `onRemove`. It belongs in the component — see the code changes below.** |
| `PdfPositionPicker` `PdfPreview` | A safe zone of **10 mm from every edge**, 28 PDF points. Printers have a non-printable border of 3–6 mm; a stamp inside it is clipped or skewed, and that is found only when a signed contract is printed. Configurable through `safeMargin` for a known set of printers; the default must be the value that breaks nothing. |
| `SlotPicker` `ItemGallery` | **The booking domain does not exist yet.** These were written ahead of a product. The page must say so plainly. |
| `LandingTemplate` `LegalPageTemplate` | **There is no public site.** Speculative, written ahead of a need. The page must say so. |
| `AuthShell` | **Not speculative** — corrected from the first answer. `/examples/login` uses it, and every application has a sign-in screen even without a public site. |
| `PreferencesCard` `ProfileCard` | Language, theme, date format and first day of the week are **per user**: the interface adapts to whoever is reading. **But the format of a document is per organisation** — if it were per user, two bookkeepers would print the same invoice as `12.04.2026.` and `04/12/2026`, and for a document that goes to a client or an authority that is not a preference, it is an error. This changes the i18n architecture and must reach `HANDOFF.md` before that work starts. |
| `LiroSankeyChart` `LiroSunburstChart` `LiroTreemap` | Established practice, recorded as practice rather than as a rule: **Sankey** for flow between stages, **Treemap** for share of a whole with many items where area carries the meaning, **Sunburst** for depth of hierarchy. The page must state that defaults are still being decided. |

### Still open — two code changes, not pages

**`AttachmentList` — `canRemove`.** The rule that a posted document's attachment
cannot be deleted is currently enforced by the application not passing `onRemove`,
which removes deletion from the whole list rather than from one file. It should
take `canRemove?: (file) => boolean` so a single attachment can be shown without
its delete button. The rule is an accounting one and belongs in the component.

**`PermissionMatrix` — a third state.** Three states are agreed — *granted*,
*denied*, *not applicable* — and that is standard for an RBAC matrix. Today the
component holds `Record<roleId, string[]>`, a set of granted permissions, so
"denied" and "not applicable" are the same thing: absence from the array. This is
a change to the **shape of the data**, not to the display, and deserves its own
step.

One constraint for whoever makes it: **the third state must not be a disabled
checkbox.** A screen reader announces that as "not granted, locked", which is the
wrong meaning. *Not applicable* is not a control at all — it is an empty cell with
a dash, the same rule as "an empty value is a dash" in the ten rules.

Until then, the page describes two states and records the third as a decision with
its date.

## Group C — no decision behind them (46)

**These do not get a GOV.UK page.** A catalog entry with a `code` block is the
right and sufficient documentation. Writing a "why it is like this" section for a
container that sets a maximum width produces filler, and filler in a documentation
set teaches people to skim it.

**Layout and text primitives**
`PageContainer` · `PageHeader` · `SectionCard` · `KeyValueList` · `Toolbar` ·
`Callout` · `EmptyState` · `BrandMark` · `TablePagination` · `RouteProgress`

**Status displays**
`StatusBadge` · `ActiveStatusBadge` · `RecordStatusBadge` · `StatusScreen` ·
`NotFoundTemplate` · `ServerErrorTemplate` · `ForbiddenTemplate` ·
`MaintenanceTemplate` · `SuspendedTemplate` · `LoadingTemplate`

**Chart wrappers** — thin layers over Mantine with the Liro palette and formatting
`LiroAreaChart` · `LiroBarChart` · `LiroLineChart` · `LiroDonutChart` ·
`LiroPieChart` · `LiroSparkline` · `LiroCompositeChart` · `LiroFunnelChart` ·
`LiroRadarChart` · `LiroRadialBarChart` · `LiroScatterChart` · `LiroBubbleChart` ·
`ChartCard`

**Form parts** — carried by the `AutoForm` page
`FormDrawer` · `FormModal` · `RelationField` · `UploadField` ·
`LocalizedTextField`

**Modals and the rest**
`ConfirmModal` · `DeleteConfirmModal` · `CodeBlock` · `CodeBlockTabs`

One shared page is still worth writing for two of these clusters — **"Charts:
choosing one"** and **"Status screens: the words"** — but as a *pattern* page, not
one page per component.

---

## Group D — families, not components (already folded in above)

Marked in group A as "one page for the family". Eleven components collapse into
four pages: `Person*`, `Message*`, the business patterns, the operations patterns.
Writing one page each would repeat the same reasoning four times and let the four
copies drift apart.

---

## What this adds up to

| Group | Components <br>*Pages* |
|---|---|
| A — write now | 49 <br>*~32* |
| B — answered, folded into A | 12 <br>*—* |
| C — catalog entry is enough | 46 <br>*2 shared pattern pages* |
| D — folded into A | 29 <br>*—* |

**About 32 pages are writable today.** Two of them are written — `DataTable` and
`AutoForm` — and 46 components deliberately get none. Two code changes remain,
listed in group B.

## Suggested order

1. **`DataTable`** and **`AutoForm`** first, as the two reference pages. They are
   the largest, the most used, and carry the most recorded reasoning — they set
   the standard the rest follow.
2. The rest of group A, family pages before single ones. `DataTable` and
   `AutoForm` are done and set the standard.
4. The two shared pattern pages for group C.

## The rule for whoever writes these

A page that cannot cite a reason must say so, literally:

```
**Reason not recorded.** Ask the owner before documenting this.
```

Not a paraphrase. That exact line, so the remaining debt can be found with one
search — and so a gap can never be mistaken for a decision.

---

## Written so far

- [DataTable](components/data-table.md) — the most used component, and the one
  with the most measurements behind it
- [AutoForm](components/auto-form.md) — a form described as data

These two set the standard the rest follow. Read one before writing another.

## Where the reasons live

- [`AGENTS.md`](../AGENTS.md) — the rules of the system
- [Intent families](intents/README.md) — why each action has the colour it has
- [Architecture](architecture.md) — the data, form and template layers
- [Getting started](getting-started.md) · [Navigation patterns](navigation-patterns.md)