'use client'

import { createContext, useContext, type ReactNode } from 'react'

/**
 * File uploads are deliberately separate from `DataProvider`.
 *
 * The database and the file storage do not have to be the same system: an
 * application can read from Postgres while keeping files on S3. Separating
 * them means either side can be replaced without the other.
 */

export interface UploadedFile {
  /** Path within storage — this is what gets saved in the database. */
  path: string
  /** URL for display or download; may be temporary. */
  url: string
  size?: number
  contentType?: string
}

export interface UploadOptions {
  /** Logical partition in storage — Supabase calls it a bucket. */
  bucket?: string
  /** Path prefix, e.g. `clients/123`. */
  folder?: string
  /** Overwrites an existing file instead of throwing an error. */
  upsert?: boolean
  onProgress?: (percent: number) => void
}

export interface FileStorage {
  upload(file: File, options?: UploadOptions): Promise<UploadedFile>
  remove(path: string, options?: Pick<UploadOptions, 'bucket'>): Promise<void>
  /** URL for reading; for private buckets, usually signed and time-limited. */
  getUrl(path: string, options?: Pick<UploadOptions, 'bucket'>): Promise<string>
}

const FileStorageContext = createContext<FileStorage | null>(null)

export interface LiroFileStorageProviderProps {
  storage: FileStorage
  children: ReactNode
}

export function LiroFileStorageProvider({ storage, children }: LiroFileStorageProviderProps) {
  return <FileStorageContext.Provider value={storage}>{children}</FileStorageContext.Provider>
}

export function useFileStorage(): FileStorage {
  const storage = useContext(FileStorageContext)
  if (!storage) throw new Error('useFileStorage must be called within <LiroFileStorageProvider>')
  return storage
}

/** For fields that need to work even when the application does not upload files. */
export function useFileStorageOptional(): FileStorage | null {
  return useContext(FileStorageContext)
}
