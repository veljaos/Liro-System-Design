'use client'

import { useState } from 'react'
import { ActionIcon, Anchor, Box, Collapse, Group, Paper, Stack, Text, Tooltip } from '@mantine/core'
import { CodeHighlight } from '@mantine/code-highlight'
import { Braces, Check, Code2, Copy, ExternalLink, Link2 } from 'lucide-react'
import { liroVar } from '@liro/tokens'
import { apiNamesForEntry, loadApis, type ComponentApi } from './props'
import { PropsTable } from './PropsTable'
import type { CatalogEntry } from './types'

/**
 * Jedan primer iz kataloga.
 *
 * Zaglavlje nosi naziv, paket i tri radnje: kopiranje veze do sidra, otvaranje
 * koda i otvaranje tabele propova. Oboje je podrazumevano sklopljeno jer se u
 * devet od deset poseta gleda samo izgled.
 */
export function DemoCard({ entry }: { entry: CatalogEntry }) {
  const [showCode, setShowCode] = useState(false)
  const [showProps, setShowProps] = useState(false)
  const [copied, setCopied] = useState(false)

  /* Sitna provera iz spiska imena — samo da se zna hoće li se dugme prikazati. */
  const apiNames = apiNamesForEntry(entry)
  const [apis, setApis] = useState<ComponentApi[]>([])

  /* Puna referenca stiže tek na prvo otvaranje. */
  const toggleProps = async () => {
    if (!showProps && apis.length === 0) setApis(await loadApis(apiNames))
    setShowProps((state) => !state)
  }

  const copyLink = async () => {
    const url = `${window.location.origin}${window.location.pathname}#${entry.id}`
    await navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <Stack
      id={entry.id}
      gap="xs"
      /* Odmak da sidro ne zavuce naslov pod lepljivo zaglavlje. */
      style={{ scrollMarginTop: 88 }}
    >
      <Group justify="space-between" align="flex-end" wrap="nowrap">
        <Stack gap={2} style={{ minWidth: 0 }}>
          <Group gap="xs" wrap="nowrap">
            <Anchor
              href={`#${entry.id}`}
              underline="never"
              style={{ color: liroVar.text.primary, fontWeight: 600, fontSize: 'var(--liro-font-size-md)' }}
            >
              {entry.title}
            </Anchor>
            {entry.from && (
              <Text
                size="xs"
                ff="monospace"
                px={6}
                py={1}
                style={{
                  color: liroVar.text.tertiary,
                  backgroundColor: liroVar.surface.sunken,
                  borderRadius: 'var(--liro-radius-xs)',
                }}
              >
                {entry.from}
              </Text>
            )}
          </Group>
          {entry.description && (
            <Text size="xs" style={{ color: liroVar.text.secondary }}>{entry.description}</Text>
          )}
        </Stack>

        <Group gap={4} wrap="nowrap">
          {entry.fullScreenHref && (
            <Tooltip label="Otvori u punoj visini" withArrow>
              <ActionIcon
                component="a"
                href={entry.fullScreenHref}
                target="_blank"
                variant="subtle"
                color="gray"
                size="md"
                aria-label="Otvori u punoj visini"
              >
                <ExternalLink size={16} />
              </ActionIcon>
            </Tooltip>
          )}

          <Tooltip label={copied ? 'Veza kopirana' : 'Kopiraj vezu'} withArrow>
            <ActionIcon variant="subtle" color="gray" size="md" onClick={copyLink} aria-label="Kopiraj vezu">
              {copied ? <Check size={16} /> : <Link2 size={16} />}
            </ActionIcon>
          </Tooltip>

          {entry.code && (
            <Tooltip label={showCode ? 'Sakrij kod' : 'Prikaži kod'} withArrow>
              <ActionIcon
                variant={showCode ? 'light' : 'subtle'}
                color="gray"
                size="md"
                onClick={() => setShowCode((state) => !state)}
                aria-label="Prikaži kod"
              >
                <Code2 size={16} />
              </ActionIcon>
            </Tooltip>
          )}

          {apiNames.length > 0 && (
            <Tooltip label={showProps ? 'Sakrij propove' : 'Prikaži propove'} withArrow>
              <ActionIcon
                variant={showProps ? 'light' : 'subtle'}
                color="gray"
                size="md"
                onClick={toggleProps}
                aria-label="Prikaži propove"
              >
                <Braces size={16} />
              </ActionIcon>
            </Tooltip>
          )}
        </Group>
      </Group>

      <Paper
        withBorder
        radius="lg"
        p={entry.wide ? 0 : 'lg'}
        style={{
          backgroundColor: entry.surface === 'sunken' ? liroVar.surface.sunken : liroVar.surface.raised,
          borderColor: liroVar.border.default,
          overflow: 'hidden',
        }}
      >
        {entry.demo}
      </Paper>

      {entry.code && (
        <Collapse expanded={showCode}>
          <Box mt={4}>
            <CodeHighlight
              code={entry.code}
              language="tsx"
              radius="md"
              withCopyButton
              style={{ border: `1px solid ${liroVar.border.default}` }}
            />
          </Box>
        </Collapse>
      )}

      {apiNames.length > 0 && (
        <Collapse expanded={showProps}>
          <Stack gap="lg" mt={4}>
            {apis.map((api) => (
              <PropsTable key={api.name} api={api} />
            ))}
          </Stack>
        </Collapse>
      )}
    </Stack>
  )
}

/** Dugme koje kopira proizvoljan tekst - koristi ga katalog ikonica. */
export function CopyChip({ value, label }: { value: string; label?: string }) {
  const [copied, setCopied] = useState(false)

  return (
    <Tooltip label={copied ? 'Kopirano' : (label ?? value)} withArrow>
      <ActionIcon
        variant="subtle"
        color="gray"
        size="sm"
        onClick={async () => {
          await navigator.clipboard.writeText(value)
          setCopied(true)
          setTimeout(() => setCopied(false), 1200)
        }}
        aria-label={`Kopiraj ${value}`}
      >
        {copied ? <Check size={13} /> : <Copy size={13} />}
      </ActionIcon>
    </Tooltip>
  )
}