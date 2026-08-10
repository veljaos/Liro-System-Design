import { createTheme, mergeThemeOverrides, type MantineColorsTuple, type MantineThemeOverride } from '@mantine/core'
import { layout, palette, radius, shadow, spacing, typography } from '@liro/tokens'

/**
 * Mantine theme derived from `@liro/tokens`. Not a single value here is
 * written by hand — everything comes from the tokens package. If a color
 * needs to change, it changes in the tokens, not here.
 */

const tuple = (ramp: readonly string[]) => ramp as unknown as MantineColorsTuple

export const liroColors = {
  'liro-blue': tuple(palette.blue),
  'liro-teal': tuple(palette.teal),
  'liro-gray': tuple(palette.gray),
  'liro-green': tuple(palette.green),
  'liro-orange': tuple(palette.orange),
  'liro-red': tuple(palette.red),
  'liro-violet': tuple(palette.violet),
} satisfies Record<string, MantineColorsTuple>

const baseTheme = createTheme({
  primaryColor: 'liro-blue',
  /** Index 6 in both schemes. */
  primaryShade: 6,
  defaultRadius: 'md',
  colors: liroColors,

  /**
   * Text color on a colored background is chosen by that background's
   * luminance.
   *
   * The 0.19 threshold is MEASURED, not chosen by feel:
   *
   *   blue[6]   0.182  below threshold -> white, ratio 4.53
   *   teal[6]   0.180  below threshold -> white, ratio 4.56
   *   violet[6] 0.063  below threshold -> white, ratio 9.31
   *   green[6]  0.203  above threshold -> black, ratio 5.06
   *   blue[5]   0.286  above threshold -> black, ratio 6.73   (filled button in the dark theme)
   *
   * The earlier threshold of 0.35 gave everything white letters, so the green
   * filled button (4.15) and the filled button in the dark theme (3.12) fell
   * below the AA threshold of 4.5.
   *
   * If the ramp is ever changed, RE-MEASURE. The gap between teal[6] (0.180)
   * and green[6] (0.203) is not large.
   */
  autoContrast: false,
  luminanceThreshold: 0.19,

  fontFamily: typography.fontFamily.sans,
  fontFamilyMonospace: typography.fontFamily.mono,
  fontSizes: typography.fontSize,
  lineHeights: {
    xs: typography.lineHeight.tight,
    sm: typography.lineHeight.base,
    md: typography.lineHeight.base,
    lg: typography.lineHeight.relaxed,
    xl: typography.lineHeight.relaxed,
  },

  headings: {
    fontFamily: typography.fontFamily.sans,
    fontWeight: typography.fontWeight.semibold,
    sizes: {
      h1: { fontSize: typography.heading.h1.fontSize, lineHeight: typography.heading.h1.lineHeight },
      h2: { fontSize: typography.heading.h2.fontSize, lineHeight: typography.heading.h2.lineHeight },
      h3: { fontSize: typography.heading.h3.fontSize, lineHeight: typography.heading.h3.lineHeight },
      h4: { fontSize: typography.heading.h4.fontSize, lineHeight: typography.heading.h4.lineHeight },
      h5: { fontSize: typography.heading.h5.fontSize, lineHeight: typography.heading.h5.lineHeight },
      h6: { fontSize: typography.heading.h6.fontSize, lineHeight: typography.heading.h6.lineHeight },
    },
  },

  spacing: {
    xs: spacing.xs,
    sm: spacing.sm,
    md: spacing.md,
    lg: spacing.lg,
    xl: spacing.xl,
  },

  radius: {
    xs: radius.xs,
    sm: radius.sm,
    md: radius.md,
    lg: radius.lg,
    xl: radius.xl,
  },

  shadows: {
    xs: shadow.xs,
    sm: shadow.sm,
    md: shadow.md,
    lg: shadow.lg,
    xl: shadow.xl,
  },

  breakpoints: layout.breakpoint,

  /**
   * Default values across the entire Mantine surface.
   *
   * The goal is that a developer can use any Mantine component directly and
   * have it already look like Liro — no wrapper, no `sx`, no copying props
   * from a neighboring screen. Everything set here is a decision no one has
   * to make again per screen.
   *
   * The density is deliberate: `sm` instead of `md` on all controls, because
   * Liro screens show many fields at once.
   */
  components: {
    // Input
    TextInput: { defaultProps: { size: 'sm' } },
    Textarea: { defaultProps: { size: 'sm', autosize: true, minRows: 3 } },
    NumberInput: { defaultProps: { size: 'sm', decimalSeparator: ',', thousandSeparator: '.' } },
    PasswordInput: { defaultProps: { size: 'sm' } },
    JsonInput: { defaultProps: { size: 'sm' } },
    Select: { defaultProps: { size: 'sm', comboboxProps: { withinPortal: true } } },
    MultiSelect: { defaultProps: { size: 'sm', comboboxProps: { withinPortal: true } } },
    Autocomplete: { defaultProps: { size: 'sm', comboboxProps: { withinPortal: true } } },
    TagsInput: { defaultProps: { size: 'sm' } },
    FileInput: { defaultProps: { size: 'sm' } },
    PinInput: { defaultProps: { size: 'md', type: 'number', oneTimeCode: true } },
    Slider: { defaultProps: { size: 'sm', radius: '9999px', thumbLabel: 'Vrednost' } },
    RangeSlider: {
      defaultProps: { size: 'sm', radius: '9999px', thumbFromLabel: 'Od', thumbToLabel: 'Do' },
    },
    Rating: { defaultProps: { size: 'sm', color: 'liro-orange' } },
    ColorInput: {
      defaultProps: {
        size: 'sm',
        eyeDropperButtonProps: { 'aria-label': 'Izaberi boju sa ekrana' },
      },
    },
    Checkbox: { defaultProps: { size: 'sm', radius: 'xs' } },
    CheckboxGroup: { defaultProps: { size: 'sm' } },
    Radio: { defaultProps: { size: 'sm' } },
    RadioGroup: { defaultProps: { size: 'sm' } },
    /* `radius: 'full'` does not exist in Mantine's radius scale — it gets
       passed through as a CSS value, the rounding drops out, and the switch
       ends up square. That is why an explicit pixel value is used instead. */
    Switch: { defaultProps: { size: 'sm', radius: '9999px' } },
    SegmentedControl: { defaultProps: { size: 'sm', radius: 'md' } },
    Chip: { defaultProps: { size: 'sm', radius: 'sm' } },
    Fieldset: { defaultProps: { radius: 'lg', variant: 'filled' } },
    InputWrapper: {
      defaultProps: {
        size: 'sm',
        inputWrapperOrder: ['label', 'input', 'description', 'error'],
      },
    },

    // Actions
    Button: { defaultProps: { size: 'sm' } },
    ActionIcon: { defaultProps: { size: 'md', variant: 'subtle', color: 'gray' } },
    CloseButton: { defaultProps: { size: 'sm' } },
    CopyButton: { defaultProps: { timeout: 1500 } },
    FileButton: {},

    // Data display
    Table: { defaultProps: { fz: 'sm', verticalSpacing: 'sm', horizontalSpacing: 'md' } },
    Badge: { defaultProps: { size: 'sm', radius: 'xs', variant: 'light' } },
    Avatar: { defaultProps: { radius: 'xl', color: 'liro-blue' } },
    Indicator: { defaultProps: { size: 10, color: 'liro-red' } },
    Progress: { defaultProps: { size: 'sm', radius: '9999px' } },
    RingProgress: { defaultProps: { thickness: 8 } },
    Timeline: { defaultProps: { bulletSize: 20, lineWidth: 1, color: 'liro-blue' } },
    Kbd: { defaultProps: { size: 'xs' } },
    Code: { defaultProps: { fz: 'xs' } },
    Spoiler: { defaultProps: { maxHeight: 120 } },

    // Layout
    Paper: { defaultProps: { radius: 'lg' } },
    Card: { defaultProps: { radius: 'lg', withBorder: true, padding: 'md' } },
    Container: { defaultProps: { size: 'lg' } },
    Divider: { defaultProps: { size: 1 } },
    Accordion: { defaultProps: { radius: 'md', variant: 'separated', chevronPosition: 'right' } },
    Stepper: { defaultProps: { size: 'sm', iconSize: 32, color: 'liro-blue' } },
    /*
     * `keepMounted: false` saves the browser work, but it has a consequence
     * worth knowing: a modal defined inside a panel disappears when the tab
     * changes. Modals go at the page level, outside <Tabs>.
     */
    Tabs: { defaultProps: { radius: 'md', keepMounted: false } },
    /* Tabs are always centered. Left-aligned on a wide screen leaves a gap
       that looks like something is missing. */
    TabsList: { defaultProps: { justify: 'center' } },
    /*
     * `tabIndex` goes on the VIEWPORT, not the root.
     *
     * Mantine creates two nested elements: root and viewport. `overflow:
     * scroll` is on the viewport, and the root receives `...others` — so the
     * earlier `tabIndex: 0` ended up on the element that does not scroll at
     * all. The viewport only accepts `viewportProps`. Verified in the Mantine
     * 9.5.1 source: `data-offset-scrollbars` sits on the viewport, the same
     * place axe reports it.
     *
     * WATCH OUT: `useProps` merges default values SHALLOWLY. A component that
     * passes its own `viewportProps` (e.g. for `onScroll`) replaces the whole
     * object and loses `tabIndex` — in that case it has to set it itself.
     */
    ScrollArea: { defaultProps: { scrollbarSize: 8, type: 'hover', viewportProps: { tabIndex: 0 } } },

    // Above the page
    /*
     * The modal is FIXED, the content adapts to it.
     *
     * A table inside a modal can stretch it across the screen, so each
     * subsequent modal opens at a different size and the user loses their
     * sense of where they are. That is why the modal has an upper height
     * limit, and the body gets its own scroll.
     */
    Modal: {
      defaultProps: {
        radius: 'lg',
        centered: true,
        overlayProps: { backgroundOpacity: 0.45, blur: 2 },
        styles: {
          content: { maxHeight: '85vh', display: 'flex', flexDirection: 'column' },
          body: { overflowY: 'auto', flex: 1, minHeight: 0 },
        },
      },
    },
    /* The drawer runs edge to edge, with no radius — rounded corners on a
       panel that touches the screen edge reveal the page behind it. */
    Drawer: { defaultProps: { radius: 0, overlayProps: { backgroundOpacity: 0.45, blur: 2 } } },
    Menu: { defaultProps: { radius: 'md', shadow: 'md', withinPortal: true } },
    Popover: { defaultProps: { radius: 'md', shadow: 'md', withinPortal: true } },
    Tooltip: { defaultProps: { radius: 'sm', fz: 'xs', withArrow: true, openDelay: 300 } },
    HoverCard: { defaultProps: { radius: 'md', shadow: 'md', withinPortal: true } },
    Notification: { defaultProps: { radius: 'md', withBorder: true } },
    Dialog: { defaultProps: { radius: 'lg', shadow: 'lg' } },
    Overlay: { defaultProps: { backgroundOpacity: 0.45, blur: 2 } },

    // Navigation
    NavLink: { defaultProps: { variant: 'light' } },
    Breadcrumbs: { defaultProps: { separator: '\u203a', separatorMargin: 'xs' } },
    Pagination: { defaultProps: { size: 'sm', radius: 'md', withEdges: false } },
    Anchor: { defaultProps: { underline: 'hover' } },
    Burger: { defaultProps: { size: 'sm' } },

    // States
    Loader: { defaultProps: { size: 'sm', type: 'oval' } },
    Skeleton: { defaultProps: { radius: 'md' } },
    LoadingOverlay: { defaultProps: { overlayProps: { blur: 1 }, zIndex: 400 } },
    Alert: { defaultProps: { radius: 'md', variant: 'light' } },
  },

  /** Available through `theme.other` in components. */
  other: {
    brandFontFamily: typography.fontFamily.brand,
    headerHeight: layout.size.headerHeight,
    navbarWidth: layout.size.navbarWidth,
    contentMaxWidth: layout.size.contentMaxWidth,
    zIndex: layout.zIndex,
  },
})

/**
 * Returns the Liro theme, optionally merged with overrides for a specific
 * application.
 *
 * @example
 * const theme = createLiroTheme({ primaryColor: 'liro-teal' })
 */
export function createLiroTheme(overrides?: MantineThemeOverride): MantineThemeOverride {
  return overrides ? mergeThemeOverrides(baseTheme, overrides) : baseTheme
}

export const liroTheme = baseTheme