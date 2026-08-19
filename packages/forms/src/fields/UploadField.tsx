'use client'

import { useState } from 'react'
import { ActionIcon, Anchor, FileInput, Group, Loader, Text } from '@mantine/core'
import { Paperclip, X } from 'lucide-react'
import { useFileStorageOptional } from '@liro/data'
import { useI18n, type TranslationKey } from '@liro/i18n'
import { liroVar } from '@liro/tokens'
import type { UploadConfig } from '../types'

const NOT_CONFIGURED: TranslationKey = 'forms.upload.notConfigured'
const FILE_TOO_LARGE: TranslationKey = 'forms.upload.fileTooLarge'
const REMOVE_FILE: TranslationKey = 'forms.upload.removeFile'
const CHOOSE_FILE: TranslationKey = 'forms.upload.chooseFile'

interface UploadFieldProps {
  label?: string
  description?: string
  placeholder?: string
  required?: boolean
  disabled?: boolean
  error?: string
  config?: UploadConfig
  /** The storage path is saved, not the file itself. */
  value: string | null
  onChange: (value: string | null) => void
  onBlur: () => void
}

export function UploadField({
  label,
  description,
  placeholder,
  required,
  disabled,
  error,
  config,
  value,
  onChange,
  onBlur,
}: UploadFieldProps) {
  const storage = useFileStorageOptional()
  const { t } = useI18n()
  const [uploading, setUploading] = useState(false)
  const [localError, setLocalError] = useState<string | null>(null)

  if (!storage) {
    return (
      <Text size="xs" style={{ color: liroVar.status.warning.fg }}>
        {t(NOT_CONFIGURED)}
      </Text>
    )
  }

  const handleChange = async (file: File | null) => {
    setLocalError(null)
    if (!file) {
      onChange(null)
      return
    }

    if (config?.maxSize && file.size > config.maxSize) {
      const limit = Math.round(config.maxSize / 1024 / 1024)
      setLocalError(t(FILE_TOO_LARGE, undefined, { limit }))
      return
    }

    setUploading(true)
    try {
      const uploaded = await storage.upload(file, { bucket: config?.bucket, folder: config?.folder })
      onChange(uploaded.path)
    } catch (uploadError) {
      setLocalError(uploadError instanceof Error ? uploadError.message : String(uploadError))
    } finally {
      setUploading(false)
      onBlur()
    }
  }

  if (value) {
    return (
      <div>
        {label && (
          <Text size="sm" fw={500} mb={4}>
            {label}
            {required && <span style={{ color: liroVar.status.danger.fg }}> *</span>}
          </Text>
        )}
        <Group
          gap="xs"
          wrap="nowrap"
          p="xs"
          style={{
            border: `1px solid ${liroVar.border.default}`,
            borderRadius: 'var(--liro-radius-md)',
            backgroundColor: liroVar.surface.sunken,
          }}
        >
          <Paperclip size={15} style={{ flexShrink: 0, color: liroVar.text.secondary }} />
          <Anchor
            href="#"
            size="sm"
            style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
            onClick={async (event) => {
              event.preventDefault()
              const url = await storage.getUrl(value, { bucket: config?.bucket })
              window.open(url, '_blank', 'noopener')
            }}
          >
            {value.split('/').pop()}
          </Anchor>
          {!disabled && (
            <ActionIcon
              variant="subtle"
              color="gray"
              size="sm"
              ml="auto"
              onClick={() => onChange(null)}
              aria-label={t(REMOVE_FILE)}
            >
              <X size={14} />
            </ActionIcon>
          )}
        </Group>
      </div>
    )
  }

  return (
    <FileInput
      label={label}
      description={description}
      placeholder={placeholder ?? t(CHOOSE_FILE)}
      withAsterisk={required}
      disabled={disabled || uploading}
      error={localError ?? error}
      accept={config?.accept}
      leftSection={uploading ? <Loader size={14} /> : <Paperclip size={15} />}
      value={null}
      onChange={handleChange}
      clearable={false}
    />
  )
}
