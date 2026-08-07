import { Box, Group, Text } from '@mantine/core'
import { liroVar } from '@liro/tokens'
import { PersonAvatar } from './PersonAvatar'

export interface PersonCellProps {
  name: string
  /** Drugi red: uloga, zvanje, odeljenje, radno mesto. */
  secondary?: string
  avatarUrl?: string | null
  size?: number
}

/**
 * Lice u redu tabele: avatar, ime, i jedan red ispod.
 *
 * `minWidth: 0` na omotacu je obavezno - bez njega `truncate` ne radi unutar
 * `Group`, jer flex stavka podrazumevano ne sme da se smanji ispod sadrzaja.
 */
export function PersonCell({ name, secondary, avatarUrl, size = 36 }: PersonCellProps) {
  return (
    <Group gap="sm" wrap="nowrap">
      <PersonAvatar name={name} src={avatarUrl} size={size} />
      <Box style={{ minWidth: 0 }}>
        <Text size="sm" fw={500} truncate>
          {name}
        </Text>
        {secondary && (
          <Text size="xs" truncate style={{ color: liroVar.text.tertiary }}>
            {secondary}
          </Text>
        )}
      </Box>
    </Group>
  )
}