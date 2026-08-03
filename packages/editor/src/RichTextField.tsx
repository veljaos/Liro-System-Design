'use client'

import { RichTextEditor, type RichTextEditorProps } from '@mantine/tiptap'
import { Box, Input, Text } from '@mantine/core'
import { useEditor, type Editor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Link from '@tiptap/extension-link'
import { useEffect } from 'react'
import { liroVar } from '@liro/tokens'
import { useI18n, type LocalizedLabel } from '@liro/i18n'

/**
 * Bogati tekst za napomene, opise usluga i klauzule ugovora.
 *
 * Skup alata je namerno kratak. Puni editor sa bojama, veličinama i fontovima
 * u poslovnoj aplikaciji proizvodi dokumente koji izgledaju kao da ih je pisalo
 * petoro ljudi - a upravo ih i jeste. Ovde postoji ono što nosi značenje:
 * podebljano, kurziv, naslovi, liste, citat i veza. Boju i pismo bira sistem.
 */

export type EditorToolset = 'minimal' | 'standard'

export interface RichTextFieldProps {
  /** HTML sadržaj. */
  value: string
  onChange: (html: string) => void
  label?: LocalizedLabel
  description?: LocalizedLabel
  placeholder?: LocalizedLabel
  error?: string
  required?: boolean
  /** `minimal` je samo podebljano, kurziv i liste - za kratke napomene. */
  toolset?: EditorToolset
  /** Bez trake sa alatima i bez ivice; koristi se za prikaz sačuvanog teksta. */
  readOnly?: boolean
  minHeight?: number
  stickyToolbar?: boolean
  variant?: RichTextEditorProps['variant']
}

export function RichTextField({
  value,
  onChange,
  label,
  description,
  error,
  required,
  toolset = 'standard',
  readOnly = false,
  minHeight = 160,
  stickyToolbar = false,
  variant = 'default',
}: RichTextFieldProps) {
  const { t } = useI18n()

  const editor = useEditor({
    /* Bez ovoga Next prijavljuje neslaganje pri hidrataciji, jer se editor na
       serveru i na klijentu ne montira istim redosledom. */
    immediatelyRender: false,
    editable: !readOnly,
    extensions: [
      StarterKit,
      Link.configure({ openOnClick: false, autolink: true }),
    ],
    content: value,
    onUpdate: ({ editor: instance }) => onChange(instance.getHTML()),
  })

  /* Kada vrednost stigne spolja - ucitavanje zapisa, reset forme - editor mora
     da je preuzme, ali samo ako se stvarno razlikuje. Bez provere bi svaki
     pritisak tastera vratio kursor na pocetak. */
  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value, { emitUpdate: false })
    }
  }, [value, editor])

  useEffect(() => {
    editor?.setEditable(!readOnly)
  }, [readOnly, editor])

  const content = (
    <RichTextEditor
      editor={editor}
      variant={variant}
      style={{
        borderColor: error ? liroVar.status.danger.border : undefined,
        backgroundColor: liroVar.surface.raised,
      }}
    >
      {!readOnly && (
        <RichTextEditor.Toolbar sticky={stickyToolbar} stickyOffset={56}>
          <RichTextEditor.ControlsGroup>
            <RichTextEditor.Bold />
            <RichTextEditor.Italic />
            <RichTextEditor.Underline />
            <RichTextEditor.Strikethrough />
          </RichTextEditor.ControlsGroup>

          {toolset === 'standard' && (
            <RichTextEditor.ControlsGroup>
              <RichTextEditor.H2 />
              <RichTextEditor.H3 />
            </RichTextEditor.ControlsGroup>
          )}

          <RichTextEditor.ControlsGroup>
            <RichTextEditor.BulletList />
            <RichTextEditor.OrderedList />
          </RichTextEditor.ControlsGroup>

          {toolset === 'standard' && (
            <RichTextEditor.ControlsGroup>
              <RichTextEditor.Blockquote />
              <RichTextEditor.Hr />
              <RichTextEditor.Link />
              <RichTextEditor.Unlink />
            </RichTextEditor.ControlsGroup>
          )}

          <RichTextEditor.ControlsGroup>
            <RichTextEditor.ClearFormatting />
            <RichTextEditor.Undo />
            <RichTextEditor.Redo />
          </RichTextEditor.ControlsGroup>
        </RichTextEditor.Toolbar>
      )}

      <RichTextEditor.Content style={{ minHeight }} />
    </RichTextEditor>
  )

  if (!label && !description && !error) return content

  return (
    <Input.Wrapper
      label={t(label)}
      description={t(description) || undefined}
      withAsterisk={required}
      error={error}
    >
      <Box mt={4}>{content}</Box>
    </Input.Wrapper>
  )
}

export interface RichTextViewProps {
  value: string | null | undefined
  /** Prazna vrednost daje crticu, ne prazan prostor. */
  emptyText?: string
}

/**
 * Prikaz sačuvanog teksta bez editora.
 *
 * Sadržaj dolazi iz baze i renderuje se kao HTML. To je bezbedno samo ako je
 * upisan kroz `RichTextField` - ako ikada bude dolazio iz spoljnog izvora,
 * mora proći kroz sanitizaciju na serveru.
 */
export function RichTextView({ value, emptyText = '—' }: RichTextViewProps) {
  if (!value || value === '<p></p>') {
    return <Text size="sm" c="dimmed">{emptyText}</Text>
  }

  return (
    <Box
      className="liro-rich-text"
      style={{ fontSize: 'var(--liro-font-size-sm)', lineHeight: 'var(--liro-line-height-base)' }}
      dangerouslySetInnerHTML={{ __html: value }}
    />
  )
}

export type { Editor }
