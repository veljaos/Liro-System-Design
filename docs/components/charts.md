# Charts

Sixteen chart components over Mantine and Recharts, with the Liro palette and the
system's number formatting.

Most of them are thin wrappers and need no page of their own. This one covers
**choosing between them** and the decisions that apply to all.

## Choosing one

| What the reader is asking | Component |
|---|---|
| How did this change over time? | `LiroLineChart` · `LiroAreaChart` |
| How do these categories compare? | `LiroBarChart` |
| How do more than five items compare? | `LiroBarsList` |
| What is the share of the whole? | `LiroDonutChart` · `LiroPieChart` |
| Where in a range is this number, against a target? | `TargetBar` |
| How does one figure trend, beside the figure? | `LiroSparkline` |
| Where does value flow between stages? | `LiroSankeyChart` |
| What is the share of a whole with many items? | `LiroTreemap` |
| How deep is this hierarchy? | `LiroSunburstChart` |
| How does activity vary day by day over a year? | `LiroHeatmap` |
| How do two quantities relate? | `LiroScatterChart` · `LiroBubbleChart` |
| Size and trend on one display | `LiroCompositeChart` |
| A score across several criteria | `LiroRadarChart` |
| Progress of several groups against a target | `LiroRadialBarChart` |
| How many of these reached the end? | `LiroFunnelChart` |

**Defaults for the hierarchy charts — Sankey, Treemap, Sunburst — are still being
decided.** The mapping above is established practice rather than a rule of this
system; treat it as a starting point.

## Rules that apply to all of them

### Bars beat a pie above five items

The eye compares **lengths** more easily than **angles**, and labels fit without
truncation. `LiroBarsList` exists for that case and should be the default reach
whenever the list is longer than five.

### The palette is not the same for bars and for series

Two lists, and the difference is not cosmetic:

| | Where the colour sits | Requirement |
|---|---|---|
| `SERIES_COLORS` | beside the label, in a legend | none |
| `BAR_COLORS` | **under** the label, in the bar | white text at 4.5+ |

`orange[6]` measured **3.18** with white text and is not in `BAR_COLORS`. Four
light shades were replaced by their darker counterparts for the same reason.

`blue[6]` at 4.53 and `teal[6]` at 4.56 have very little margin. **If the ramp is
ever adjusted, measure again — do not assume.**

### The Mantine `variant` trap

`LiroBarsList` uses `variant="filled"`, and it must.

Mantine's default `"light"` **with an explicit shade** returns a solid background
with the text colour meant for a *tint* — light blue on solid blue. In the light
theme it happens to pass; in the dark theme it fails.

This is a trap rather than a mistake, because nothing in the API suggests it: the
grid of variant and shade has a branch most people never read.

### Formatters are created once

`Intl` formatters are expensive to build and cheap to use. Building one per render
was a real bug in this package — the chart formatters were recreated on every
call, and a `useMemo` with an object from `...rest` did not stop it.

`createValueFormatter` and the cache in `@liro/i18n` are what keep that from
coming back.

### No `Intl` inside a chart component

Forbidden by ESLint, with an exception only for `@liro/i18n` and
`LiroDatesProvider`. A chart with its own `new Intl.NumberFormat` writes
`1,234.56` above a table that writes `1.234,56` — on the same screen.

## TargetBar

The one component here worth its own section.

Colour comes from the **deviation from target**, not from the value. A figure is
not good or bad in itself; missing a plan is.

`invert` exists because for expenses an overshoot is bad news. Without it, a cost
overrun would be green.

`max` defaults to 125% of the target so an overshoot has room to be seen. A bar
that ends exactly at the target cannot show that the target was passed.

Bands are quiet on purpose: they are **context, not data**.

## LiroHeatmap

Activity by day over a period — the shape of a year of work.

**365 cells get one summary, not 365 keyboard stops.** Mantine offers
`getRectProps`, so every cell could be named and reachable — and a keyboard user
would face 365 stops to cross a single display. That is worse than inaccessible.

`role="img"` with a summary in `aria-label` makes the children presentational and
gives a screen reader one useful sentence. The honest answer is a table of the
same data beside it; this is the minimum until a screen needs one.

`withTooltip` was a prop that **did nothing**: Mantine renders a tooltip only when
`getTooltipLabel` is given as well. Worth remembering as the second prop in this
system found to be inert — `readOnly` on `LiroSchedule` was the first.

## Related

- `ChartCard` — the frame with a title and a period
- `StatCard` · `ProgressCard` — a figure or a progress rather than a chart
- `DataTable` — when the reader needs the numbers, not their shape

## Why it is like this

### Why wrappers at all

Mantine's charts are good and take a `color`. That single prop is what would let
two screens in one application use different blues.

The wrappers exist to remove that choice: the palette, the number formatting, the
currency, and the non-breaking space before `RSD` are decided once. What is left
to the application is the data.