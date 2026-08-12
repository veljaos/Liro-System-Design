import { CATEGORIES } from './registry'

/**
 * The list in the left sidebar.
 *
 * Groups follow the path a developer takes the first time: what is this ->
 * how is it wired in -> what is it built from -> what does it look like
 * finished. Categories are derived from the catalog, so adding a new
 * category drops it into the sidebar on its own.
 */

export interface SidebarItem {
  label: string
  href: string
}

export interface SidebarGroup {
  title: string
  items: SidebarItem[]
}

const GROUP_TITLES: Record<string, string> = {
  components: 'Komponente',
  blocks: 'Blokovi',
  charts: 'Grafikoni',
  examples: 'Primeri',
  marketing: 'Marketing',
  design: 'Dizajn sistem',
}

function categoryItems(group: string): SidebarItem[] {
  return CATEGORIES.filter((category) => category.group === group).map((category) => ({
    label: category.title,
    href: `/category/${category.slug}`,
  }))
}

export const SIDEBAR: SidebarGroup[] = [
  {
    title: 'Početak',
    items: [
      { label: 'Uvod', href: '/' },
      { label: 'Getting started', href: '/docs/getting-started' },
      { label: 'Navigation patterns', href: '/docs/navigation-patterns' },
      { label: 'Rules of the system', href: '/docs/agents' },
      { label: 'All documentation', href: '/docs' },
    ],
  },
  {
    /*
     * Written out rather than derived from `docsTree()`.
     *
     * `DocsShell` is a client component and cannot await a filesystem read.
     * Deriving it would mean passing the tree down from every page that uses the
     * shell. Four entries are not worth that; when the list grows past a dozen,
     * pass it as a prop.
     */
    title: 'Intents',
    items: [
      { label: 'Overview', href: '/docs/intents' },
      { label: 'Primary', href: '/docs/intents/primary' },
      { label: 'Verify', href: '/docs/intents/verify' },
      { label: 'Document', href: '/docs/intents/document' },
      { label: 'Positive', href: '/docs/intents/positive' },
      { label: 'Destructive', href: '/docs/intents/destructive' },
      { label: 'Caution', href: '/docs/intents/caution' },
      { label: 'Neutral', href: '/docs/intents/neutral' },
    ],
  },
  {
    title: 'Components',
    items: [
      { label: 'DataTable', href: '/docs/components/data-table' },
      { label: 'AutoForm', href: '/docs/components/auto-form' },
      { label: 'EditableGrid', href: '/docs/components/editable-grid' },
      { label: 'FormWizard', href: '/docs/components/form-wizard' },
      { label: 'SplitAction', href: '/docs/components/split-action' },
      { label: 'Business patterns', href: '/docs/components/business-patterns' },
      { label: 'Operations patterns', href: '/docs/components/operations-patterns' },
      { label: 'Displaying a person', href: '/docs/components/person' },
      { label: 'Messages', href: '/docs/components/messages' },
      { label: 'Charts', href: '/docs/components/charts' },
      { label: 'CapacityTimeline', href: '/docs/components/capacity-timeline' },
      { label: 'ProgressCard', href: '/docs/components/progress-card' },
      { label: 'ArticleCard', href: '/docs/components/article-card' },
      { label: 'TableOfContents', href: '/docs/components/table-of-contents' },
      { label: 'FileDropzone', href: '/docs/components/file-dropzone' },
      { label: 'Navigation and shortcuts', href: '/docs/components/navigation' },
      { label: 'Dates and periods', href: '/docs/components/dates' },
      { label: 'Application shell', href: '/docs/components/app-shell' },
      { label: 'Feedback and state', href: '/docs/components/feedback' },
    ],
  },
  {
    title: 'Reference',
    items: [
      { label: 'Architecture', href: '/docs/architecture' },
      { label: 'Component inventory', href: '/docs/component-inventory' },
    ],
  },
  ...Object.entries(GROUP_TITLES)
    .map(([group, title]) => ({ title, items: categoryItems(group) }))
    .filter((group) => group.items.length > 0),
]