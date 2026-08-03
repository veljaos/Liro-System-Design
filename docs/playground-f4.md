# Playground (F4)

Do sada je sve prolazilo samo kroz `tsc`. Playground je prvi put da kod radi u
pregledaču — i odmah je našao grešku koju typecheck ne može da vidi (v. dole).

```powershell
pnpm dev
```

Otvara se na `http://localhost:3100`.

## Šta je unutra

| Stranica | Šta pokazuje |
| --- | --- |
| `/` | Pregled, `ModuleGrid` sa zaključanim modulom |
| `/tokens` | Semantički tokeni, palete, tipografija, razmaci, radijusi, senke |
| `/components` | Sve iz `@liro/ui` u stanjima u kojima se stvarno koristi |
| `/forms` | Jedna šema sa svim tipovima polja, uslovima i relacijama |
| `/templates` | `ResourceTable` uživo nad 47 zapisa, klik na red vodi na detalje |
| `/status` | Pet prekinutih ekrana sa prekidačem |

Ceo playground radi nad `createInMemoryProvider`-om — nema baze, nema `.env`
fajla, nema podešavanja. To je i provera: ako komponenta traži nešto što se ne
može izraziti nad nizom u memoriji, previše je vezana za konkretan backend.

## Šta proveriti prvo

**Prekidač teme u zaglavlju.** Menja sve stranice odjednom. Ako negde nešto
ostane nečitljivo u tamnoj temi, to je greška u tokenima, ne u komponenti.

**Unos datuma na `/forms`.** Otkucajte `010326` i pritisnite Tab.

**Zavisne relacije na `/forms`.** Polje „Poslovnica" stoji zaključano dok se ne
izabere klijent.

**Uslovna polja na `/forms`.** Uključite olakšicu, popunite šifru, isključite je
i sačuvajte — šifra neće biti u ispisu, jer sakrivena polja ne putuju u bazu.

**Tabela na `/templates`.** Pretraga, sortiranje po koloni, promena broja redova
po strani, brisanje uz potvrdu — sve ide kroz `DataProvider`.

## Greška koju je build našao

`next build` je pukao na ovome:

```
Functions cannot be passed directly to Client Components
  {linkComponent: function i}
```

`app/not-found.tsx` je serverska komponenta i prosleđivala je `next/link` kao
prop klijentskoj komponenti. Funkcije ne mogu da pređu granicu server/klijent,
pa se build rušio na prerenderu — a `tsc` to nikada ne bi prijavio.

Popravka je promenila API na bolje: `linkComponent` sada pada nazad na
`LiroAppProvider`, pa se podešava na jednom mestu umesto da se provlači kroz
propove. Prop je i dalje tu, ali samo za klijentske komponente kojima treba
drugačija komponenta za linkove.

**Posledica za aplikacije:** u `not-found.tsx`, `error.tsx` i drugim serverskim
komponentama nemojte prosleđivati `linkComponent` — podesite ga jednom u
`LiroAppProvider`-u.

## Zašto ne Storybook

Storybook bi doneo svoj bundler, svoju konfiguraciju i svoju verziju istine o
tome kako se komponente montiraju. Playground je stvarna Next 16 aplikacija sa
istim `transpilePackages` podešavanjem koje će imati Liro ERP — pa je i test
realniji. Greška iznad je dokaz: Storybook je ne bi uhvatio jer nema RSC
granicu.
