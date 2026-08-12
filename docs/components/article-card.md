# ArticleCard

A card with an image behind it and the title over the image: for documentation,
release notes, and news inside an application.

## When to use

- A list of articles, guides, or release notes where the image helps the reader
  recognise the piece.
- Anywhere the whole card should be a link to a longer text.

## When not to use

- **Not for a record.** A client, an invoice, an employee is `PersonCard`,
  `StatCard`, or a table row. This card is for *reading material*.
- **Not without an image.** The whole point is the picture behind the title; with
  a flat colour it is a `SectionCard` with extra steps.
- **Not with an action button inside.** When `href` is given the entire card is
  the link — see below.

## How it behaves

### The whole card is the link

```tsx
<ArticleCard
  image="/covers/release-0-1-0.svg"
  category="Release"
  title="What is new in version 0.1.0"
  href="/docs/releases/0-1-0"
/>
```

Rather than a title plus a separate "Read more" button. One target for the mouse
and one stop for the keyboard, and the accessible name of the link is the title —
which is exactly what a screen reader should announce.

A card with both a title and a button gives two targets that go to the same place,
and the button's name is usually "Read more", which tells nobody anything.

`action` exists for the case where `href` is **not** given, because a link inside
a link is invalid HTML.

### The image is a background, not an `<img>`

It is decoration; the title carries the meaning. As a CSS background it is
correctly invisible to a screen reader, without needing `alt=""` and
`aria-hidden`.

## The contrast problem this component is the example of

**Text over a `background-image` is not measured by `axe`.**

It returns `incomplete` rather than a violation, because it cannot read the image
— and `a11y.spec.ts` counts only violations. **The test passes and the problem
stays.** This is the one place in the system where the checks cannot help and
arithmetic decides.

The scrim is computed against the **lightest possible image**, because the
component cannot know what it will be given:

| | white on a white image |
|---|---|
| `surface.backdrop`, 45% | **3.35** — fails |
| `surface.scrim`, 55% | **4.76** — passes |

That is why `surface.scrim` exists as a separate token from `backdrop`. Behind a
modal, 45% is enough because no text sits on it; over a photograph, text does.

### `opacity` on text enters the ratio

The category label was written with `opacity: 0.85` to make it quieter than the
title. Measured:

| | ratio |
|---|---|
| white on the scrim | 4.76 |
| the same at `opacity: 0.85` | **3.95** |

Quieter text is made with **size and weight**, never with opacity. That rule came
from this component and is now in `AGENTS.md`.

## Related

- `PersonCard` — the same card shape for a person, with a colour band
- `LiroCarousel` — a row of these when they do not fit
- `Callout` — a notice inside a page rather than a link out of it

## Why it is like this

### Why the demo images are SVG and deliberately pale

`cover-light.svg` in the playground is almost white **on purpose**. It is the
worst case for the scrim, and having it in the catalog means the worst case is on
screen every time someone looks at the page.

They are SVG rather than photographs for three reasons: no network in the visual
baselines, no licence question, and identical rendering on every machine — which
keeps the 118 baselines trustworthy.