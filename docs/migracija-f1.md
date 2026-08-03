# Migracija na `@liro/ui` (F1)

Komponente su izvučene iz `Liro Business App` i očišćene od dve stvari koje su
sprečavale ponovnu upotrebu: hardkodiranih boja i zavisnosti od `next/navigation`
i Supabase-a. Ispod je šta se tačno promenilo.

## Mapa komponenti

| Bilo u Liro | Sada | Napomena |
| --- | --- | --- |
| `components/ui/PageHeader` | `PageHeader` | `backHref` → `onBack` |
| `components/ui/StatusBadge` | `StatusBadge` | `tone` sada uključuje `premium` |
| `components/ui/EmptyState` | `EmptyState` | dodata `error` varijanta |
| `components/ui/AutoStats` | `StatGrid` / `StatCard` | dodat `invertDiff` |
| `components/ui/TablePagination` | `TablePagination` | `totalPages` se sada računa sam |
| `components/ui/DeleteConfirmModal` | `DeleteConfirmModal` | tanak omotač oko `ConfirmModal` |
| `components/ui/ModuleGrid` | `ModuleGrid` | moduli su prop, ne interni `useModules` |
| `components/ui/ColorSchemeToggle` | `ColorSchemeToggle` | — |
| `components/layout/StatusScreen` | `StatusScreen` | `iconBg` → `tone` |
| `components/layout/AuthLayout` | `AuthShell` | slika je prop `cover` |
| `lib/i18n` | `@liro/i18n` | dodati `formatNumber` / `formatCurrency` / `formatDate` |
| — | `SectionCard` | nova |
| — | `Toolbar` | nova |
| — | `KeyValueList` | nova |
| — | `DataTable` | prezentacioni deo budućeg `AutoTable`-a |

`AutoTable`, `AutoForm`, `FormModal` i `FormDrawer` **nisu** u F1. Oni zovu
Supabase direktno i čekaju adapter sloj iz F2.

## Tri prekidajuće izmene

**`PageHeader` više ne zna za rutiranje.** Umesto `backHref="/employees"` prosleđuje
se `onBack={() => router.push('/employees')}`. Komponenta koja importuje
`next/navigation` ne može da se koristi izvan Next-a, a ni da se testira bez
rutera. Isti razlog stoji iza `linkComponent` propa na `StatusScreen`-u i
`ModuleGrid`-u — aplikacija prosleđuje `next/link`, biblioteka ne pretpostavlja
da postoji.

**`ModuleGrid` ne dovlači module.** Ranije je interno pozivao `useModules()`.
Sada prima `modules` niz. Liro Business App zadržava svoj hook i prosleđuje
rezultat; ERP će imati svoj izvor.

**`StatusScreen` bira boju preko `tone`, ne preko `iconBg` heksa.** `tone="danger"`
umesto `iconBg="#A4262C"`. Zbog toga ekran radi i u tamnoj temi.

## Šta je nestalo iz koda

Nijedna komponenta više ne sadrži heks vrednost. Sve boje idu kroz `liroVar`,
što znači da tamna tema radi bez ijednog dodatnog pravila. Ranije je
`PageHeader` forsirao `color: '#323130'`, pa je naslov u tamnoj temi bio
nevidljiv — takvih mesta je bilo trinaest.

## Uključivanje u aplikaciju

`next.config.ts`:

```ts
transpilePackages: ['@liro/tokens', '@liro/theme', '@liro/i18n', '@liro/ui'],
```

Redosled uvoza CSS-a u `layout.tsx`:

```ts
import '@mantine/core/styles.css'
import '@liro/tokens/css'
import '@liro/theme/styles.css'
import '@liro/ui/styles.css'
import './globals.css'
```

Provajderi se ugnježđuju ovim redom:

```tsx
<LiroThemeProvider>
  <I18nProvider initialLocale="sr">
    <LiroAppProvider config={{ name: 'Liro Business App', shortName: 'Liro' }}>
      {children}
    </LiroAppProvider>
  </I18nProvider>
</LiroThemeProvider>
```
