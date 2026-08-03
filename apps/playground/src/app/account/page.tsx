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
  { name: 'name', type: 'text', label: { sr: 'Naziv', en: 'Name' }, required: true },
  { name: 'pib', type: 'text', label: { sr: 'PIB', en: 'Tax ID' }, required: true },
  { name: 'maticni', type: 'text', label: { sr: 'Matični broj', en: 'Reg. number' } },
  { name: 'email', type: 'email', label: { sr: 'Elektronska pošta', en: 'Email' } },
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
    locale: 'sr',
    colorScheme: 'light',
    denseTables: false,
    emailNotifications: true,
  })
  const [twoFactor, setTwoFactor] = useState(false)
  const [sessions, setSessions] = useState([
    { id: '1', device: 'Chrome · Windows 11', location: 'Beograd', lastActive: 'Sada', current: true },
    { id: '2', device: 'Safari · iPhone', location: 'Novi Sad', lastActive: 'Pre 2 sata' },
    { id: '3', device: 'Firefox · Ubuntu', location: 'Beograd', lastActive: 'Juče u 17:42' },
  ])

  const errors = useFormErrors()
  const [showConflict, setShowConflict] = useState(false)

  /* Simulacija odgovora servera - u aplikaciji ovo dolazi iz `onError` mutacije. */
  const simulateDuplicate = () =>
    errors.capture(
      new DataProviderError('duplicate key value violates unique constraint', 'conflict', null, [
        { field: 'pib', message: 'Klijent sa ovim PIB-om već postoji.' },
      ]),
    )

  const simulateConflict = () => {
    errors.capture(new ConcurrencyError('Zapis je u međuvremenu izmenjen.'))
    setShowConflict(true)
  }

  return (
    <DemoAppShell>
      <ListPageTemplate
        title={{ sr: 'Nalog i sigurnost zapisa', en: 'Account and record safety' }}
        description={{
          sr: 'Profil, podešavanja, greške sa servera i sukob istovremene izmene.',
          en: 'Profile, settings, server-side errors and concurrent edit conflicts.',
        }}
        flush
      >
        <Tabs defaultValue="profile" keepMounted={false}>
          <Tabs.List mb="lg">
            <Tabs.Tab value="profile">Profil</Tabs.Tab>
            <Tabs.Tab value="security">Sigurnost</Tabs.Tab>
            <Tabs.Tab value="errors">Greške sa servera</Tabs.Tab>
            <Tabs.Tab value="conflict">Istovremena izmena</Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value="profile">
            <Stack gap="lg">
              <ProfileCard
                value={profile}
                onChange={setProfile}
                onSave={() => commonNotice.saved()}
                onAvatarSelect={() => commonNotice.saved({ sr: 'Slika je primljena.', en: 'Photo received.' })}
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
                  sr: 'Nalog je jedini administrator organizacije. Prvo dodelite ulogu drugom korisniku.',
                  en: 'This is the only administrator. Assign the role to someone else first.',
                }}
              />
            </Stack>
          </Tabs.Panel>

          <Tabs.Panel value="errors">
            <Stack gap="lg">
              <Callout tone="info" title={{ sr: 'Greška stoji uz polje', en: 'Errors belong next to the field' }}>
                Klijentska validacija nikada nije potpuna — jedinstvenost PIB-a zna samo baza. Kada
                server kaže koje polje ne valja, <code>AutoForm</code> upisuje grešku u stanje forme,
                pa se ponaša isto kao lokalna: nestaje kad korisnik ispravi unos i fokusira prvo
                pogođeno polje.
              </Callout>

              <SectionCard title={{ sr: 'Isprobajte', en: 'Try it' }}>
                <ActionGroup>
                  <ActionButton
                    intent="submit"
                    label={{ sr: 'Simuliraj duplikat PIB-a', en: 'Simulate duplicate' }}
                    onClick={simulateDuplicate}
                  />
                  <ActionButton
                    intent="reject"
                    label={{ sr: 'Simuliraj nedostatak prava', en: 'Simulate forbidden' }}
                    onClick={() => errors.capture(new DataProviderError('forbidden', 'forbidden'))}
                  />
                  <ActionButton
                    intent="refresh"
                    label={{ sr: 'Očisti greške', en: 'Clear' }}
                    onClick={errors.clear}
                  />
                </ActionGroup>
              </SectionCard>

              <SectionCard title={{ sr: 'Forma', en: 'Form' }}>
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
              <Callout tone="warning" title={{ sr: 'Ko piše poslednji, ne pobeđuje', en: 'Last write does not win' }}>
                Dvoje ljudi otvori isti zapis i sačuva redom — bez provere verzije drugi bi obrisao
                izmene prvog i niko ne bi primetio. Uslov na verziju ide u isti <code>UPDATE</code>,
                ne kao zasebno čitanje pre njega, jer između čitanja i upisa uvek postoji procep.
              </Callout>

              <SimpleGrid cols={1} spacing="lg">
                <SectionCard title={{ sr: 'Isprobajte', en: 'Try it' }}>
                  <ActionGroup>
                    <ActionButton
                      intent="save"
                      label={{ sr: 'Simuliraj sukob', en: 'Simulate conflict' }}
                      onClick={simulateConflict}
                    />
                    <ActionButton
                      intent="refresh"
                      label={{ sr: 'Sakrij', en: 'Hide' }}
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
                    changedAt="pre 2 minuta"
                    fields={[
                      { label: { sr: 'Bruto zarada', en: 'Gross salary' }, mine: '125.450,00', theirs: '132.000,00' },
                      { label: { sr: 'Radno mesto', en: 'Position' }, mine: 'Knjigovođa', theirs: 'Viši knjigovođa' },
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

                <SectionCard title={{ sr: 'Optimistično osvežavanje', en: 'Optimistic updates' }}>
                  <Text size="sm">
                    <code>useResourceMutations(resource, {'{ optimistic: true }'})</code> odmah primeni
                    izmenu na učitane liste, pre nego što server odgovori, i vrati prethodno stanje ako
                    zahtev padne.
                  </Text>
                  <Text size="sm" mt="xs">
                    Vredi na spiskovima gde se radi u nizu — označavanje kao pročitano, prekidači,
                    brisanje reda. Ne vredi tamo gde server računa vrednosti koje klijent ne zna
                    (redni broj dokumenta, obračunat iznos), jer bi red na trenutak prikazao pogrešne
                    podatke pa se ispravio.
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
