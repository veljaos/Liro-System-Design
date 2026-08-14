# Achievements

`AchievementBadge` and `AchievementGrid`: a badge, and a grid of them with names
and progress.

## The reason it exists

Business software is dry, and the work inside it is repetitive and largely
invisible — **nobody notices a bookkeeper who cleared the queue, only one who did
not.**

An achievement says the work was seen. That is a small thing and it is not
nothing.

## When to use

- A profile or settings screen, where a person's own history is on show.
- Onboarding, where an early achievement tells someone they are doing it right.
- Anywhere repetitive work has a shape worth naming: fifty invoices in a day, ten
  runs without a correction, a period closed on time.

## When not to use

- **Not as a status.** A record's state is `RecordStatusBadge` or `StatusBadge`. An
  achievement is about the person, not the record.
- **Not as a metric.** A number that goes up and down is `StatCard`. An achievement
  is earned once and stays earned.
- **Not for ranking people against each other.** The component has no concept of a
  leaderboard, deliberately — in a workplace, ranking colleagues by throughput
  changes what people optimise for, and rarely for the better.

## How it behaves

```tsx
<AchievementGrid
  achievements={[
    {
      id: 'fast',
      label: { en: 'Quick hands' },
      description: { en: 'Enter 50 invoices in one day' },
      image: '/achievements/quick-hands.svg',
      earned: true,
      earnedAt: '02.04.2026.',
      level: 3,
      tone: 'premium',
    },
  ]}
/>
```

### The image comes from the application

**That is the line between a design system and a product.** The system frames,
crops, dims and labels the badge; what is drawn on it is the product's decision,
and a customer will want their own artwork.

`icon` is the fallback when there is no image — and what a locked badge shows if it
has neither.

### A locked badge is dimmed, never hidden

Desaturated and at 45% opacity, with its shape still recognisable. **A goal nobody
can see is not a goal.**

And it states **what is required**, not only that it is locked. A grey square with
no explanation is a taunt.

### Progress where it can be counted

`{ done: 6, total: 10 }` renders a bar and the counts. "6 of 10" is something a
person can act on today; "not yet earned" is not.

Where there is nothing to count, the card says *Locked* and leaves it at that.

### The level mark

`level: 3` shows `×3` over the corner, as on GitHub. Only from 2 upwards — a `×1`
on every badge is noise.

## Related

- `StatCard` — a metric rather than an achievement
- `StatusBadge` — a record's state
- `PersonCard` — the profile an achievement grid usually sits on

## Why it is like this

### The level mark uses `fg` on `bg`, not white on `solid`

The first version put white text on `status[tone].solid`, and `axe` caught it in
the dark theme. Measured there against white:

| tone | white | black |
|---|---|---|
| success | 3.39 | 5.08 |
| warning | 3.18 | 5.42 |
| danger | 5.41 | 3.18 |
| info | 4.53 | 3.80 |
| neutral | 2.64 | 6.53 |
| premium | 4.26 | 4.04 |

**No single text colour works on all six.** That is because `solid` is meant for
bars and dots, not for text — the same class of mistake as using `brand.solid`
where `text.brand` belongs.

Text on a tone is always `fg` on `bg`: 4.69–6.15 in the light theme, 6.32–7.19 in
the dark one.

`bg` is translucent in the dark theme, so it is painted over an opaque base —
`backgroundColor` for the base, `backgroundImage: linear-gradient(token, token)`
above it. Same technique as the reaction chips in `Messages`, and the same reason:
a translucent token cannot sit on an unknown background.

### The demo badges are SVG

Four in `apps/playground/public/achievements/`, and SVG rather than PNG for the
same three reasons as the article card covers: no network in the visual baselines,
no licence question, and identical rendering on every machine.

A real product would use PNG, and the component takes either.

### The badge is not focusable

`role="img"` with no `tabIndex`. It is a display, not a control — the tab order
should not stop on it.

Where the name is written beside the badge, pass `withTooltip={false}`: a tooltip
repeating what is already on screen is read twice by a screen reader.