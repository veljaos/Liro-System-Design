import type { SupabaseClient } from '@supabase/supabase-js'
import { DataProviderError, type FileStorage, type UploadOptions, type UploadedFile } from '@liro/data'

export interface SupabaseFileStorageOptions {
  client: SupabaseClient
  /** Bucket used when a field doesn't specify its own. */
  defaultBucket: string
  /**
   * For private buckets the public URL doesn't work - a signed one is
   * needed, with a lifetime in seconds.
   */
  signedUrlExpiresIn?: number
}

function safeFileName(name: string): string {
  /* Cyrillic, spaces, and quotes in a file name break the storage path. */
  const normalized = name.normalize('NFKD').replace(/[\u0300-\u036f]/g, '')
  return normalized.replace(/[^a-zA-Z0-9._-]/g, '-').replace(/-+/g, '-').toLowerCase()
}

export function createSupabaseFileStorage(options: SupabaseFileStorageOptions): FileStorage {
  const { client, defaultBucket, signedUrlExpiresIn } = options

  const bucketOf = (uploadOptions?: Pick<UploadOptions, 'bucket'>) =>
    uploadOptions?.bucket ?? defaultBucket

  const resolveUrl = async (bucket: string, path: string): Promise<string> => {
    if (signedUrlExpiresIn) {
      const { data, error } = await client.storage.from(bucket).createSignedUrl(path, signedUrlExpiresIn)
      if (error) throw new DataProviderError(error.message, 'unknown', error)
      return data.signedUrl
    }
    return client.storage.from(bucket).getPublicUrl(path).data.publicUrl
  }

  return {
    async upload(file: File, uploadOptions?: UploadOptions): Promise<UploadedFile> {
      const bucket = bucketOf(uploadOptions)
      const folder = uploadOptions?.folder ? `${uploadOptions.folder.replace(/\/+$/, '')}/` : ''
      const path = `${folder}${Date.now()}-${safeFileName(file.name)}`

      const { error } = await client.storage
        .from(bucket)
        .upload(path, file, { upsert: uploadOptions?.upsert ?? false, contentType: file.type })

      if (error) throw new DataProviderError(error.message, 'unknown', error)

      return {
        path,
        url: await resolveUrl(bucket, path),
        size: file.size,
        contentType: file.type,
      }
    },

    async remove(path: string, removeOptions?: Pick<UploadOptions, 'bucket'>): Promise<void> {
      const { error } = await client.storage.from(bucketOf(removeOptions)).remove([path])
      if (error) throw new DataProviderError(error.message, 'unknown', error)
    },

    async getUrl(path: string, urlOptions?: Pick<UploadOptions, 'bucket'>): Promise<string> {
      return resolveUrl(bucketOf(urlOptions), path)
    },
  }
}
