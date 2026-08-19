'use client'

import { useState } from 'react'
import {
  Badge,
  Divider,
  FileButton,
  Group,
  PasswordInput,
  Progress,
  Select,
  Stack,
  Switch,
  Text,
  TextInput,
} from '@mantine/core'
import { Monitor, ShieldCheck, Trash2 } from 'lucide-react'
import { liroVar } from '@liro/tokens'
import { useI18n, type Locale, type LocalizedLabel, type TranslationKey } from '@liro/i18n'
import { ActionButton, ActionGroup } from '../actions/ActionButton'
import { SectionCard } from '../layout/SectionCard'
import { StatusBadge } from '../feedback/StatusBadge'
import { PersonAvatar } from '../primitives/PersonAvatar'

/**
 * Account and profile.
 *
 * These screens exist in every application and are built from scratch
 * everywhere, so they end up slightly different everywhere. Here they are
 * components that receive values and return events — the application
 * decides what to do with them, the appearance is settled.
 */

export interface ProfileValues {
  fullName: string
  email: string
  phone?: string
  jobTitle?: string
  avatarUrl?: string | null
}

export interface ProfileCardProps {
  value: ProfileValues
  onChange: (value: ProfileValues) => void
  onSave: () => void
  onAvatarSelect?: (file: File) => void
  onAvatarRemove?: () => void
  saving?: boolean
  /** Errors from the server, by field. */
  errors?: Record<string, string>
  /** Email is most often changed through a separate flow with confirmation. */
  emailReadOnly?: boolean
}

const PROFILE_TITLE: TranslationKey = 'auth.profile.title'
const PROFILE_DESCRIPTION: TranslationKey = 'auth.profile.description'
const CHANGE_PHOTO: TranslationKey = 'auth.profile.changePhoto'
const REMOVE: TranslationKey = 'auth.profile.remove'
const PHOTO_HINT: TranslationKey = 'auth.profile.photoHint'
const FULL_NAME: TranslationKey = 'auth.profile.fullName'
const JOB_TITLE: TranslationKey = 'auth.profile.jobTitle'
const EMAIL: TranslationKey = 'auth.login.email'
const PHONE: TranslationKey = 'auth.profile.phone'
const EMAIL_CHANGE_NOTE: TranslationKey = 'auth.profile.emailChangeNote'

export function ProfileCard({
  value,
  onChange,
  onSave,
  onAvatarSelect,
  onAvatarRemove,
  saving = false,
  errors = {},
  emailReadOnly = false,
}: ProfileCardProps) {
  const { t } = useI18n()
  const set = <K extends keyof ProfileValues>(key: K, next: ProfileValues[K]) =>
    onChange({ ...value, [key]: next })

  return (
    <SectionCard
      title={PROFILE_TITLE}
      description={PROFILE_DESCRIPTION}
      actions={<ActionButton intent="save" onClick={onSave} loading={saving} />}
    >
      <Stack gap="lg">
        <Group gap="md" wrap="nowrap">
          <PersonAvatar name={value.fullName} src={value.avatarUrl} size={72} />

          <Stack gap={6}>
            <Group gap="xs">
              {onAvatarSelect && (
                <FileButton onChange={(file) => file && onAvatarSelect(file)} accept="image/png,image/jpeg">
                  {(props) => (
                    <ActionButton
                      intent="edit"
                      label={CHANGE_PHOTO}
                      onClick={props.onClick}
                    />
                  )}
                </FileButton>
              )}
              {value.avatarUrl && onAvatarRemove && (
                <ActionButton
                  intent="delete"
                  label={REMOVE}
                  onClick={onAvatarRemove}
                />
              )}
            </Group>
            <Text size="xs" style={{ color: liroVar.text.tertiary }}>
              {t(PHOTO_HINT)}
            </Text>
          </Stack>
        </Group>

        <Divider />

        <Group grow align="flex-start">
          <TextInput
            label={t(FULL_NAME)}
            value={value.fullName}
            onChange={(event) => set('fullName', event.currentTarget.value)}
            error={errors.fullName}
            withAsterisk
          />
          <TextInput
            label={t(JOB_TITLE)}
            value={value.jobTitle ?? ''}
            onChange={(event) => set('jobTitle', event.currentTarget.value)}
            error={errors.jobTitle}
          />
        </Group>

        {/*
          The explanation about changing the address goes BELOW the row, not
          as one field's `description`: a description under a single field
          pushes that field up, and two fields in the same row stop being
          aligned.
        */}
        <Stack gap={6}>
          <Group grow align="flex-start">
            <TextInput
              label={t(EMAIL)}
              value={value.email}
              onChange={(event) => set('email', event.currentTarget.value)}
              error={errors.email}
              disabled={emailReadOnly}
            />
            <TextInput
              label={t(PHONE)}
              value={value.phone ?? ''}
              onChange={(event) => set('phone', event.currentTarget.value)}
              error={errors.phone}
            />
          </Group>

          {emailReadOnly && (
            <Text size="xs" style={{ color: liroVar.text.tertiary }}>
              {t(EMAIL_CHANGE_NOTE)}
            </Text>
          )}
        </Stack>
      </Stack>
    </SectionCard>
  )
}

export interface PasswordChangeCardProps {
  onSubmit: (values: { current: string; next: string }) => void
  saving?: boolean
  error?: string | null
  /** Minimum allowed length; defaults to 12. */
  minLength?: number
}

/**
 * Password strength is measured by length and variety, not by rules like
 * "must have an uppercase letter and a number". Those rules push people
 * toward `Password1!`, which is weaker than four random words.
 */
function passwordScore(value: string, minLength: number): number {
  if (!value) return 0
  let score = Math.min(value.length / (minLength * 1.5), 1) * 70
  if (/[a-z]/.test(value) && /[A-Z]/.test(value)) score += 10
  if (/\d/.test(value)) score += 10
  if (/[^\w\s]/.test(value)) score += 10
  return Math.min(Math.round(score), 100)
}

const PASSWORD_TITLE: TranslationKey = 'auth.password.title'
const PASSWORD_DESCRIPTION: TranslationKey = 'auth.password.description'
const CURRENT_PASSWORD: TranslationKey = 'auth.password.current'
const NEW_PASSWORD: TranslationKey = 'auth.password.new'
const MIN_LENGTH: TranslationKey = 'auth.password.minLength'
const PASSWORD_STRENGTH: TranslationKey = 'auth.password.strength'
const PASSWORD_HINT: TranslationKey = 'auth.password.hint'
const REPEAT_PASSWORD: TranslationKey = 'auth.password.repeat'
const PASSWORD_MISMATCH: TranslationKey = 'auth.password.mismatch'
const CHANGE_PASSWORD: TranslationKey = 'auth.password.change'

export function PasswordChangeCard({
  onSubmit,
  saving = false,
  error,
  minLength = 12,
}: PasswordChangeCardProps) {
  const { t } = useI18n()
  const [current, setCurrent] = useState('')
  const [next, setNext] = useState('')
  const [repeat, setRepeat] = useState('')

  const score = passwordScore(next, minLength)
  const tooShort = next.length > 0 && next.length < minLength
  const mismatch = repeat.length > 0 && next !== repeat
  const canSubmit = current.length > 0 && next.length >= minLength && next === repeat

  return (
    <SectionCard
      title={PASSWORD_TITLE}
      description={PASSWORD_DESCRIPTION}
    >
      <Stack gap="md" maw={420}>
        <PasswordInput
          label={t(CURRENT_PASSWORD)}
          value={current}
          onChange={(event) => setCurrent(event.currentTarget.value)}
          error={error}
          autoComplete="current-password"
        />

        <Stack gap={6}>
          <PasswordInput
            label={t(NEW_PASSWORD)}
            value={next}
            onChange={(event) => setNext(event.currentTarget.value)}
            error={tooShort ? t(MIN_LENGTH, undefined, { min: minLength }) : undefined}
            autoComplete="new-password"
          />
          {next.length > 0 && (
            <Progress
              value={score}
              size="xs"
              radius="xl"
              color={score < 40 ? 'liro-red' : score < 70 ? 'liro-orange' : 'liro-green'}
              aria-label={t(PASSWORD_STRENGTH)}
            />
          )}
          <Text size="xs" style={{ color: liroVar.text.tertiary }}>
            {t(PASSWORD_HINT)}
          </Text>
        </Stack>

        <PasswordInput
          label={t(REPEAT_PASSWORD)}
          value={repeat}
          onChange={(event) => setRepeat(event.currentTarget.value)}
          error={mismatch ? t(PASSWORD_MISMATCH) : undefined}
          autoComplete="new-password"
        />

        <ActionGroup>
          <ActionButton
            intent="save"
            label={CHANGE_PASSWORD}
            disabled={!canSubmit}
            loading={saving}
            onClick={() => onSubmit({ current, next })}
          />
        </ActionGroup>
      </Stack>
    </SectionCard>
  )
}

export interface TwoFactorCardProps {
  enabled: boolean
  onEnable: () => void
  onDisable: () => void
  /** Number of remaining backup codes; below three, a warning is shown. */
  backupCodesLeft?: number
  onRegenerateBackupCodes?: () => void
  busy?: boolean
}

const TWO_FACTOR_CARD_TITLE: TranslationKey = 'auth.twoFactorCard.title'
const TWO_FACTOR_CARD_DESCRIPTION: TranslationKey = 'auth.twoFactorCard.description'
const TWO_FACTOR_ON: TranslationKey = 'auth.twoFactorCard.on'
const TWO_FACTOR_OFF: TranslationKey = 'auth.twoFactorCard.off'
const TWO_FACTOR_ENABLED_HINT: TranslationKey = 'auth.twoFactorCard.enabledHint'
const TWO_FACTOR_DISABLED_HINT: TranslationKey = 'auth.twoFactorCard.disabledHint'
const BACKUP_CODES_LEFT: TranslationKey = 'auth.twoFactorCard.backupCodesLeft'
const GENERATE_NEW: TranslationKey = 'auth.twoFactorCard.generateNew'
const TURN_OFF_TWO_FACTOR: TranslationKey = 'auth.twoFactorCard.turnOff'
const TURN_ON: TranslationKey = 'auth.twoFactorCard.turnOn'

export function TwoFactorCard({
  enabled,
  onEnable,
  onDisable,
  backupCodesLeft,
  onRegenerateBackupCodes,
  busy = false,
}: TwoFactorCardProps) {
  const { t } = useI18n()
  const lowCodes = backupCodesLeft !== undefined && backupCodesLeft <= 3

  return (
    <SectionCard
      title={TWO_FACTOR_CARD_TITLE}
      description={TWO_FACTOR_CARD_DESCRIPTION}
      icon={ShieldCheck}
      actions={
        <StatusBadge
          tone={enabled ? 'success' : 'warning'}
          label={enabled ? TWO_FACTOR_ON : TWO_FACTOR_OFF}
        />
      }
    >
      <Stack gap="md">
        <Text size="sm" style={{ color: liroVar.text.secondary }}>
          {enabled ? t(TWO_FACTOR_ENABLED_HINT) : t(TWO_FACTOR_DISABLED_HINT)}
        </Text>

        {enabled && backupCodesLeft !== undefined && (
          <Group gap="xs">
            <Badge
              variant="light"
              color={lowCodes ? 'liro-orange' : 'liro-gray'}
              radius="sm"
            >
              {t(BACKUP_CODES_LEFT, undefined, { count: backupCodesLeft })}
            </Badge>
            {lowCodes && onRegenerateBackupCodes && (
              <ActionButton
                intent="refresh"
                label={GENERATE_NEW}
                onClick={onRegenerateBackupCodes}
              />
            )}
          </Group>
        )}

        <ActionGroup>
          {enabled ? (
            <ActionButton
              intent="revert"
              label={TURN_OFF_TWO_FACTOR}
              onClick={onDisable}
              loading={busy}
            />
          ) : (
            <ActionButton
              intent="verify"
              label={TURN_ON}
              onClick={onEnable}
              loading={busy}
            />
          )}
        </ActionGroup>
      </Stack>
    </SectionCard>
  )
}

export interface SessionInfo {
  id: string
  device: string
  location?: string
  lastActive: string
  current?: boolean
}

export interface SessionsCardProps {
  sessions: SessionInfo[]
  onRevoke: (id: string) => void
  onRevokeAll?: () => void
}

/** List of signed-in devices. The current one cannot be signed out from here. */
const SESSIONS_TITLE: TranslationKey = 'auth.sessions.title'
const SIGN_OUT_OTHERS: TranslationKey = 'auth.sessions.signOutOthers'
const THIS_DEVICE: TranslationKey = 'auth.sessions.thisDevice'
const SIGN_OUT_DEVICE: TranslationKey = 'auth.sessions.signOutDevice'
const NO_OTHER_SESSIONS: TranslationKey = 'auth.sessions.noOtherSessions'

export function SessionsCard({ sessions, onRevoke, onRevokeAll }: SessionsCardProps) {
  const { t } = useI18n()

  return (
    <SectionCard
      title={SESSIONS_TITLE}
      icon={Monitor}
      actions={
        onRevokeAll && sessions.length > 1 ? (
          <ActionButton
            intent="delete"
            label={SIGN_OUT_OTHERS}
            onClick={onRevokeAll}
          />
        ) : undefined
      }
    >
      <Stack gap="xs">
        {sessions.map((session) => (
          <Group
            key={session.id}
            justify="space-between"
            wrap="nowrap"
            p="xs"
            style={{
              border: `1px solid ${liroVar.border.default}`,
              borderRadius: 'var(--liro-radius-md)',
            }}
          >
            <Stack gap={2} style={{ minWidth: 0 }}>
              <Group gap="xs">
                <Text size="sm" fw={600}>{session.device}</Text>
                {session.current && (
                  <StatusBadge tone="info" label={THIS_DEVICE} />
                )}
              </Group>
              <Text size="xs" style={{ color: liroVar.text.tertiary }}>
                {[session.location, session.lastActive].filter(Boolean).join(' · ')}
              </Text>
            </Stack>

            {!session.current && (
              <ActionButton
                intent="delete"
                iconOnly
                label={SIGN_OUT_DEVICE}
                onClick={() => onRevoke(session.id)}
              />
            )}
          </Group>
        ))}
        {sessions.length === 0 && (
          <Text size="sm" c="dimmed">
            {t(NO_OTHER_SESSIONS)}
          </Text>
        )}
      </Stack>
    </SectionCard>
  )
}

export interface PreferencesValues {
  locale: Locale
  colorScheme: 'light' | 'dark' | 'auto'
  /** Denser tables for users who look at lists all day. */
  denseTables: boolean
  emailNotifications: boolean
}

export interface PreferencesCardProps {
  value: PreferencesValues
  onChange: (value: PreferencesValues) => void
}

const LOCALE_OPTIONS: { value: Locale; label: string }[] = [
  { value: 'sr-Latn', label: 'Latinica' },
  { value: 'sr-Cyrl', label: 'Ћирилица' },
  { value: 'en', label: 'English' },
]

const PREFERENCES_TITLE: TranslationKey = 'auth.preferences.title'
const LANGUAGE: TranslationKey = 'auth.preferences.language'
const THEME: TranslationKey = 'auth.preferences.theme'
const THEME_LIGHT: TranslationKey = 'auth.preferences.themeLight'
const THEME_DARK: TranslationKey = 'auth.preferences.themeDark'
const THEME_SYSTEM: TranslationKey = 'auth.preferences.themeSystem'
const DENSE_TABLES: TranslationKey = 'auth.preferences.denseTables'
const DENSE_TABLES_HINT: TranslationKey = 'auth.preferences.denseTablesHint'
const EMAIL_NOTIFICATIONS: TranslationKey = 'auth.preferences.emailNotifications'
const EMAIL_NOTIFICATIONS_HINT: TranslationKey = 'auth.preferences.emailNotificationsHint'

export function PreferencesCard({ value, onChange }: PreferencesCardProps) {
  const { t } = useI18n()
  const set = <K extends keyof PreferencesValues>(key: K, next: PreferencesValues[K]) =>
    onChange({ ...value, [key]: next })

  return (
    <SectionCard title={PREFERENCES_TITLE}>
      <Stack gap="lg">
        {/*
          Select, not SegmentedControl.
          A three-state switch stretched across the whole card looks like it
          carries more weight than it does; these are settings touched once.
        */}
        <Group grow align="flex-start">
          <Select
            label={t(LANGUAGE)}
            value={value.locale}
            onChange={(next) => next && set('locale', next as Locale)}
            data={LOCALE_OPTIONS}
            allowDeselect={false}
          />
          <Select
            label={t(THEME)}
            value={value.colorScheme}
            onChange={(next) => next && set('colorScheme', next as PreferencesValues['colorScheme'])}
            data={[
              { value: 'light', label: t(THEME_LIGHT) },
              { value: 'dark', label: t(THEME_DARK) },
              { value: 'auto', label: t(THEME_SYSTEM) },
            ]}
            allowDeselect={false}
          />
        </Group>

        <Divider />

        <Switch
          checked={value.denseTables}
          onChange={(event) => set('denseTables', event.currentTarget.checked)}
          label={t(DENSE_TABLES)}
          description={t(DENSE_TABLES_HINT)}
        />

        <Switch
          checked={value.emailNotifications}
          onChange={(event) => set('emailNotifications', event.currentTarget.checked)}
          label={t(EMAIL_NOTIFICATIONS)}
          description={t(EMAIL_NOTIFICATIONS_HINT)}
        />
      </Stack>
    </SectionCard>
  )
}

export interface DangerZoneCardProps {
  onDeleteAccount: () => void
  /** When `false`, deletion is disabled with an explanation. */
  canDelete?: boolean
  blockedReason?: LocalizedLabel
}

/**
 * Irreversible actions, kept separate from the rest of the settings.
 *
 * The red border and its own card exist so that this button does not end up
 * next to the theme switch — the difference in consequence must be visible
 * even before reading.
 */
const DANGER_ZONE_TITLE: TranslationKey = 'auth.dangerZone.title'
const DANGER_ZONE_DESCRIPTION: TranslationKey = 'auth.dangerZone.description'
const DELETE_ACCOUNT: TranslationKey = 'auth.dangerZone.deleteAccount'

export function DangerZoneCard({ onDeleteAccount, canDelete = true, blockedReason }: DangerZoneCardProps) {
  const { t } = useI18n()

  return (
    <SectionCard
      title={DANGER_ZONE_TITLE}
      icon={Trash2}
      description={DANGER_ZONE_DESCRIPTION}
    >
      <Stack gap="sm">
        {!canDelete && blockedReason && (
          <Text size="sm" style={{ color: liroVar.status.warning.fg }}>{t(blockedReason)}</Text>
        )}
        <ActionGroup>
          <ActionButton
            intent="delete"
            label={DELETE_ACCOUNT}
            onClick={onDeleteAccount}
            disabled={!canDelete}
          />
        </ActionGroup>
      </Stack>
    </SectionCard>
  )
}
