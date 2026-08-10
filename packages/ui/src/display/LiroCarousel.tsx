'use client'

import { Carousel, type CarouselProps } from '@mantine/carousel'
import type { ReactNode } from 'react'
import { liroVar } from '@liro/tokens'

/**
 * Horizontal list that can be dragged.
 *
 * In a business application this is not an image gallery but a way to show a
 * row of summary cards or attachments on a narrow screen without scrolling
 * the whole page horizontally.
 *
 * That is why `withIndicators` is off by default — dots below make sense for
 * three slides in a hero section, not for twelve cards with numbers.
 */

export interface LiroCarouselProps {
  children: ReactNode
  /** Width of a single slide; also accepts a responsive object. */
  slideSize?: CarouselProps['slideSize']
  slideGap?: CarouselProps['slideGap']
  withControls?: boolean
  withIndicators?: boolean
  /** Moves one slide at a time instead of a whole screen. */
  slidesToScroll?: number
  loop?: boolean
  height?: number | string
}

export function LiroCarousel({
  children,
  slideSize = { base: '100%', sm: '50%', md: '33.333333%' },
  slideGap = 'md',
  withControls = true,
  withIndicators = false,
  slidesToScroll = 1,
  loop = false,
  height = 'auto',
}: LiroCarouselProps) {
  return (
    <Carousel
      slideSize={slideSize}
      slideGap={slideGap}
      withControls={withControls}
      withIndicators={withIndicators}
      height={height}
      emblaOptions={{ loop, align: 'start', slidesToScroll }}
      controlSize={30}
      /*
       * Controls are moved OUTSIDE the slide track.
       *
       * By default they sit over the first and last card and cut into the
       * content — on a card with a number they cover exactly the number. A
       * negative offset moves them into the margin, so they do not overlap
       * anything.
       */
      styles={{
        root: { paddingInline: 34 },
        controls: { left: 0, right: 0, pointerEvents: 'none' },
        control: {
          pointerEvents: 'auto',
          backgroundColor: liroVar.surface.raised,
          border: `1px solid ${liroVar.border.default}`,
          color: liroVar.text.primary,
          boxShadow: 'var(--liro-shadow-sm)',
        },
      }}
    >
      {children}
    </Carousel>
  )
}

export const LiroCarouselSlide = Carousel.Slide
