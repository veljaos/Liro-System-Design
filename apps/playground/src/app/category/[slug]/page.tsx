'use client'

import { use } from 'react'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Anchor, Divider, Stack, Text, Title } from '@mantine/core'
import { ArrowLeft } from 'lucide-react'
import { liroVar } from '@liro/tokens'
import { DemoCard } from '@/catalog/DemoCard'
import { findCategory } from '@/catalog/registry'
import { DocsPage, DocsShell } from '@/components/DocsShell'

/** Single category page: examples in the middle, list of anchors on the right. */
export default function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params)
  const category = findCategory(slug)

  if (!category) notFound()

  return (
    <DocsShell>
      <DocsPage toc={category.entries.map((entry) => ({ id: entry.id, title: entry.title }))}>
        <Stack gap="xl">
          <Stack gap="sm">
            <Anchor
              component={Link}
              href="/"
              size="sm"
              style={{ color: liroVar.text.secondary, display: 'inline-flex', alignItems: 'center', gap: 6 }}
            >
              <ArrowLeft size={15} />
              Introduction
            </Anchor>

            <Stack gap={4}>
              <Title order={1} fz={30}>{category.title}</Title>
              <Text size="sm" style={{ color: liroVar.text.secondary }}>{category.description}</Text>
            </Stack>

            <Divider mt="xs" />
          </Stack>

          <Stack gap={40}>
            {category.entries.map((entry) => (
              <DemoCard key={entry.id} entry={entry} />
            ))}
          </Stack>
        </Stack>
      </DocsPage>
    </DocsShell>
  )
}
