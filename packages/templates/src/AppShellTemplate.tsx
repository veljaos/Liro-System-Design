'use client'

import {
  ActionIcon,
  AppShell,
  Anchor,
  Avatar,
  Box,
  Breadcrumbs,
  Burger,
  Button,
  Divider,
  Group,
  Indicator,
  Menu,
  NavLink,
  Tabs,
  ScrollArea,
  Text,
  UnstyledButton,
} from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import { Bell, LogOut, Search, Settings, type LucideIcon } from 'lucide-react'
import { Fragment, type ElementType, type ReactNode } from 'react'
import { liroVar } from '@liro/tokens'
import { useI18n, type LocalizedLabel } from '@liro/i18n'
import {
  BrandMark,
  ColorSchemeToggle,
  PageContainer,
  useLiroApp,
  useNavigation,
  type AppUser,
  type NavItem,
  type PageWidth,
} from '@liro/ui'

export interface Crumb {
  label: LocalizedLabel
  href?: string
}

export interface UserMenuItem {
  label: LocalizedLabel
  icon?: LucideIcon
  onClick: () => void
  danger?: boolean
}

export interface AppShellTemplateProps {
  children: ReactNode
  user?: AppUser
  /** Path to the current page; the application computes it from its router. */
  breadcrumbs?: Crumb[]
  /** Current address — used to highlight the active navigation item. */
  pathname?: string
  /** Opens search (Spotlight or a custom one). Without it, the button is not shown. */
  onSearch?: () => void
  notificationCount?: number
  onNotificationsClick?: () => void
  userMenuItems?: UserMenuItem[]
  onLogout?: () => void
  /**
   * How the main navigation is displayed.
   *
   * `tabs` is the default and recommended: tabs in the header leave all the
   * space below for content, and the user sees every part of the application
   * at a glance. A sidebar takes up 260px of width on every screen forever,
   * which is not a small price on a table with twelve columns.
   *
   * `sidebar` exists for applications with more than about ten sections.
   */
  navigationMode?: 'tabs' | 'sidebar' | 'none'
  /** Content measure. Side padding is a system decision, not a page one. */
  contentWidth?: PageWidth
}

const SEARCH_LABEL: LocalizedLabel = { sr: 'Pretraga…', 'sr-Cyrl': 'Претрага…', en: 'Search…' }
const NOTIFICATIONS_LABEL: LocalizedLabel = { sr: 'Obaveštenja', 'sr-Cyrl': 'Обавештења', en: 'Notifications' }
const LOGOUT_LABEL: LocalizedLabel = { sr: 'Odjava', 'sr-Cyrl': 'Одјава', en: 'Log out' }
const MENU_LABEL: LocalizedLabel = { sr: 'Meni', 'sr-Cyrl': 'Мени', en: 'Menu' }
const USER_MENU_LABEL: LocalizedLabel = { sr: 'Korisnički meni', 'sr-Cyrl': 'Кориснички мени', en: 'User menu' }

function initials(name?: string): string {
  if (!name) return '?'
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('')
}

/**
 * Application chrome: header, navigation, breadcrumbs, user menu.
 *
 * Knows nothing about routing — it receives the path and the active address
 * as data. Because of this, the same shell works in Liro Business App, ERP,
 * and CRM, and only `navigation` in `LiroAppProvider` and the content differ.
 */
export function AppShellTemplate({
  children,
  user,
  breadcrumbs = [],
  pathname,
  onSearch,
  notificationCount = 0,
  onNotificationsClick,
  userMenuItems,
  onLogout,
  navigationMode = 'tabs',
  contentWidth = 'default',
}: AppShellTemplateProps) {
  const { t } = useI18n()
  const app = useLiroApp()
  const navigation = useNavigation()
  const [mobileOpened, { toggle: toggleMobile, close: closeMobile }] = useDisclosure(false)

  /* The active tab is computed from the longest match, so `/tokens/colors`
     highlights the `/tokens` tab, not the home one. */
  const activeTab =
    [...navigation]
      .filter((item) => pathname === item.href || pathname?.startsWith(`${item.href}/`))
      .sort((a, b) => b.href.length - a.href.length)[0]?.href ?? null

  const Link = (app.linkComponent ?? 'a') as ElementType
  const hasNavbar = navigationMode === 'sidebar' && navigation.length > 0
  const hasTabs = navigationMode === 'tabs' && navigation.length > 0
  const headerHeight = hasTabs ? 96 : 56

  return (
    <AppShell
      header={{ height: headerHeight }}
      navbar={
        hasNavbar
          ? { width: 260, breakpoint: 'sm', collapsed: { mobile: !mobileOpened } }
          : undefined
      }
      /* `PageContainer` carries the padding so it is the same on pages that
         do not use this shell — login, landing, standalone screens. */
      padding={0}
      styles={{ main: { backgroundColor: liroVar.surface.page, minHeight: '100vh' } }}
    >
      <AppShell.Header
        px={{ base: 'md', sm: 'lg' }}
        style={{
          backgroundColor: liroVar.surface.header,
          borderBottom: `1px solid ${liroVar.border.default}`,
        }}
      >
        <Group justify="space-between" h={56} wrap="nowrap">
          <Group gap="md" wrap="nowrap" style={{ minWidth: 0, flex: 1 }}>
            {(hasNavbar || hasTabs) && (
              <Burger
                opened={mobileOpened}
                onClick={toggleMobile}
                hiddenFrom="sm"
                size="sm"
                aria-label={t(MENU_LABEL)}
                style={hasTabs ? { display: 'none' } : undefined}
              />
            )}

            <Link href={app.homeHref ?? '/'} style={{ textDecoration: 'none', flexShrink: 0 }}>
              <BrandMark />
            </Link>

            {breadcrumbs.length > 0 && (
              <>
                <Divider orientation="vertical" style={{ height: 18 }} visibleFrom="sm" />
                <Box visibleFrom="sm" style={{ overflow: 'hidden', minWidth: 0 }}>
                  <Breadcrumbs separator="›" separatorMargin="xs">
                    {breadcrumbs.map((crumb, index) => {
                      const label = t(crumb.label)
                      const isLast = index === breadcrumbs.length - 1
                      return isLast || !crumb.href ? (
                        <Text key={index} size="xs" fw={600}>{label}</Text>
                      ) : (
                        <Anchor
                          key={index}
                          size="xs"
                          renderRoot={(props) => <Link href={crumb.href} {...props} />}
                          style={{ color: liroVar.text.secondary }}
                        >
                          {label}
                        </Anchor>
                      )
                    })}
                  </Breadcrumbs>
                </Box>
              </>
            )}
          </Group>

          <Group gap="xs" wrap="nowrap">
            {onSearch && (
              <>
                <Button
                  variant="default"
                  size="sm"
                  leftSection={<Search size={15} />}
                  onClick={onSearch}
                  visibleFrom="md"
                  style={{ color: liroVar.text.secondary, fontWeight: 400 }}
                >
                  {t(SEARCH_LABEL)}
                  <Text component="span" size="xs" ml="md" style={{ color: liroVar.text.tertiary }}>
                    Ctrl+K
                  </Text>
                </Button>
                <ActionIcon hiddenFrom="md" onClick={onSearch} aria-label={t(SEARCH_LABEL)}>
                  <Search size={18} />
                </ActionIcon>
              </>
            )}

            {onNotificationsClick && (
              <Indicator
                disabled={notificationCount === 0}
                processing
                color={liroVar.status.danger.solid}
                size={10}
                offset={4}
              >
                <ActionIcon onClick={onNotificationsClick} aria-label={t(NOTIFICATIONS_LABEL)}>
                  <Bell size={18} />
                </ActionIcon>
              </Indicator>
            )}

            <ColorSchemeToggle />

            {user && (
              <Menu position="bottom-end" offset={8} width={220} shadow="md" radius="md">
                <Menu.Target>
                  {/*
                    `Menu.Target` adds `aria-haspopup` and `aria-expanded` to
                    its child. `Avatar` renders a `<div>`, which must not
                    carry those attributes — they belong to an element with
                    the role of a button. `UnstyledButton` brings the role,
                    focus, and keyboard triggering.
                  */}
                  <UnstyledButton aria-label={t(USER_MENU_LABEL)} style={{ display: 'flex' }}>
                    <Avatar
                      src={user.avatarUrl ?? undefined}
                      alt={user.name}
                      color="liro-blue"
                      radius="xl"
                      size="md"
                    >
                      {!user.avatarUrl && initials(user.name)}
                    </Avatar>
                  </UnstyledButton>
                </Menu.Target>
                <Menu.Dropdown>
                  <Menu.Label>
                    <Text size="xs" fw={600}>{user.name}</Text>
                    {user.email && (
                      <Text size="xs" style={{ color: liroVar.text.tertiary }}>{user.email}</Text>
                    )}
                  </Menu.Label>
                  <Menu.Divider />
                  {(userMenuItems ?? []).map((item, index) => {
                    const Icon = item.icon ?? Settings
                    return (
                      <Menu.Item
                        key={index}
                        color={item.danger ? 'liro-red' : undefined}
                        leftSection={<Icon size={14} />}
                        onClick={item.onClick}
                      >
                        {t(item.label)}
                      </Menu.Item>
                    )
                  })}
                  {onLogout && (
                    <>
                      <Menu.Divider />
                      <Menu.Item color="liro-red" leftSection={<LogOut size={14} />} onClick={onLogout}>
                        {t(LOGOUT_LABEL)}
                      </Menu.Item>
                    </>
                  )}
                </Menu.Dropdown>
              </Menu>
            )}
          </Group>
        </Group>

        {hasTabs && (
          <Tabs
            value={activeTab}
            variant="default"
            keepMounted={false}
            styles={{
              list: { borderBottom: 'none', flexWrap: 'nowrap', overflowX: 'auto' },
              tab: { fontSize: 'var(--liro-font-size-sm)', fontWeight: 500 },
            }}
          >
            <Tabs.List>
              {navigation.map((item) => {
                const Icon = item.icon
                return (
                  <Tabs.Tab
                    key={item.id}
                    value={item.href}
                    leftSection={Icon ? <Icon size={15} /> : undefined}
                    renderRoot={(props) => <Link href={item.href} {...props} />}
                  >
                    {t(item.label)}
                  </Tabs.Tab>
                )
              })}
            </Tabs.List>
          </Tabs>
        )}
      </AppShell.Header>

      {hasNavbar && (
        <AppShell.Navbar
          p="xs"
          style={{
            backgroundColor: liroVar.surface.raised,
            borderRight: `1px solid ${liroVar.border.default}`,
          }}
        >
          <AppShell.Section grow component={ScrollArea}>
            <NavTree items={navigation} pathname={pathname} linkComponent={Link} onNavigate={closeMobile} />
          </AppShell.Section>
        </AppShell.Navbar>
      )}

      <AppShell.Main>
        <PageContainer width={contentWidth}>{children}</PageContainer>
      </AppShell.Main>
    </AppShell>
  )
}

interface NavTreeProps {
  items: NavItem[]
  pathname?: string
  linkComponent: ElementType
  onNavigate: () => void
}

function NavTree({ items, pathname, linkComponent: Link, onNavigate }: NavTreeProps) {
  const { t } = useI18n()

  /* Groups are derived from the items instead of being configured
     separately — one structure is one source of truth for both order and
     titles. */
  const groups: { label?: LocalizedLabel; items: NavItem[] }[] = []
  for (const item of items) {
    const last = groups[groups.length - 1]
    if (last && t(last.label) === t(item.group)) {
      last.items.push(item)
    } else {
      groups.push({ label: item.group, items: [item] })
    }
  }

  const isActive = (href: string) =>
    pathname === href || (href !== '/' && Boolean(pathname?.startsWith(`${href}/`)))

  return (
    <>
      {groups.map((group, groupIndex) => (
        <Fragment key={groupIndex}>
          {group.label && (
            <Text
              size="xs"
              fw={700}
              mt={groupIndex === 0 ? 4 : 'md'}
              mb={4}
              px="xs"
              style={{
                color: liroVar.text.tertiary,
                textTransform: 'uppercase',
                letterSpacing: 'var(--liro-tracking-caps)',
              }}
            >
              {t(group.label)}
            </Text>
          )}

          {group.items.map((item) => {
            const Icon = item.icon
            const hasChildren = Boolean(item.children?.length)

            return (
              <NavLink
                key={item.id}
                label={t(item.label)}
                leftSection={Icon ? <Icon size={17} /> : undefined}
                rightSection={
                  item.badge ? (
                    <Text size="xs" fw={700} style={{ color: liroVar.text.brand }}>
                      {item.badge}
                    </Text>
                  ) : undefined
                }
                active={isActive(item.href)}
                defaultOpened={hasChildren && Boolean(item.children?.some((child) => isActive(child.href)))}
                onClick={hasChildren ? undefined : onNavigate}
                renderRoot={
                  hasChildren ? undefined : (props) => <Link href={item.href} {...props} />
                }
                variant="light"
              >
                {hasChildren
                  ? item.children?.map((child) => (
                      <NavLink
                        key={child.id}
                        label={t(child.label)}
                        active={isActive(child.href)}
                        onClick={onNavigate}
                        renderRoot={(props) => <Link href={child.href} {...props} />}
                        variant="light"
                      />
                    ))
                  : null}
              </NavLink>
            )
          })}
        </Fragment>
      ))}
    </>
  )
}