import { readdir, readFile } from 'node:fs/promises'
import { join, relative, resolve, dirname } from 'node:path'
import { cache } from 'react'
import { marked } from 'marked'

/**
 * Documentation read from markdown on disk.
 *
 * The markdown files are the source of truth and live at the repository root,
 * so they are readable on GitHub without this application running. This module
 * renders the same files inside the playground, next to the live components —
 * which is the whole point of the GOV.UK pattern: you read "when not to use it"
 * and see the thing itself on the same screen.
 *
 * Server-only. `marked` and `node:fs` never reach the browser.
 *
 * NOTE for deployment: files outside `apps/playground` are read at request or
 * build time. With `output: 'standalone'` they must be declared in
 * `outputFileTracingIncludes`, otherwise the page renders empty in production.
 */

/* `process.cwd()` is `apps/playground` under both `next dev` and `next build`. */
const REPO = resolve(process.cwd(), '..', '..')
const DOCS = join(REPO, 'docs')

export interface DocPage {
  /** URL segments after `/docs`. */
  slug: string[]
  /** Absolute path on disk. */
  file: string
  title: string
  /** Section this page belongs to in the sidebar. */
  section: string
}

export interface DocHeading {
  id: string
  title: string
  level: 1 | 2
}

/**
 * HTML entities back to characters, for slug computation only.
 *
 * `marked` escapes `&` in heading text, so `## Page Templates & App Shell`
 * becomes `<h2>Page Templates &amp; App Shell</h2>`. The table of contents
 * computes its slug from the markdown source and got `page-templates-app-shell`,
 * while the injected `id` was computed from the HTML and got
 * `page-templates-amp-app-shell`.
 *
 * The two never matched, so `getElementById` returned null for every heading
 * containing a special character - the item could not become active and its link
 * pointed at an anchor that did not exist.
 */
function decodeEntities(html: string): string {
  return html
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#(\d+);/g, (_, code: string) => String.fromCharCode(Number(code)))
}

/**
 * Anchor id from heading text.
 *
 * Must produce the same value here and in the injected `id` attribute, so the
 * table of contents actually scrolls somewhere. Diacritics are stripped rather
 * than transliterated: `Sačuvaj` and `Sacuvaj` would otherwise be two anchors.
 */
export function slugify(text: string): string {
  return text
    .replace(/<[^>]+>/g, '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

async function markdownFiles(dir: string): Promise<string[]> {
  const entries = await readdir(dir, { withFileTypes: true })
  const out: string[] = []

  for (const entry of entries) {
    const full = join(dir, entry.name)
    if (entry.isDirectory()) out.push(...(await markdownFiles(full)))
    else if (entry.name.endsWith('.md')) out.push(full)
  }

  return out
}

function titleOf(source: string, fallback: string): string {
  const match = /^#\s+(.+)$/m.exec(source)
  return match ? match[1]!.trim() : fallback
}

/*
 * Pages at the root of `docs/` that belong at the beginning, not under
 * "Reference". Written out because the order in which someone reads
 * documentation the first time is an editorial decision, not something a
 * directory listing knows.
 */
const START_HERE = new Set(['getting-started', 'navigation-patterns'])

/**
 * Every page, in sidebar order.
 *
 * `AGENTS.md` sits at the repository root, not in `docs/`, because an engineer
 * and an agent must both find it without opening a folder. It is still the most
 * important page in the documentation, so it is pulled in here under `/docs/agents`.
 *
 * Wrapped in React `cache`, so one request reads the disk once.
 *
 * A single page called this three times - `generateStaticParams`, `findDoc` and
 * `renderDoc` - and each call re-read every file. `cache` deduplicates within a
 * request without keeping anything stale between them, which a module-level
 * variable would.
 */
export const docsTree = cache(async function docsTree(): Promise<DocPage[]> { 
  const files = await markdownFiles(DOCS)
  const pages: DocPage[] = []

  const agents = join(REPO, 'AGENTS.md')
  pages.push({
    slug: ['agents'],
    file: agents,
    title: titleOf((await readFile(agents, 'utf8')).replace(/\r\n/g, '\n'), 'Rules'),
    section: 'Start here',
  })

  for (const file of files.sort()) {
    const rel = relative(DOCS, file).replace(/\\/g, '/')
    const parts = rel.replace(/\.md$/, '').split('/')

    /* `folder/README.md` is that folder's index page, at `/docs/folder`. */
    const slug = parts[parts.length - 1] === 'README' ? parts.slice(0, -1) : parts
    if (slug.length === 0) continue

    const source = (await readFile(file, 'utf8')).replace(/\r\n/g, '\n')
    pages.push({
      slug,
      file,
      title: titleOf(source, slug[slug.length - 1]!),
      section:
        parts.length > 1
          ? parts[0]!
          : START_HERE.has(slug[0]!)
            ? 'Start here'
            : 'Reference',
    })
  }

  /*
   * Explicit order for the beginning; everything else keeps its alphabetical
   * position. Alphabetical would put "Architecture" before "Getting started",
   * which is the wrong first page for someone who has just cloned the repo.
   */
  const ORDER = ['agents', 'getting-started', 'navigation-patterns']
  pages.sort((a, b) => {
    const ai = ORDER.indexOf(a.slug.join('/'))
    const bi = ORDER.indexOf(b.slug.join('/'))
    if (ai !== -1 || bi !== -1) return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi)
    return 0
  })

  return pages
})

export async function findDoc(slug: string[]): Promise<DocPage | null> {
  const tree = await docsTree()
  const wanted = slug.join('/')
  return tree.find((page) => page.slug.join('/') === wanted) ?? null
}

/** Headings for the table of contents, taken from the source, not the HTML. */
export function headings(source: string): DocHeading[] {
  const out: DocHeading[] = []

  /*
  * `\r` is stripped before matching.
  *
  * A file saved on Windows leaves `## Title\r` after `split('\n')`. In a JS
  * regex `.` does not match `\r`, so `(.+)$` stops before it and `$` never
  * reaches the end of the string - the heading silently does not match and the
  * table of contents comes out empty.
  */ 
  for (const line of source.replace(/\r\n/g, '\n').split('\n')) {
    const match = /^(#{2,3})\s+(.+)$/.exec(line)
    if (!match) continue
    const title = match[2]!.replace(/`/g, '').trim()
    out.push({ id: slugify(title), title, level: match[1]!.length === 2 ? 1 : 2 })
  }

  return out
}

export async function renderDoc(page: DocPage): Promise<{ html: string; toc: DocHeading[] }> {
  const source = (await readFile(page.file, 'utf8')).replace(/\r\n/g, '\n')
  let html = await marked.parse(source, { gfm: true, async: false })

  /*
   * Heading ids are injected after parsing, not through a custom renderer.
   *
   * `marked`'s renderer signature changed between major versions; the shape of
   * its heading output did not. Post-processing survives an upgrade.
   */
  html = html.replace(
    /<h([23])>(.*?)<\/h\1>/g,
    (_, level: string, inner: string) =>
      /* The slug is computed from decoded text, the heading keeps the escaped
         HTML. Both sides must slugify the same characters. */
      `<h${level} id="${slugify(decodeEntities(inner))}">${inner}</h${level}>`,
  )

  /*
   * A `<pre>` with `overflow-x: auto` is a region the mouse can scroll and the
   * keyboard cannot. `aria-label` is not allowed on `<pre>` (role `generic`),
   * so the role comes first and the name after it.
   */
  html = html.replace(
    /<pre>/g,
    '<pre tabindex="0" role="group" aria-label="Code example">',
  )

  /* Same reasoning for tables, which overflow on narrow screens. */
  html = html
    .replace(/<table>/g, '<div class="liro-prose-scroll" tabindex="0" role="group" aria-label="Table"><table>')
    .replace(/<\/table>/g, '</table></div>')

  /*
   * Links between markdown files must become application routes.
   *
   * Resolved against the directory of the page being rendered, then looked up in
   * the tree — so `primary.md`, `../architecture.md` and `../../AGENTS.md` all
   * work, and a link to a file that is not published stays untouched rather than
   * silently pointing at a 404.
   */
  const tree = await docsTree()
  const byFile = new Map(tree.map((doc) => [doc.file, `/docs/${doc.slug.join('/')}`]))

  html = html.replace(/href="([^"]+\.md)(#[^"]*)?"/g, (whole, target: string, hash = '') => {
    const resolved = resolve(dirname(page.file), target)
    const href = byFile.get(resolved)
    return href ? `href="${href}${hash}"` : whole
  })

  return { html, toc: headings(source) }
}