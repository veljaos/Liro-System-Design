'use client'

import { useCallback, useRef, useState } from 'react'
import { ActionIcon, Anchor, Box, Group, Loader, Progress, Stack, Text } from '@mantine/core'
import { Dropzone, type DropzoneProps } from '@mantine/dropzone'
import { FileText, Image as ImageIcon, Sheet, Upload, X } from 'lucide-react'
import { useFileStorageOptional, type UploadedFile } from '@liro/data'
import { useI18n, type LocalizedLabel, type TranslationKey } from '@liro/i18n'
import { liroVar } from '@liro/tokens'
import { ActionButton, commonNotice } from '@liro/ui'

/**
 * Drag-and-drop attachments.
 *
 * Uploading goes through `FileStorage` from `@liro/data`, the same as
 * `UploadField` in forms — so the application configures storage once and it
 * applies everywhere.
 *
 * Multiple files are uploaded in sequence, not in parallel. Ten statements
 * sent at once can bring down the connection on a weaker office internet
 * line, and a partial failure is worse than a slow success because you
 * cannot see what went through.
 */

export interface FileDropzoneProps {
  onUploaded: (files: UploadedFile[]) => void
  bucket?: string
  folder?: string
  accept?: DropzoneProps['accept']
  /** Maximum size per file in bytes. */
  maxSize?: number
  maxFiles?: number
  multiple?: boolean
  label?: LocalizedLabel
  description?: LocalizedLabel
  disabled?: boolean
  height?: number
  withButton?: boolean
  buttonLabel?: LocalizedLabel
}

const IDLE: TranslationKey = 'files.dropzone.idle'
const ACCEPTED: TranslationKey = 'files.dropzone.accepted'
const REJECTED: TranslationKey = 'files.dropzone.rejected'
const NO_STORAGE: TranslationKey = 'files.dropzone.noStorage'
const SELECT: TranslationKey = 'files.dropzone.select'
const MAX_SIZE: TranslationKey = 'files.dropzone.maxSize'
const UPLOADING_COUNT: TranslationKey = 'files.dropzone.uploadingCount'
const UPLOAD_PROGRESS: TranslationKey = 'files.dropzone.uploadProgress'

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
  withButton = false,
  buttonLabel,
}: FileDropzoneProps) {
  /*
   * Deliberately `Optional`: a component that crashes the whole screen
   * because storage is not configured is worse than one that says so. This
   * way the error is visible at the place it originated.
   */
  const storage = useFileStorageOptional()
  const { t } = useI18n()
  const [busy, setBusy] = useState(false)
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(null)
  /* Mantine's way to open the file-picker dialog without clicking the zone.
    Without it, the button would have to simulate a click on the hidden input. */
  const openRef = useRef<() => void>(null)

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
        /* We report the failure, but keep what went through — otherwise the
           user resends files that are already uploaded. */
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
        openRef={openRef}
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
                {t(MAX_SIZE, undefined, { size: Math.round(maxSize / 1024 / 1024) })}
              </Text>
            )}
          </Stack>
        </Group>
      </Dropzone>

      {withButton && (
        <Group justify="center">
          <ActionButton
            intent="import"
            label={buttonLabel ?? SELECT}
            onClick={() => openRef.current?.()}
            disabled={disabled || busy}
          />
        </Group>
      )}

      {progress && progress.total > 1 && (
        <Stack gap={4}>
          <Group justify="space-between">
            <Text size="xs" style={{ color: liroVar.text.secondary }}>
              {t(UPLOADING_COUNT, undefined, { done: progress.done, total: progress.total })}
            </Text>
            <Loader size={12} />
          </Group>
          <Progress
            value={(progress.done / progress.total) * 100}
            size="sm"
            radius="xl"
            aria-label={t(UPLOAD_PROGRESS)}
          />
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
  /**
   * Which attachments may be removed.
   * 
   * The rule this exists for is an accounting one: **an attachment cannot be
   * deleted once the document is posted**, because at that point it is evidence.
   * 
   * Before this prop, the application enforced it by not passing `onRemove` at
   * all - which removed deletion from the whole list rather than from one file,
   * and put a domain rule in the screen instead of in the component.
   * 
   * Omitting it means every attachment may be removed, which is the right
   * default for a draft.
   */
  canRemove?: (file: AttachmentItem) => boolean
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

const NO_FILES: TranslationKey = 'files.attachments.empty'
const REMOVE_ATTACHMENT: TranslationKey = 'files.attachments.remove'

/** List of attachments, opened through a signed URL, with removal. */
export function AttachmentList({ files, onRemove, canRemove, bucket, emptyText }: AttachmentListProps) {
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

            {onRemove && (canRemove?.(file) ?? true) && (
              <ActionIcon
                variant="subtle"
                color="gray"
                size="sm"
                ml="auto"
                onClick={() => onRemove(file.path)}
                aria-label={t(REMOVE_ATTACHMENT)}
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
