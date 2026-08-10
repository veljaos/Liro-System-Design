import { Avatar, type AvatarProps } from '@mantine/core'

/**
 * Initials from a name: first letters of the first two words.
 *
 * NOT `name.slice(0, 2)`. That is the first two CHARACTERS, so "Ana
 * Jovanovic" gives AN instead of AJ, and "Marko Petrovic" gives MA instead
 * of MP — in a list of five people, half end up with the same initials.
 * That mistake existed in two places.
 *
 * `toUpperCase()` works with both diacritics and Cyrillic: "Đorđe" -> Đ,
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
  /** Full name. Initials are derived from it when there is no image. */
  name: string
  src?: string | null
  /**
   * Name for a screen reader.
   *
   * By default the avatar is DECORATIVE (`alt=""` + `aria-hidden`), because
   * in practice the name is always written next to it — in a message, in a
   * comment, in a table row. Without this, a screen reader reads the name
   * twice, and the initials "AJ" as a word.
   *
   * Pass `alt={person.name}` only when the avatar stands ALONE, with no
   * written name. Then it is the sole carrier of the information.
   */
  alt?: string
}

export function PersonAvatar({ name, src, alt, radius = 'xl', ...rest }: PersonAvatarProps) {
  const decorative = alt === undefined

  return (
    <Avatar
      {...rest}
      src={src ?? undefined}
      /* An empty `alt` is CORRECT for a decorative image; a missing one is
         not. Without this, `image-alt` fails every time `src` actually exists. */
      alt={decorative ? '' : alt}
      aria-hidden={decorative || undefined}
      radius={radius}
      color="liro-blue"
    >
      {initials(name)}
    </Avatar>
  )
}