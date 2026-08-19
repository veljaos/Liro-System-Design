/* GENERATED from packages/i18n/locales/*.json - do not edit by hand.
 *
 * Add a language by adding a file, then run `pnpm i18n:locales` - or
 * just `pnpm dev` or `pnpm build`, which run it first.
 */

import catalog_en from '../locales/en.json'
import catalog_sr_Latn from '../locales/sr-Latn.json'

export type CatalogValue = string | Partial<Record<string, string>>
export type Catalog = Record<string, CatalogValue>

/**
 * Locales this package ships.
 *
 * NOT the full set an application may use: `registerCatalog` accepts any
 * tag, so a customer can add their own without forking. That is why `Locale` is
 * open - see `format.ts`.
 */
export type BuiltInLocale =
  | 'en'
  | 'sr-Cyrl'
  | 'sr-Latn'

export const LOCALES: BuiltInLocale[] = [
  'en',
  'sr-Cyrl',
  'sr-Latn',
]

/*
 * The union of every key in `en.json`.
 *
 * This is what makes a typo fail `typecheck` rather than silently falling
 * back to English at runtime: a misspelled key is rejected at the declaration,
 * before it ever reaches `t()`.
 */
export type TranslationKey =
  | 'actions.intent.approve'
  | 'actions.intent.archive'
  | 'actions.intent.back'
  | 'actions.intent.cancel'
  | 'actions.intent.cancelDocument'
  | 'actions.intent.complete'
  | 'actions.intent.confirm'
  | 'actions.intent.create'
  | 'actions.intent.delete'
  | 'actions.intent.download'
  | 'actions.intent.duplicate'
  | 'actions.intent.edit'
  | 'actions.intent.excel'
  | 'actions.intent.filter'
  | 'actions.intent.import'
  | 'actions.intent.more'
  | 'actions.intent.next'
  | 'actions.intent.pdf'
  | 'actions.intent.post'
  | 'actions.intent.preview'
  | 'actions.intent.print'
  | 'actions.intent.refresh'
  | 'actions.intent.reject'
  | 'actions.intent.revert'
  | 'actions.intent.save'
  | 'actions.intent.send'
  | 'actions.intent.settings'
  | 'actions.intent.sign'
  | 'actions.intent.submit'
  | 'actions.intent.sync'
  | 'actions.intent.unlock'
  | 'actions.intent.verify'
  | 'actions.intent.view'
  | 'actions.intent.void'
  | 'actions.splitAction.moreActions'
  | 'auth.dangerZone.deleteAccount'
  | 'auth.dangerZone.description'
  | 'auth.dangerZone.title'
  | 'auth.login.email'
  | 'auth.login.forgotPassword'
  | 'auth.login.password'
  | 'auth.login.rememberMe'
  | 'auth.login.resendIn'
  | 'auth.login.sendNewCode'
  | 'auth.login.signIn'
  | 'auth.login.title'
  | 'auth.password.change'
  | 'auth.password.current'
  | 'auth.password.description'
  | 'auth.password.hint'
  | 'auth.password.minLength'
  | 'auth.password.mismatch'
  | 'auth.password.new'
  | 'auth.password.repeat'
  | 'auth.password.strength'
  | 'auth.password.title'
  | 'auth.preferences.denseTables'
  | 'auth.preferences.denseTablesHint'
  | 'auth.preferences.emailNotifications'
  | 'auth.preferences.emailNotificationsHint'
  | 'auth.preferences.language'
  | 'auth.preferences.theme'
  | 'auth.preferences.themeDark'
  | 'auth.preferences.themeLight'
  | 'auth.preferences.themeSystem'
  | 'auth.preferences.title'
  | 'auth.profile.changePhoto'
  | 'auth.profile.description'
  | 'auth.profile.emailChangeNote'
  | 'auth.profile.fullName'
  | 'auth.profile.jobTitle'
  | 'auth.profile.phone'
  | 'auth.profile.photoHint'
  | 'auth.profile.remove'
  | 'auth.profile.title'
  | 'auth.sessions.noOtherSessions'
  | 'auth.sessions.signOutDevice'
  | 'auth.sessions.signOutOthers'
  | 'auth.sessions.thisDevice'
  | 'auth.sessions.title'
  | 'auth.twoFactor.description'
  | 'auth.twoFactor.title'
  | 'auth.twoFactorCard.backupCodesLeft'
  | 'auth.twoFactorCard.description'
  | 'auth.twoFactorCard.disabledHint'
  | 'auth.twoFactorCard.enabledHint'
  | 'auth.twoFactorCard.generateNew'
  | 'auth.twoFactorCard.off'
  | 'auth.twoFactorCard.on'
  | 'auth.twoFactorCard.title'
  | 'auth.twoFactorCard.turnOff'
  | 'auth.twoFactorCard.turnOn'
  | 'charts.card.noData'
  | 'charts.heatmap.summary'
  | 'charts.targetBar.target'
  | 'data.bulk.clearSelection'
  | 'data.bulk.confirmCount'
  | 'data.bulk.confirmFallback'
  | 'data.bulk.confirmTitle.approve'
  | 'data.bulk.confirmTitle.cancelDocument'
  | 'data.bulk.confirmTitle.delete'
  | 'data.bulk.confirmTitle.post'
  | 'data.bulk.confirmTitle.reject'
  | 'data.bulk.confirmTitle.void'
  | 'data.bulk.selectAllCount'
  | 'data.bulk.selectedCount'
  | 'data.detailDrawer.close'
  | 'data.detailDrawer.next'
  | 'data.detailDrawer.previous'
  | 'data.editableGrid.addRow'
  | 'data.editableGrid.balanced'
  | 'data.editableGrid.deleteRow'
  | 'data.editableGrid.difference'
  | 'data.editableGrid.hint'
  | 'data.editableGrid.total'
  | 'data.jobProgress.cancel'
  | 'data.jobProgress.cancelled'
  | 'data.jobProgress.downloadResult'
  | 'data.jobProgress.elapsed'
  | 'data.jobProgress.failed'
  | 'data.jobProgress.itemsFailed'
  | 'data.jobProgress.queued'
  | 'data.jobProgress.retry'
  | 'data.jobProgress.running'
  | 'data.jobProgress.succeeded'
  | 'data.kanban.dragHint'
  | 'data.kanban.limitReached'
  | 'data.kanban.moveTo'
  | 'data.pagination.firstPageAria'
  | 'data.pagination.lastPageAria'
  | 'data.pagination.nextPageAria'
  | 'data.pagination.of'
  | 'data.pagination.pageAria'
  | 'data.pagination.perPage'
  | 'data.pagination.prevPageAria'
  | 'data.pagination.rowsPerPageAria'
  | 'data.pagination.showing'
  | 'data.permissionMatrix.lockedHint'
  | 'data.permissionMatrix.notApplicable'
  | 'data.permissionMatrix.permissionColumn'
  | 'data.progressCard.doneOfTotal'
  | 'data.progressCard.progress'
  | 'data.table.actions'
  | 'data.table.columnWidth'
  | 'data.table.delete'
  | 'data.table.edit'
  | 'data.table.selectAll'
  | 'data.table.selectRow'
  | 'dates.accountingPeriod.label'
  | 'dates.dueDate.dueInDays'
  | 'dates.dueDate.dueToday'
  | 'dates.dueDate.overdue'
  | 'dates.dueDate.overdueTooltip'
  | 'dates.dueDate.settled'
  | 'dates.period.last30'
  | 'dates.period.last90'
  | 'dates.period.lastMonth'
  | 'dates.period.lastQuarter'
  | 'dates.period.lastYear'
  | 'dates.period.thisMonth'
  | 'dates.period.thisQuarter'
  | 'dates.period.thisWeek'
  | 'dates.period.thisYear'
  | 'dates.period.today'
  | 'dates.period.yearToDate'
  | 'dates.period.yesterday'
  | 'dates.periodPicker.allPeriods'
  | 'dates.periodPicker.clear'
  | 'dates.periodPicker.customRange'
  | 'editor.textEditorLabel'
  | 'errors.already_exists'
  | 'errors.check_digit'
  | 'errors.forbidden_value'
  | 'errors.immutable'
  | 'errors.invalid'
  | 'errors.not_found'
  | 'errors.out_of_range'
  | 'errors.period_closed'
  | 'errors.reference_in_use'
  | 'errors.required'
  | 'errors.too_long'
  | 'errors.too_short'
  | 'feedback.achievement.earned'
  | 'feedback.achievement.level'
  | 'feedback.achievement.locked'
  | 'feedback.confirmModal.cancel'
  | 'feedback.confirmModal.confirm'
  | 'feedback.confirmModal.deleteConfirm'
  | 'feedback.confirmModal.deleteText'
  | 'feedback.confirmModal.deleteTitle'
  | 'feedback.conflictBanner.changesNotSaved'
  | 'feedback.conflictBanner.loadLatest'
  | 'feedback.conflictBanner.overwriteMine'
  | 'feedback.conflictBanner.title'
  | 'feedback.emptyState.empty.description'
  | 'feedback.emptyState.empty.title'
  | 'feedback.emptyState.error.description'
  | 'feedback.emptyState.error.title'
  | 'feedback.emptyState.noResults.description'
  | 'feedback.emptyState.noResults.title'
  | 'feedback.notice.deleted'
  | 'feedback.notice.failed'
  | 'feedback.notice.saved'
  | 'feedback.notice.undo'
  | 'feedback.recordStatus.approved'
  | 'feedback.recordStatus.archived'
  | 'feedback.recordStatus.cancelled'
  | 'feedback.recordStatus.draft'
  | 'feedback.recordStatus.error'
  | 'feedback.recordStatus.inReview'
  | 'feedback.recordStatus.locked'
  | 'feedback.recordStatus.overdue'
  | 'feedback.recordStatus.paid'
  | 'feedback.recordStatus.partiallyPaid'
  | 'feedback.recordStatus.pending'
  | 'feedback.recordStatus.posted'
  | 'feedback.recordStatus.rejected'
  | 'feedback.recordStatus.sent'
  | 'feedback.recordStatus.signed'
  | 'feedback.status.active'
  | 'feedback.status.inactive'
  | 'files.attachments.empty'
  | 'files.attachments.remove'
  | 'files.dropzone.accepted'
  | 'files.dropzone.idle'
  | 'files.dropzone.maxSize'
  | 'files.dropzone.noStorage'
  | 'files.dropzone.rejected'
  | 'files.dropzone.select'
  | 'files.dropzone.uploadProgress'
  | 'files.dropzone.uploadingCount'
  | 'forms.actions.cancel'
  | 'forms.actions.save'
  | 'forms.errors.conflict'
  | 'forms.errors.forbidden'
  | 'forms.errors.generic'
  | 'forms.errors.network'
  | 'forms.field.required'
  | 'forms.record.createTitle'
  | 'forms.record.editTitle'
  | 'forms.relation.loading'
  | 'forms.relation.noResults'
  | 'forms.relation.selectPreviousFirst'
  | 'forms.upload.chooseFile'
  | 'forms.upload.fileTooLarge'
  | 'forms.upload.notConfigured'
  | 'forms.upload.removeFile'
  | 'forms.wizard.back'
  | 'forms.wizard.discardConfirm'
  | 'forms.wizard.discardText'
  | 'forms.wizard.draftSaved'
  | 'forms.wizard.next'
  | 'forms.wizard.stay'
  | 'forms.wizard.unsavedChanges'
  | 'nav.commandPalette.actions'
  | 'nav.commandPalette.goTo'
  | 'nav.commandPalette.nothingFound'
  | 'nav.commandPalette.placeholder'
  | 'nav.launchpad.locked'
  | 'nav.locked.badge'
  | 'nav.moduleCard.lockedTooltip'
  | 'nav.toc.onThisPage'
  | 'patterns.approval.approved'
  | 'patterns.approval.delegated'
  | 'patterns.approval.pending'
  | 'patterns.approval.rejected'
  | 'patterns.approval.skipped'
  | 'patterns.approvalChain.missingReason'
  | 'patterns.approvalChain.requiresAll'
  | 'patterns.approvalChain.requiresOne'
  | 'patterns.capacityTimeline.day'
  | 'patterns.capacityTimeline.month'
  | 'patterns.capacityTimeline.overloadedResource'
  | 'patterns.capacityTimeline.progress'
  | 'patterns.capacityTimeline.today'
  | 'patterns.capacityTimeline.utilization'
  | 'patterns.capacityTimeline.week'
  | 'patterns.checklist.blocked'
  | 'patterns.checklist.blockingCheck'
  | 'patterns.checklist.checksPassed'
  | 'patterns.checklist.passing'
  | 'patterns.checklist.shareOfPassed'
  | 'patterns.gallery.noPhotos'
  | 'patterns.processMap.decision'
  | 'patterns.processMap.end'
  | 'patterns.processMap.start'
  | 'patterns.processMap.task'
  | 'patterns.rate.amountsIn'
  | 'patterns.slotPicker.confirmSlot'
  | 'patterns.slotPicker.free'
  | 'patterns.slotPicker.noSlots'
  | 'patterns.stepWizard.close'
  | 'patterns.stepWizard.finish'
  | 'patterns.stepWizard.next'
  | 'patterns.stepWizard.stepProgress'
  | 'patterns.stepWizard.working'
  | 'patterns.stockMovement.adjustment'
  | 'patterns.stockMovement.colBalance'
  | 'patterns.stockMovement.colDate'
  | 'patterns.stockMovement.colFromTo'
  | 'patterns.stockMovement.colQuantity'
  | 'patterns.stockMovement.colReference'
  | 'patterns.stockMovement.colType'
  | 'patterns.stockMovement.count'
  | 'patterns.stockMovement.currentBalance'
  | 'patterns.stockMovement.in'
  | 'patterns.stockMovement.ledgerLabel'
  | 'patterns.stockMovement.out'
  | 'patterns.stockMovement.transfer'
  | 'patterns.versionCompare.noDifferences'
  | 'patterns.versionCompare.showUnchanged'
  | 'pdf.picker.confirmPosition'
  | 'pdf.picker.hint'
  | 'pdf.picker.stamp'
  | 'pdf.preview.loadError'
  | 'pdf.preview.nextPage'
  | 'pdf.preview.previousPage'
  | 'pdf.preview.zoomIn'
  | 'pdf.preview.zoomOut'
  | 'schedule.kind.absence'
  | 'schedule.kind.completed'
  | 'schedule.kind.deadline'
  | 'schedule.kind.filing'
  | 'schedule.kind.payroll'
  | 'schedule.kind.reminder'
  | 'templates.landing.lastUpdated'
  | 'templates.recordForm.unsavedChanges'
  | 'templates.shell.logout'
  | 'templates.shell.menu'
  | 'templates.shell.notifications'
  | 'templates.shell.search'
  | 'templates.shell.userMenu'
  | 'templates.status.forbidden.description'
  | 'templates.status.forbidden.title'
  | 'templates.status.home'
  | 'templates.status.maintenance.description'
  | 'templates.status.maintenance.title'
  | 'templates.status.notFound.description'
  | 'templates.status.notFound.title'
  | 'templates.status.retry'
  | 'templates.status.serverError.description'
  | 'templates.status.serverError.title'
  | 'templates.status.suspended.description'
  | 'templates.status.suspended.title'
  | 'ui.colorScheme.toDark'
  | 'ui.colorScheme.toLight'
  | 'ui.localePicker.language'
  | 'ui.messages.noMessages'
  | 'ui.messages.send'
  | 'ui.pageHeader.back'
  | 'ui.personInfo.email'
  | 'ui.personInfo.phone'
  | 'ui.splitPanel.divider'
  | 'ui.toolbar.searchPlaceholder'
  | 'ui.writeMessage.placeholder'

/** Same set, for the O(1) runtime check in `resolveLabel` - is this string
 *  a catalog key, or a plain string to return as-is? */
export const TRANSLATION_KEYS: ReadonlySet<string> = new Set([
  'actions.intent.approve',
  'actions.intent.archive',
  'actions.intent.back',
  'actions.intent.cancel',
  'actions.intent.cancelDocument',
  'actions.intent.complete',
  'actions.intent.confirm',
  'actions.intent.create',
  'actions.intent.delete',
  'actions.intent.download',
  'actions.intent.duplicate',
  'actions.intent.edit',
  'actions.intent.excel',
  'actions.intent.filter',
  'actions.intent.import',
  'actions.intent.more',
  'actions.intent.next',
  'actions.intent.pdf',
  'actions.intent.post',
  'actions.intent.preview',
  'actions.intent.print',
  'actions.intent.refresh',
  'actions.intent.reject',
  'actions.intent.revert',
  'actions.intent.save',
  'actions.intent.send',
  'actions.intent.settings',
  'actions.intent.sign',
  'actions.intent.submit',
  'actions.intent.sync',
  'actions.intent.unlock',
  'actions.intent.verify',
  'actions.intent.view',
  'actions.intent.void',
  'actions.splitAction.moreActions',
  'auth.dangerZone.deleteAccount',
  'auth.dangerZone.description',
  'auth.dangerZone.title',
  'auth.login.email',
  'auth.login.forgotPassword',
  'auth.login.password',
  'auth.login.rememberMe',
  'auth.login.resendIn',
  'auth.login.sendNewCode',
  'auth.login.signIn',
  'auth.login.title',
  'auth.password.change',
  'auth.password.current',
  'auth.password.description',
  'auth.password.hint',
  'auth.password.minLength',
  'auth.password.mismatch',
  'auth.password.new',
  'auth.password.repeat',
  'auth.password.strength',
  'auth.password.title',
  'auth.preferences.denseTables',
  'auth.preferences.denseTablesHint',
  'auth.preferences.emailNotifications',
  'auth.preferences.emailNotificationsHint',
  'auth.preferences.language',
  'auth.preferences.theme',
  'auth.preferences.themeDark',
  'auth.preferences.themeLight',
  'auth.preferences.themeSystem',
  'auth.preferences.title',
  'auth.profile.changePhoto',
  'auth.profile.description',
  'auth.profile.emailChangeNote',
  'auth.profile.fullName',
  'auth.profile.jobTitle',
  'auth.profile.phone',
  'auth.profile.photoHint',
  'auth.profile.remove',
  'auth.profile.title',
  'auth.sessions.noOtherSessions',
  'auth.sessions.signOutDevice',
  'auth.sessions.signOutOthers',
  'auth.sessions.thisDevice',
  'auth.sessions.title',
  'auth.twoFactor.description',
  'auth.twoFactor.title',
  'auth.twoFactorCard.backupCodesLeft',
  'auth.twoFactorCard.description',
  'auth.twoFactorCard.disabledHint',
  'auth.twoFactorCard.enabledHint',
  'auth.twoFactorCard.generateNew',
  'auth.twoFactorCard.off',
  'auth.twoFactorCard.on',
  'auth.twoFactorCard.title',
  'auth.twoFactorCard.turnOff',
  'auth.twoFactorCard.turnOn',
  'charts.card.noData',
  'charts.heatmap.summary',
  'charts.targetBar.target',
  'data.bulk.clearSelection',
  'data.bulk.confirmCount',
  'data.bulk.confirmFallback',
  'data.bulk.confirmTitle.approve',
  'data.bulk.confirmTitle.cancelDocument',
  'data.bulk.confirmTitle.delete',
  'data.bulk.confirmTitle.post',
  'data.bulk.confirmTitle.reject',
  'data.bulk.confirmTitle.void',
  'data.bulk.selectAllCount',
  'data.bulk.selectedCount',
  'data.detailDrawer.close',
  'data.detailDrawer.next',
  'data.detailDrawer.previous',
  'data.editableGrid.addRow',
  'data.editableGrid.balanced',
  'data.editableGrid.deleteRow',
  'data.editableGrid.difference',
  'data.editableGrid.hint',
  'data.editableGrid.total',
  'data.jobProgress.cancel',
  'data.jobProgress.cancelled',
  'data.jobProgress.downloadResult',
  'data.jobProgress.elapsed',
  'data.jobProgress.failed',
  'data.jobProgress.itemsFailed',
  'data.jobProgress.queued',
  'data.jobProgress.retry',
  'data.jobProgress.running',
  'data.jobProgress.succeeded',
  'data.kanban.dragHint',
  'data.kanban.limitReached',
  'data.kanban.moveTo',
  'data.pagination.firstPageAria',
  'data.pagination.lastPageAria',
  'data.pagination.nextPageAria',
  'data.pagination.of',
  'data.pagination.pageAria',
  'data.pagination.perPage',
  'data.pagination.prevPageAria',
  'data.pagination.rowsPerPageAria',
  'data.pagination.showing',
  'data.permissionMatrix.lockedHint',
  'data.permissionMatrix.notApplicable',
  'data.permissionMatrix.permissionColumn',
  'data.progressCard.doneOfTotal',
  'data.progressCard.progress',
  'data.table.actions',
  'data.table.columnWidth',
  'data.table.delete',
  'data.table.edit',
  'data.table.selectAll',
  'data.table.selectRow',
  'dates.accountingPeriod.label',
  'dates.dueDate.dueInDays',
  'dates.dueDate.dueToday',
  'dates.dueDate.overdue',
  'dates.dueDate.overdueTooltip',
  'dates.dueDate.settled',
  'dates.period.last30',
  'dates.period.last90',
  'dates.period.lastMonth',
  'dates.period.lastQuarter',
  'dates.period.lastYear',
  'dates.period.thisMonth',
  'dates.period.thisQuarter',
  'dates.period.thisWeek',
  'dates.period.thisYear',
  'dates.period.today',
  'dates.period.yearToDate',
  'dates.period.yesterday',
  'dates.periodPicker.allPeriods',
  'dates.periodPicker.clear',
  'dates.periodPicker.customRange',
  'editor.textEditorLabel',
  'errors.already_exists',
  'errors.check_digit',
  'errors.forbidden_value',
  'errors.immutable',
  'errors.invalid',
  'errors.not_found',
  'errors.out_of_range',
  'errors.period_closed',
  'errors.reference_in_use',
  'errors.required',
  'errors.too_long',
  'errors.too_short',
  'feedback.achievement.earned',
  'feedback.achievement.level',
  'feedback.achievement.locked',
  'feedback.confirmModal.cancel',
  'feedback.confirmModal.confirm',
  'feedback.confirmModal.deleteConfirm',
  'feedback.confirmModal.deleteText',
  'feedback.confirmModal.deleteTitle',
  'feedback.conflictBanner.changesNotSaved',
  'feedback.conflictBanner.loadLatest',
  'feedback.conflictBanner.overwriteMine',
  'feedback.conflictBanner.title',
  'feedback.emptyState.empty.description',
  'feedback.emptyState.empty.title',
  'feedback.emptyState.error.description',
  'feedback.emptyState.error.title',
  'feedback.emptyState.noResults.description',
  'feedback.emptyState.noResults.title',
  'feedback.notice.deleted',
  'feedback.notice.failed',
  'feedback.notice.saved',
  'feedback.notice.undo',
  'feedback.recordStatus.approved',
  'feedback.recordStatus.archived',
  'feedback.recordStatus.cancelled',
  'feedback.recordStatus.draft',
  'feedback.recordStatus.error',
  'feedback.recordStatus.inReview',
  'feedback.recordStatus.locked',
  'feedback.recordStatus.overdue',
  'feedback.recordStatus.paid',
  'feedback.recordStatus.partiallyPaid',
  'feedback.recordStatus.pending',
  'feedback.recordStatus.posted',
  'feedback.recordStatus.rejected',
  'feedback.recordStatus.sent',
  'feedback.recordStatus.signed',
  'feedback.status.active',
  'feedback.status.inactive',
  'files.attachments.empty',
  'files.attachments.remove',
  'files.dropzone.accepted',
  'files.dropzone.idle',
  'files.dropzone.maxSize',
  'files.dropzone.noStorage',
  'files.dropzone.rejected',
  'files.dropzone.select',
  'files.dropzone.uploadProgress',
  'files.dropzone.uploadingCount',
  'forms.actions.cancel',
  'forms.actions.save',
  'forms.errors.conflict',
  'forms.errors.forbidden',
  'forms.errors.generic',
  'forms.errors.network',
  'forms.field.required',
  'forms.record.createTitle',
  'forms.record.editTitle',
  'forms.relation.loading',
  'forms.relation.noResults',
  'forms.relation.selectPreviousFirst',
  'forms.upload.chooseFile',
  'forms.upload.fileTooLarge',
  'forms.upload.notConfigured',
  'forms.upload.removeFile',
  'forms.wizard.back',
  'forms.wizard.discardConfirm',
  'forms.wizard.discardText',
  'forms.wizard.draftSaved',
  'forms.wizard.next',
  'forms.wizard.stay',
  'forms.wizard.unsavedChanges',
  'nav.commandPalette.actions',
  'nav.commandPalette.goTo',
  'nav.commandPalette.nothingFound',
  'nav.commandPalette.placeholder',
  'nav.launchpad.locked',
  'nav.locked.badge',
  'nav.moduleCard.lockedTooltip',
  'nav.toc.onThisPage',
  'patterns.approval.approved',
  'patterns.approval.delegated',
  'patterns.approval.pending',
  'patterns.approval.rejected',
  'patterns.approval.skipped',
  'patterns.approvalChain.missingReason',
  'patterns.approvalChain.requiresAll',
  'patterns.approvalChain.requiresOne',
  'patterns.capacityTimeline.day',
  'patterns.capacityTimeline.month',
  'patterns.capacityTimeline.overloadedResource',
  'patterns.capacityTimeline.progress',
  'patterns.capacityTimeline.today',
  'patterns.capacityTimeline.utilization',
  'patterns.capacityTimeline.week',
  'patterns.checklist.blocked',
  'patterns.checklist.blockingCheck',
  'patterns.checklist.checksPassed',
  'patterns.checklist.passing',
  'patterns.checklist.shareOfPassed',
  'patterns.gallery.noPhotos',
  'patterns.processMap.decision',
  'patterns.processMap.end',
  'patterns.processMap.start',
  'patterns.processMap.task',
  'patterns.rate.amountsIn',
  'patterns.slotPicker.confirmSlot',
  'patterns.slotPicker.free',
  'patterns.slotPicker.noSlots',
  'patterns.stepWizard.close',
  'patterns.stepWizard.finish',
  'patterns.stepWizard.next',
  'patterns.stepWizard.stepProgress',
  'patterns.stepWizard.working',
  'patterns.stockMovement.adjustment',
  'patterns.stockMovement.colBalance',
  'patterns.stockMovement.colDate',
  'patterns.stockMovement.colFromTo',
  'patterns.stockMovement.colQuantity',
  'patterns.stockMovement.colReference',
  'patterns.stockMovement.colType',
  'patterns.stockMovement.count',
  'patterns.stockMovement.currentBalance',
  'patterns.stockMovement.in',
  'patterns.stockMovement.ledgerLabel',
  'patterns.stockMovement.out',
  'patterns.stockMovement.transfer',
  'patterns.versionCompare.noDifferences',
  'patterns.versionCompare.showUnchanged',
  'pdf.picker.confirmPosition',
  'pdf.picker.hint',
  'pdf.picker.stamp',
  'pdf.preview.loadError',
  'pdf.preview.nextPage',
  'pdf.preview.previousPage',
  'pdf.preview.zoomIn',
  'pdf.preview.zoomOut',
  'schedule.kind.absence',
  'schedule.kind.completed',
  'schedule.kind.deadline',
  'schedule.kind.filing',
  'schedule.kind.payroll',
  'schedule.kind.reminder',
  'templates.landing.lastUpdated',
  'templates.recordForm.unsavedChanges',
  'templates.shell.logout',
  'templates.shell.menu',
  'templates.shell.notifications',
  'templates.shell.search',
  'templates.shell.userMenu',
  'templates.status.forbidden.description',
  'templates.status.forbidden.title',
  'templates.status.home',
  'templates.status.maintenance.description',
  'templates.status.maintenance.title',
  'templates.status.notFound.description',
  'templates.status.notFound.title',
  'templates.status.retry',
  'templates.status.serverError.description',
  'templates.status.serverError.title',
  'templates.status.suspended.description',
  'templates.status.suspended.title',
  'ui.colorScheme.toDark',
  'ui.colorScheme.toLight',
  'ui.localePicker.language',
  'ui.messages.noMessages',
  'ui.messages.send',
  'ui.pageHeader.back',
  'ui.personInfo.email',
  'ui.personInfo.phone',
  'ui.splitPanel.divider',
  'ui.toolbar.searchPlaceholder',
  'ui.writeMessage.placeholder',
])

/** Catalogs available without a fetch: the source locale and the default one. */
export const STATIC_CATALOGS: Record<string, Catalog> = {
  'en': catalog_en as Catalog,
  'sr-Latn': catalog_sr_Latn as Catalog,
}

/**
 * The rest, as chunks.
 *
 * The bundler splits each `import()` into its own file, so a user
 * downloads the one language they selected and nothing else.
 */
export const CATALOG_LOADERS: Record<string, () => Promise<Catalog>> = {
  'sr-Cyrl': () => import('../locales/sr-Cyrl.json').then((m) => m.default as Catalog),
}

/**
 * dayjs locale registration, per locale.
 *
 * Mantine's date components read day and month names from dayjs, and dayjs knows
 * only what has been imported. Loaded alongside the catalog, because a calendar
 * in the wrong language is as wrong as a button in the wrong language.
 */
export const DAYJS_LOADERS: Record<string, () => Promise<void>> = {
  'en': () => import('dayjs/locale/en.js').then(() => undefined),
  'sr-Cyrl': () => import('dayjs/locale/sr-cyrl.js').then(() => undefined),
  'sr-Latn': () => import('dayjs/locale/sr.js').then(() => undefined),
}
