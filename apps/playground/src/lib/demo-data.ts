import { createInMemoryProvider } from '@liro/data'

/**
 * Izmišljeni podaci nad kojima rade `ResourceTable` i relacije u formama.
 *
 * Poenta nije sadržaj nego to što ceo playground radi bez baze - ako
 * komponenta traži nešto što se ne može izraziti nad nizom u memoriji, to je
 * znak da je previše vezana za konkretan backend.
 */

const CLIENTS = [
  { id: 'c1', name: 'Konfirs d.o.o.', pib: '100234567', city: 'Beograd', active: true },
  { id: 'c2', name: 'Officedirect d.o.o.', pib: '101987654', city: 'Novi Sad', active: true },
  { id: 'c3', name: 'Pekara Sunce', pib: '102345678', city: 'Niš', active: false },
]

const BRANCHES = [
  { id: 'b1', client_id: 'c1', name: 'Centrala' },
  { id: 'b2', client_id: 'c1', name: 'Magacin Zemun' },
  { id: 'b3', client_id: 'c2', name: 'Poslovnica Liman' },
]

const FIRST = ['Ana', 'Marko', 'Jelena', 'Nikola', 'Milica', 'Stefan', 'Ivana', 'Dušan']
const LAST = ['Jovanović', 'Petrović', 'Nikolić', 'Ilić', 'Marković', 'Stanković']
const POSITIONS = ['Knjigovođa', 'Komercijalista', 'Magacioner', 'Vozač', 'Analitičar']

const EMPLOYEES = Array.from({ length: 47 }, (_, index) => {
  /* `noUncheckedIndexedAccess` je uključen namerno - pristup po indeksu
     uvek može da vrati undefined, pa ovde stoji izričit fallback. */
  const first = FIRST[index % FIRST.length] ?? 'Ana'
  const last = LAST[index % LAST.length] ?? 'Jovanović'
  return {
    id: `e${index + 1}`,
    first_name: first,
    last_name: last,
    full_name: `${first} ${last}`,
    position: POSITIONS[index % POSITIONS.length] ?? 'Knjigovođa',
    client_id: CLIENTS[index % CLIENTS.length]?.id ?? 'c1',
    gross_salary: 85000 + (index % 12) * 7350,
    start_date: `20${20 + (index % 6)}-${String((index % 12) + 1).padStart(2, '0')}-1${index % 9}`,
    active: index % 7 !== 0,
  }
})


const DOC_STATUSES = ['draft', 'pending', 'signed', 'posted', 'overdue', 'paid'] as const
const DOC_TYPES = ['Faktura', 'Predračun', 'Otpremnica', 'Knjižno odobrenje']

const DOCUMENTS = Array.from({ length: 63 }, (_, index) => {
  const client = CLIENTS[index % CLIENTS.length]
  const net = 24_500 + (index % 17) * 8_930
  return {
    id: `d${index + 1}`,
    number: `2026-${String(318 - index).padStart(6, '0')}`,
    type: DOC_TYPES[index % DOC_TYPES.length] ?? 'Faktura',
    client_id: client?.id ?? 'c1',
    client_name: client?.name ?? 'Konfirs d.o.o.',
    issue_date: `2026-0${(index % 3) + 1}-${String((index % 27) + 1).padStart(2, '0')}`,
    due_date: `2026-0${(index % 3) + 2}-${String((index % 27) + 1).padStart(2, '0')}`,
    net,
    vat: Math.round(net * 0.2),
    total: Math.round(net * 1.2),
    status: DOC_STATUSES[index % DOC_STATUSES.length] ?? 'draft',
  }
})

const RECEIPTS = Array.from({ length: 84 }, (_, index) => ({
  id: `r${index + 1}`,
  pfr_number: `${String(index + 1).padStart(4, '0')}/${2026}ПФР`,
  cashier: FIRST[index % FIRST.length] ?? 'Ana',
  location: index % 3 === 0 ? 'Prodavnica Centar' : index % 3 === 1 ? 'Magacin Zemun' : 'Poslovnica Liman',
  issued_at: `2026-03-${String((index % 28) + 1).padStart(2, '0')}`,
  payment: index % 4 === 0 ? 'Gotovina' : index % 4 === 1 ? 'Kartica' : index % 4 === 2 ? 'Virman' : 'Ček',
  total: 1_240 + (index % 23) * 780,
  vat: Math.round((1_240 + (index % 23) * 780) / 6),
  fiscalized: index % 11 !== 0,
}))

const NOTIFICATION_KINDS = ['deadline', 'document', 'system', 'mention'] as const

const NOTIFICATIONS = Array.from({ length: 24 }, (_, index) => ({
  id: `n${index + 1}`,
  kind: NOTIFICATION_KINDS[index % NOTIFICATION_KINDS.length] ?? 'system',
  title:
    index % 4 === 0
      ? 'Rok za PPP-PD ističe za 2 dana'
      : index % 4 === 1
        ? `Faktura 2026-${String(318 - index).padStart(6, '0')} je potpisana`
        : index % 4 === 2
          ? 'Kurs NBS-a je osvežen'
          : 'Ana Jovanović vas je pomenula u napomeni',
  body:
    index % 4 === 0
      ? 'Prijava za obračunski period 2026-03 mora biti predata do 05.04.2026.'
      : index % 4 === 1
        ? 'Dokument je prosleđen u SEF i čeka potvrdu prijema.'
        : index % 4 === 2
          ? 'Srednji kurs EUR: 117,2043'
          : 'Proveri stavku 3 na otpremnici, količina ne odgovara.',
  created_at: `2026-04-0${(index % 9) + 1}`,
  read: index % 3 !== 0,
}))

export const demoProvider = createInMemoryProvider({
  data: {
    clients: CLIENTS,
    branches: BRANCHES,
    employees: EMPLOYEES,
    documents: DOCUMENTS,
    fiscal_receipts: RECEIPTS,
    notifications: NOTIFICATIONS,
  },
  /* Malo kašnjenja da bi se videla stanja učitavanja. */
  delay: 250,
  procedures: {
    employee_summary: () => ({
      total: EMPLOYEES.length,
      active: EMPLOYEES.filter((employee) => employee.active).length,
    }),
  },
})
