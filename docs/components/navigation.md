# Navigation and shortcuts

Getting into a module and getting to a screen: `Launchpad`, `ModuleGrid`,
`ModuleCard`, `CommandPalette` and `ShortcutHint`.

## Launchpad

The home page is a grid of tiles, not a menu.

### When to use

- The entry point of an application — the screen a user lands on.
- Anywhere a set of modules has to be chosen between.

### When not to use

- **Not as a dashboard.** A screen of figures and charts is a dashboard. A
  launchpad is a way in.
- **Not for a list of records.** Tiles are modules, not rows.

### How it behaves

Fully operable from the keyboard: **1–9 open, arrows move the selection, Enter
confirms.** That is not decoration — someone entering data all day reaches for the
number, not the mouse.

The tiles were previously `<div onClick>`, which meant no keyboard, no focus ring
and no role. They are `UnstyledButton` now, and that fix is one of the eight real
bugs recorded in the handover.

### Why the figure is a badge and not a subtitle

Below the title sits a **subtitle**, not a number.

A number under the title felt like a good idea and broke the grid's rhythm: in the
original application a tile is an **entry point into a module**, not a metric.
When a figure is needed — eleven documents overdue — it goes as a badge top right,
where `PRO` and `UNAVAILABLE` already sit.

### The class name matters

The tile carries `liro-module-card`, the same class as in Liro Business App, and
that is deliberate rather than incidental. The rule
`.liro-module-card:hover .liro-module-icon` gives the icon a blue background and
white colour on hover. While the class was `liro-tile`, that rule matched nothing
and the hover state silently did not exist.

---

## CommandPalette

`Ctrl+K`, and everything reachable by typing its name.

### When to use

- Always, in an application with more than a handful of screens. It costs one
  component and removes the need to remember where anything is.

### When not to use

- **Not as the only way to reach something.** A palette is a shortcut for people
  who know what they want. Everything in it must also be reachable by clicking.

### How it behaves

**Navigation comes from `LiroAppProvider` and is already filtered through
permissions**, so the palette cannot offer a screen the user has no right to open.

That is worth stating because the alternative is a common bug: a search box that
indexes every route, and a user who finds a screen they cannot enter.

### Why it exists

Human behaviour does not change. Someone entering data all day does not take their
hands off the keyboard to hunt through a menu.

`ShortcutHint` displays the key combination beside an action rather than hiding
it. A shortcut nobody knows about is a shortcut nobody uses.

## Related

- `AppShellTemplate` — the frame the launchpad and the palette sit in
- `LiroAppProvider` — where navigation and permissions come from
- [Navigation patterns](../navigation-patterns.md) — modal, drawer, or page