import type { FileStorage, UploadOptions, UploadedFile } from './storage'

/**
 * File storage in the browser's memory.
 *
 * A counterpart to `createInMemoryProvider`: it serves the playground,
 * examples, and tests, and at the same time is a check that the
 * `FileStorage` interface is not shaped around Supabase Storage.
 *
 * Files live as `blob:` URLs and disappear when the page is refreshed —
 * that is deliberate, since this is not a replacement for real storage.
 */
export function createMemoryFileStorage(options: { delay?: number } = {}): FileStorage {
  const files = new Map<string, { url: string; file: File }>()

  const wait = () =>
    options.delay ? new Promise<void>((resolve) => setTimeout(resolve, options.delay)) : Promise.resolve()

  return {
    async upload(file: File, uploadOptions?: UploadOptions): Promise<UploadedFile> {
      await wait()
      const folder = uploadOptions?.folder ? `${uploadOptions.folder.replace(/\/+$/, '')}/` : ''
      const path = `${folder}${Date.now()}-${file.name}`
      files.set(path, { url: URL.createObjectURL(file), file })
      return { path, url: files.get(path)!.url, size: file.size, contentType: file.type }
    },

    async remove(path: string): Promise<void> {
      await wait()
      const entry = files.get(path)
      if (entry) URL.revokeObjectURL(entry.url)
      files.delete(path)
    },

    async getUrl(path: string): Promise<string> {
      const entry = files.get(path)
      if (!entry) throw new Error(`File ${path} does not exist in memory storage.`)
      return entry.url
    },
  }
}
