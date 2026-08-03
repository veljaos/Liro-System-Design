# Motor formi (F2b)

`AutoForm` opisuje formu kao podatak. Razlog je isti kao kod tabela: ekran za
unos zaposlenog ima četrdesetak polja, i pisati ih ručno znači četrdeset prilika
da se razmak, veličina kontrole ili način prikaza greške razlikuju od susednog
ekrana.

```tsx
const schema: FieldSchema[] = [
  { name: 'first_name', type: 'text', label: { sr: 'Ime', en: 'First name' }, required: true },
  {
    name: 'client_id',
    type: 'relation',
    label: { sr: 'Klijent', en: 'Client' },
    relation: { resource: 'clients', labelField: 'name', searchFields: ['name', 'pib'] },
  },
  {
    name: 'branch_id',
    type: 'relation',
    label: { sr: 'Poslovnica', en: 'Branch' },
    relation: {
      resource: 'branches',
      labelField: 'name',
      dependsOn: { field: 'client_id', column: 'client_id' },
    },
  },
  { name: 'gross_salary', type: 'currency', label: { sr: 'Bruto zarada', en: 'Gross salary' } },
  { name: 'start_date', type: 'date', label: { sr: 'Datum zasnivanja', en: 'Start date' } },
]

<FormModal opened={opened} onClose={close} schema={schema} onSubmit={save} />
```

## Tipovi polja

`text`, `email`, `password`, `textarea`, `number`, `currency`, `date`, `select`,
`multi-select`, `checkbox`, `switch`, `relation`, `multi-relation`,
`localized-text`, `upload`, `custom` — plus tri rasporeda koja nemaju svoju
vrednost: `row`, `section`, `tabs`.

## Četiri odluke koje vredi znati

**Unos datuma prati kako se datumi zaista kucaju.** Operater koji unosi stotinu
naloga ne kuca tačke. `parseSerbianDate` prihvata `010326`, `01032026`,
`1.3.2026`, `01-03-2026` i `2026-03-01`, a odbija nepostojeće datume — `31.02`
i `29.02.2025` vraćaju `null` umesto da se tiho pretvore u sledeći mesec.
Vrednosti se čuvaju kao `YYYY-MM-DD` stringovi, kako Mantine 9 i očekuje, pa
nema vremenskih zona ni pomeranja za jedan dan.

**Padajuće liste pretražuju na serveru.** Šifarnik partnera ima hiljade redova;
dovlačenje svih pri otvaranju forme je i sporo i nepotrebno. `RelationField`
šalje pojam pretrage kroz `DataProvider` sa odloženim okidanjem od 300 ms.
`dependsOn` vezuje listu za drugo polje — izbor klijenta filtrira njegove
poslovnice, a dok klijent nije izabran polje stoji onemogućeno sa jasnim
objašnjenjem umesto praznog spiska.

**Uslovi se prate ciljano.** `conditionFields` govori koja polja `condition`
čita, pa se forma ne prerenderuje na svaki pritisak tastera. Ako se izostavi,
`AutoForm` prati celu formu — radi ispravno, samo sporije. Na formama sa
četrdeset polja razlika se oseti.

**Sakrivena polja ne putuju u bazu.** Ako uslov sakrije polje, njegova vrednost
se izostavlja pri čuvanju. Bez toga se čuva podatak koji korisnik nije ni video,
što je izvor grešaka koje se otkriju mnogo kasnije.

## Otpremanje fajlova

`FileStorage` je namerno odvojen od `DataProvider`-a: baza i skladište ne moraju
biti isti sistem. `@liro/data-supabase` nudi `createSupabaseFileStorage`, koji
razrešava nazive fajlova (ćirilica i razmaci lome putanju), podržava potpisane
adrese za privatne pregrade, i vraća putanju koja se čuva u bazi.

```tsx
<LiroFileStorageProvider storage={createSupabaseFileStorage({ client, defaultBucket: 'documents' })}>
```

Polje `upload` radi i bez provajdera — prikaže obaveštenje umesto da sruši ekran.

## Provajderi

```tsx
<LiroThemeProvider>
  <I18nProvider initialLocale="sr">
    <QueryClientProvider client={queryClient}>
      <LiroDataProvider provider={dataProvider}>
        <LiroFileStorageProvider storage={fileStorage}>
          <LiroAppProvider config={{ name: 'Liro Business App', shortName: 'Liro' }}>
            {children}
          </LiroAppProvider>
        </LiroFileStorageProvider>
      </LiroDataProvider>
    </QueryClientProvider>
  </I18nProvider>
</LiroThemeProvider>
```
