'use client'

import { createContext, useContext, type ReactNode } from 'react'

/**
 * Otpremanje fajlova je odvojeno od `DataProvider`-a namerno.
 *
 * Baza i skladiste fajlova ne moraju biti isti sistem: aplikacija moze da
 * cita iz Postgres-a a fajlove drzi na S3-u. Razdvajanje znaci da svaka
 * strana moze da se zameni bez druge.
 */

export interface UploadedFile {
  /** Putanja unutar skladista - ovo se cuva u bazi. */
  path: string
  /** Adresa za prikaz ili preuzimanje; moze biti privremena. */
  url: string
  size?: number
  contentType?: string
}

export interface UploadOptions {
  /** Logicka pregrada u skladistu - Supabase je zove bucket. */
  bucket?: string
  /** Prefiks putanje, npr. `klijenti/123`. */
  folder?: string
  /** Prepisuje postojeci fajl umesto da baci gresku. */
  upsert?: boolean
  onProgress?: (percent: number) => void
}

export interface FileStorage {
  upload(file: File, options?: UploadOptions): Promise<UploadedFile>
  remove(path: string, options?: Pick<UploadOptions, 'bucket'>): Promise<void>
  /** Adresa za citanje; kod privatnih pregrada obicno potpisana i vremenski ogranicena. */
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
  if (!storage) throw new Error('useFileStorage mora biti pozvan unutar <LiroFileStorageProvider>')
  return storage
}

/** Za polja koja treba da rade i kada aplikacija ne otprema fajlove. */
export function useFileStorageOptional(): FileStorage | null {
  return useContext(FileStorageContext)
}
