import Link from 'next/link'
import { Stack, Text, Title } from '@mantine/core'
import { liroVar } from '@liro/tokens'
import { DocsPage, DocsShell } from '@/components/DocsShell'
import { docsTree } from '@/lib/docs'

/** Index of the documentation, grouped by section. */
export default async function DocsIndex() {
  const tree = await docsTree()
  const sections = [...new Set(tree.map((page) => page.section))]

  return (
    <DocsShell>
      <DocsPage>
        <Stack gap="xl">
          <Stack gap={4}>
            <Title order={1} fz={30}>Documentation</Title>
            <Text size="sm" style={{ color: liroVar.text.secondary }}>
              The rules of the system and the reasoning behind them. Every page answers when to use
              something, when not to, and why it is the way it is.
            </Text>
          </Stack>

          {sections.map((section) => (
            <Stack key={section} gap="xs">
              <Text
                size="xs"
                fw={700}
                style={{
                  color: liroVar.text.tertiary,
                  textTransform: 'uppercase',
                  letterSpacing: 'var(--liro-tracking-caps)',
                }}
              >
                {section}
              </Text>
              {tree
                .filter((page) => page.section === section)
                .map((page) => (
                  /*
                  * `Link` directly, not `<Anchor component={Link}>`.
                  * 
                  * `Anchor` is a client component, and a component passed as a
                  * prop cannot cross the server/client boundary — the same rule
                  * ESLint enforces for `primitives`. `Link` imported and used
                  * as an element is fine.
                  */
                 <Link
                   key={page.slug.join('/')}
                   href={`/docs/${page.slug.join('/')}`}
                   style={{
                    color: liroVar.text.link,
                    textDecoration: 'none',
                    fontSize: 'var(--liro-font-size-sm)',
                  }}
                >
                  {page.title}
                </Link>
                ))}
            </Stack>
          ))}
        </Stack>
      </DocsPage>
    </DocsShell>
  )
}