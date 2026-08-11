import { notFound } from 'next/navigation'
import { Box } from '@mantine/core'
import { DocsPage, DocsShell } from '@/components/DocsShell'
import { ProseInteractions } from '@/components/ProseInteractions'
import { docsTree, findDoc, renderDoc } from '@/lib/docs'
import '../prose.css'

/**
 * One documentation page, rendered from markdown.
 *
 * A Server Component on purpose: the parser runs at build time and the browser
 * receives finished HTML. No markdown library reaches the client bundle.
 */
export async function generateStaticParams() {
  const tree = await docsTree()
  return tree.map((page) => ({ slug: page.slug }))
}

export default async function DocPage({ params }: { params: Promise<{ slug: string[] }> }) {
  const { slug } = await params
  const page = await findDoc(slug)

  if (!page) notFound()

  const { html, toc } = await renderDoc(page)

  return (
    <DocsShell>
      <DocsPage toc={toc.map((item) => ({ id: item.id, title: item.title, level: item.level }))}>
        {/*
          `dangerouslySetInnerHTML` is correct here and only here: the source is
          markdown committed to this repository, not user input. Sanitising it
          would strip the `tabindex` and `role` attributes added above for
          accessibility.
        */}
        <Box className="liro-prose" dangerouslySetInnerHTML={{ __html: html }} />
        <ProseInteractions />
      </DocsPage>
    </DocsShell>
  )
}