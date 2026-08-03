'use client'

import { useCallback, useState } from 'react'
import { ActionIcon, Anchor, Box, Group, Loader, Progress, Stack, Text } from '@mantine/core'
import { Dropzone, type DropzoneProps } from '@mantine/dropzone'
import { FileText, Image as ImageIcon, Sheet, Upload, X } from 'lucide-react'
import { useFileStorageOptional, type UploadedFile } from '@liro/data'
import { useI18n, type LocalizedLabel } from '@liro/i18n'
import { liroVar } from '@liro/tokens'
import { commonNotice } from '@liro/ui'

/**
 * Prevlacenje priloga.
 *
 * Otpremanje ide kroz `FileStorage` iz `@liro/data`, isto kao `UploadField` u
 * formama - pa aplikacija podesava skladiste jednom i vazi svuda.
 *
 * Vise fajlova se otprema redom, ne paralelno. Deset izvoda poslatih odjednom
 * ume da obori vezu na slabijem internetu u kancelariji, a delimican neuspeh
 * je gori od sporog uspeha jer se ne vidi sta je proslo.
 */

export interface FileDropzoneProps {
  onUploaded: (files: UploadedFile[]) => void
  bucket?: string
  folder?: string
  accept?: DropzoneProps['accept']
  /** Najveca velicina po fajlu u bajtovima. */
  maxSize?: number
  maxFiles?: number
  multiple?: boolean
  label?: LocalizedLabel
  description?: LocalizedLabel
  disabled?: boolean
  height?: number
}

const IDLE: LocalizedLabel = {
  sr: 'Prevucite fajlove ovde ili kliknite da izaberete',
  'sr-Cyrl': 'Превуците фајлове овде или кликните да изаберете',
  en: 'Drag files here or click to browse',
}
const ACCEPTED: LocalizedLabel = { sr: 'Pustite fajlove', 'sr-Cyrl': 'Пустите фајлове', en: 'Drop the files' }
const REJECTED: LocalizedLabel = {
  sr: 'Fajl nije prihvaćen — proverite tip i veličinu',
  'sr-Cyrl': 'Фајл није прихваћен — проверите тип и величину',
  en: 'File rejected — check type and size',
}

const NO_STORAGE: LocalizedLabel = {
  sr: 'Otpremanje fajlova nije podešeno — nedostaje <LiroFileStorageProvider>.',
  'sr-Cyrl': 'Отпремање фајлова није подешено — недостаје <LiroFileStorageProvider>.',
  en: 'File uploads are not configured — <LiroFileStorageProvider> is missing.',
}

export function FileDropzone({
  onUploaded,
  bucket,
  folder,
  accept,
  maxSize,
  maxFiles,
  multiple = true,
  label,
  description,
  disabled = false,
  height = 130,
}: FileDropzoneProps) {
  /*
   * Namerno `Optional`: komponenta koja srusi ceo ekran zato sto skladiste nije
   * podeseno je gora od one koja to kaze. Ovako se greska vidi na mestu gde je
   * nastala.
   */
  const storage = useFileStorageOptional()
  const { t } = useI18n()
  const [busy, setBusy] = useState(false)
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(null)

  const handleDrop = useCallback(
    async (files: File[]) => {
      if (!storage) return
      const selected = maxFiles ? files.slice(0, maxFiles) : files
      setBusy(true)
      setProgress({ done: 0, total: selected.length })

      const uploaded: UploadedFile[] = []
      try {
        for (const [index, file] of selected.entries()) {
          const result = await storage.upload(file, { bucket, folder })
          uploaded.push(result)
          setProgress({ done: index + 1, total: selected.length })
        }
        onUploaded(uploaded)
      } catch (error) {
        /* Prijavljujemo neuspeh, ali zadrzavamo ono sto je proslo - inace
           korisnik ponovo salje fajlove koji su vec gore. */
        if (uploaded.length > 0) onUploaded(uploaded)
        commonNotice.failed(error)
      } finally {
        setBusy(false)
        setProgress(null)
      }
    },
    [storage, bucket, folder, maxFiles, onUploaded],
  )

  if (!storage) {
    return (
      <Text size="sm" style={{ color: liroVar.status.warning.fg }}>{t(NO_STORAGE)}</Text>
    )
  }

  return (
    <Stack gap="xs">
      <Dropzone
        onDrop={handleDrop}
        onReject={() => commonNotice.failed(new Error(t(REJECTED)))}
        accept={accept}
        maxSize={maxSize}
        multiple={multiple}
        disabled={disabled || busy}
        loading={busy}
        radius="lg"
        style={{ borderColor: liroVar.border.default, backgroundColor: liroVar.surface.sunken }}
      >
        <Group justify="center" gap="md" mih={height} style={{ pointerEvents: 'none' }}>
          <Dropzone.Accept>
            <Upload size={30} color={liroVar.brand.solid} />
          </Dropzone.Accept>
          <Dropzone.Reject>
            <X size={30} color={liroVar.status.danger.fg} />
          </Dropzone.Reject>
          <Dropzone.Idle>
            <Upload size={30} color={liroVar.text.tertiary} />
          </Dropzone.Idle>

          <Stack gap={2}>
            <Text size="sm" fw={600}>
              <Dropzone.Accept>{t(ACCEPTED)}</Dropzone.Accept>
              <Dropzone.Reject>{t(REJECTED)}</Dropzone.Reject>
              <Dropzone.Idle>{t(label ?? IDLE)}</Dropzone.Idle>
            </Text>
            {description && (
              <Text size="xs" style={{ color: liroVar.text.secondary }}>{t(description)}</Text>
            )}
            {maxSize && (
              <Text size="xs" style={{ color: liroVar.text.tertiary }}>
                {t({
                  sr: `Najviše ${Math.round(maxSize / 1024 / 1024)} MB po fajlu`,
                  'sr-Cyrl': `Највише ${Math.round(maxSize / 1024 / 1024)} MB по фајлу`,
                  en: `Up to ${Math.round(maxSize / 1024 / 1024)} MB per file`,
                })}
              </Text>
            )}
          </Stack>
        </Group>
      </Dropzone>

      {progress && progress.total > 1 && (
        <Stack gap={4}>
          <Group justify="space-between">
            <Text size="xs" style={{ color: liroVar.text.secondary }}>
              {t({
                sr: `Otpremanje ${progress.done} od ${progress.total}`,
                'sr-Cyrl': `Отпремање ${progress.done} од ${progress.total}`,
                en: `Uploading ${progress.done} of ${progress.total}`,
              })}
            </Text>
            <Loader size={12} />
          </Group>
          <Progress value={(progress.done / progress.total) * 100} size="sm" radius="xl" />
        </Stack>
      )}
    </Stack>
  )
}

export interface AttachmentItem {
  path: string
  name?: string
  size?: number
  contentType?: string
}

export interface AttachmentListProps {
  files: AttachmentItem[]
  onRemove?: (path: string) => void
  bucket?: string
  emptyText?: LocalizedLabel
}

const EXTENSION_ICON: Record<string, typeof FileText> = {
  pdf: FileText,
  xml: FileText,
  xlsx: Sheet,
  xls: Sheet,
  csv: Sheet,
  png: ImageIcon,
  jpg: ImageIcon,
  jpeg: ImageIcon,
}

function humanSize(bytes?: number): string {
  if (!bytes) return ''
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`
}

const NO_FILES: LocalizedLabel = { sr: 'Nema priloga', 'sr-Cyrl': 'Нема прилога', en: 'No attachments' }

/** Spisak priloga sa otvaranjem kroz potpisanu adresu i uklanjanjem. */
export function AttachmentList({ files, onRemove, bucket, emptyText }: AttachmentListProps) {
  const storage = useFileStorageOptional()
  const { t } = useI18n()

  if (files.length === 0) {
    return <Text size="sm" c="dimmed">{t(emptyText ?? NO_FILES)}</Text>
  }

  return (
    <Stack gap={6}>
      {files.map((file) => {
        const name = file.name ?? file.path.split('/').pop() ?? file.path
        const extension = name.split('.').pop()?.toLowerCase() ?? ''
        const Icon = EXTENSION_ICON[extension] ?? FileText

        return (
          <Group
            key={file.path}
            gap="xs"
            wrap="nowrap"
            p="xs"
            style={{
              border: `1px solid ${liroVar.border.default}`,
              borderRadius: 'var(--liro-radius-md)',
              backgroundColor: liroVar.surface.raised,
            }}
          >
            <Box style={{ color: liroVar.text.secondary, display: 'flex', flexShrink: 0 }}>
              <Icon size={16} />
            </Box>

            <Anchor
              href="#"
              size="sm"
              style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
              onClick={async (event) => {
                event.preventDefault()
                if (!storage) return
                const url = await storage.getUrl(file.path, { bucket })
                window.open(url, '_blank', 'noopener')
              }}
            >
              {name}
            </Anchor>

            {file.size && (
              <Text size="xs" style={{ color: liroVar.text.tertiary, flexShrink: 0 }}>
                {humanSize(file.size)}
              </Text>
            )}

            {onRemove && (
              <ActionIcon
                variant="subtle"
                color="gray"
                size="sm"
                ml="auto"
                onClick={() => onRemove(file.path)}
                aria-label={t({ sr: 'Ukloni prilog', 'sr-Cyrl': 'Уклони прилог', en: 'Remove attachment' })}
              >
                <X size={14} />
              </ActionIcon>
            )}
          </Group>
        )
      })}
    </Stack>
  )
}
