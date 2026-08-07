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
import { useI18n, type Locale, type LocalizedLabel } from '@liro/i18n'
import { ActionButton, ActionGroup } from '../actions/ActionButton'
import { SectionCard } from '../layout/SectionCard'
import { StatusBadge } from '../feedback/StatusBadge'
import { PersonAvatar } from '../primitives/PersonAvatar'

/**
 * Nalog i profil.
 *
 * Ovi ekrani postoje u svakoj aplikaciji i svuda se prave iznova, pa svuda
 * ispadnu malo drugaciji. Ovde su kao komponente koje primaju vrednosti i
 * vracaju dogadjaje - aplikacija odlucuje sta ce sa njima, izgled je resen.
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
  /** Greske sa servera, po polju. */
  errors?: Record<string, string>
  /** Elektronska posta se najcesce menja kroz poseban tok sa potvrdom. */
  emailReadOnly?: boolean
}

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
      title={{ sr: 'Profil', en: 'Profile' }}
      description={{
        sr: 'Podaci koje vide ostali korisnici u vašoj organizaciji.',
        en: 'What other people in your organisation see.',
      }}
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
                      label={{ sr: 'Promeni sliku', en: 'Change photo' }}
                      onClick={props.onClick}
                    />
                  )}
                </FileButton>
              )}
              {value.avatarUrl && onAvatarRemove && (
                <ActionButton
                  intent="delete"
                  label={{ sr: 'Ukloni', en: 'Remove' }}
                  onClick={onAvatarRemove}
                />
              )}
            </Group>
            <Text size="xs" style={{ color: liroVar.text.tertiary }}>
              {t({ sr: 'PNG ili JPG, najviše 2 MB', 'sr-Cyrl': 'PNG или JPG, највише 2 MB', en: 'PNG or JPG, up to 2 MB' })}
            </Text>
          </Stack>
        </Group>

        <Divider />

        <Group grow align="flex-start">
          <TextInput
            label={t({ sr: 'Ime i prezime', 'sr-Cyrl': 'Име и презиме', en: 'Full name' })}
            value={value.fullName}
            onChange={(event) => set('fullName', event.currentTarget.value)}
            error={errors.fullName}
            withAsterisk
          />
          <TextInput
            label={t({ sr: 'Radno mesto', 'sr-Cyrl': 'Радно место', en: 'Job title' })}
            value={value.jobTitle ?? ''}
            onChange={(event) => set('jobTitle', event.currentTarget.value)}
            error={errors.jobTitle}
          />
        </Group>

        {/*
          Objasnjenje o promeni adrese ide ISPOD reda, ne kao `description`
          jednog polja: opis ispod jednog polja pomera to polje navise i dva
          polja u istom redu prestaju da budu poravnata.
        */}
        <Stack gap={6}>
          <Group grow align="flex-start">
            <TextInput
              label={t({ sr: 'Elektronska pošta', 'sr-Cyrl': 'Електронска пошта', en: 'Email' })}
              value={value.email}
              onChange={(event) => set('email', event.currentTarget.value)}
              error={errors.email}
              disabled={emailReadOnly}
            />
            <TextInput
              label={t({ sr: 'Telefon', 'sr-Cyrl': 'Телефон', en: 'Phone' })}
              value={value.phone ?? ''}
              onChange={(event) => set('phone', event.currentTarget.value)}
              error={errors.phone}
            />
          </Group>

          {emailReadOnly && (
            <Text size="xs" style={{ color: liroVar.text.tertiary }}>
              {t({
                sr: 'Promena adrese elektronske pošte ide kroz potvrdu na novoj adresi.',
                'sr-Cyrl': 'Промена адресе електронске поште иде кроз потврду на новој адреси.',
                en: 'Changing the email address requires confirmation at the new one.',
              })}
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
  /** Najmanja dozvoljena dužina; podrazumevano 12. */
  minLength?: number
}

/**
 * Snaga lozinke se meri duzinom i raznovrsnoscu, a ne pravilima tipa
 * „mora veliko slovo i broj". Ta pravila teraju ljude na `Lozinka1!`, sto je
 * slabije od cetiri nasumicne reci.
 */
function passwordScore(value: string, minLength: number): number {
  if (!value) return 0
  let score = Math.min(value.length / (minLength * 1.5), 1) * 70
  if (/[a-z]/.test(value) && /[A-Z]/.test(value)) score += 10
  if (/\d/.test(value)) score += 10
  if (/[^\w\s]/.test(value)) score += 10
  return Math.min(Math.round(score), 100)
}

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
      title={{ sr: 'Lozinka', en: 'Password' }}
      description={{
        sr: 'Promena lozinke odjavljuje ostale uređaje.',
        en: 'Changing the password signs out other devices.',
      }}
    >
      <Stack gap="md" maw={420}>
        <PasswordInput
          label={t({ sr: 'Trenutna lozinka', 'sr-Cyrl': 'Тренутна лозинка', en: 'Current password' })}
          value={current}
          onChange={(event) => setCurrent(event.currentTarget.value)}
          error={error}
          autoComplete="current-password"
        />

        <Stack gap={6}>
          <PasswordInput
            label={t({ sr: 'Nova lozinka', 'sr-Cyrl': 'Нова лозинка', en: 'New password' })}
            value={next}
            onChange={(event) => setNext(event.currentTarget.value)}
            error={
              tooShort
                ? t({
                    sr: `Najmanje ${minLength} znakova`,
                    'sr-Cyrl': `Најмање ${minLength} знакова`,
                    en: `At least ${minLength} characters`,
                  })
                : undefined
            }
            autoComplete="new-password"
          />
          {next.length > 0 && (
            <Progress
              value={score}
              size="xs"
              radius="xl"
              color={score < 40 ? 'liro-red' : score < 70 ? 'liro-orange' : 'liro-green'}
              aria-label={t({
                sr: 'Jačina lozinke',
                'sr-Cyrl': 'Јачина лозинке',
                en: 'Password strength',
              })}
            />
          )}
          <Text size="xs" style={{ color: liroVar.text.tertiary }}>
            {t({
              sr: 'Duža lozinka je jača od komplikovane. Četiri nasumične reči rade bolje od Lozinka1!.',
              'sr-Cyrl': 'Дужа лозинка је јача од компликоване.',
              en: 'Length beats complexity. Four random words beat Password1!.',
            })}
          </Text>
        </Stack>

        <PasswordInput
          label={t({ sr: 'Ponovite novu lozinku', 'sr-Cyrl': 'Поновите нову лозинку', en: 'Repeat new password' })}
          value={repeat}
          onChange={(event) => setRepeat(event.currentTarget.value)}
          error={
            mismatch
              ? t({ sr: 'Lozinke se ne poklapaju', 'sr-Cyrl': 'Лозинке се не поклапају', en: 'Passwords do not match' })
              : undefined
          }
          autoComplete="new-password"
        />

        <ActionGroup>
          <ActionButton
            intent="save"
            label={{ sr: 'Promeni lozinku', en: 'Change password' }}
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
  /** Broj preostalih rezervnih kodova; ispod tri se prikazuje upozorenje. */
  backupCodesLeft?: number
  onRegenerateBackupCodes?: () => void
  busy?: boolean
}

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
      title={{ sr: 'Dvofaktorna potvrda', en: 'Two-factor authentication' }}
      description={{
        sr: 'Dodatni kod pri prijavi sa novog uređaja.',
        en: 'An extra code when signing in from a new device.',
      }}
      icon={ShieldCheck}
      actions={
        <StatusBadge
          tone={enabled ? 'success' : 'warning'}
          label={
            enabled
              ? { sr: 'Uključeno', 'sr-Cyrl': 'Укључено', en: 'On' }
              : { sr: 'Isključeno', 'sr-Cyrl': 'Искључено', en: 'Off' }
          }
        />
      }
    >
      <Stack gap="md">
        <Text size="sm" style={{ color: liroVar.text.secondary }}>
          {enabled
            ? t({
                sr: 'Pri prijavi sa nepoznatog uređaja tražiće se kod iz aplikacije za potvrdu.',
                'sr-Cyrl': 'При пријави са непознатог уређаја тражиће се код из апликације.',
                en: 'Signing in from an unknown device will ask for a code from your authenticator app.',
              })
            : t({
                sr: 'Preporučeno za naloge koji pristupaju podacima o zaradama i poreskim prijavama.',
                'sr-Cyrl': 'Препоручено за налоге који приступају подацима о зарадама.',
                en: 'Recommended for accounts that access payroll and tax data.',
              })}
        </Text>

        {enabled && backupCodesLeft !== undefined && (
          <Group gap="xs">
            <Badge
              variant="light"
              color={lowCodes ? 'liro-orange' : 'liro-gray'}
              radius="sm"
            >
              {t({
                sr: `Rezervnih kodova: ${backupCodesLeft}`,
                'sr-Cyrl': `Резервних кодова: ${backupCodesLeft}`,
                en: `Backup codes left: ${backupCodesLeft}`,
              })}
            </Badge>
            {lowCodes && onRegenerateBackupCodes && (
              <ActionButton
                intent="refresh"
                label={{ sr: 'Generiši nove', en: 'Generate new' }}
                onClick={onRegenerateBackupCodes}
              />
            )}
          </Group>
        )}

        <ActionGroup>
          {enabled ? (
            <ActionButton
              intent="revert"
              label={{ sr: 'Isključi dvofaktornu potvrdu', en: 'Turn off two-factor' }}
              onClick={onDisable}
              loading={busy}
            />
          ) : (
            <ActionButton
              intent="verify"
              label={{ sr: 'Uključi', en: 'Turn on' }}
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

/** Spisak prijavljenih uredjaja. Tekuci se ne moze odjaviti odavde. */
export function SessionsCard({ sessions, onRevoke, onRevokeAll }: SessionsCardProps) {
  const { t } = useI18n()

  return (
    <SectionCard
      title={{ sr: 'Prijavljeni uređaji', en: 'Active sessions' }}
      icon={Monitor}
      actions={
        onRevokeAll && sessions.length > 1 ? (
          <ActionButton
            intent="delete"
            label={{ sr: 'Odjavi sve ostale', en: 'Sign out others' }}
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
                  <StatusBadge tone="info" label={{ sr: 'Ovaj uređaj', 'sr-Cyrl': 'Овај уређај', en: 'This device' }} />
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
                label={{ sr: 'Odjavi uređaj', en: 'Sign out device' }}
                onClick={() => onRevoke(session.id)}
              />
            )}
          </Group>
        ))}
        {sessions.length === 0 && (
          <Text size="sm" c="dimmed">
            {t({ sr: 'Nema drugih prijava', 'sr-Cyrl': 'Нема других пријава', en: 'No other sessions' })}
          </Text>
        )}
      </Stack>
    </SectionCard>
  )
}

export interface PreferencesValues {
  locale: Locale
  colorScheme: 'light' | 'dark' | 'auto'
  /** Gusce tabele za korisnike koji ceo dan gledaju spiskove. */
  denseTables: boolean
  emailNotifications: boolean
}

export interface PreferencesCardProps {
  value: PreferencesValues
  onChange: (value: PreferencesValues) => void
}

const LOCALE_OPTIONS: { value: Locale; label: string }[] = [
  { value: 'sr', label: 'Latinica' },
  { value: 'sr-Cyrl', label: 'Ћирилица' },
  { value: 'en', label: 'English' },
]

export function PreferencesCard({ value, onChange }: PreferencesCardProps) {
  const { t } = useI18n()
  const set = <K extends keyof PreferencesValues>(key: K, next: PreferencesValues[K]) =>
    onChange({ ...value, [key]: next })

  return (
    <SectionCard title={{ sr: 'Podešavanja prikaza', en: 'Preferences' }}>
      <Stack gap="lg">
        {/*
          Select, ne SegmentedControl.
          Prekidac sa tri stanja razvucen preko cele kartice izgleda kao da nosi
          vecu tezinu nego sto ima; ovo su podesavanja koja se diraju jednom.
        */}
        <Group grow align="flex-start">
          <Select
            label={t({ sr: 'Jezik', 'sr-Cyrl': 'Језик', en: 'Language' })}
            value={value.locale}
            onChange={(next) => next && set('locale', next as Locale)}
            data={LOCALE_OPTIONS}
            allowDeselect={false}
          />
          <Select
            label={t({ sr: 'Tema', 'sr-Cyrl': 'Тема', en: 'Theme' })}
            value={value.colorScheme}
            onChange={(next) => next && set('colorScheme', next as PreferencesValues['colorScheme'])}
            data={[
              { value: 'light', label: t({ sr: 'Svetla', 'sr-Cyrl': 'Светла', en: 'Light' }) },
              { value: 'dark', label: t({ sr: 'Tamna', 'sr-Cyrl': 'Тамна', en: 'Dark' }) },
              { value: 'auto', label: t({ sr: 'Sistemska', 'sr-Cyrl': 'Системска', en: 'System' }) },
            ]}
            allowDeselect={false}
          />
        </Group>

        <Divider />

        <Switch
          checked={value.denseTables}
          onChange={(event) => set('denseTables', event.currentTarget.checked)}
          label={t({ sr: 'Guste tabele', 'sr-Cyrl': 'Густе табеле', en: 'Dense tables' })}
          description={t({
            sr: 'Više redova na ekranu, manji razmak. Korisno kada se ceo dan radi sa spiskovima.',
            'sr-Cyrl': 'Више редова на екрану, мањи размак.',
            en: 'More rows per screen. Useful when you work with lists all day.',
          })}
        />

        <Switch
          checked={value.emailNotifications}
          onChange={(event) => set('emailNotifications', event.currentTarget.checked)}
          label={t({ sr: 'Obaveštenja mejlom', 'sr-Cyrl': 'Обавештења мејлом', en: 'Email notifications' })}
          description={t({
            sr: 'Rokovi, odbijene prijave i dodeljeni zadaci.',
            'sr-Cyrl': 'Рокови, одбијене пријаве и додељени задаци.',
            en: 'Deadlines, rejected filings and assigned tasks.',
          })}
        />
      </Stack>
    </SectionCard>
  )
}

export interface DangerZoneCardProps {
  onDeleteAccount: () => void
  /** Kada je `false`, brisanje je onemoguceno uz objasnjenje. */
  canDelete?: boolean
  blockedReason?: LocalizedLabel
}

/**
 * Nepovratne radnje, odvojene od ostatka podesavanja.
 *
 * Crvena ivica i sopstvena kartica postoje da se ovo dugme ne bi naslo pored
 * prekidaca za temu - razlika u posledici mora da se vidi i pre citanja.
 */
export function DangerZoneCard({ onDeleteAccount, canDelete = true, blockedReason }: DangerZoneCardProps) {
  const { t } = useI18n()

  return (
    <SectionCard
      title={{ sr: 'Brisanje naloga', en: 'Delete account' }}
      icon={Trash2}
      description={{
        sr: 'Nalog i lični podaci se brišu trajno. Knjigovodstvena dokumentacija ostaje po zakonu.',
        en: 'The account and personal data are removed permanently. Accounting records are retained by law.',
      }}
    >
      <Stack gap="sm">
        {!canDelete && blockedReason && (
          <Text size="sm" style={{ color: liroVar.status.warning.fg }}>{t(blockedReason)}</Text>
        )}
        <ActionGroup>
          <ActionButton
            intent="delete"
            label={{ sr: 'Obriši nalog', en: 'Delete account' }}
            onClick={onDeleteAccount}
            disabled={!canDelete}
          />
        </ActionGroup>
      </Stack>
    </SectionCard>
  )
}
