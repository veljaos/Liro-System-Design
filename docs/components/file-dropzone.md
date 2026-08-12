# FileDropzone

Drag-and-drop upload with a named button, and `AttachmentList` for what was
uploaded.

## When to use

- Attaching documents to a record: a bank statement, a filing, a contract.
- Anywhere the user brings a file from their own machine.

## When not to use

- **Not for images that are looked at.** A set of photographs with captions is
  `ItemGallery`. This is for documents.
- **Not for a single required file in a form.** That is an `upload` field in
  `AutoForm`, which participates in validation and in the payload.

## How it behaves

### Uploads run in sequence, not in parallel

Ten files at once means ten simultaneous requests, a progress bar that jumps
around, and a server that has to cope with a burst from every user. In sequence
the progress is honest — *3 of 10* — and a failure identifies which file failed.

### `withButton` adds a named path to the same dialogue

```tsx
<FileDropzone
  onUploaded={attach}
  withButton
  accept={['application/pdf']}
  maxSize={30 * 1024 * 1024}
/>
```

Dropping and clicking the zone both work through a hidden `input[type=file]`,
which a screen reader announces as **a field with no name** — a known Mantine
`Dropzone` issue, recorded in the `KNOWN` list.

The button is an explicit, named route to the same dialogue. It is useful even
where the zone is not a problem, because "Import" is a thing a person looks for
and a drop zone is a thing they have to notice.

## An attachment cannot be deleted once the document is posted

**This is an accounting rule, not a UI preference.** A posted document's
attachment becomes evidence, and evidence is not deleted.

Today the rule is enforced by the application **not passing `onRemove`** — which
works, but removes deletion from the whole list rather than from one file, and
puts a domain rule in the screen rather than in the component.

> **Open.** `AttachmentList` should take `canRemove?: (file) => boolean`, so a
> single attachment can be shown without its delete button. Recorded in
> [the component inventory](../component-inventory.md).

## Related

- `AutoForm` — an `upload` field inside a form
- `ItemGallery` — photographs rather than documents
- `LiroFileStorageProvider` — where the files actually go

## Why it is like this

### File storage is separate from the data provider

An upload goes through `LiroFileStorageProvider`, not through the data provider.
Databases and object storage are different services and routinely different
vendors; tying them together would force one choice on both.

`docs/architecture.md` covers the same split on the data side.