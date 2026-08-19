'use client'

import { useState } from 'react'
import { SimpleGrid, Stack, Tabs, Text } from '@mantine/core'
import {
  ActionButton,
  ActionGroup,
  Callout,
  ConflictBanner,
  DangerZoneCard,
  PasswordChangeCard,
  PreferencesCard,
  ProfileCard,
  SectionCard,
  SessionsCard,
  TwoFactorCard,
  commonNotice,
  type PreferencesValues,
  type ProfileValues,
} from '@liro/ui'
import { AutoForm, useFormErrors, type FieldSchema } from '@liro/forms'
import { DataProviderError, ConcurrencyError } from '@liro/data'
import { ListPageTemplate } from '@liro/templates'
import { DemoAppShell } from '@/components/DemoAppShell'

const CLIENT_SCHEMA: FieldSchema[] = [
  { name: 'name', type: 'text', label: { en: 'Name' }, required: true },
  { name: 'pib', type: 'text', label: { en: 'Tax ID' }, required: true },
  { name: 'maticni', type: 'text', label: { en: 'Reg. number' } },
  { name: 'email', type: 'email', label: { en: 'Email' } },
]

export default function AccountPage() {
  const [profile, setProfile] = useState<ProfileValues>({
    fullName: 'Veljko Ostojić',
    email: 'veljko@liro.rs',
    phone: '+381 64 123 4567',
    jobTitle: 'Vlasnik',
    avatarUrl: null,
  })
  const [prefs, setPrefs] = useState<PreferencesValues>({
    locale: 'sr-Latn',
    colorScheme: 'light',
    denseTables: false,
    emailNotifications: true,
  })
  const [twoFactor, setTwoFactor] = useState(false)
  const [sessions, setSessions] = useState([
    { id: '1', device: 'Chrome · Windows 11', location: 'Beograd', lastActive: 'Now', current: true },
    { id: '2', device: 'Safari · iPhone', location: 'Novi Sad', lastActive: '2 hours ago' },
    { id: '3', device: 'Firefox · Ubuntu', location: 'Beograd', lastActive: 'Yesterday at 17:42' },
  ])

  const errors = useFormErrors()
  const [showConflict, setShowConflict] = useState(false)

  /* Simulates a server response - in a real application this comes from an `onError` mutation. */
  const simulateDuplicate = () =>
    errors.capture(
      new DataProviderError('duplicate key value violates unique constraint', 'conflict', null, [
        /*
        * A code and its params, not prose.
        *
        * This is what the server actually sends now: the translation lives in
        * `FIELD_ERROR_LABELS`, so the same response reads correctly in every
        * locale. Switch the language in the header and the message follows.
        */ 
        { field: 'pib', code: 'already_exists', params: { value: '100002315' } },
      ]),
    )

  const simulateConflict = () => {
    errors.capture(new ConcurrencyError('The record was changed in the meantime.'))
    setShowConflict(true)
  }

  return (
    <DemoAppShell>
      <ListPageTemplate
        title={{ en: 'Account and record safety' }}
        description={{
          en: 'Profile, settings, server-side errors and concurrent edit conflicts.',
        }}
        flush
      >
        <Tabs defaultValue="profile" keepMounted={false}>
          <Tabs.List mb="lg">
            <Tabs.Tab value="profile">Profile</Tabs.Tab>
            <Tabs.Tab value="security">Security</Tabs.Tab>
            <Tabs.Tab value="errors">Server errors</Tabs.Tab>
            <Tabs.Tab value="conflict">Concurrent edit</Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value="profile">
            <Stack gap="lg">
              <ProfileCard
                value={profile}
                onChange={setProfile}
                onSave={() => commonNotice.saved()}
                onAvatarSelect={() => commonNotice.saved({ en: 'Photo received.' })}
                onAvatarRemove={() => setProfile({ ...profile, avatarUrl: null })}
                emailReadOnly
              />
              <PreferencesCard value={prefs} onChange={setPrefs} />
            </Stack>
          </Tabs.Panel>

          <Tabs.Panel value="security">
            <Stack gap="lg">
              <PasswordChangeCard onSubmit={() => commonNotice.saved()} />
              <TwoFactorCard
                enabled={twoFactor}
                onEnable={() => setTwoFactor(true)}
                onDisable={() => setTwoFactor(false)}
                backupCodesLeft={twoFactor ? 2 : undefined}
                onRegenerateBackupCodes={() => commonNotice.saved()}
              />
              <SessionsCard
                sessions={sessions}
                onRevoke={(id) => setSessions((current) => current.filter((item) => item.id !== id))}
                onRevokeAll={() => setSessions((current) => current.filter((item) => item.current))}
              />
              <DangerZoneCard
                onDeleteAccount={() => {}}
                canDelete={false}
                blockedReason={{
                  en: 'This is the only administrator. Assign the role to someone else first.',
                }}
              />
            </Stack>
          </Tabs.Panel>

          <Tabs.Panel value="errors">
            <Stack gap="lg">
              <Callout tone="info" title={{ en: 'Errors belong next to the field' }}>
                Client-side validation is never complete — only the database knows whether a PIB is
                unique. When the server says which field is wrong, <code>AutoForm</code> writes the
                error into the form state, so it behaves just like a local one: it disappears when
                the user corrects the input, and focus moves to the first affected field.
              </Callout>

              <SectionCard title={{ en: 'Try it' }}>
                <ActionGroup>
                  <ActionButton
                    intent="submit"
                    label={{ en: 'Simulate duplicate' }}
                    onClick={simulateDuplicate}
                  />
                  <ActionButton
                    intent="reject"
                    label={{ en: 'Simulate forbidden' }}
                    onClick={() => errors.capture(new DataProviderError('forbidden', 'forbidden'))}
                  />
                  <ActionButton
                    intent="refresh"
                    label={{ en: 'Clear' }}
                    onClick={errors.clear}
                  />
                </ActionGroup>
              </SectionCard>

              <SectionCard title={{ en: 'Form' }}>
                <AutoForm
                  schema={CLIENT_SCHEMA}
                  defaultValues={{ name: 'Konfirs d.o.o.', pib: '100234567' }}
                  serverErrors={errors.serverErrors}
                  formError={errors.formError}
                  onSubmit={() => {
                    errors.clear()
                    commonNotice.saved()
                  }}
                />
              </SectionCard>
            </Stack>
          </Tabs.Panel>

          <Tabs.Panel value="conflict">
            <Stack gap="lg">
              <Callout tone="warning" title={{ en: 'Last write does not win' }}>
                Two people open the same record and save it in turn — without a version check, the
                second save would erase the first person's changes and no one would notice. The
                version condition goes into the same <code>UPDATE</code>, not as a separate read
                before it, because there is always a gap between a read and a write.
              </Callout>

              <SimpleGrid cols={1} spacing="lg">
                <SectionCard title={{ en: 'Try it' }}>
                  <ActionGroup>
                    <ActionButton
                      intent="save"
                      label={{ en: 'Simulate conflict' }}
                      onClick={simulateConflict}
                    />
                    <ActionButton
                      intent="refresh"
                      label={{ en: 'Hide' }}
                      onClick={() => {
                        setShowConflict(false)
                        errors.clear()
                      }}
                    />
                  </ActionGroup>
                </SectionCard>

                {showConflict && (
                  <ConflictBanner
                    changedBy="Ana Jovanović"
                    changedAt="2 minutes ago"
                    fields={[
                      { label: { en: 'Gross salary' }, mine: '125.450,00', theirs: '132.000,00' },
                      { label: { en: 'Position' }, mine: 'Bookkeeper', theirs: 'Accountant' },
                    ]}
                    onReload={() => {
                      setShowConflict(false)
                      errors.clear()
                    }}
                    onOverwrite={() => {
                      setShowConflict(false)
                      errors.clear()
                      commonNotice.saved()
                    }}
                  />
                )}

                <SectionCard title={{ en: 'Optimistic updates' }}>
                  <Text size="sm">
                    <code>useResourceMutations(resource, {'{ optimistic: true }'})</code> immediately
                    applies the change to loaded lists, before the server responds, and rolls back to
                    the previous state if the request fails.
                  </Text>
                  <Text size="sm" mt="xs">
                    It is worth it on lists where actions happen in a row — marking as read, toggles,
                    deleting a row. It is not worth it where the server computes values the client
                    does not know (a document's sequence number, a calculated amount), because the
                    row would briefly show wrong data and then correct itself.
                  </Text>
                </SectionCard>
              </SimpleGrid>
            </Stack>
          </Tabs.Panel>
        </Tabs>
      </ListPageTemplate>
    </DemoAppShell>
  )
}
