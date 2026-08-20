'use client'

import { ActionIcon, Box, Divider, Drawer, Group, ScrollArea, Stack, Text, Tooltip } from '@mantine/core'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { useEffect, type ReactNode } from 'react'
import { liroVar } from '@liro/tokens'
import { useI18n, type LocalizedLabel, type TranslationKey } from '@liro/i18n'

/**
 * Detail of one record, beside the list it came from.
 *
 * Exists to preserve context. A user reading a hundred invoices clicks one; a
 * full page loses the table, the scroll position, the filter and the place in
 * the list, and getting back costs a navigation. A panel keeps all of it: look,
 * approve, close, carry on down the table.
 *
 * Different from `FormDrawer`, which is a form. This is a READING view - the
 * actions are on it, but the fields are not edited here. When the record needs
 * editing, the drawer's action navigates to the page: a long form needs an
 * address, and a drawer has none.
 */

const CLOSE_LABEL: TranslationKey = 'data.detailDrawer.close'
const PREVIOUS: TranslationKey = 'data.detailDrawer.previous'
const NEXT: TranslationKey = 'data.detailDrawer.next'

export interface DetailDrawerProps {
  opened: boolean
  onClose: () => void
  title: LocalizedLabel | string
  /** Second line under the title: a number, a status, a date. Already formatted. */
  subtitle?: string
  children: ReactNode
  /** Actions at the bottom, always visible. */
  actions?: ReactNode
  /**
   * Moving through the list without closing.
   *
   * This is what makes the component worth having. Without it the user closes
   * the panel, finds the next row, and opens it again - which is the navigation
   * the panel was supposed to remove.
   */
  onPrevious?: () => void
  onNext?: () => void
  size?: string | number
}

export function DetailDrawer({
  opened,
  onClose,
  title,
  subtitle,
  children,
  actions,
  onPrevious,
  onNext,
  size = 'lg',
}: DetailDrawerProps) {
  const { t } = useI18n()

  /*
   * The arrow keys move through the list while the drawer is open.
   *
   * Someone checking forty invoices should not reach for the mouse between each
   * one. `ArrowDown`/`ArrowUp` rather than left/right, because the movement is
   * through rows of a table.
   *
   * Ignored while the focus is in a field - otherwise the arrows would jump to
   * the next record instead of moving the cursor, which is the behaviour a user
   * already expects from an input.
   */
  useEffect(() => {
    if (!opened) return

    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null
      const typing =
        target instanceof HTMLInputElement ||
        target instanceof HTMLTextAreaElement ||
        target?.isContentEditable

      if (typing) return

      if (event.key === 'ArrowDown' && onNext) {
        event.preventDefault()
        onNext()
      } else if (event.key === 'ArrowUp' && onPrevious) {
        event.preventDefault()
        onPrevious()
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [opened, onNext, onPrevious])

  return (
    <Drawer
      opened={opened}
      onClose={onClose}
      position="right"
      size={size}
      padding={0}
      closeButtonProps={{ 'aria-label': t(CLOSE_LABEL) }}
      /*
       * `withOverlay={false}` on purpose.
       *
       * The point is that the table stays visible and usable behind the panel.
       * An overlay would dim the very context this component exists to keep, and
       * would swallow the click that selects the next row.
       */
      withOverlay={false}
      /*
       * The focus is not trapped, for the same reason: the user must be able to
       * tab back into the table. `Escape` still closes.
       */
      trapFocus={false}
      lockScroll={false}
      styles={{
        content: {
          display: 'flex',
          flexDirection: 'column',
          borderInlineStart: `1px solid ${liroVar.border.default}`,
          boxShadow: 'var(--liro-shadow-lg)',
        },
        /*
        * `padding={0}` on the Drawer removes padding from the header too, and
        * the title then sits against the top edge. The body needs none - the
        * inner `Stack` has its own - but the header does.
        */
        header: {
           padding: 'var(--liro-space-md)',
           alignItems: 'flex-start',
           borderBottom: `1px solid ${liroVar.border.subtle}`,
           marginBottom: 0,
          },
        title: { flex: 1, minWidth: 0, marginInlineEnd: 'var(--liro-space-sm)' },  
        body: { display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0, padding: 0 },
      }}
      title={
        <Group gap="xs" wrap="nowrap" justify="space-between" w="100%">
          <Box style={{ minWidth: 0 }}>
            <Text size="sm" fw={700} truncate>
              {typeof title === 'string' ? title : t(title)}
            </Text>
            {subtitle && (
              <Text size="xs" truncate style={{ color: liroVar.text.tertiary }}>
                {subtitle}
              </Text>
            )}
          </Box>

          {(onPrevious || onNext) && (
            <Group gap={2} wrap="nowrap" style={{ flexShrink: 0 }}>
              <Tooltip label={t(PREVIOUS)} withArrow events={{ hover: true, focus: true, touch: true }}>
                <ActionIcon
                  variant="subtle"
                  color="gray"
                  size="sm"
                  disabled={!onPrevious}
                  onClick={onPrevious}
                  aria-label={t(PREVIOUS)}
                >
                  <ChevronUp size={16} />
                </ActionIcon>
              </Tooltip>
              <Tooltip label={t(NEXT)} withArrow events={{ hover: true, focus: true, touch: true }}>
                <ActionIcon
                  variant="subtle"
                  color="gray"
                  size="sm"
                  disabled={!onNext}
                  onClick={onNext}
                  aria-label={t(NEXT)}
                >
                  <ChevronDown size={16} />
                </ActionIcon>
              </Tooltip>
            </Group>
          )}
        </Group>
      }
    >
      <ScrollArea style={{ flex: 1, minHeight: 0 }} viewportProps={{ tabIndex: 0 }}>
        <Stack gap="md" p="md">
          {children}
        </Stack>
      </ScrollArea>

      {actions && (
        <Box>
          <Divider />
          {/* The actions stay put while the content scrolls: on a long record the
              approve button must not be somewhere below the fold. */}
          <Group gap="xs" justify="flex-end" p="md" style={{ backgroundColor: liroVar.surface.raised }}>
            {actions}
          </Group>
        </Box>
      )}
    </Drawer>
  )
}