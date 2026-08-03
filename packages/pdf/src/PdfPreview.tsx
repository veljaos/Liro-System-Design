'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { Alert, Box, Center, Group, Loader, Stack, Text } from '@mantine/core'
import { AlertCircle, ChevronLeft, ChevronRight, ZoomIn, ZoomOut } from 'lucide-react'
import { liroVar } from '@liro/tokens'
import { useI18n, type LocalizedLabel } from '@liro/i18n'
import { ActionButton, ActionGroup } from '@liro/ui'

/**
 * Pregled PDF-a i izbor pozicije pečata.
 *
 * `pdfjs-dist` se uvozi DINAMIČKI, unutar efekta, a ne na vrhu fajla.
 *
 * Razlog nije lenjo učitavanje nego to što `pdfjs-dist` na najvišem nivou
 * modula koristi `DOMMatrix`, koji postoji samo u pregledaču. Next.js evaluira
 * modul na serveru i za komponente sa `'use client'`, pa statičan uvoz obara
 * prvi render — greška koja se ne pogodi iz prve i koju je lako vratiti pri
 * čišćenju uvoza.
 */

interface PdfPageProxy {
  getViewport(options: { scale: number }): { width: number; height: number }
  render(options: { canvasContext: CanvasRenderingContext2D; viewport: unknown; canvas?: HTMLCanvasElement }): {
    promise: Promise<void>
  }
}

interface PdfDocumentProxy {
  numPages: number
  getPage(page: number): Promise<PdfPageProxy>
}

let workerConfigured = false

async function loadDocument(source: File | ArrayBuffer | string): Promise<PdfDocumentProxy> {
  const pdfjs = (await import('pdfjs-dist')) as unknown as {
    GlobalWorkerOptions: { workerSrc: string }
    getDocument: (options: unknown) => { promise: Promise<PdfDocumentProxy> }
  }

  if (!workerConfigured) {
    pdfjs.GlobalWorkerOptions.workerSrc = new URL(
      'pdfjs-dist/build/pdf.worker.min.mjs',
      import.meta.url,
    ).toString()
    workerConfigured = true
  }

  const data =
    source instanceof File ? await source.arrayBuffer() : typeof source === 'string' ? undefined : source

  return pdfjs.getDocument(typeof source === 'string' ? { url: source } : { data }).promise
}

export interface PdfPreviewProps {
  /** Fajl iz `input`-a, već pročitan bafer ili adresa dokumenta. */
  source: File | ArrayBuffer | string
  /** Širina prikaza u pikselima; visina se računa iz odnosa stranice. */
  width?: number
  /** Početna stranica, 1-indeksirano. */
  page?: number
  onPageChange?: (page: number) => void
  /** Sadržaj iznad platna — npr. okvir pečata. */
  overlay?: (info: { canvasWidth: number; canvasHeight: number }) => React.ReactNode
  withZoom?: boolean
}

const LOAD_ERROR: LocalizedLabel = {
  sr: 'Nije moguće učitati PDF za pregled.',
  'sr-Cyrl': 'Није могуће учитати PDF за преглед.',
  en: 'The PDF could not be loaded for preview.',
}

export function PdfPreview({
  source,
  width = 480,
  page: controlledPage,
  onPageChange,
  overlay,
  withZoom = false,
}: PdfPreviewProps) {
  const { t } = useI18n()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [document_, setDocument] = useState<PdfDocumentProxy | null>(null)
  const [internalPage, setInternalPage] = useState(controlledPage ?? 1)
  const [numPages, setNumPages] = useState(1)
  const [zoom, setZoom] = useState(1)
  const [size, setSize] = useState({ width, height: Math.round(width * 1.414) })
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  const page = controlledPage ?? internalPage

  const setPage = (next: number) => {
    setInternalPage(next)
    onPageChange?.(next)
  }

  useEffect(() => {
    let cancelled = false

    loadDocument(source)
      .then((doc) => {
        if (cancelled) return
        setDocument(doc)
        setNumPages(doc.numPages)
        setError(null)
      })
      .catch(() => {
        if (!cancelled) setError(t(LOAD_ERROR))
      })

    return () => {
      cancelled = true
    }
  }, [source, t])

  useEffect(() => {
    if (!document_) return
    let cancelled = false

    const render = async () => {
      setLoading(true)
      const pageProxy = await document_.getPage(page)
      const base = pageProxy.getViewport({ scale: 1 })
      const scale = ((width * zoom) / base.width)
      const viewport = pageProxy.getViewport({ scale })

      const canvas = canvasRef.current
      const context = canvas?.getContext('2d')
      if (!canvas || !context || cancelled) return

      canvas.width = viewport.width
      canvas.height = viewport.height
      setSize({ width: viewport.width, height: viewport.height })

      await pageProxy.render({ canvasContext: context, viewport, canvas }).promise
      if (!cancelled) setLoading(false)
    }

    void render()
    return () => {
      cancelled = true
    }
  }, [document_, page, width, zoom])

  if (error) {
    return (
      <Alert color="liro-red" icon={<AlertCircle size={16} />}>
        {error}
      </Alert>
    )
  }

  return (
    <Stack gap="xs" align="center">
      <Box
        pos="relative"
        style={{
          border: `1px solid ${liroVar.border.default}`,
          borderRadius: 'var(--liro-radius-md)',
          overflow: 'hidden',
          backgroundColor: liroVar.surface.sunken,
          lineHeight: 0,
        }}
      >
        <canvas ref={canvasRef} style={{ display: 'block' }} />
        {overlay?.({ canvasWidth: size.width, canvasHeight: size.height })}
        {loading && (
          <Center pos="absolute" inset={0} style={{ backgroundColor: liroVar.surface.backdrop }}>
            <Loader size="sm" />
          </Center>
        )}
      </Box>

      <Group gap="xs" justify="center">
        <ActionButton
          intent="back"
          iconOnly
          label={{ sr: 'Prethodna strana' }}
          disabled={page <= 1}
          onClick={() => setPage(page - 1)}
        />
        <Text size="sm" data-numeric style={{ minWidth: 80, textAlign: 'center' }}>
          {page} / {numPages}
        </Text>
        <ActionButton
          intent="view"
          iconOnly
          label={{ sr: 'Sledeća strana' }}
          disabled={page >= numPages}
          onClick={() => setPage(page + 1)}
        />

        {withZoom && (
          <Group gap={4} ml="md">
            <ActionButton
              intent="view"
              iconOnly
              label={{ sr: 'Umanji' }}
              disabled={zoom <= 0.6}
              onClick={() => setZoom((current) => Math.max(current - 0.2, 0.6))}
            />
            <Text size="xs" data-numeric>{Math.round(zoom * 100)}%</Text>
            <ActionButton
              intent="view"
              iconOnly
              label={{ sr: 'Uvećaj' }}
              disabled={zoom >= 2}
              onClick={() => setZoom((current) => Math.min(current + 0.2, 2))}
            />
          </Group>
        )}
      </Group>
    </Stack>
  )
}

export interface StampPosition {
  /** 1-indeksirano, redosled čitanja stranica. */
  page: number
  /** PDF tačke, poreklo dole levo — format koji potpisni sloj očekuje. */
  x: number
  y: number
}

export interface PdfPositionPickerProps {
  source: File | ArrayBuffer | string
  onConfirm: (position: StampPosition) => void
  onCancel?: () => void
  /** Veličina pečata u PDF tačkama — mora se poklapati sa serverskom. */
  stampWidth?: number
  stampHeight?: number
  width?: number
  label?: LocalizedLabel
}

const HINT: LocalizedLabel = {
  sr: 'Prevucite okvir na mesto gde želite pečat, pa potvrdite.',
  'sr-Cyrl': 'Превуците оквир на место где желите печат, па потврдите.',
  en: 'Drag the frame where the stamp should go, then confirm.',
}

/**
 * Izbor pozicije pečata prevlačenjem preko pregleda.
 *
 * Vraća koordinate u PDF tačkama sa poreklom dole levo, jer je to ono što
 * potpisni sloj očekuje — a ekran radi u pikselima sa poreklom gore levo.
 * Pretvaranje se radi ovde, jednom, da ga ne bi radila svaka aplikacija.
 *
 * Veličina okvira je samo vizuelni vodič; stvarnu veličinu pečata računa
 * server. Vrednosti treba držati usaglašene da korisnik ne bude iznenađen.
 */
export function PdfPositionPicker({
  source,
  onConfirm,
  onCancel,
  stampWidth = 190,
  stampHeight = 56,
  width = 480,
  label,
}: PdfPositionPickerProps) {
  const { t } = useI18n()
  const [page, setPage] = useState(1)
  const [box, setBox] = useState({ left: 24, top: 24 })
  const [canvas, setCanvas] = useState({ width, height: Math.round(width * 1.414) })
  const dragRef = useRef<{ startX: number; startY: number; left: number; top: number } | null>(null)

  /* Odnos piksela ekrana prema PDF tačkama. A4 je 595 tačaka široka; kada se
     prikaz skalira, odnos se menja zajedno sa njim. */
  const pointsPerPixel = 595 / canvas.width
  const boxWidthPx = stampWidth / pointsPerPixel
  const boxHeightPx = stampHeight / pointsPerPixel

  const onPointerDown = (event: React.PointerEvent) => {
    event.currentTarget.setPointerCapture(event.pointerId)
    dragRef.current = { startX: event.clientX, startY: event.clientY, left: box.left, top: box.top }
  }

  const onPointerMove = useCallback(
    (event: React.PointerEvent) => {
      const drag = dragRef.current
      if (!drag) return
      const left = drag.left + (event.clientX - drag.startX)
      const top = drag.top + (event.clientY - drag.startY)
      setBox({
        left: Math.min(Math.max(left, 0), canvas.width - boxWidthPx),
        top: Math.min(Math.max(top, 0), canvas.height - boxHeightPx),
      })
    },
    [canvas.width, canvas.height, boxWidthPx, boxHeightPx],
  )

  const confirm = () => {
    /* Ekran meri odozgo, PDF odozdo — otud oduzimanje od visine strane. */
    const x = Math.round(box.left * pointsPerPixel)
    const y = Math.round((canvas.height - box.top - boxHeightPx) * pointsPerPixel)
    onConfirm({ page, x, y })
  }

  return (
    <Stack gap="md">
      <Text size="sm" style={{ color: liroVar.text.secondary }}>{t(label ?? HINT)}</Text>

      <PdfPreview
        source={source}
        width={width}
        page={page}
        onPageChange={setPage}
        overlay={({ canvasWidth, canvasHeight }) => {
          if (canvasWidth !== canvas.width || canvasHeight !== canvas.height) {
            queueMicrotask(() => setCanvas({ width: canvasWidth, height: canvasHeight }))
          }

          return (
            <Box
              onPointerDown={onPointerDown}
              onPointerMove={onPointerMove}
              onPointerUp={() => {
                dragRef.current = null
              }}
              style={{
                position: 'absolute',
                left: box.left,
                top: box.top,
                width: boxWidthPx,
                height: boxHeightPx,
                border: `2px dashed ${liroVar.brand.solid}`,
                backgroundColor: liroVar.brand.subtle,
                borderRadius: 'var(--liro-radius-xs)',
                cursor: 'grab',
                touchAction: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Text size="xs" fw={600} style={{ color: liroVar.text.brand, pointerEvents: 'none' }}>
                {t({ sr: 'Pečat', 'sr-Cyrl': 'Печат', en: 'Stamp' })}
              </Text>
            </Box>
          )
        }}
      />

      <ActionGroup>
        {onCancel && <ActionButton intent="cancel" onClick={onCancel} />}
        <ActionButton
          intent="sign"
          label={{ sr: 'Potvrdi poziciju', en: 'Confirm position' }}
          onClick={confirm}
        />
      </ActionGroup>
    </Stack>
  )
}
