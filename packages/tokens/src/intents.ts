/**
 * Namere radnji.
 *
 * Ovo je najkrući deo sistema i to je namerno. Programer ne bira boju dugmeta -
 * bira sta dugme radi, a boja je posledica. Zbog toga je dugme "Novo" plavo u
 * svakoj Liro aplikaciji, na svakom ekranu, bez izuzetka, i korisnik ga
 * prepoznaje pre nego sto procita natpis.
 *
 * Sistem boja prati Fluent logiku svrhe, ne ukusa:
 *
 *   plava      stvaranje i potvrda - "nastavi napred"
 *   tirkizna   overa, potpis, slanje nadleznom organu
 *   ljubicasta dokumenti i izlaz - PDF, stampa, pregled
 *   zelena     pozitivan zavrsetak - odobreno, knjizeno, izvezeno
 *   crvena     razaranje i odbijanje
 *   narandzasta radnje sa posledicom koja se tesko vraca
 *   siva       neutralno - izmena, filter, osvezavanje, odustajanje
 *
 * Ako neka nova radnja ne ulazi ni u jednu grupu, to je znak da grupa fali -
 * a ne da toj radnji treba sopstvena boja.
 */

export type ActionIntent =
  // Plava - stvaranje i potvrda
  | 'create'
  | 'save'
  | 'submit'
  | 'confirm'
  | 'next'
  // Tirkizna - overa i slanje
  | 'verify'
  | 'sign'
  | 'send'
  | 'sync'
  // Ljubicasta - dokumenti i izlaz
  | 'pdf'
  | 'print'
  | 'preview'
  | 'download'
  // Zelena - pozitivan zavrsetak
  | 'approve'
  | 'post'
  | 'excel'
  | 'complete'
  // Crvena - razaranje i odbijanje
  | 'delete'
  | 'reject'
  | 'cancelDocument'
  // Narandzasta - tesko povratne radnje
  | 'unlock'
  | 'revert'
  | 'void'
  // Siva - neutralno
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

/** Grupa boje kojoj namera pripada. */
export type IntentFamily = 'primary' | 'verify' | 'document' | 'positive' | 'destructive' | 'caution' | 'neutral'

export interface IntentDefinition {
  family: IntentFamily
  /**
   * `filled` nosi glavnu radnju ekrana, `light` sporedne, `subtle` one u
   * meniju reda. Namera odredjuje podrazumevanu tezinu jer se time sprecava
   * ekran sa sest punih dugmadi koja se medjusobno nadvikuju.
   */
  weight: 'filled' | 'light' | 'subtle' | 'default'
  /** Trazi potvrdu pre izvrsenja. */
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
   * Dokumenti nose punu tezinu, ne blagu.
   *
   * U Liro Business App-u su PDF i stampa medju najcescim radnjama na ekranu -
   * knjigovodja ih trazi ocima pre svega ostalog. Blaga ljubicasta se gubi
   * pored pune plave, pa dokument dugmad dobijaju istu tezinu kao glavna
   * radnja. `preview` i `download` ostaju blagi jer su sporedni ulazi u isti tok.
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
 * Stanja zapisa - isti princip primenjen na oznake umesto na radnje.
 *
 * Razdvojeno je od `StatusTone` jer tonovi opisuju boju, a ova mapa opisuje
 * znacenje. `draft` je siv zato sto je nacrt, ne zato sto je "neutral".
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
