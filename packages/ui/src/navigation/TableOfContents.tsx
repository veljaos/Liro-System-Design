'use client'

import { useEffect, useId, useRef, useState } from 'react'
import { Box, Group, Text, UnstyledButton } from '@mantine/core'
import { ListTree } from 'lucide-react'
import { liroVar } from '@liro/tokens'
import { useI18n, type LocalizedLabel } from '@liro/i18n'

/**
 * Spisak naslova na stranici, lepljiv sa strane.
 *
 * Prati polozaj skrola. To nije ukras - spisak koji pokazuje samo zadnji
 * KLIKNUTI naslov ne odgovara na pitanje zbog kojeg postoji: gde sam sada.
 */

const ON_THIS_PAGE: LocalizedLabel = {
  sr: 'Na ovoj stranici',
  'sr-Cyrl': 'На овој страници',
  en: 'On this page',
}

export interface TocItem {
  /** `id` naslova na stranici. Mora postojati u DOM-u. */
  id: string
  title: string
  /** Nivo uvlacenja. 1 je podrazumevan. */
  level?: 1 | 2
}

export interface TableOfContentsProps {
  items: TocItem[]
  label?: LocalizedLabel
  /** Odstojanje od vrha za lepljivi polozaj. Racunaj visinu zaglavlja. */
  top?: number
  width?: number
  /**
   * Prati polozaj skrola kroz `IntersectionObserver`.
   *
   * Iskljuci kada naslovi iz `items` NISU na stranici - u katalogu, u primeru,
   * u dokumentaciji same komponente. Tada bi posmatrac trazio `id` koji ne
   * postoji i spisak bi ostao bez aktivne stavke.
   */
  trackScroll?: boolean
}

export function TableOfContents({
  items,
  label,
  top = 80,
  width = 200,
  trackScroll = true,
}: TableOfContentsProps) {
  const { t } = useI18n()
  const [active, setActive] = useState<string | null>(null)
  const headingId = useId()

  /*
  * Klik zaklju­cava pracenje.
  *
  * Zadnje sekcije dokumenta staju u poslednji ekran, pa klik na bilo koju od
  * njih pomeri stranicu do dna - i pravilo za dno pregazi ono na sta je covek
  * kliknuo. Bez ovoga te stavke se ne mogu izabrati uopste.
  * 
  * Otklju­cava se kad korisnik SAM pomeri stranicu, ne po tajmeru: tajmer bi
  * posle pola sekunde ipak skocio na dno i to se vidi kao trzaj.
  */
  const lockedRef = useRef(false)

  /*
   * Zavisnost je NIZ ID-jeva spojen u string, ne `items`.
   *
   * `items` je niz koji roditelj pravi u svakom renderu, pa bi efekat sa njim
   * u zavisnostima pravio i rusio posmatraca na svaki render. To je ista greska
   * koja je u ovom repou vec dvaput napravljena - formatteri grafikona i
   * `rowId` u `ResourceTable`.
   */
  const key = items.map((item) => item.id).join('|')

  useEffect(() => {
    if (!trackScroll || items.length === 0) return

    const ids = items.map((item) => item.id)
    let frame = 0

    const update = () => {
      frame = 0

      if (lockedRef.current) return

      /*
      * Dno stranice je poseban slucaj, ne rub.
      *
      * Zadnji naslovi u dokumentu ostaju u poslednjem ekranu i nikad ne dodju
      * do vrha - stranica se zaustavi pre toga. Bez ovog pravila aktivna
      * ostaje ona stavka koja je zadnja uspela da prodje, pa poslednje dve ili
      * tri nikad ne dobiju svoj red. To se ne resava pomeranjem granice: gde
      * god je postavis, zadnjih nekoliko stavki ostaje ispod nje.
      */
     const atBottom =
      window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2

    if (atBottom) {
      /*
      * Poslednji naslov koji je USAO u ekran, ne slepo zadnji u nizu -
      * stranica se moze zavrsavati sadrzajem bez naslova.
      */
      let lastVisible: string | null = null
      for (const id of ids) {
        const element = document.getElementById(id)
        if (!element) continue
        if (element.getBoundingClientRect().top < window.innerHeight) lastVisible = id
      }
      setActive(lastVisible ?? ids[ids.length - 1] ?? null)
      return
    }

    /*
    * Aktivan je POSLEDNJI naslov koji je presao granicu, ne prvi vidljivi.
    * `break` je ispravan jer su stavke u redosledu dokumenta, pa prvi koji
    * nije presao znaci da nije ni jedan posle njega.
    */
    let current: string | null = null
    for (const id of ids) {
      const element = document.getElementById(id)
      if (!element) continue
      if (element.getBoundingClientRect().top > top + 8) break
      current = id
    }

    setActive(current ?? ids[0] ?? null)
  }

  /*
  * `requestAnimationFrame` kao brana: bez nje bi se `getBoundingClientRect`
  * za svaki naslov zvao na svaki dogadjaj skrola. To je merenje rasporeda,
  * najskuplja stvar koju mozes da uradis u toj petlji.
  */
  const onScroll = () => {
    if (frame) return
    frame = requestAnimationFrame(update)
  }

  /* Samo pokret koji dolazi od coveka otklju­cava pracenje. Dogadjaj `scroll`
    za to ne sluzi - njega izazove i sam klik na stavku. */
  const unlock = () => {
    lockedRef.current = false
  }

  update()
  window.addEventListener('scroll', onScroll, { passive: true })
  window.addEventListener('resize', onScroll, { passive: true })
  window.addEventListener('wheel', unlock, { passive: true })
  window.addEventListener('touchmove', unlock, { passive: true })
  window.addEventListener('keydown', unlock)

  return () => {
    if (frame) cancelAnimationFrame(frame)
    window.removeEventListener('scroll', onScroll)
    window.removeEventListener('resize', onScroll)
    window.removeEventListener('wheel', unlock)
    window.removeEventListener('touchmove', unlock)
    window.removeEventListener('keydown', unlock)
  }
    // eslint-disable-next-line react-hooks/exhaustive-deps
}, [key, top, trackScroll])

  if (items.length === 0) return null

  return (
    <Box
      component="nav"
      visibleFrom="lg"
      /* Imenovan orijentir. Na stranici vec postoji `AppShell.Navbar`, pa dva
         neimenovana `<nav>` elementa citac ekrana ne razlikuje. */
      aria-labelledby={headingId}
      style={{ position: 'sticky', top, width, flexShrink: 0, alignSelf: 'flex-start' }}
    >
      <Group gap={6} mb={8} wrap="nowrap">
        <ListTree size={14} aria-hidden style={{ color: liroVar.text.tertiary, flexShrink: 0 }} />
        <Text
          id={headingId}
          size="xs"
          fw={700}
          style={{
            color: liroVar.text.tertiary,
            textTransform: 'uppercase',
            letterSpacing: 'var(--liro-tracking-caps)',
          }}
        >
          {t(label ?? ON_THIS_PAGE)}
        </Text>
      </Group>

      {items.map((item) => {
        const isActive = active === item.id

        return (
          <UnstyledButton
            key={item.id}
            component="a"
            href={`#${item.id}`}
            onClick={() => {
              lockedRef.current = true
              setActive(item.id)
            }}
            /* `location`, ne `page`: stavka vodi na deo OVE stranice, ne na
               drugu stranicu. */
            aria-current={isActive ? 'location' : undefined}
            style={{
              display: 'block',
              padding: item.level === 2 ? '4px 0 4px 24px' : '4px 0 4px 12px',
              borderLeft: `2px solid ${isActive ? liroVar.brand.solid : liroVar.border.default}`,
              fontSize: 'var(--liro-font-size-sm)',
              color: isActive ? liroVar.text.brand : liroVar.text.secondary,
              fontWeight: isActive ? 600 : 400,
            }}
          >
            {item.title}
          </UnstyledButton>
        )
      })}
    </Box>
  )
}