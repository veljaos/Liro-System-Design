# Šabloni stranica (F3)

`@liro/templates` sadrži okvir aplikacije i gotove rasporede stranica. Ovo je
sloj koji od skupa komponenti pravi aplikaciju koja izgleda isto od modula do
modula.

## Pun `AppConfig`

`LiroAppProvider` iz `@liro/ui` sada nosi i navigaciju i dozvole:

```tsx
<LiroAppProvider
  config={{
    name: 'Liro Business App',
    shortName: 'Liro',
    linkComponent: Link,
    can: (permission) => permissions.includes(permission),
    navigation: [
      { id: 'home', label: { sr: 'Početna', en: 'Home' }, href: '/', icon: Home },
      { id: 'employees', label: { sr: 'Zaposlena lica', en: 'Employees' }, href: '/employees', icon: Users },
      {
        id: 'clients',
        label: { sr: 'Klijenti', en: 'Clients' },
        href: '/system/clients',
        icon: Building2,
        group: { sr: 'Sistem', en: 'System' },
        permission: 'system.clients.view',
      },
    ],
  }}
>
```

`useNavigation()` vraća stavke pročišćene kroz `can()`. Grupa koja ostane bez
ijedne dozvoljene podstavke se ne prikazuje — bez toga bi korisnik video prazan
naslov „Sistem" iznad ničega.

## `AppShellTemplate`

Zaglavlje sa wordmarkom, putanjom, pretragom, obaveštenjima, prekidačem teme i
korisničkim menijem, plus bočna navigacija koja se na telefonu skuplja.

Ne zna ništa o rutiranju. Putanju prima kao `breadcrumbs`, trenutnu adresu kao
`pathname`, a `next/link` kroz `linkComponent` u konfiguraciji. Zato isti okvir
radi u Liro Business App-u, ERP-u i CRM-u.

```tsx
<AppShellTemplate
  user={user}
  pathname={pathname}
  breadcrumbs={crumbs}
  onSearch={spotlight.open}
  notificationCount={unread}
  onNotificationsClick={() => router.push('/notifications')}
  onLogout={logout}
>
  {children}
</AppShellTemplate>
```

## Rasporedi stranica

`ListPageTemplate` — naslov, zbirne kartice, tabela. Isti redosled na svakom
modulu: kada korisnik nauči gde stoji dugme za nov unos na zaposlenima, zna gde
je i na dokumentima.

`DetailPageTemplate` — naslov sa oznakom stanja, sadržaj i opciona bočna kolona
koja se na uskim ekranima spušta ispod.

`DashboardTemplate` — brojke na vrhu, sadržaj ispod.

## `LoadingTemplate`

Pet varijanti: `list`, `detail`, `dashboard`, `form`, `spinner`. Kostur koji
odgovara stvarnom rasporedu deluje brže od vrteške, jer se sadržaj ne pomera
kada stigne. Vrteška ostaje samo za slučajeve gde se raspored ne zna unapred.

```tsx
// app/(app)/employees/loading.tsx
export default function Loading() {
  return <LoadingTemplate variant="list" />
}
```

## Prekinuti ekrani

`NotFoundTemplate`, `ServerErrorTemplate`, `ForbiddenTemplate`,
`MaintenanceTemplate`, `SuspendedTemplate` — svi dele okvir iz `StatusScreen`-a.

Tekstovi objašnjavaju šta se desilo i šta korisnik može da uradi. Ne izvinjavaju
se i ne koriste tehničke izraze: „Stranica ne postoji" je upotrebljivije od
„404 Not Found". Svaki tekst se može zameniti kroz `title` i `description`.

## `LandingTemplate` i `LegalPageTemplate`

Javna početna strana i pravni dokumenti. Landing je namerno miran: jedan naslov,
jedna rečenica objašnjenja, dve radnje. Poslovni softver se ne prodaje
uzvičnicima nego jasnoćom o tome šta radi — pa je naslov jedino mesto sa brend
pismom, a sve ostalo je čitljiv tekst u istoj skali kao i sama aplikacija.

`LegalPageTemplate` koristi užu meru od 720px i veći prored, jer su to jedine
stranice u sistemu koje se zaista čitaju od početka do kraja.
