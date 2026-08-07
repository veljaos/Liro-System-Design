import { Avatar, type AvatarProps } from '@mantine/core'

/**
 * Inicijali iz imena: prva slova prve dve reci.
 *
 * NIJE `name.slice(0, 2)`. To su prva dva ZNAKA, pa "Ana Jovanovic" daje AN
 * umesto AJ, a "Marko Petrovic" MA umesto MP - u spisku od pet ljudi polovina
 * dobije iste inicijale. Ta greska je postojala na dva mesta.
 *
 * `toUpperCase()` radi i sa dijakritikom i sa cirilicom: "Đorđe" -> Đ,
 * "Ана Јовановић" -> АЈ.
 */
export function initials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('')
}

export interface PersonAvatarProps extends Omit<AvatarProps, 'src' | 'alt' | 'children' | 'color'> {
  /** Puno ime. Iz njega se izvode inicijali kada slike nema. */
  name: string
  src?: string | null
  /**
   * Ime za citac ekrana.
   *
   * Podrazumevano je avatar UKRASAN (`alt=""` + `aria-hidden`), jer u praksi
   * ime uvek stoji napisano pored njega - u poruci, u komentaru, u redu tabele.
   * Bez ovoga citac ekrana procita ime dvaput, a inicijale "AJ" kao rec.
   *
   * Prosledi `alt={person.name}` samo kada avatar stoji SAM, bez ispisanog
   * imena. Tada je on jedini nosilac informacije.
   */
  alt?: string
}

export function PersonAvatar({ name, src, alt, radius = 'xl', ...rest }: PersonAvatarProps) {
  const decorative = alt === undefined

  return (
    <Avatar
      {...rest}
      src={src ?? undefined}
      /* Prazan `alt` je ISPRAVAN za ukrasnu sliku; nedostajuci nije.
         Bez ovoga `image-alt` pada svaki put kad `src` zaista postoji. */
      alt={decorative ? '' : alt}
      aria-hidden={decorative || undefined}
      radius={radius}
      color="liro-blue"
    >
      {initials(name)}
    </Avatar>
  )
}