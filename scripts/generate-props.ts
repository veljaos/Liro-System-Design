import { mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs'
import { join, relative, resolve, sep } from 'node:path'
import ts from 'typescript'
import { withCompilerOptions, type ComponentDoc, type PropItemType } from 'react-docgen-typescript'

/**
 * Izvlaci javni API komponenti iz TypeScript-a i JSDoc komentara.
 *
 * Rucno pisane tabele propova zastare pri prvoj izmeni potpisa i niko to ne
 * primeti. Ovde je izvor istine kod, a tabela samo njegov prikaz - pa ne moze
 * da se razidje.
 *
 * Pokreni posle svake izmene javnog API-ja:
 *
 *   pnpm props
 *
 * Rezultat (`props.generated.json`) se COMMITUJE, da build ne mora da ga pravi
 * i da razvoj ne zavisi od jos jednog koraka.
 */

const ROOT = resolve(process.cwd())
const PACKAGES = join(ROOT, 'packages')
const CATALOG = join(ROOT, 'apps/playground/src/catalog')
const OUTPUT = join(CATALOG, 'props.generated.json')

/*
* Sitan spisak imena, odvojen od pune reference.
*
* `DemoCard` mora znati postoji li API da bi odlucio hoce li prikazati dugme -
* ali mu za to ne treba svih 124 opisa. Puna referenca se ucitava tek na klik,
* pa ne opterecuje nijednu stranicu na kojoj se ne otvori.
*/
const INDEX_OUTPUT = join(CATALOG, 'props.index.json')

/** Fajlovi koji nisu komponente i samo bi zagadili rezultat. */
const SKIP = /\.(test|spec|stories)\.tsx?$/

function collectTsx(dir: string, out: string[] = []): string[] {
  for (const name of readdirSync(dir)) {
    if (name === 'node_modules' || name.startsWith('.')) continue
    const full = join(dir, name)
    if (statSync(full).isDirectory()) {
      collectTsx(full, out)
      continue
    }
    if (name.endsWith('.tsx') && !SKIP.test(name)) out.push(full)
  }
  return out
}

const parser = withCompilerOptions(
  {
    jsx: ts.JsxEmit.ReactJSX,
    target: ts.ScriptTarget.ES2022,
    module: ts.ModuleKind.ESNext,
    moduleResolution: ts.ModuleResolutionKind.Bundler,
    strict: true,
    skipLibCheck: true,
    esModuleInterop: true,
    allowSyntheticDefaultImports: true,
    resolveJsonModule: true,
  },
  {
    savePropValueAsString: true,
    shouldExtractLiteralValuesFromEnum: true,
    shouldRemoveUndefinedFromOptional: true,

    /*
     * Bez ovog filtera svaka komponenta nasledjuje oko dvesta propova iz
     * Mantine-a i React-ovih DOM tipova. Tabela od dvesta redova nije
     * dokumentacija nego smetnja - zanima nas samo ono sto je definisano OVDE.
     */
    propFilter: (prop) => {
      const declarations = prop.declarations ?? []
      if (declarations.length === 0) return true
      return !declarations.some((declaration) => declaration.fileName.includes('node_modules'))
    },
  },
)

interface PropDoc {
  name: string
  type: string
  required: boolean
  defaultValue: string | null
  description: string
}

interface ComponentApi {
  name: string
  package: string
  file: string
  description: string
  props: PropDoc[]
}

function packageOf(file: string): string {
  const rel = relative(PACKAGES, file)
  const name = rel.split(sep)[0]
  return name ? `@liro/${name}` : '@liro'
}

/** Uredniji prikaz tipa: bez viska razmaka, bez `| undefined`, bez suvisnih zagrada. */
function cleanType(raw: string): string {
  const cleaned = raw
    .replace(/\s*\|\s*undefined/g, '')
    .replace(/\s+/g, ' ')
    .trim()

  /* `(() => void)` -> `() => void`; zagrade su ostale posle uklanjanja unije. */
  return cleaned.startsWith('(') && cleaned.endsWith(')') ? cleaned.slice(1, -1).trim() : cleaned
}

/**
 * Citljiv tip umesto reci `enum`.
 *
 * `react-docgen-typescript` svaku uniju literala oznaci kao `enum`, a same
 * vrednosti smesti u `value`. Za `intent` bi tabela inace pisala samo "enum" -
 * bez ijedne informacije o tome sta se sme proslediti.
 *
 * Kratke unije se ispisuju u celosti. Duge (npr. 33 namere) svode se na ime
 * tipa, koje se moze potraziti - to je citljivije od reda dugackog trista
 * znakova u celiji tabele.
 */
function typeLabel(type: PropItemType | undefined): string {
  if (!type) return 'unknown'
  if (type.name !== 'enum') return cleanType(type.name)

  const values = (type.value ?? [])
    .map((entry: { value: unknown }) => String(entry.value))
    .filter((value: string) => value !== 'undefined')

  if (values.length > 0 && values.length <= 8) return cleanType(values.join(' | '))
  if (type.raw && type.raw !== 'enum') return cleanType(type.raw)
  if (values.length > 0) return `${values.slice(0, 6).join(' | ')} | …`
  return 'enum'
}

/**
 * Prvi JSDoc blok u fajlu.
 *
 * U ovom repozitorijumu se objasnjenje komponente cesto pise na vrhu fajla, a
 * ne neposredno iznad funkcije - parser ga tada ne poveze. Umesto da se pomera
 * dvadesetak komentara, uzima se kao rezerva kada opisa nema.
 */
function leadingDoc(file: string): string {
  const source = readFileSync(file, 'utf8')
  const match = /\/\*\*([\s\S]*?)\*\//.exec(source)
  if (!match?.[1]) return ''

  return match[1]
    .split('\n')
    .map((line) => line.replace(/^\s*\*\s?/, '').trimEnd())
    .join('\n')
    .trim()
}

function toApi(doc: ComponentDoc): ComponentApi | null {
  const props = Object.values(doc.props ?? {})
    .map<PropDoc>((prop) => ({
      name: prop.name,
      type: typeLabel(prop.type),
      required: prop.required,
      defaultValue: prop.defaultValue?.value ?? null,
      description: (prop.description ?? '').trim(),
    }))
    /* Obavezni propovi prvi, pa azbucno - tako se tabela cita odozgo nadole. */
    .sort((a, b) => {
      if (a.required !== b.required) return a.required ? -1 : 1
      return a.name.localeCompare(b.name)
    })

  if (props.length === 0) return null

  return {
    name: doc.displayName,
    package: packageOf(doc.filePath),
    file: relative(ROOT, doc.filePath).split(sep).join('/'),
    /* Kada parser nije nasao opis uz deklaraciju, uzmi blok sa vrha fajla. */
    description: (doc.description ?? '').trim() || leadingDoc(doc.filePath),
    props,
  }
}

const files = collectTsx(PACKAGES)
console.log(`Čitam ${files.length} fajlova…`)

const parsed = parser.parse(files)
const result: Record<string, ComponentApi> = {}

for (const doc of parsed) {
  const api = toApi(doc)
  if (!api) continue
  /*
   * Ista komponenta moze biti prepoznata vise puta (omotac i deljeni prikaz
   * nose isto ime). Zadrzavamo onu sa vise dokumentovanih propova - to je po
   * pravilu javni omotac, koji programer i koristi.
   */
  const existing = result[api.name]
  if (!existing || api.props.length > existing.props.length) result[api.name] = api
}

const sorted = Object.fromEntries(Object.entries(result).sort(([a], [b]) => a.localeCompare(b)))

mkdirSync(CATALOG, { recursive: true })
writeFileSync(OUTPUT, `${JSON.stringify(sorted, null, 2)}\n`, 'utf8')
writeFileSync(INDEX_OUTPUT, `${JSON.stringify(Object.keys(sorted), null, 2)}\n`, 'utf8')

const documented = Object.values(sorted).filter((api) => api.props.some((p) => p.description)).length
console.log(`Zapisano ${Object.keys(sorted).length} komponenti u ${relative(ROOT, OUTPUT)}`)
console.log(`Sa opisima propova: ${documented}`)
console.log(`Spisak imena: ${relative(ROOT, INDEX_OUTPUT)}`)