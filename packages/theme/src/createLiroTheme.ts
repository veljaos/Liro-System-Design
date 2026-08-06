import { createTheme, mergeThemeOverrides, type MantineColorsTuple, type MantineThemeOverride } from '@mantine/core'
import { layout, palette, radius, shadow, spacing, typography } from '@liro/tokens'

/**
 * Mantine tema izvedena iz `@liro/tokens`. Ni jedna vrednost ovde nije upisana
 * rucno - sve dolazi iz paketa tokena. Ako neka boja treba da se promeni,
 * menja se u tokenima, ne ovde.
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
  /** Indeks 6 u obe seme. */
  primaryShade: 6,
  defaultRadius: 'md',
  colors: liroColors,

  /**
   * Boja teksta na obojenoj pozadini se bira po luminaciji te pozadine.
   *
   * Prag 0.19 je IZMEREN, ne izabran po oseca:
   *
   *   blue[6]   0.182  ispod praga -> belo, odnos 4.53
   *   teal[6]   0.180  ispod praga -> belo, odnos 4.56
   *   violet[6] 0.063  ispod praga -> belo, odnos 9.31
   *   green[6]  0.203  iznad praga -> crno, odnos 5.06
   *   blue[5]   0.286  iznad praga -> crno, odnos 6.73   (puno dugme u dark temi)
   *
   * Raniji prag 0.35 je svemu davao bela slova, pa su zeleno puno dugme (4.15)
   * i puno dugme u tamnoj temi (3.12) padali ispod AA praga od 4.5.
   *
   * Ako se rampa ikad promeni, PREMERI. Razmak izmedju teal[6] (0.180) i
   * green[6] (0.203) nije velik.
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
   * Podrazumevane vrednosti za celu Mantine povrsinu.
   *
   * Cilj je da programer moze da koristi bilo koju Mantine komponentu direktno
   * i da ona vec izgleda kao Liro - bez omotaca, bez `sx`, bez kopiranja
   * propova sa susednog ekrana. Sve sto se ovde podesi je odluka koju vise
   * niko ne donosi po ekranu.
   *
   * Gustina je namerna: `sm` umesto `md` na svim kontrolama, jer Liro ekrani
   * prikazuju mnogo polja odjednom.
   */
  components: {
    // Unos
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
    /* `radius: 'full'` ne postoji u Mantine skali radijusa - prosledjuje se kao
       CSS vrednost, pravilo otpada i prekidac ispadne kockast. Zato ide
       eksplicitna vrednost u pikselima. */
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

    // Radnje
    Button: { defaultProps: { size: 'sm' } },
    ActionIcon: { defaultProps: { size: 'md', variant: 'subtle', color: 'gray' } },
    CloseButton: { defaultProps: { size: 'sm' } },
    CopyButton: { defaultProps: { timeout: 1500 } },
    FileButton: {},

    // Prikaz podataka
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

    // Raspored
    Paper: { defaultProps: { radius: 'lg' } },
    Card: { defaultProps: { radius: 'lg', withBorder: true, padding: 'md' } },
    Container: { defaultProps: { size: 'lg' } },
    Divider: { defaultProps: { size: 1 } },
    Accordion: { defaultProps: { radius: 'md', variant: 'separated', chevronPosition: 'right' } },
    Stepper: { defaultProps: { size: 'sm', iconSize: 32, color: 'liro-blue' } },
    /*
     * `keepMounted: false` stedi rad pregledaca, ali ima posledicu koju treba
     * znati: modal definisan unutar panela nestane kada se promeni kartica.
     * Modali idu na nivo stranice, izvan <Tabs>.
     */
    Tabs: { defaultProps: { radius: 'md', keepMounted: false } },
    /* Kartice su uvek centrirane. Levo poravnate na sirokom ekranu ostavljaju
       prazninu koja izgleda kao da nesto nedostaje. */
    TabsList: { defaultProps: { justify: 'center' } },
    /*
     * `tabIndex` ide na VIEWPORT, ne na koren.
     *
     * Mantine pravi dva ugnjezdena elementa: koren i viewport. `overflow:
     * scroll` je na viewport-u, a koren prima `...others` - pa je raniji
     * `tabIndex: 0` zavrsavao na elementu koji se uopste ne skroluje.
     * Viewport prima samo `viewportProps`. Provereno u izvoru Mantine 9.5.1:
     * `data-offset-scrollbars` stoji na viewport-u, isto kao sto axe prijavljuje.
     * 
     * PAZI: `useProps` spaja podrazumevane vrednosti PLITKO. Komponenta koja
     * prosledi svoj `viewportProps` (npr. zbog `onScroll`) zamenjuje ceo
     * objekat i gubi `tabIndex` - u tom slucaju ga mora upisati sama.
     */
    ScrollArea: { defaultProps: { scrollbarSize: 8, type: 'hover', viewportProps: { tabIndex: 0 } } },

    // Iznad stranice
    /*
     * Modal je FIKSAN, sadrzaj se prilagodjava njemu.
     *
     * Tabela u modalu ume da ga rasiri preko ekrana, pa se svaki sledeci modal
     * otvori u drugoj velicini i korisnik gubi osecaj gde se nalazi. Zato modal
     * ima gornju granicu visine, a telo dobija sopstveni skrol.
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
    /* Fioka ide od ivice do ivice, bez radijusa - zaobljeni uglovi na panelu
       koji dodiruje ivicu ekrana otkrivaju stranicu iza njega. */
    Drawer: { defaultProps: { radius: 0, overlayProps: { backgroundOpacity: 0.45, blur: 2 } } },
    Menu: { defaultProps: { radius: 'md', shadow: 'md', withinPortal: true } },
    Popover: { defaultProps: { radius: 'md', shadow: 'md', withinPortal: true } },
    Tooltip: { defaultProps: { radius: 'sm', fz: 'xs', withArrow: true, openDelay: 300 } },
    HoverCard: { defaultProps: { radius: 'md', shadow: 'md', withinPortal: true } },
    Notification: { defaultProps: { radius: 'md', withBorder: true } },
    Dialog: { defaultProps: { radius: 'lg', shadow: 'lg' } },
    Overlay: { defaultProps: { backgroundOpacity: 0.45, blur: 2 } },

    // Navigacija
    NavLink: { defaultProps: { variant: 'light' } },
    Breadcrumbs: { defaultProps: { separator: '\u203a', separatorMargin: 'xs' } },
    Pagination: { defaultProps: { size: 'sm', radius: 'md', withEdges: false } },
    Anchor: { defaultProps: { underline: 'hover' } },
    Burger: { defaultProps: { size: 'sm' } },

    // Stanja
    Loader: { defaultProps: { size: 'sm', type: 'oval' } },
    Skeleton: { defaultProps: { radius: 'md' } },
    LoadingOverlay: { defaultProps: { overlayProps: { blur: 1 }, zIndex: 400 } },
    Alert: { defaultProps: { radius: 'md', variant: 'light' } },
  },

  /** Dostupno kroz `theme.other` u komponentama. */
  other: {
    brandFontFamily: typography.fontFamily.brand,
    headerHeight: layout.size.headerHeight,
    navbarWidth: layout.size.navbarWidth,
    contentMaxWidth: layout.size.contentMaxWidth,
    zIndex: layout.zIndex,
  },
})

/**
 * Vraca Liro temu, opciono spojenu sa dopunama za konkretnu aplikaciju.
 *
 * @example
 * const theme = createLiroTheme({ primaryColor: 'liro-teal' })
 */
export function createLiroTheme(overrides?: MantineThemeOverride): MantineThemeOverride {
  return overrides ? mergeThemeOverrides(baseTheme, overrides) : baseTheme
}

export const liroTheme = baseTheme