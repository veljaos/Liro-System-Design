# Messages

Correspondence attached to a record: `MessageBubble`, `MessageList`,
`MessageComposer`, and `MessageThread` which combines the last two.

## What this is not

**In a business application this is not chat.** It is correspondence with a
record — a bookkeeper's question to a client, a tax authority's reply, a support
message about a specific invoice.

That distinction produces the one prop chat applications do not need: **every
message carries a delivery status.** In correspondence about a document it matters
whether the other side received the message at all, because the answer decides
what happens next.

## When to use

- A conversation attached to a document, a client, or a case.
- Anywhere the reader needs to know whether a message arrived.

## When not to use

- **Not for notes on a document.** A list of remarks by different people, where
  the side does not matter and the text is long, is `CommentThread` with
  `layout="flat"`. Messages have sides; notes do not.
- **Not for system events.** "Document posted", "permission changed" is
  `AuditTrail`. A system line inside a conversation exists — `system: true` — but
  it is for context, not for the record of what happened.
- **Not for notifications.** A message is addressed to someone. A notification is
  broadcast.

## How it behaves

### Consecutive messages merge

The name and the avatar are not repeated when the previous message is from the
same author. Without it, a correspondence of twenty messages reads as twenty
separate posts.

The merging is computed in `MessageList` from the previous message; the bubble
itself only receives `compact`.

### The tail marks the first message of a run, at the top

```
┌─ sharp corner, top left        first from this author
│  Poslala sam izvod za mart.
└─ rounded

┌─ fully rounded                 continuation
│  Iznos je 42.180,00 RSD.
└─
```

The tail is at the **top**, on the **first** message — the WhatsApp pattern rather
than iMessage's, which puts it on the last one at the bottom.

Two reasons. A run of five messages needs the tail to mark where the run *starts*,
otherwise it stops separating runs and becomes decoration. And reactions sit at
the bottom edge, so a tail down there would be covered by them — which is exactly
what happened before the tail moved.

The sharp corner is on the author's side, so **the side is visible without
colour**. That matters in the dark theme and for anyone who does not distinguish
the blue.

### Enter sends, Shift+Enter breaks the line

The reversed behaviour is the most common complaint about business applications.
Someone typing messages all day does not reach for the mouse to find a send
button.

### Reactions

```tsx
<MessageThread
  messages={messages}
  onReact={react}
  reactionOptions={[
    { id: 'ok', icon: ThumbsUp, label: 'Confirmed', tone: 'success' },
    { id: 'q', icon: CircleQuestionMark, label: 'Question', tone: 'info' },
    { id: 'urgent', icon: TriangleAlert, label: 'Urgent', tone: 'warning' },
    { id: 'blocked', icon: Ban, label: 'Disputed', tone: 'danger' },
  ]}
  onSend={send}
/>
```

**Lucide icons, not emoji.** Three reasons: the emoji font differs between
systems, which would make the visual baselines unreliable; there is no emoji
anywhere else in the system; and in correspondence attached to a record you do not
need twenty reactions, you need three or four that mean something.

**The picker appears on hover**, not permanently — a row of buttons under every
message is noise. It stays in the keyboard order regardless (`opacity: 0`, never
`display: none`) and becomes visible on focus.

**Your own reaction carries the colour of its meaning; other people's are quiet.**
If every reaction were coloured, a row of four would be a rainbow that does not
say which one is yours.

Reactions overlap the bottom edge of the bubble, on the side **opposite** the
tail.

## Examples

A thread on a document screen:

```tsx
<MessageThread
  messages={messages}
  height={340}
  dayLabelOf={(message) => message.dayLabel}
  onSend={send}
/>
```

A single bubble with delivery status, for a status display:

```tsx
<MessageBubble
  message={{
    id: '1',
    author: { id: 'me', name: 'Ja' },
    text: 'Poslato u obradu.',
    time: '09:15',
    own: true,
    status: 'sent',
  }}
/>
```

Statuses are `sending`, `sent`, `delivered`, `read`, `failed`. `read` uses the
brand colour, `failed` the danger colour, and the rest are quiet — a message that
arrived is not news, a message that failed is.

## Related

- `CommentThread` — notes on a document, where the side does not matter
- `PersonAvatar` — what the bubble uses for the author
- `AuditTrail` — the record of what happened, not what was said
- `notice` — feedback about an action, not a message to a person

## Why it is like this

### The bubble is `xl`, not a pill

16px radius rather than fully rounded. A pill works for short lines of chat; here
a message about an invoice is often a paragraph, and a pill around a paragraph
looks wrong.

The one exception is the tail corner at `xs` — 2px — which is what makes the side
readable without colour.

### A translucent token cannot sit on an unknown background

The reaction chips were built with `status[tone].bg`, which in the dark theme is
`rgba(..., 0.20)` computed against the page background. Placed on a blue bubble it
mixed with the blue:

| | measured |
|---|---|
| translucent tone directly on the blue bubble | **2.34** |
| the same tone over an opaque base | **6.32** |

The fix is to paint the base first — `backgroundColor` for an opaque surface, then
`backgroundImage: linear-gradient(token, token)` above it — so the translucency
always mixes with the same thing regardless of what is underneath.

This is the general rule recorded in `AGENTS.md`, and this component is where it
was found.

### The ring around a chip is the colour of the surface, not the bubble

A reaction crosses the bubble's edge. Without a ring it reads as part of the
bubble; with a ring in the wrong colour it reads as a mistake. The ring uses
`surface.raised` — the surface the conversation *sits on*, which is a
`SectionCard`, a panel or a drawer.

`surface.page` was tried and is wrong: in the light theme the difference is
invisible, but in the dark theme it is `ink` against `inkRaised` and the ring
shows as a dark line.

### Sending is the one control in blue

`MessageComposer` sets the send button to the brand colour, against the theme's
default grey for `ActionIcon`. Most icon buttons are secondary — edit, delete,
open a menu. Sending is the main action of the field and the only one bound to
`Enter`, so it carries the weight of a filled button.