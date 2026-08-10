/**
 * Action intents.
 *
 * This is the shortest part of the system, and that is deliberate. A
 * developer does not choose the button's color — they choose what the button
 * does, and the color follows. That is why the "New" button is blue in every
 * Liro application, on every screen, without exception, and the user
 * recognizes it before reading the label.
 *
 * The color system follows Fluent's logic of purpose, not of taste:
 *
 *   blue       creation and confirmation — "move forward"
 *   teal       verification, signature, submission to an authority
 *   violet     documents and export — PDF, print, preview
 *   green      positive completion — approved, posted, exported
 *   red        destruction and rejection
 *   orange     actions with a hard-to-reverse consequence
 *   gray       neutral — edit, filter, refresh, cancel
 *
 * If some new action does not fit any group, that is a sign the group is
 * missing — not that this action needs its own color.
 */

export type ActionIntent =
  // Blue - creation and confirmation
  | 'create'
  | 'save'
  | 'submit'
  | 'confirm'
  | 'next'
  // Teal - verification and submission
  | 'verify'
  | 'sign'
  | 'send'
  | 'sync'
  // Violet - documents and export
  | 'pdf'
  | 'print'
  | 'preview'
  | 'download'
  // Green - positive completion
  | 'approve'
  | 'post'
  | 'excel'
  | 'complete'
  // Red - destruction and rejection
  | 'delete'
  | 'reject'
  | 'cancelDocument'
  // Orange - hard-to-reverse actions
  | 'unlock'
  | 'revert'
  | 'void'
  // Gray - neutral
  | 'edit'
  | 'view'
  | 'filter'
  | 'refresh'
  | 'back'
  | 'cancel'
  | 'duplicate'
  | 'import'
  | 'archive'
  | 'settings'
  | 'more'

/** Color group the intent belongs to. */
export type IntentFamily = 'primary' | 'verify' | 'document' | 'positive' | 'destructive' | 'caution' | 'neutral'

export interface IntentDefinition {
  family: IntentFamily
  /**
   * `filled` carries the screen's primary action, `light` secondary ones,
   * `subtle` the ones in a row menu. Intent determines the default weight
   * because that prevents a screen with six filled buttons shouting over each
   * other.
   */
  weight: 'filled' | 'light' | 'subtle' | 'default'
  /** Requires confirmation before executing. */
  confirms?: boolean
}

export const INTENT_FAMILY_COLOR: Record<IntentFamily, string> = {
  primary: 'liro-blue',
  verify: 'liro-teal',
  document: 'liro-violet',
  positive: 'liro-green',
  destructive: 'liro-red',
  caution: 'liro-orange',
  neutral: 'liro-gray',
}

export const INTENTS: Record<ActionIntent, IntentDefinition> = {
  create: { family: 'primary', weight: 'filled' },
  save: { family: 'primary', weight: 'filled' },
  submit: { family: 'primary', weight: 'filled' },
  confirm: { family: 'primary', weight: 'filled' },
  next: { family: 'primary', weight: 'filled' },

  verify: { family: 'verify', weight: 'filled' },
  sign: { family: 'verify', weight: 'filled', confirms: true },
  send: { family: 'verify', weight: 'filled', confirms: true },
  sync: { family: 'verify', weight: 'light' },

  /*
   * Documents carry full weight, not light.
   *
   * In Liro Business App, PDF and print are among the most common actions on
   * screen — a bookkeeper looks for them before anything else. A light violet
   * gets lost next to a filled blue, so document buttons get the same weight
   * as the primary action. `preview` and `download` stay light because they
   * are secondary entry points into the same flow.
   */
  pdf: { family: 'document', weight: 'filled' },
  print: { family: 'document', weight: 'filled' },
  preview: { family: 'document', weight: 'light' },
  download: { family: 'document', weight: 'light' },

  approve: { family: 'positive', weight: 'filled', confirms: true },
  post: { family: 'positive', weight: 'filled', confirms: true },
  excel: { family: 'positive', weight: 'light' },
  complete: { family: 'positive', weight: 'filled' },

  delete: { family: 'destructive', weight: 'subtle', confirms: true },
  reject: { family: 'destructive', weight: 'light', confirms: true },
  cancelDocument: { family: 'destructive', weight: 'light', confirms: true },

  unlock: { family: 'caution', weight: 'light', confirms: true },
  revert: { family: 'caution', weight: 'light', confirms: true },
  void: { family: 'caution', weight: 'light', confirms: true },

  edit: { family: 'neutral', weight: 'default' },
  view: { family: 'neutral', weight: 'subtle' },
  filter: { family: 'neutral', weight: 'default' },
  refresh: { family: 'neutral', weight: 'subtle' },
  back: { family: 'neutral', weight: 'subtle' },
  cancel: { family: 'neutral', weight: 'default' },
  duplicate: { family: 'neutral', weight: 'default' },
  import: { family: 'neutral', weight: 'default' },
  archive: { family: 'neutral', weight: 'default' },
  settings: { family: 'neutral', weight: 'subtle' },
  more: { family: 'neutral', weight: 'subtle' },
}

/**
 * Record statuses — the same principle applied to badges instead of actions.
 *
 * Kept separate from `StatusTone` because tones describe a color, while this
 * map describes meaning. `draft` is gray because it is a draft, not because
 * it is "neutral".
 */
export type RecordStatus =
  | 'draft'
  | 'pending'
  | 'inReview'
  | 'approved'
  | 'posted'
  | 'signed'
  | 'sent'
  | 'paid'
  | 'partiallyPaid'
  | 'overdue'
  | 'rejected'
  | 'cancelled'
  | 'archived'
  | 'active'
  | 'inactive'
  | 'locked'
  | 'error'

export const RECORD_STATUS_TONE: Record<RecordStatus, 'success' | 'warning' | 'danger' | 'info' | 'neutral' | 'premium'> = {
  draft: 'neutral',
  pending: 'warning',
  inReview: 'info',
  approved: 'success',
  posted: 'success',
  signed: 'info',
  sent: 'info',
  paid: 'success',
  partiallyPaid: 'warning',
  overdue: 'danger',
  rejected: 'danger',
  cancelled: 'danger',
  archived: 'neutral',
  active: 'success',
  inactive: 'neutral',
  locked: 'warning',
  error: 'danger',
}
