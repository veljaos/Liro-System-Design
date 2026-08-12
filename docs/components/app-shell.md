# Application shell and providers

`LiroAppProvider`, `LiroProviders`, `AppShellTemplate` and the page templates:
what an application is wired into.

## LiroAppProvider

The identity and structure of a specific application: its name, its navigation,
its permissions, and the link component of its router.

### Why it exists

Without it, every component that displays the product name or the navigation
would have to receive them as a prop through three levels — or have them
hardcoded.

**A hardcoded name is the reason a library cannot be shared between Liro Business
App and Liro ERP.**

### How it behaves

Navigation is filtered by permissions, and **empty groups disappear**. A menu
heading with nothing under it tells the user there is something they cannot see,
which is worse than the item simply not being there.

The router is passed in as `linkComponent`, so the shell knows nothing about Next.
The same shell would work under a different router with one prop changed.

## AppShellTemplate

A responsive frame: header, collapsible sidebar, content.

The active item is computed from the **longest matching prefix**, so `/tokens/boje`
does not light up both *Tokens* and *Colours* at once.

The current path arrives as a prop — the application computes it from its own
router. That is the same decoupling as `linkComponent`.

## Page templates

`ListPageTemplate`, `DetailPageTemplate`, `RecordFormTemplate`,
`DashboardTemplate`.

They exist so a list screen in one module looks like a list screen in another. The
arrangement is decided once: where the title sits, where the actions sit, where
the summary figures sit.

### Actions are at the top and at the bottom

On a form that scrolls, the user finishes typing at the **bottom** of the screen.
Asking them to scroll back up to save is unnecessary work, and it is exactly what
most business applications do.

The bottom bar is sticky to the window rather than to the end of the document, so
it stays visible while there is something to save.

### Skeletons match the layout

`LoadingTemplate` renders a skeleton in the shape of the page that is coming, not
a spinner. A spinner says *something is happening*; a skeleton says *what* is
happening, and the page does not jump when the content arrives.

## The provider chain

`LiroProviders` wraps the whole chain in the correct order. The order is a rule,
and [getting started](../getting-started.md) writes it out for anyone who needs to
insert a provider of their own.

Two decisions worth repeating here:

**The query client is created in component state, never as a module variable.** On
the server, one client shared between requests would leak one user's cached data
into another user's response.

**`I18nProvider` sits above the data layer**, so an error coming back from a
provider is already localised by the time a component displays it.

## Related

- [Getting started](../getting-started.md) — installing and wiring up
- [Navigation patterns](../navigation-patterns.md) — modal, drawer, or page
- [Architecture](../architecture.md) — the data and form layers
- `Launchpad` — what usually sits inside the shell first