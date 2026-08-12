# Displaying a person

Four components for the same subject at four sizes: `PersonAvatar`, `PersonCell`,
`PersonInfo` and `PersonCard`.

One page, because the decisions behind them are shared and documenting them apart
would repeat the same reasoning four times.

## Which one

| Component | Where it goes |
|---|---|
| `PersonAvatar` | Beside a name that is already written — a message, a comment, an approval chain |
| `PersonCell` | A row in a table: avatar, name, and one line under it |
| `PersonInfo` | A contact block: role, name, email, phone |
| `PersonCard` | A card in a grid: header band, avatar, figures, one action |

## When not to use

- **Not for a list of names without faces.** If the avatar carries no information
  — a dropdown of assignees, a filter — plain text is better. An avatar of
  initials next to every option is decoration that costs a line of height.
- **`PersonCell` is not for two columns.** It is one table cell. Name and role in
  separate columns is an ordinary `DataTable` column pair.
- **`PersonCard` is not a profile page.** It is a summary in a grid. Editing a
  profile is `ProfileCard` in account settings.

## The shared decisions

### Initials are the first letters of the first two words

```
"Ana Jovanović"    →  AJ    not AN
"Marko Petrović"   →  MP    not MA
"Đorđe Đurić"      →  ĐĐ
```

`name.slice(0, 2)` takes the first two **characters**, which was the bug in two
files before this family existed. In a list of five people, half of them ended up
with the same initials.

`toLocaleUpperCase` handles diacritics and Cyrillic, which is why `Đ` comes out
as `Đ` and not `D`.

### The avatar is decorative by default

```tsx
<PersonAvatar name={person.name} />              /* alt="" aria-hidden */
<PersonAvatar name={person.name} alt={person.name} />  /* only when it stands alone */
```

In practice the name is always written beside the avatar — in a message, a
comment, a table row. A screen reader would then read the name twice, and read
"AJ" as a word.

Pass `alt` only when the avatar stands alone and is the sole carrier of the
information.

**An empty `alt` is correct for a decorative image; a missing one is not.** Without
it, `image-alt` fails the moment a real `src` is passed — which is why it is set
explicitly rather than left out.

### Contact details are links, not text

`PersonInfo` renders email and phone as `mailto:` and `tel:`. A written-out
address the user has to copy by hand is work a computer can do, and on a phone
`tel:` starts the call.

```tsx
telHref('+381 (11) 890 56 23')  →  'tel:+381118905623'
```

`tel:` accepts only digits and a leading plus — spaces and brackets are there for
the eye, not for the dialler. The display keeps what was passed; the link is
cleaned.

Each link carries a `VisuallyHidden` prefix — "Email:", "Phone:" — because the
icon says what it is to the eye and nothing to a screen reader. Without it, a
phone number is read as a bare string of digits with no context.

### The card's header is a colour band, not a photograph

Two reasons, and the first is not aesthetic:

**Visual regression must not depend on the network.** A card with a photograph
from an image service makes 118 baselines fail whenever that service is slow or
changes the image.

**In a business system a decorative landscape behind an employee is noise.**

`coverImage` exists for when a photograph is genuinely wanted. When it is used,
the image goes in as a CSS background rather than an `<img>` — it is decorative,
so being invisible to a screen reader is the correct behaviour, not an oversight.

### The action is a slot

```tsx
<PersonCard
  name="Ana Jovanović"
  position="Bookkeeper"
  stats={[{ value: 318, label: { en: 'Documents' } }]}
  action={<ActionButton intent="view" label={{ en: 'Open profile' }} />}
/>
```

Not `action="view"`. The card must not know about the intent catalogue — the
application passes the button. That keeps `PersonCard` usable on a screen whose
action is not in the catalogue at all.

### The prop is `position`, not `role`

`jsx-a11y/aria-role` reads every JSX `role` as an ARIA role, on our own components
as much as on DOM elements. `role="Bookkeeper"` is a lint error.

`PersonCell` takes `secondary` instead, and that difference is deliberate: the
second line in a table row is not always a job title. It can be a city, a tax
number, a department. `secondary` is honest about that; `position` would claim
something the cell does not know.

## Examples

A table column:

```tsx
{
  key: 'employee',
  header: { en: 'Employee' },
  render: (row) => <PersonCell name={row.fullName} secondary={row.position} />,
}
```

A contact block on a client screen:

```tsx
<PersonInfo
  name={client.contactName}
  position={client.contactRole}
  email={client.email}
  phone={client.phone}
/>
```

A grid of people:

```tsx
<SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="lg">
  {employees.map((person) => (
    <PersonCard
      key={person.id}
      name={person.fullName}
      position={person.position}
      avatarUrl={person.photoUrl}
      stats={[
        { value: person.documentCount, label: { en: 'Documents' } },
        { value: person.clientCount, label: { en: 'Clients' } },
      ]}
      action={<ActionButton intent="view" label={{ en: 'Open profile' }} />}
    />
  ))}
</SimpleGrid>
```

A card without figures and without an action keeps the same height as its
neighbours — that is intentional, so a grid does not become ragged when some
people have data and others do not.

## Related

- `DataTable` — the table `PersonCell` goes into
- `ApprovalChain` · `CommentThread` · `Messages` — all three use `PersonAvatar`
- `ProfileCard` — editing one's own profile, in account settings
- `ArticleCard` — the same "card with an image" shape, for content rather than
  people

## Why it is like this

### Why `PersonAvatar` and `PersonCell` are in `primitives`

Both display **data**: a name and a line of text, already resolved. No hooks, no
functions in props, no `LocalizedLabel`. That makes them usable in a server tree,
which matters because a table of employees is a good candidate for server
rendering.

`PersonInfo` and `PersonCard` are not: they carry system labels — "Email:",
"Phone:", the figure captions — which have to go through `useI18n`.

That split is the three-kinds-of-component rule from `AGENTS.md`, applied to one
small family. It is worth reading this family as the worked example of it.

### Why one page for four components

They share every decision above. Four pages would state the initials rule four
times, and the fourth copy would be the one that stays wrong after someone fixes
the first three.