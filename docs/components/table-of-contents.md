# TableOfContents

A list of the headings on a page, sticky to the side, that follows the scroll
position.

## When to use

- Any long page of text — documentation, a legal document, a policy.
- Anywhere the reader's question is *how much is left* as much as *what is here*.

## When not to use

- **Not as navigation between pages.** Links to other pages are the sidebar. This
  is about one page.
- **Not for a short page.** Two headings on one screen do not need an index.
- **Not when the headings are not on the page.** In a catalog demo, pass
  `trackScroll={false}` — otherwise the component looks for ids that do not exist
  and shows nothing as active.

## How it behaves

```tsx
<TableOfContents
  items={[
    { id: 'basics', title: 'Basic details' },
    { id: 'tax-number', title: 'Tax number', level: 2 },
    { id: 'vat', title: 'VAT' },
  ]}
/>
```

Two levels of indentation. `top` accounts for a sticky header. Hidden below `lg`,
because a sidebar of headings on a narrow screen costs more width than it gives.

**A click locks the tracking** until the reader scrolls themselves. Without that,
clicking one of the last items scrolls the page to the bottom and the bottom rule
immediately overrides the choice — those items could not be selected at all.

## Why it is like this

This component is the best worked example in the system of **measuring instead of
guessing**. Four separate bugs, three of them wrong hypotheses of mine before the
measurement, all in one small component.

### 1. It only tracked clicks

The original `PageToc` set the active item **on click only**. A reader scrolling
through eight examples saw whatever they last clicked, or nothing.

A list that does not answer *where am I now* has failed at the only thing it is
for.

### 2. The bottom of the page is a special case

The last headings sit in the final screen and **never reach the top** — the page
stops scrolling before they get there. With an ordinary "last heading above the
line" rule, the final two or three items never become active.

Moving the threshold does not fix it. Wherever the line is placed, the last few
headings stay below it. The bottom needs its own rule.

### 3. `window.scrollY` was not the scroll position

Measured on `/docs/architecture`, at the very bottom of the page:

```
window.scrollY                          0
document.scrollingElement.scrollTop  1526
document height                      2441   window height  915
```

Two values that should agree, and did not. The bottom rule read the first, so it
never fired.

`scrollContainerOf` walks up looking for an ancestor that scrolls — needed for
`ScrollArea` and `Table.ScrollContainer` — and correctly returns nothing here,
because the scrolling element is `<html>` with `overflow-y: visible`.

### 4. The document grew after the first paint

```
scrollTop 1216   document 2127   →  at the bottom
scrollTop 1216   document 2441   →  no longer at the bottom
```

Nothing scrolled. `next/font` swapped the fallback for the real face and the text
metrics changed. Neither `scroll` nor `resize` fires for that, so the component
kept a picture of the page from 300 pixels ago.

A `ResizeObserver` on `document.body` re-measures, behind the same
`requestAnimationFrame` gate as the scroll handler.

### 5. The ids did not match

The real cause of what was visible, and the one that survived three fixes.

The heading ids were computed from the **rendered HTML**, where `marked` escapes
`&`. The table of contents computed them from the **markdown source**:

```
## Page Templates & App Shell
    →  id     page-templates-amp-app-shell
    →  slug   page-templates-app-shell
```

`getElementById` returned `null` for every heading with a special character. Those
items could never become active, and their links pointed at anchors that did not
exist.

That is why "Form Engine" was always the last active item on that page: it is the
last heading **without a special character**.

## What is left

On a short page, when two sections are on screen at once, only one can be marked.
There is no data about which one the reader is reading — that is a limit, not a
bug, and it is the same on `/category/business-patterns`.

## Related

- `DocsShell` — the page layout this sits in
- `CommandPalette` — finding something across pages rather than within one

## The general lesson

Three of the four hypotheses above were wrong, and each was plausible. Every one
was settled in a single measurement from the browser console.

**When behaviour disagrees with expectation, measure before changing anything.**
The repository has three other bugs of this class recorded in `AGENTS.md`, and the
same approach found each of them.