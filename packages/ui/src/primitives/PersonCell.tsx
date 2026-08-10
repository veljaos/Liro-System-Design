import { Box, Group, Text } from '@mantine/core'
import { liroVar } from '@liro/tokens'
import { PersonAvatar } from './PersonAvatar'

export interface PersonCellProps {
  name: string
  /** Second line: role, title, department, position. */
  secondary?: string
  avatarUrl?: string | null
  size?: number
}

/**
 * A person in a table row: avatar, name, and one line underneath.
 *
 * `minWidth: 0` on the wrapper is required - without it `truncate` doesn't
 * work inside `Group`, because a flex item by default won't shrink below its
 * content.
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