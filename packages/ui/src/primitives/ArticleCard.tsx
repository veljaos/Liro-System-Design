import { Box, Paper, Text, Title } from '@mantine/core'
import type { ReactNode } from 'react'
import { liroVar } from '@liro/tokens'

/**
 * Kartica clanka: fotografija u pozadini, naslov preko nje.
 *
 * Tekst preko fotografije je jedini slucaj kontrasta koji `axe` NE moze da
 * izmeri - fotografiju ne cita, pa prijavi `incomplete`, ne pad. Test ce proci
 * a problem ostati. Zato zatamnjenje nije stvar ukusa:
 *
 *   belo na 45% crnog preko BELE slike  = 3.35   pada
 *   belo na 55% crnog preko BELE slike  = 4.76   prolazi
 *
 * `surface.scrim` je 55% i racunat je na najgori slucaj. Slika ne zna koliko je
 * svetla, pa se pretpostavlja najsvetlija moguca.
 */

export interface ArticleCardProps {
  /** Naslov clanka. Podatak, ne natpis sistema - zato `string`. */
  title: string
  /** Rubrika, oznaka, datum. Stoji nad naslovom, verzalom. */
  category?: string
  /** Putanja do slike. Ide kao CSS pozadina, dakle ukras - naslov nosi znacenje. */
  image: string
  /**
   * Kada je zadata, CELA kartica je link.
   *
   * To je namerno umesto dugmeta u uglu: jedan cilj za mis i za tastaturu,
   * a pristupacno ime linka je naslov. Kartica sa naslovom i odvojenim dugmetom
   * daje dva cilja koja vode na isto mesto.
   */
  href?: string
  /** Radnja na dnu, kada `href` NIJE zadat. Uz `href` bi bio ugnjezden link. */
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
      /* Mantine klasa za vidljiv prsten fokusa. Bez nje link preko fotografije
         nema nikakvu oznaku da je na njemu tastatura. */
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
      {/* Zatamnjenje je poseban sloj, ne poluprozirna boja na tekstu: tekst
          mora ostati pun, a pozadina se prigusuje. */}
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