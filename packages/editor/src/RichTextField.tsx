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
 * Rich text for notes, service descriptions, and contract clauses.
 *
 * The toolset is deliberately short. A full editor with colors, sizes, and
 * fonts in a business application produces documents that look like they were
 * written by five people — because they were. What exists here is what
 * carries meaning: bold, italic, headings, lists, quote, and link. Color and
 * typeface are chosen by the system.
 */

export type EditorToolset = 'minimal' | 'standard'

export interface RichTextFieldProps {
  /** HTML content. */
  value: string
  onChange: (html: string) => void
  label?: LocalizedLabel
  description?: LocalizedLabel
  placeholder?: LocalizedLabel
  error?: string
  required?: boolean
  /** `minimal` is just bold, italic, and lists — for short notes. */
  toolset?: EditorToolset
  /** No toolbar and no border; used to display saved text. */
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

  /*
  * ProseMirror sets `role="textbox"` on the `contenteditable` div itself, but
  * does not add a name. Without one, this is an input field that a screen
  * reader reads as empty. When the field has its own label, that becomes the
  * name; otherwise a general description is used.
  */
  const ariaLabel =
    t(label) ||
    t({ sr: 'Uređivač teksta', 'sr-Cyrl': 'Уређивач текста', en: 'Text editor' })

  const editor = useEditor({
    /* Without this, Next reports a hydration mismatch, because the editor
       does not mount in the same order on the server and on the client. */
    immediatelyRender: false,
    editable: !readOnly,
    extensions: [
      StarterKit,
      Link.configure({ openOnClick: false, autolink: true }),
    ],
    content: value,
    editorProps: { attributes: { 'aria-label': ariaLabel } },
    onUpdate: ({ editor: instance }) => onChange(instance.getHTML()),
  })

  /* When the value arrives from outside — loading a record, resetting the
     form — the editor must take it, but only if it genuinely differs. Without
     the check, every keystroke would reset the cursor to the start. */
  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value, { emitUpdate: false })
    }
  }, [value, editor])

  useEffect(() => {
    editor?.setEditable(!readOnly)
  }, [readOnly, editor])

  /* `useEditor` with no dependency array creates the editor once and never
    looks at the options again, so the name must be set separately when the
    language or label changes. `setOptions` passes `editorProps` through
    `view.setProps`, which ProseMirror applies to the DOM. Recreating the
    editor is not an option — it would lose the content. */
  useEffect(() => {
    editor?.setOptions({ editorProps: { attributes: { 'aria-label': ariaLabel } } })
  }, [ariaLabel, editor])

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
  /** An empty value produces a dash, not empty space. */
  emptyText?: string
}

/**
 * Display of saved text without the editor.
 *
 * Content comes from the database and is rendered as HTML. That is safe only
 * if it was written through `RichTextField` — if it ever comes from an
 * external source, it must go through sanitization on the server.
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
