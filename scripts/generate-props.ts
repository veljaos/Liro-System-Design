import { mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs'
import { join, relative, resolve, sep } from 'node:path'
import ts from 'typescript'
import { withCompilerOptions, type ComponentDoc, type PropItemType } from 'react-docgen-typescript'

/**
 * Extracts the public API of components from TypeScript and JSDoc comments.
 *
 * Hand-written prop tables go stale at the first signature change and no one
 * notices. Here the source of truth is the code, and the table is just its
 * display — so it cannot drift.
 *
 * Run after every change to a public API:
 *
 *   pnpm props
 *
 * The result (`props.generated.json`) is COMMITTED, so the build does not
 * have to generate it and development does not depend on one more step.
 */

const ROOT = resolve(process.cwd())
const PACKAGES = join(ROOT, 'packages')
const CATALOG = join(ROOT, 'apps/playground/src/catalog')
const OUTPUT = join(CATALOG, 'props.generated.json')

/*
* A small list of names, separate from the full reference.
*
* `DemoCard` needs to know whether an API exists to decide whether to show a
* button — but it does not need all 124 descriptions for that. The full
* reference is loaded only on click, so it does not weigh down any page where
* it is not opened.
*/
const INDEX_OUTPUT = join(CATALOG, 'props.index.json')

/** Files that are not components and would only pollute the result. */
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
     * Without this filter, every component inherits about two hundred props
     * from Mantine and React's DOM types. A table of two hundred rows is not
     * documentation, it is a nuisance — we only care about what is defined
     * HERE.
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

/** A tidier type display: no extra whitespace, no `| undefined`, no leftover parentheses. */
function cleanType(raw: string): string {
  const cleaned = raw
    .replace(/\s*\|\s*undefined/g, '')
    .replace(/\s+/g, ' ')
    .trim()

  /* `(() => void)` -> `() => void`; the parentheses were left over after removing the union. */
  return cleaned.startsWith('(') && cleaned.endsWith(')') ? cleaned.slice(1, -1).trim() : cleaned
}

/**
 * A readable type instead of the word `enum`.
 *
 * `react-docgen-typescript` marks every literal union as `enum` and puts the
 * actual values in `value`. For `intent`, the table would otherwise just say
 * "enum" — with no information about what can be passed.
 *
 * Short unions are printed in full. Long ones (e.g. 33 intents) are reduced to
 * the type name, which can be looked up — that is more readable than a
 * three-hundred-character row in a table cell.
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
 * First JSDoc block in the file.
 *
 * In this repository, a component's explanation is often written at the top
 * of the file rather than directly above the function — the parser does not
 * connect it in that case. Instead of moving some twenty comments, it is used
 * as a fallback when there is no description.
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
    /* Required props first, then alphabetically — so the table reads top to bottom. */
    .sort((a, b) => {
      if (a.required !== b.required) return a.required ? -1 : 1
      return a.name.localeCompare(b.name)
    })

  if (props.length === 0) return null

  return {
    name: doc.displayName,
    package: packageOf(doc.filePath),
    file: relative(ROOT, doc.filePath).split(sep).join('/'),
    /* When the parser did not find a description at the declaration, take the block from the top of the file. */
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
   * The same component can be detected more than once (a wrapper and the
   * shared view carry the same name). We keep the one with more documented
   * props — that is, as a rule, the public wrapper, which is what a developer
   * actually uses.
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