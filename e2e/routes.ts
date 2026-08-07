/**
 * Rute koje se proveravaju.
 *
 * Namerno ispisane, a ne otkrivene u toku testa: Playwright mora znati spisak
 * pre pokretanja da bi napravio zaseban test po ruti. Jedan test za pedeset
 * ruta znaci da sve mora stati u jedan timeout — i da prva spora ruta obori
 * proveru svih ostalih.
 *
 * Da spisak ne bi zastario, poslednji test u `catalog.spec.ts` poredi ga sa
 * navigacijom i pada kada se doda kategorija koja ovde nedostaje.
 */

export const CATEGORY_SLUGS = [
  'actions', 'app-screens', 'badges', 'booking', 'business-patterns', 'buttons',
  'capacity', 'carousels', 'charts', 'charts-advanced', 'colors', 'content-blocks',
  'data-display', 'dates', 'feedback', 'form-inputs', 'help', 'hierarchy', 'icons',
  'inputs', 'messages', 'navigation', 'overlays', 'people', 'pricing', 'process', 'scales',
  'schedule', 'signing', 'stats', 'status-screens', 'stock', 'summary-blocks',
  'tables', 'versions',
]

const INTRO = ['/', '/uvod/instalacija', '/uvod/navigacija', '/uvod/pravila']

const EXAMPLES = [
  '/examples/dashboard',
  '/examples/client-form',
  '/examples/document-generator',
  '/examples/employee-new',
  '/examples/journal-entry',
  '/examples/mass-processing',
  '/examples/report-run',
  '/examples/roles',
  '/examples/server-page',
  '/examples/table-large',
  '/examples/documents',
  '/examples/employees',
  '/examples/fiscal-receipts',
  '/examples/launchpad',
  '/examples/notifications',
  '/examples/status',
  '/examples/login',
  '/account',
  '/application',
  '/application/invoice',
]

export const ROUTES = [...INTRO, ...CATEGORY_SLUGS.map((slug) => `/category/${slug}`), ...EXAMPLES]