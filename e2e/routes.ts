/**
 * Routes that are checked.
 *
 * Deliberately written out, not discovered during the test run: Playwright
 * must know the list before starting in order to make a separate test per
 * route. One test for fifty routes would mean everything has to fit in a
 * single timeout — and the first slow route would fail the check for all
 * the others.
 *
 * So the list does not go stale, the last test in `catalog.spec.ts` compares
 * it against the navigation and fails when a category is added that is
 * missing here.
 */

export const CATEGORY_SLUGS = [
  'actions', 'app-screens', 'badges', 'booking', 'business-patterns', 'buttons',
  'capacity', 'carousels', 'charts', 'charts-advanced', 'colors', 'content-blocks',
  'data-display', 'dates', 'feedback', 'form-inputs', 'help', 'hierarchy', 'icons',
  'inputs', 'messages', 'navigation', 'overlays', 'people', 'pricing', 'process', 'scales',
  'schedule', 'signing', 'stats', 'status-screens', 'stock', 'summary-blocks',
  'tables', 'versions',
]

const INTRO = ['/']

/*
 * Documentation pages rendered from markdown.
 * 
 * Written out for the same reason as the categories: Playwright needs the list
 * before it starts. When a markdown file is added, add it here.
 */
const DOCS = [
   '/docs',
   '/docs/agents',
   '/docs/architecture',
   '/docs/getting-started',
   '/docs/navigation-patterns',
   '/docs/intents',
   '/docs/intents/primary',
   '/docs/intents/verify',
   '/docs/intents/destructive',
   '/docs/intents/neutral',
   '/docs/intents/document',
   '/docs/intents/positive',
   '/docs/intents/caution',
   '/docs/component-inventory',
   '/docs/components/data-table',
   '/docs/components/auto-form',
   '/docs/components/business-patterns',
   '/docs/components/person',
   '/docs/components/operations-patterns',
   '/docs/components/messages',
   '/docs/components/editable-grid',
   '/docs/components/form-wizard',
   '/docs/components/split-action',
   '/docs/components/progress-card',
   '/docs/components/capacity-timeline',
   '/docs/components/article-card',
   '/docs/components/charts',
   '/docs/components/table-of-contents',
   '/docs/components/file-dropzone',
   '/docs/components/navigation',
   '/docs/components/dates',
   '/docs/components/app-shell',
   '/docs/components/feedback',
   '/docs/components/resizing',
   '/docs/components/detail-drawer',
   '/docs/components/kanban-board',
   '/docs/components/achievements',
]

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

export const ROUTES = [...INTRO, ...DOCS, ...CATEGORY_SLUGS.map((slug) => `/category/${slug}`), ...EXAMPLES]