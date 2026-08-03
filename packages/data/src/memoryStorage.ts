import type { FileStorage, UploadOptions, UploadedFile } from './storage'

/**
 * Skladiste fajlova u memoriji pregledaca.
 *
 * Parnjak `createInMemoryProvider`-u: sluzi playgroundu, primerima i testovima,
 * i istovremeno je provera da `FileStorage` interfejs nije oblikovan oko
 * Supabase Storage-a.
 *
 * Fajlovi zive kao `blob:` adrese i nestaju sa osvezavanjem stranice - to je
 * namerno, jer ovo nije zamena za pravo skladiste.
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
      if (!entry) throw new Error(`Fajl ${path} ne postoji u memorijskom skladištu.`)
      return entry.url
    },
  }
}
