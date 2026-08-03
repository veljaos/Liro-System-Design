# Adapter sloj (F2)

`AutoTable` u Liro Business App-u zove `supabase.from(tableName)` direktno.
Zbog te jedne linije komponenta ne može da se upotrebi nigde gde Supabase nije
baza — a Liro ERP i CRM neće nužno deliti istu šemu ni isti backend.

F2 razdvaja to na dva paketa.

## `@liro/data` — ugovor

```ts
interface DataProvider {
  list(resource, params): Promise<{ rows, total }>
  getOne(resource, id, options?): Promise<Row>
  create(resource, data, options?): Promise<Row>
  update(resource, id, data, options?): Promise<Row>
  remove(resource, id, options?): Promise<void>
  call(name, args?): Promise<unknown>
}
```

Pet CRUD metoda plus `call` za sve ostalo. Izveštaji, obračuni i integracije
ne pripadaju ovde — vezani su za konkretan posao aplikacije, a ne za način na
koji se tabela prikazuje. `call` je otvor kroz koji aplikacija dohvata svoje
procedure bez da dizajn sistem zna šta one rade.

Uz interfejs idu i React kuke nad TanStack Query-jem: `useResourceList`,
`useResourceItem`, `useResourceMutations`, `useCall`, `useCallMutation`.
Ključevi keša imaju jedan oblik za ceo sistem (`dataKeys`), pa poništavanje iz
bilo koje komponente pogađa tačno ono što treba.

`ResourceTable` sastavlja `Toolbar`, `DataTable` i `TablePagination` iz
`@liro/ui` i puni ih kroz provajder. Podela je stroga: u `@liro/ui` nema
nijednog mrežnog poziva, u `@liro/data` nema nijedne odluke o izgledu.

## `@liro/data-supabase` — implementacija

Nosi ono što ti je sada rasuto po `AutoTable`-u:

- `sanitizeSearchTerm` uklanja `%`, `,`, `(` i `)` — bez toga unos `50%` ili
  `d.o.o. (Beograd)` proizvodi neispravan PostgREST upit
- sastavljanje `or()` izraza sa `ilike` po zadatim kolonama
- `count: 'exact'` i `range()` za paginaciju
- `from` opcija pri brisanju, jer view sa JOIN-om ne prima `DELETE`
- prevod PostgREST kodova grešaka u `DataProviderError` sa razumljivim `code`

## `createInMemoryProvider`

Implementacija nad običnim nizom. Služi za primere i testove — i kao provera
da interfejs nije potajno oblikovan oko Supabase-a. Ako se nešto ne može
izraziti nad nizom u memoriji, verovatno ne pripada interfejsu.

## Uključivanje

```tsx
import { LiroDataProvider } from '@liro/data'
import { createSupabaseProvider } from '@liro/data-supabase'
import { createClient } from '@/lib/supabase/client'

const provider = createSupabaseProvider({ client: createClient() })

<QueryClientProvider client={queryClient}>
  <LiroDataProvider provider={provider}>{children}</LiroDataProvider>
</QueryClientProvider>
```

Zamena `AutoTable`-a:

```tsx
<ResourceTable
  resource="employees_with_details"
  deleteFrom="employees"
  columns={columns}
  searchFields={['first_name', 'last_name', 'jmbg']}
  onEdit={openEdit}
  allowDelete
  onError={(error) => notifications.show({ color: 'red', message: error.message })}
/>
```

Prikaz greške je namerno prosleđen spolja — dizajn sistem ne bi trebalo da
bira sistem obaveštenja umesto aplikacije.

## Šta nije u F2

Motor formi. `AutoForm` je pet stotina linija sa uslovnim poljima, tabovima,
relacijama i otpremanjem fajlova; njegov `RelationSelect` takođe ide kroz
provajder. To je zaseban zalogaj i dolazi kao F2b.
