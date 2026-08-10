import { Box, Paper, Text, Title } from '@mantine/core'
import type { ReactNode } from 'react'
import { liroVar } from '@liro/tokens'

/**
 * Article card: a photo in the background, a title over it.
 *
 * Text over a photo is the one contrast case `axe` CANNOT measure — it does
 * not read the photo, so it reports `incomplete`, not a failure. The test
 * passes and the problem stays. That is why the darkening is not a matter of
 * taste:
 *
 *   white on 45% black over a WHITE image  = 3.35   fails
 *   white on 55% black over a WHITE image  = 4.76   passes
 *
 * `surface.scrim` is 55% and is calculated for the worst case. The image does
 * not know how light it is, so the lightest possible one is assumed.
 */

export interface ArticleCardProps {
  /** Article title. Data, not a system label — hence `string`. */
  title: string
  /** Section, tag, date. Sits above the title, in caps. */
  category?: string
  /** Path to the image. Goes in as a CSS background, so decoration — the title carries the meaning. */
  image: string
  /**
   * When given, the ENTIRE card is a link.
   *
   * This is deliberate instead of a button in the corner: one target for the
   * mouse and the keyboard, and the link's accessible name is the title. A
   * card with a title and a separate button gives two targets that lead to
   * the same place.
   */
  href?: string
  /** Action at the bottom, when `href` is NOT given. With `href` it would be a nested link. */
  action?: ReactNode
  height?: number
}

export function ArticleCard({
  title,
  category,
  image,
  href,
  action,
  height = 220,
}: ArticleCardProps) {
  return (
    <Paper
      component={href ? 'a' : 'div'}
      href={href}
      /* Mantine class for a visible focus ring. Without it, a link over a
         photo has no indication at all that the keyboard is on it. */
      className={href ? 'mantine-focus-auto' : undefined}
      radius="md"
      p="lg"
      style={{
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        height,
        overflow: 'hidden',
        textDecoration: 'none',
        backgroundImage: `url(${image})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      {/* The darkening is a separate layer, not a translucent color on the
          text: the text must stay fully opaque, and the background is dimmed. */}
      <Box
        aria-hidden
        style={{
          position: 'absolute',
          inset: 0,
          backgroundColor: liroVar.surface.scrim,
        }}
      />

      <Box style={{ position: 'relative' }}>
        {category && (
          <Text
            size="xs"
            fw={700}
            style={{
              color: liroVar.text.onAccent,
              textTransform: 'uppercase',
              letterSpacing: 'var(--liro-tracking-caps)',
            }}
          >
            {category}
          </Text>
        )}
      </Box>

      <Box style={{ position: 'relative' }}>
        <Title order={3} style={{ color: liroVar.text.onAccent }}>
          {title}
        </Title>
        {action && <Box mt="md">{action}</Box>}
      </Box>
    </Paper>
  )
}