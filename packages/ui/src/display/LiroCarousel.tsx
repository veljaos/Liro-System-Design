'use client'

import { Carousel, type CarouselProps } from '@mantine/carousel'
import type { ReactNode } from 'react'
import { liroVar } from '@liro/tokens'

/**
 * Vodoravna lista koja se prevlaci.
 *
 * U poslovnoj aplikaciji ovo nije galerija slika nego nacin da se na uskom
 * ekranu prikaze red zbirnih kartica ili priloga bez horizontalnog skrola
 * cele stranice.
 *
 * Zato je `withIndicators` iskljuceno podrazumevano - tackice ispod imaju
 * smisla za tri slajda u hero sekciji, ne za dvanaest kartica sa brojkama.
 */

export interface LiroCarouselProps {
  children: ReactNode
  /** Sirina jednog slajda; prihvata i responzivan objekat. */
  slideSize?: CarouselProps['slideSize']
  slideGap?: CarouselProps['slideGap']
  withControls?: boolean
  withIndicators?: boolean
  /** Pomera po jedan slajd umesto po ceo ekran. */
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
       * Kontrole se pomeraju IZVAN staze slajdova.
       *
       * Podrazumevano stoje preko prve i poslednje kartice i seku sadrzaj -
       * na kartici sa brojkom prekriju upravo brojku. Negativan offset ih
       * izmesta u marginu, pa se ne preklapaju ni sa cim.
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
