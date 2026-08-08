# Liro Design System — pravila rada

Ovaj fajl čitaš pre nego što promeniš bilo šta u repozitorijumu.

## Šta je ovaj repozitorijum

Dizajn sistem koji stoji **iznad Mantine-a**, a **ispod** proizvoda. Nije vezan
ni za jednu aplikaciju. Postoji da bi svaki sledeći proizvod izgledao i ponašao
se isto, bez dogovaranja i bez ponovnog odlučivanja.

Šesnaest paketa i jedna aplikacija (`apps/playground`) koja je živa
dokumentacija.

**Šta ovde ne ide:**
- Poslovna logika bilo kog proizvoda
- Pozivi ka konkretnoj bazi ili API-ju (`@liro/data` definiše *ugovor*, ne
  implementaciju; `@liro/data-supabase` je jedna od implementacija)
- Ekrani koji imaju smisla samo u jednom proizvodu

Ako se dvoumiš pripada li nešto ovde: pitanje je da li bi to trebalo i drugom
proizvodu. Ako ne — ne pripada.

---

## Pre nego što išta promeniš

```bash
pnpm install
pnpm dev        # playground na 3100
```

Pre nego što kažeš da si gotov, sve četiri moraju proći:

```bash
pnpm lint       # 0 grešaka; upozorenja su dozvoljena
pnpm typecheck
pnpm test
pnpm build
```

Kad `pnpm install` promeni `node_modules`, restartuj TypeScript server u
uredniku — inače vidiš greške kojih nema.

---

## Slojevi i smer zavisnosti

Zavisnosti idu **samo nadole**. Paket nikada ne uvozi paket iznad sebe.

**`@liro/forms` ne zavisi od `@liro/ui` i to zadržavamo kao pravilo.** Forma
mora raditi i u aplikaciji koja ne koristi ostatak sistema. Ako ti u `forms`
zatreba `ActionButton`, koristi Mantine `Button` — tako radi i `AutoForm`.

**`@liro/preset` zavisi od svega** i to je u redu. On je meta-paket: aplikacija
instalira njega i dobija podešen Next, ispravan redosled CSS-a i ceo niz
providera.

---

## Granica server/klijent

Postoje **tri** vrste komponenti, ne dve.

| Vrsta | Direktiva | Gde radi | Gde živi |
|---|---|---|---|
| Deljena | nema, i **nema hukova** | u oba stabla | `@liro/ui/primitives` |
| Klijentska | `'use client'` | u oba (server ume da renderuje klijenta) | `@liro/ui` |
| Serverska | `await`, `cookies()` | samo u serverskom stablu | u aplikaciji, ne ovde |

**Pravila deljenog sloja** (`packages/ui/src/primitives/**`) — ESLint ih
sprovodi, ne oslanjaj se na pamćenje:

- Bez `'use client'`
- Bez ijednog huka
- Bez funkcija u propovima — funkcija ne može preći granicu server/klijent.
  Umesto `onBack: () => void` koristi slot `back?: ReactNode`
- Tekst dolazi kao gotov `string`, ne kao `LocalizedLabel`. Prevod je posao
  sloja iznad

**Zašto ovako:** komponenta koju treba i serverska i klijentska stranica ne
sme biti Server Component — klijentska stranica je ne bi mogla koristiti.
Deljeni sloj je jedini oblik koji radi na obe strane.

Klijentski `@liro/ui` je tanak omotač oko deljenog: prima `LocalizedLabel`,
razrešava prevod kroz `useI18n()`, prosleđuje gotov tekst nadole. Kada
prebacuješ komponentu u deljeni sloj, **ne menjaj javni API** — postojeći
ekrani ne smeju primetiti.

Serverska stranica koristi `getServerI18n()` iz `@liro/i18n/server`, koji ima
namerno isti oblik kao `useI18n()`:

```ts
const { t, formatCurrency } = useI18n()             // klijent
const { t, formatCurrency } = await getServerI18n() // server
```

---

## Tokeni

**`packages/tokens/src/styles/tokens.css` je generisan fajl.** Posle izmene u
`semantic.ts` obavezno `pnpm tokens:build` — inače CSS promenljive nose staru
vrednost, a ništa ne prijavi grešku.

Tri sloja: primitivi (`gray[3]`) → semantika (`surface.raised`) → upotreba
(`liroVar.surface.raised`).

- Komponenta koristi **isključivo** `liroVar.*` ili `var(--liro-*)`
- Heks vrednost u komponenti je greška; ESLint je odbija
- Samo `@liro/tokens` sme da definiše boje

**`brand.solid` je pozadina, `text.brand` je tekst.** Idu u suprotnim smerovima
po temama — u tamnoj pozadina mora biti tamnija, tekst svetliji — i ne smeju
deliti isti token. Resolver mapira `--mantine-primary-color-filled` na
`brand.solid`, pa svaka izmena tog tokena menja **svako puno dugme u sistemu**.
Ista greška se već desila dvaput: prvo u tamnoj temi, pa u svetloj.

Tamna tema radi bez ijednog dodatnog pravila **zato što** se ovo poštuje. Prvi
heks koji prođe je prvo mesto koje će u tamnoj temi izgledati pogrešno.

---

## Namere umesto boja

`ActionButton` **ne prima `color` ni `variant`.** Prima `intent`.

```tsx
<ActionButton intent="delete" />          // ispravno
<Button color="red">Obriši</Button>       // nije
```

Namera nosi ikonicu, boju, podrazumevani natpis i težinu. Zato se šest punih
dugmadi na jednom ekranu ne mogu ni napraviti.

Ako radnja traži boju koja ne postoji u katalogu namera — **greška je u
katalogu, ne na mestu upotrebe.** Dodaje se u `packages/tokens/src/intents.ts`,
jednom, i odmah važi svuda.

Menja se natpis, ne boja: `label={{ sr: 'Novo lice' }}` je preciznije i
korisno. Zeleno „Novo" nije.

---

## Deset pravila sistema

Iste one sa stranice `/uvod/pravila`. Pročitaju se jednom; posle toga ih sistem
sam sprovodi.

1. **`ActionButton` ne prima `color` ni `variant`.** Ta dva propa su razlog
   zbog kojeg dva ekrana u istoj aplikaciji izgledaju kao dva proizvoda.
2. **Komponente ne sadrže heks vrednosti.** Sve ide kroz `liroVar`.
3. **Natpis se menja, boja ne.**
4. **Jedna puna dugmad po ekranu.** Namera nosi podrazumevanu težinu.
5. **Tabela na telefonu nije tabela.** Horizontalni skrol kroz pet kolona niko
   ne čita — `mobile` prop opisuje karticu.
6. **Prazna vrednost je crtica.** Bez nje se ne vidi razlika između „nema
   podatka" i „polje se nije učitalo".
7. **Modali stoje izvan `Tabs`.** `keepMounted` je `false`, pa modal u
   neaktivnom panelu ne postoji.
8. **Sakrivena polja ne putuju u bazu.** Inače se čuva vrednost koju korisnik
   nije ni video.
9. **Greška stoji uz polje.** Opšta poruka na vrhu se ne povezuje sa unosom.
10. **Uspeh nestaje, greška čeka.** Poruka o grešci koja nestane za tri sekunde
    je isto što i poruka koje nije bilo.

---

## Kako se dodaje komponenta

1. **Proveri da već ne postoji.** Sistem ima preklapanja (`DataTable` /
   `ResourceTable`, `StatusScreen` / `StatusTemplates`). Nova komponenta koja
   radi 80% postojeće je dug, ne doprinos.
2. **Odredi sloj.** Bez stanja i bez funkcija u propovima → `primitives`.
   Inače → odgovarajući folder u `@liro/ui`.
3. **Jedan fajl, jedna komponenta.** Fajl sa pet nepovezanih komponenti znači
   da uvoz jedne povlači svih pet.
4. **Čiste funkcije u zaseban modul bez direktive.** `toMinor` i `srPlural`
   žive u `money.ts` i `plural.ts` upravo zato — da mogu biti testirane bez
   pokretanja Reacta.
5. **Izvezi iz `packages/<paket>/src/index.ts`**, uključujući tipove.
6. **Dodaj primer u katalog** sa `code` blokom.
7. **Napiši komentare koji objašnjavaju *zašto*, ne *šta*.** Kod već kaže šta
   radi. Komentar treba da kaže zbog čega je ovako, a ne drugačije.

Komentari se pišu bez dijakritike (`sr` bez „č, ć, š, ž, đ") jer neki alati
lome kodiranje u izvornim fajlovima. Tekst koji vidi korisnik — sa
dijakritikom, uvek.

---

## Katalog

`apps/playground/src/catalog/entries/*.tsx`. Svaki unos:

- `id`, `title`, `description`, `demo`, `from` (odakle se uvozi)
- `code` — **obavezno.** Primer koji se vidi ali ne može kopirati je pola
  primera
- `props` — tabela javnog API-ja kad postoji

Demo mora biti realan. `<Button>Dugme</Button>` ne pokazuje ništa; poslovni
ekran sa stvarnim nazivima pokazuje kako komponenta izgleda u upotrebi.

---

## i18n

- `LocalizedLabel` je `string | Partial<Record<Locale, string>>`. Običan string
  je dozvoljen kad prevod nije potreban
- Jezici: `sr` (latinica), `sr-Cyrl` (ćirilica), `en`
- Fallback lanac: traženi → `sr` → `en` → prva neprazna vrednost. Nikada prazan
  ekran
- **Čiste funkcije žive u `packages/i18n/src/format.ts`, bez direktive.**
  `i18n.tsx` ima `'use client'`, a ta direktiva važi za ceo modul — funkcija
  reeksportovana odatle ne može se pozvati sa servera
- Množina se ne izbegava. `srPlural` postoji jer `3 stavke` i `5 stavki` nisu
  isti oblik, a `Izabrano: 3` je zaobilaženje problema

---

## Datumi i novac

**Datumi su stringovi `YYYY-MM-DD`**, ne `Date` objekti. Nema vremenskih zona i
nema pomeranja za dan. `@liro/dates` ne zavisi od `dayjs`.

`parseSerbianDate` prihvata ono što operater zaista kuca: `010326`, `1.3.2026`,
`01/03/2026`. Dvocifrena godina: do 69 je dvehiljadite, od 70 devetnaeste.

**Novac se poredi u parama, ne u decimalnim brojevima.** `0.1 + 0.2 !== 0.3` —
nalog od sto redova bi se razbalansirao za dinar iz čistog zaokruživanja.
Koristi `toMinor` / `fromMinor` iz `@liro/ui`.

`formatCurrency` spaja iznos i valutu **nedeljivim razmakom** (`U+00A0`).
Običan razmak dozvoljava da se `RSD` prelomi u novi red.

Ovo je funkcija za **prikaz**. U CSV i Excel idu sirovi brojevi.

---

## Performanse — greške koje smo već napravili

**Ne renderuj dvaput.** `hiddenFrom` i `visibleFrom` iz Mantine-a **sakrivaju
CSS-om, ali oba stabla nastaju.** `DataTable` je zbog toga na svakom ekranu
pravio i tabelu i mobilne kartice. Za 932 reda to je bilo 1.592 ms po
interakciji. Koristi `useMediaQuery` i pravo grananje.

**Ništa nasumično i ništa vremenski zavisno u renderu.** `Math.random()`,
`Date.now()`, `new Date()` daju jednu vrednost na serveru, drugu u pregledaču,
i React prijavi neslaganje pri hidrataciji. Za testne podatke koristi
deterministički generator iz rednog broja. Za sat koji kuca — `useState(null)`
plus `useEffect`.

**Funkcije u propovima definiši van komponente ili kroz `useMemo`.**
`getRowId={(row) => row.id}` napisano inline pravi novu funkciju pri svakom
renderu i ruši svaki `useMemo` koji od nje zavisi.

**`Intl` formattere keširaj.** Pravljenje instance je skupo, upotreba jeftina.

**Virtuelizuj obe strane.** Tabela i mobilne kartice imaju istu granicu; jedna
bez druge je pola rešenja.

---

## Pristupačnost — minimum

- `aria-sort` na koloni koja se sortira. Strelica za čitač ekrana ne postoji
- Sve što reaguje na klik reaguje i na tastaturu. Ako je element `<div>` sa
  `onClick`, pretvori ga u `UnstyledButton` — dobiješ ulogu, fokus i
  Enter/razmak besplatno
- `aria-live="polite"` na brojaču koji se menja, `role="status"` na stanju
  posla. Bez toga korisnik čekira red i ne dobije nikakvu povratnu informaciju
- Razmak i Enter nisu isto: **Enter otvara, razmak čekira.** Link se po
  standardu otvara samo Enter-om — to nije greška
- Polje u mreži za unos mora imati `aria-label`; zaglavlje kolone nije povezano
  sa poljem
- **Kontrast se meri posle mešanja slojeva, ne prema deklarisanoj boji.**
 Providni preliv preko teksta menja efektivnu pozadinu. `CapacityTimeline` je
 padao iako su svi tokeni bili ispravni: traka napretka na 25% je mešala
 `tone.solid` u `tone.bg` ispod natpisa i obarala info sa 5.04 na 3.65
- **Tekst preko `background-image` axe NE meri.** Vrati `incomplete`, ne pad, a
`a11y.spec.ts` broji samo `violations` — dakle test prolazi a problem ostaje.
Tu odlučuje račun na najsvetliju moguću sliku, ne provera. `surface.scrim` je
55% jer 45% daje 3.35 na beloj slici
- **Prozirnost na tekstu ulazi u odnos kontrasta.** `opacity: 0.85` na belom
natpisu preko zatamnjene bele slike obara 4.76 na 3.95. Tiši tekst se pravi
veličinom i težinom, ne prozirnošću
- Prazan `aria-label` je gori od nikakvog. Mantine ga upiše sam kad izostaviš
`thumbLabel` na `Slider`-u — atribut postoji, ime ne
- Kod Mantine omotača proveri **na koji čvor** atribut stvarno pada. `tabIndex`
na `ScrollArea` ide na koren, a skroluje se viewport — treba `viewportProps`
- `aria-label` na `<div>` ili `<pre>` je zabranjen (uloga `generic`). Ako elementu treba ime, prvo mu treba uloga: `role="group"`
elementu treba ime, prvo mu treba uloga: `role="group"`

---

## Testovi

`pnpm test` pokreće Vitest nad `packages/*/src/**/*.test.ts`.

**Testiraju se čiste funkcije** — one koje tiho lome podatke: formatiranje,
parsiranje, provere identifikatora, pravila množine, računanje u parama.

**Ne testiraju se komponente jediničnim testovima.** DOM test komponente
uglavnom proverava da Mantine i dalje radi, što nije naš posao.

Paket koji ima testove mora imati `vitest` u svojim `devDependencies` — pnpm ne
deli zavisnosti korena.

### Vizuelna regresija

`pnpm e2e` poredi 59 ruta × 2 teme sa snimcima u `e2e/catalog.spec.ts-snapshots`. **Prag i režim osvežavanja su par i menjaju se zajedno.**

| | Vrednost | Zašto |
|---|---|---|
| `threshold` | `0.2` | Razlika po pikselu. Pokriva antialiasing na ivici slova. |
| `maxDiffPixelRatio` | `0.001` | Prvo je bilo `0.02` — promena boje **svih** dugmadi u sistemu je oko 0.07% `fullPage` snimka, pa je prošla neprimećeno na svih 118 snimaka. |
| `--update-snapshots` | `changed` | Prepisuje samo ono što je palo. |

**Ako se prag ikad digne,** **`changed`** **prestaje da radi** i mora se vratiti `all`: kad prave promene ne padaju, nema šta da se prepiše i osnove tiho zastarevaju.

Na to smo već naleteli — `e2e:update` je odbio da osveži `/application`.

**Zašto ne** **`maxDiffPixels: 0`**. Izmereno: između dva računara 36 od 59 ruta ima sitnu razliku, verovatno antialiasing. Sa nultom tolerancijom svaka smena računara obori 72 testa. Prag od `0.001` je kalibrisan da uhvati dodavanje jedne komponente, a podnese šum između mašina.

**Osnove nose sufiks** **`-win32`**, pa `pnpm e2e` **ne ide u CI** — na Linux-u ti fajlovi ne postoje. `pnpm a11y` ide, jer `axe-core` računa iz izračunatog CSS-a i rezultat je isti na svakom sistemu.

**Sitne promene se slažu.** Razlika ispod praga ne obori test, pa osnova ostane stara. Posle deset takvih jedna stranica jednog dana padne, a diff pokaže sumu deset stvari od kojih se ne prepoznaje ni jedna. Zato: **pre svakog objavljivanja verzije jednom** **`--update-snapshots=all`**, uvek na istom računaru. Tada se dug briše svesno.

---

## Domenska pravila koja se ne izmišljaju

`@liro/validators` je samostalan paket bez zavisnosti. Sadrži pravila srpskog
poslovnog okruženja. **Nije obavezan** — proizvod van tog tržišta ga ne
instalira.

Sve u tabeli je **provereno stvarnim podacima**. Ne menjaj bez novih stvarnih
podataka.

| Podatak | Kontrola | Potvrđeno |
|---|---|---|
| PIB | ISO 7064 MOD 11,10 nad 8 cifara | 3 stvarna |
| Matični broj | **nema kontrolu** — redni broj u registru APR-a | 4 stvarna + pretraga ~2M shema |
| JMBG | MOD 11, težine 7-6-5-4-3-2 ponovljene; `m = 1` je nevažeće | 2 stvarna |
| Evidencioni broj stranca | 13 cifara, **ne prati JMBG kontrolu** | 1 stvaran |
| Tekući račun | ISO 7064 MOD 97; ceo 18-cifreni niz `mod 97 === 1` | 5 stvarnih, 5 banaka |
| Poziv na broj, model 97 | MOD 97, kontrola **na početku** niza | 4 primera |
| Poziv na broj, model 11 | MOD 11, težine od `dužina_tela + 1` do 2, po delu | 7 parova, 5 različitih kontrola |

**Pravilo iznad svih ostalih:**

> Algoritam se ne piše dok uzorak nema **različite** kontrolne vrednosti.

Šest primera sa istom poslednjom cifrom ne dokazuju ništa — svaka formula koja
slučajno vrati tu cifru „prolazi". Kod matičnog broja je ovo pravilo sprečilo
da se izmisli kontrola koje nema.

**Vrsta podatka se ne pogađa iz oblika.** Evidencioni broj stranca ima trinaest
cifara kao i JMBG, ali ne prolazi njegovu kontrolu — pravilo „trinaest cifara
znači JMBG" bi odbilo ispravan broj svakog stranca. Aplikacija mora reći koja
je vrsta.

**Lažno odbijanje je gora greška od propuštanja.** Kad ne znaš pravilo, propusti
i zapiši da ne znaš.

**Oznaka pola iz JMBG-a nije rodni identitet.** `registrovaniPolIzMaticnogBroja`
vraća administrativni podatak iz registra. Ne koristi se za popunjavanje polja
u interfejsu — samo za obrasce koji izričito traže vrednost iz registra. Za sve
ostalo se pita osoba.

---

## Čega se nikad ne radi

- Ne dodaje se `color` ili `variant` na `Button` u kodu proizvoda
- Ne piše se heks vrednost izvan `@liro/tokens`
- Ne dodaje se `'use client'` u `primitives`
- Ne uvozi se čista funkcija iz modula koji ima `'use client'` u serverskoj
  komponenti
- Ne menja se javni API postojeće komponente bez omotača koji čuva staro
  ponašanje
- Ne dodaje se zavisnost u `@liro/tokens`, `@liro/i18n/format` ili
  `@liro/validators` — ta tri sloja moraju ostati čista
- Ne piše se poslovna logika proizvoda u dizajn sistem

---

## Kad nisi siguran

Pitaj. Tri puta u razvoju ovog sistema pretpostavka o domenskom pravilu bila je
pogrešna, a svaki put je čovek koji poznaje domen ispravio u jednoj rečenici.
Pretpostavka koja uđe u kod košta mnogo više od pitanja.