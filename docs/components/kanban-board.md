# KanbanBoard

Cards in columns, moved between them.

## When to use

- A status flow the user works through: invoices awaiting approval, tickets,
  documents in a signing queue.
- Anywhere the number of items in a stage is itself the information — see the
  limit below.

## When not to use

- **Not for a list.** Two hundred invoices are a `DataTable`. A board is readable
  at perhaps forty cards; past that it is a wall.
- **Not for one record's progress.** A record moving through named states is
  `WorkflowStatus`. A board shows many records at once.
- **Not for scheduling.** Cards on a date axis are `LiroSchedule` or
  `CapacityTimeline`. A column is a status, not a time.
- **Not for hand-sorting.** See below — cards are not reordered within a column.

## How it behaves

```tsx
<KanbanBoard
  columns={columns}
  onMove={(cardId, toColumnId) => updateStatus(cardId, toColumnId)}
/>
```

**The board holds no state.** `onMove` is the only way anything happens: the
application performs the move and sends the cards back. Because the column *is*
the status, moving a card is a state change — and a state change belongs to the
application, not to a display.

### Drag is not accessible, so the menu is not a fallback

Neither HTML5 drag-and-drop nor pointer events reach the keyboard, and the
"keyboard drag mode" some libraries offer is a mode nobody discovers.

So **every card carries a visible "Move to" menu** listing the other columns.

For a keyboard that is the *better* path, because it can be seen. For a screen
reader it is the only path. The mouse drags, the keyboard picks from the menu, and
both call the same `onMove`.

Writing it the other way round — drag as the feature, keyboard as the
accommodation — produces exactly the interface where the accommodation is
undiscoverable.

### The limit is not decoration

```tsx
{ id: 'review', label: { en: 'In review' }, limit: 3, cards }
```

A column of forty items "in progress" means nothing is in progress. The limit is
what makes that visible: over it, the heading and the count both turn.

**The move still goes through.** The board reports the problem; it does not block
the work. A board that refused a move would be a board people work around.

The heading turns as well as the badge, because a badge alone is easy to miss on a
board of six columns.

### Only the grip starts a drag

Pressing anywhere on the card would make the card impossible to click — and
clicking it to open the record is the common action. The grip is a separate, small
target with `cursor: grab`.

## Related

- `DataTable` — the same records as a list
- `WorkflowStatus` — one record through named states
- `DetailDrawer` — what usually opens from `onCardClick`
- `RecordStatusBadge` — the status without a board

## Why it is like this

### No reordering within a column

In a business flow the column is the status, and the order inside it belongs to the
application — by date, by deadline, by amount. **Hand-sorting a queue of two
hundred invoices is not a thing anyone does.**

Supporting it would mean an index in `onMove`, drop-position detection between
cards, and an `order` field somewhere in the database. Trello needs all of that
because in Trello the order *is* the priority. Here it is not.

### No drag-and-drop library

The third component in this system built on plain pointer events, after
`SplitPanel` and column resizing. `@dnd-kit` is 30 KB and solves sortable lists,
collision detection and nested droppables — none of which a board with four
columns and no reordering needs.

### The dragged card is transparent to hit-testing

`pointerEvents: 'none'` while dragging, and this was the bug that took the
longest.

`columnAt` uses `document.elementFromPoint`, and the dragged card sits under the
pointer the whole time. Without this it is what gets returned — and `closest()`
then walks up the **DOM**, where the card is still a child of the *source* column,
because it only moved by `transform`.

The target therefore always came back as the source: no outline, no move, and an
occasional hit whenever the pointer strayed off the card's own edge.

`setPointerCapture` is on the grip, not the card, so making the card transparent
does not interrupt the drag — captured events bypass hit-testing entirely.

### The column is found by point, not by rectangle

Rectangles measured when the card is picked up are stale the moment the board
scrolls sideways — which it does, whenever the target column is off-screen.