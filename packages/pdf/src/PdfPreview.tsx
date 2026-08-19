'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { ActionIcon, Alert, Box, Center, Group, Loader, Stack, Text, Tooltip } from '@mantine/core'
import { AlertCircle, ChevronLeft, ChevronRight, ZoomIn, ZoomOut } from 'lucide-react'
import { liroVar } from '@liro/tokens'
import { useI18n, type LocalizedLabel, type TranslationKey } from '@liro/i18n'
import { ActionButton, ActionGroup } from '@liro/ui'

/**
 * PDF preview and stamp position picker.
 *
 * `pdfjs-dist` is imported DYNAMICALLY, inside an effect, not at the top of
 * the file.
 *
 * The reason is not lazy loading but that `pdfjs-dist` uses `DOMMatrix` at
 * the top level of the module, which only exists in the browser. Next.js
 * evaluates the module on the server too, even for components with
 * `'use client'`, so a static import breaks the first render — an error that
 * is not easy to guess the first time and easy to bring back while cleaning
 * up imports.
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
  /** File from an `input`, an already-read buffer, or a document URL. */
  source: File | ArrayBuffer | string
  /** Display width in pixels; height is computed from the page ratio. */
  width?: number
  /** Starting page, 1-indexed. */
  page?: number
  onPageChange?: (page: number) => void
  /** Content over the canvas — e.g. the stamp frame. */
  overlay?: (info: { canvasWidth: number; canvasHeight: number }) => React.ReactNode
  /** Zoom controls under the page. On by default. */
  withZoom?: boolean
}

const LOAD_ERROR: TranslationKey = 'pdf.preview.loadError'
const PREVIOUS_PAGE: TranslationKey = 'pdf.preview.previousPage'
const NEXT_PAGE: TranslationKey = 'pdf.preview.nextPage'
const ZOOM_OUT: TranslationKey = 'pdf.preview.zoomOut'
const ZOOM_IN: TranslationKey = 'pdf.preview.zoomIn'

export function PdfPreview({
  source,
  width = 480,
  page: controlledPage,
  onPageChange,
  overlay,
  withZoom = true,
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
        {/*
          Paging and zoom are controls of the viewer, not business actions, so
          they are `ActionIcon` rather than `ActionButton` - the same choice as
          `ColorSchemeToggle` and `LocalePicker`.

          There is no intent for "next page" or "zoom out". `view` was being used
          for three of these four buttons, which is why they showed an eye.

          `ActionIcon` does not wrap itself in a `Tooltip` the way `ActionButton`
          with `iconOnly` does, so each one is wrapped here: `aria-label` gives a
          screen reader a name, and an arrow icon with no name gives the eye
          nothing.

          `events` is set because a disabled button emits no mouse events - and a
          disabled control is exactly when the explanation is most needed.
        */}
        <Tooltip
          label={t(PREVIOUS_PAGE)}
          withArrow
          events={{ hover: true, focus: true, touch: true }}
        >
          <ActionIcon
            variant="subtle"
            color="gray"
            radius="md"
            disabled={page <= 1}
            onClick={() => setPage(page - 1)}
            aria-label={t(PREVIOUS_PAGE)}
          >
            <ChevronLeft size={18} />
          </ActionIcon>
        </Tooltip>

        <Text size="sm" data-numeric style={{ minWidth: 80, textAlign: 'center' }}>
          {page} / {numPages}
        </Text>

        <Tooltip
          label={t(NEXT_PAGE)}
          withArrow
          events={{ hover: true, focus: true, touch: true }}
        >
          <ActionIcon
            variant="subtle"
            color="gray"
            radius="md"
            disabled={page >= numPages}
            onClick={() => setPage(page + 1)}
            aria-label={t(NEXT_PAGE)}
          >
            <ChevronRight size={18} />
          </ActionIcon>
        </Tooltip>

        {withZoom && (
          <Group gap={4} ml="md">
            <Tooltip
              label={t(ZOOM_OUT)}
              withArrow
              events={{ hover: true, focus: true, touch: true }}
            >
              <ActionIcon
                variant="subtle"
                color="gray"
                radius="md"
                disabled={zoom <= 0.6}
                onClick={() => setZoom((current) => Math.max(current - 0.2, 0.6))}
                aria-label={t(ZOOM_OUT)}
              >
                <ZoomOut size={18} />
              </ActionIcon>
            </Tooltip>

            <Text size="xs" data-numeric>{Math.round(zoom * 100)}%</Text>

            <Tooltip
              label={t(ZOOM_IN)}
              withArrow
              events={{ hover: true, focus: true, touch: true }}
            >
              <ActionIcon
                variant="subtle"
                color="gray"
                radius="md"
                disabled={zoom >= 2}
                onClick={() => setZoom((current) => Math.min(current + 0.2, 2))}
                aria-label={t(ZOOM_IN)}
              >
                <ZoomIn size={18} />
              </ActionIcon>
            </Tooltip>
          </Group>
        )}
      </Group>
    </Stack>
  )
}

export interface StampPosition {
  /** 1-indexed, page reading order. */
  page: number
  /** PDF points, origin bottom-left — the format the signing layer expects. */
  x: number
  y: number
}

export interface PdfPositionPickerProps {
  source: File | ArrayBuffer | string
  onConfirm: (position: StampPosition) => void
  onCancel?: () => void
  /** Stamp size in PDF points — must match the server-side one. */
  stampWidth?: number
  stampHeight?: number
  width?: number
  label?: LocalizedLabel
  /**
   * Safe zone from every edge of the page, in PDF points.
   * 
   * Home and office printers have a non-printable border of 3 to 6 mm. A stamp
   * placed inside it is either clipped or printed skewed, and that is discovered
   * only when someone prints a signed contract.
   * 
   * The default is 10 mm - 28 points at 72 dpi - which covers the worst printer
   * with room to spare and costs almost nothing on an A4 page. Lower it only for
   * a known set of printers; the default must be the value that breaks nothing.
   */
  safeMargin?: number
}

const HINT: TranslationKey = 'pdf.picker.hint'
const STAMP: TranslationKey = 'pdf.picker.stamp'
const CONFIRM_POSITION: TranslationKey = 'pdf.picker.confirmPosition'

/**
 * Stamp position picker via dragging over the preview.
 *
 * Returns coordinates in PDF points with origin bottom-left, because that is
 * what the signing layer expects — while the screen works in pixels with
 * origin top-left. The conversion is done here, once, so every application
 * does not have to do it.
 *
 * The frame size is only a visual guide; the actual stamp size is computed
 * by the server. The values should be kept in sync so the user is not
 * surprised.
 */
export function PdfPositionPicker({
  source,
  onConfirm,
  onCancel,
  stampWidth = 190,
  stampHeight = 56,
  width = 480,
  label,
  /* 10 mm at 72 points per inch. */
  safeMargin = 28,
}: PdfPositionPickerProps) {
  const { t } = useI18n()
  const [page, setPage] = useState(1)
  /* Starts inside the safe zone, not at an arbitrary 24px. */
  const [box, setBox] = useState({ left: 28, top: 28 })
  const [canvas, setCanvas] = useState({ width, height: Math.round(width * 1.414) })
  const dragRef = useRef<{ startX: number; startY: number; left: number; top: number } | null>(null)

  /* Ratio of screen pixels to PDF points. A4 is 595 points wide; when the
     display is scaled, the ratio changes along with it. */
  const pointsPerPixel = 595 / canvas.width
  const boxWidthPx = stampWidth / pointsPerPixel
  const boxHeightPx = stampHeight / pointsPerPixel
  /* The margin is given in points; dragging happens in screen pixels. */
  const marginPx = safeMargin / pointsPerPixel

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
        left: Math.min(Math.max(left, marginPx), canvas.width - boxWidthPx - marginPx),
        top: Math.min(Math.max(top, marginPx), canvas.height - boxHeightPx - marginPx),
      })
    },
    [canvas.width, canvas.height, boxWidthPx, boxHeightPx, marginPx],
  )

  const confirm = () => {
    /* The screen measures from the top, PDF from the bottom — hence subtracting from the page height. */
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
                {t(STAMP)}
              </Text>
            </Box>
          )
        }}
      />

      <ActionGroup>
        {onCancel && <ActionButton intent="cancel" onClick={onCancel} />}
        <ActionButton
          intent="sign"
          label={CONFIRM_POSITION}
          onClick={confirm}
        />
      </ActionGroup>
    </Stack>
  )
}
