'use client'

import { useState, type ReactNode } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  AppShell,
  Box,
  Burger,
  Group,
  Kbd,
  ScrollArea,
  Text,
  UnstyledButton,
} from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import { Search } from 'lucide-react'
import { liroVar } from '@liro/tokens'
import { BrandMark, ColorSchemeToggle, CommandPalette, openCommandPalette } from '@liro/ui'
import { SIDEBAR } from '@/catalog/sidebar'

/**
 * Okvir dokumentacije.
 *
 * Namerno NIJE isti kao okvir poslovne aplikacije. Aplikacija koristi kartice u
 * zaglavlju jer ima malo odredista; dokumentacija ima preko dvadeset stranica i
 * treba joj spisak koji stalno stoji sa strane. Kada je sve vidljivo odjednom,
 * ne postoji „gde li je ono bilo".
 *
 * Ovo je i razlog zasto ovaj okvir zivi u playgroundu, a ne u `@liro/templates`:
 * poslovne aplikacije ga nece koristiti.
 */
export function DocsShell({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const [opened, { toggle, close }] = useDisclosure(false)

  return (
    <>
      <CommandPalette
        withNavigation={false}
        actions={SIDEBAR.flatMap((group) =>
          group.items.map((item) => ({
            id: item.href,
            label: { sr: item.label, en: item.label },
            description: { sr: group.title, en: group.title },
            group: { sr: group.title, en: group.title },
            onTrigger: () => {
              window.location.href = item.href
            },
          })),
        )}
      />

      <AppShell
        header={{ height: 56 }}
        navbar={{ width: 260, breakpoint: 'md', collapsed: { mobile: !opened } }}
        padding={0}
        styles={{ main: { backgroundColor: liroVar.surface.page, minHeight: '100vh' } }}
      >
        <AppShell.Header
          px="md"
          style={{
            backgroundColor: liroVar.surface.header,
            borderBottom: `1px solid ${liroVar.border.default}`,
          }}
        >
          <Group h="100%" justify="space-between" wrap="nowrap" gap="md">
            <Group gap="sm" wrap="nowrap" w={{ base: 'auto', md: 244 }}>
              <Burger opened={opened} onClick={toggle} hiddenFrom="md" size="sm" aria-label="Meni" />
              <Link href="/" style={{ textDecoration: 'none' }}>
                <BrandMark responsive={false} />
              </Link>
            </Group>

            {/* Pretraga je centrirana jer je najcesci ulaz u dokumentaciju. */}
            <UnstyledButton
              onClick={openCommandPalette}
              style={{
                flex: 1,
                maxWidth: 440,
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                height: 34,
                padding: '0 10px',
                borderRadius: 'var(--liro-radius-md)',
                border: `1px solid ${liroVar.border.default}`,
                backgroundColor: liroVar.surface.sunken,
                color: liroVar.text.tertiary,
              }}
            >
              <Search size={15} />
              <Text size="sm" style={{ flex: 1, textAlign: 'left' }}>Pretraga…</Text>
              <Group gap={2} visibleFrom="sm">
                <Kbd size="xs">Ctrl</Kbd>
                <Kbd size="xs">K</Kbd>
              </Group>
            </UnstyledButton>

            <Group gap={4} wrap="nowrap" justify="flex-end" w={{ base: 'auto', md: 244 }}>
              <ColorSchemeToggle />
            </Group>
          </Group>
        </AppShell.Header>

        <AppShell.Navbar
          p="md"
          style={{
            backgroundColor: liroVar.surface.raised,
            borderRight: `1px solid ${liroVar.border.default}`,
          }}
        >
          <AppShell.Section grow component={ScrollArea} type="hover">
            {SIDEBAR.map((group) => (
              <Box key={group.title} mb="lg">
                <Text
                  size="xs"
                  fw={700}
                  mb={6}
                  style={{
                    color: liroVar.text.tertiary,
                    textTransform: 'uppercase',
                    letterSpacing: 'var(--liro-tracking-caps)',
                  }}
                >
                  {group.title}
                </Text>

                {group.items.map((item) => {
                  const active = pathname === item.href
                  return (
                    <UnstyledButton
                      key={item.href}
                      component={Link}
                      href={item.href}
                      onClick={close}
                      style={{
                        display: 'block',
                        padding: '5px 8px',
                        marginLeft: -8,
                        borderRadius: 'var(--liro-radius-sm)',
                        fontSize: 'var(--liro-font-size-sm)',
                        fontWeight: active ? 600 : 400,
                        color: active ? liroVar.text.brand : liroVar.text.secondary,
                        backgroundColor: active ? liroVar.brand.subtle : 'transparent',
                      }}
                    >
                      {item.label}
                    </UnstyledButton>
                  )
                })}
              </Box>
            ))}
          </AppShell.Section>
        </AppShell.Navbar>

        <AppShell.Main>{children}</AppShell.Main>
      </AppShell>
    </>
  )
}

export interface TocItem {
  id: string
  title: string
}

/**
 * Spisak „na ovoj stranici".
 *
 * Lepljiv je i uvek desno. Bez njega je stranica kategorije sa osam primera
 * beskonacan skrol u kojem se ne vidi ni koliko je ostalo ni sta je bilo gore.
 */
export function PageToc({ items }: { items: TocItem[] }) {
  const [active, setActive] = useState<string | null>(null)

  if (items.length === 0) return null

  return (
    <Box
      component="nav"
      visibleFrom="lg"
      style={{ position: 'sticky', top: 80, width: 200, flexShrink: 0, alignSelf: 'flex-start' }}
    >
      <Text
        size="xs"
        fw={700}
        mb={8}
        style={{
          color: liroVar.text.tertiary,
          textTransform: 'uppercase',
          letterSpacing: 'var(--liro-tracking-caps)',
        }}
      >
        Na ovoj stranici
      </Text>

      {items.map((item) => (
        <UnstyledButton
          key={item.id}
          component="a"
          href={`#${item.id}`}
          onClick={() => setActive(item.id)}
          style={{
            display: 'block',
            padding: '4px 0 4px 12px',
            borderLeft: `2px solid ${active === item.id ? liroVar.brand.solid : liroVar.border.default}`,
            fontSize: 'var(--liro-font-size-sm)',
            color: active === item.id ? liroVar.text.brand : liroVar.text.secondary,
            fontWeight: active === item.id ? 600 : 400,
          }}
        >
          {item.title}
        </UnstyledButton>
      ))}
    </Box>
  )
}

/** Sadržaj stranice sa merom čitanja i mestom za TOC. */
export function DocsPage({ children, toc }: { children: ReactNode; toc?: TocItem[] }) {
  return (
    <Box style={{ display: 'flex', gap: 48, padding: '32px 40px 96px', maxWidth: 1400 }}>
      <Box style={{ flex: 1, minWidth: 0, maxWidth: 900 }}>{children}</Box>
      {toc && <PageToc items={toc} />}
    </Box>
  )
}
