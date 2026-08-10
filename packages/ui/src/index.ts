// Application identity
export {
  LiroAppProvider,
  useLiroApp,
  useLiroAppOptional,
  useCan,
  useNavigation,
  type AppUser,
  type LiroAppConfig,
  type LiroAppProviderProps,
  type NavItem,
} from './app/LiroAppProvider'

// Actions
export {
  ActionButton,
  ActionGroup,
  intentColor,
  intentIcon,
  intentLabel,
  type ActionButtonProps,
  type ActionGroupProps,
} from './actions/ActionButton'

export {
  SplitAction,
  type SplitActionItem,
  type SplitActionProps,
} from './actions/SplitAction'

// Keyboard
export { ShortcutHint, type ShortcutHintProps } from './keyboard/ShortcutHint'
export { useShortcuts, STANDARD_SHORTCUTS, type Shortcut } from './keyboard/useShortcuts'

// Content
export { Callout, type CalloutProps } from './content/Callout'
export {
  CommentThread,
  AuditTrail,
  type CommentThreadProps,
  type CommentItem,
  type CommentAuthor,
  type AuditTrailProps,
  type AuditEntry,
} from './content/CommentThread'

// Login and account
export { LoginForm, TwoFactorForm, type LoginFormProps, type TwoFactorFormProps } from './auth/LoginForm'
export {
  ProfileCard,
  PasswordChangeCard,
  TwoFactorCard,
  SessionsCard,
  PreferencesCard,
  DangerZoneCard,
  type ProfileCardProps,
  type ProfileValues,
  type PasswordChangeCardProps,
  type TwoFactorCardProps,
  type SessionsCardProps,
  type SessionInfo,
  type PreferencesCardProps,
  type PreferencesValues,
  type DangerZoneCardProps,
} from './auth/AccountSettings'

// Brand
export { BrandMark, type BrandMarkProps } from './brand/BrandMark'

// Layout
export { PageHeader, type PageHeaderProps } from './layout/PageHeader'
export { SectionCard, type SectionCardProps } from './layout/SectionCard'
export { Toolbar, type ToolbarProps } from './layout/Toolbar'
export { AuthShell, type AuthShellProps } from './layout/AuthShell'
/* PageContainer has no state - it lives in the shared layer and is re-exported from there. */
export { PageContainer, type PageContainerProps, type PageWidth } from './primitives/PageContainer'
export { PersonAvatar, initials, type PersonAvatarProps } from './primitives/PersonAvatar'
export { PersonCell, type PersonCellProps } from './primitives/PersonCell'

// Feedback
export { StatusBadge, ActiveStatusBadge, type StatusBadgeProps, type StatusTone } from './feedback/StatusBadge'
export { RecordStatusBadge, recordStatusLabel, type RecordStatusBadgeProps } from './feedback/RecordStatusBadge'
export { EmptyState, type EmptyStateProps, type EmptyStateVariant } from './feedback/EmptyState'
export {
  ConfirmModal,
  DeleteConfirmModal,
  type ConfirmModalProps,
  type DeleteConfirmModalProps,
} from './feedback/ConfirmModal'
export { notice, commonNotice, undoNotice, type NoticeKind, type NoticeOptions, type UndoNoticeOptions } from './feedback/notice'
export { ConflictBanner, type ConflictBannerProps, type ConflictField } from './feedback/ConflictBanner'
export { StatusScreen, type StatusScreenProps, type StatusScreenAction } from './feedback/StatusScreen'

// Data
export { StatCard, StatGrid, type StatCardProps, type StatGridProps, type StatItem } from './data/StatCard'
export {
  DataTable,
  type DataTableProps,
  type DataTableFooter,
  type MobileCardConfig,
  type DataTableColumn,
  type RowAction,
  type SortState,
  type ColumnType,
} from './data/DataTable'
export { TablePagination, type TablePaginationProps } from './data/TablePagination'
export { BulkActionBar, type BulkActionBarProps, type BulkAction } from './data/BulkActionBar'
export { JobProgress, type JobProgressProps, type JobState, type JobPhase } from './data/JobProgress'
export { toMinor, fromMinor } from './data/money'
export { srPlural } from './text/plural'
export {
  PermissionMatrix,
  type PermissionMatrixProps,
  type PermissionGroup,
  type PermissionItem,
  type RoleColumn,
} from './data/PermissionMatrix'
export {
  EditableGrid,
  type EditableGridProps,
  type EditableColumn,
  type EditableColumnType,
  type BalanceConfig,
} from './data/EditableGrid'
export { KeyValueList, type KeyValueListProps, type KeyValueItem } from './data/KeyValueList'
export { ProgressCard, type ProgressCardProps } from './data/ProgressCard'

// Navigation
export {
  CommandPalette,
  openCommandPalette,
  type CommandPaletteProps,
  type CommandAction,
} from './navigation/CommandPalette'
export {
  ModuleCard,
  ModuleGrid,
  type ModuleCardProps,
  type ModuleGridProps,
  type ModuleItem,
  type ModuleTier,
} from './navigation/ModuleGrid'

// Controls
export { ColorSchemeToggle, type ColorSchemeToggleProps } from './controls/ColorSchemeToggle'

// Display
export { LiroCarousel, LiroCarouselSlide, type LiroCarouselProps } from './display/LiroCarousel'

// Messages
export {
  MessageBubble,
  MessageList,
  MessageComposer,
  MessageThread,
  type Message,
  type MessageAuthor,
  type MessageStatus,
  type MessageBubbleProps,
  type MessageListProps,
  type MessageComposerProps,
  type MessageThreadProps,
} from './messaging/Messages'

// Business domain patterns
export {
  WorkflowStatus,
  ApprovalChain,
  Checklist,
  ScoreMeter,
  type WorkflowStatusProps,
  type WorkflowStep,
  type WorkflowStepState,
  type ApprovalChainProps,
  type ApprovalEntry,
  type ApprovalDecision,
  type ChecklistProps,
  type CheckGroup,
  type CheckItem,
  type CheckOutcome,
  type ScoreMeterProps,
  type ScoreBand,
} from './patterns/BusinessPatterns'

export {
  StockLedger,
  RateTable,
  SlotPicker,
  ItemGallery,
  ProcessMap,
  type StockLedgerProps,
  type StockMovement,
  type MovementKind,
  type RateTableProps,
  type RateRow,
  type RateColumn,
  type SlotPickerProps,
  type SlotDay,
  type TimeSlot,
  type ItemGalleryProps,
  type GalleryImage,
  type ProcessMapProps,
  type ProcessNode,
  type ProcessEdge,
  type ProcessNodeKind,
} from './patterns/OperationsPatterns'

export {
  StructureTree,
  VersionCompare,
  type StructureTreeProps,
  type StructureNode,
  type VersionCompareProps,
  type FieldChange,
  type ChangeKind,
} from './patterns/StructurePatterns'

export {
  CapacityTimeline,
  type CapacityTimelineProps,
  type CapacityRow,
  type CapacityBar,
  type TimeScale,
} from './patterns/CapacityTimeline'

export { Launchpad, type LaunchpadProps, type LaunchpadTile } from './navigation/Launchpad'

export {
  StepWizard,
  type StepWizardProps,
  type WizardStep,
  type WizardOutcome,
} from './patterns/StepWizard'

export {
  CardSelect,
  CardMultiSelect,
  type CardSelectProps,
  type CardMultiSelectProps,
  type CardOption,
} from './actions/CardSelect'

export { PersonInfo, type PersonInfoProps } from './people/PersonInfo'
export { PersonCard, type PersonCardProps, type PersonCardStat } from './people/PersonCard'

export { TableOfContents, type TableOfContentsProps, type TocItem } from './navigation/TableOfContents'

export { ArticleCard, type ArticleCardProps } from './primitives/ArticleCard'