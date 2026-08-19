/* GENERATED from packages/i18n/locales/*.json - do not edit by hand.
 *
 * Add a language by adding a file. Run `pnpm i18n:locales`, or just `pnpm dev`
 * or `pnpm build`, which run it first.
 */

export type Locale =
  | 'en'
  | 'sr-Cyrl'
  | 'sr-Latn'

export const LOCALES: Locale[] = [
  'en',
  'sr-Cyrl',
  'sr-Latn',
]

/*
 * The union of every key in `en.json`.
 *
 * This is what makes a typo in a translation key fail `typecheck` rather than
 * silently falling back to English at runtime: declare the constant as
 * `const X: TranslationKey = 'data.table.clearSelection'` and a misspelled key
 * is rejected at the declaration, before it ever reaches `t()`.
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

/** Same set, for the `O(1)` runtime check in `resolveLabel` - is this string a
 *  catalog key, or a plain string that should be returned as-is? */
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

/**
 * The catalog content itself, embedded at build time rather than read with a
 * JSON import - keeps `format.ts` free of a `resolveJsonModule` dependency and
 * matches how `Locale` itself is generated here.
 *
 * A value is either a plain string, or - for a key whose translation depends on
 * a count (`data.bulk.selectedCount`, ...) - an object keyed by CLDR plural
 * category (`one` / `few` / `many` / `other`, ...). See `resolveLabel`.
 */
export const CATALOGS: Record<Locale, Record<string, string | Partial<Record<string, string>>>> = {
  'en': {
    "errors.required": "This field is required.",
    "errors.invalid": "This value is not valid.",
    "errors.too_short": "At least {min} characters.",
    "errors.too_long": "At most {max} characters.",
    "errors.out_of_range": "Must be between {min} and {max}.",
    "errors.already_exists": "{value} already exists.",
    "errors.not_found": "Record not found.",
    "errors.immutable": "This field cannot be changed once posted.",
    "errors.forbidden_value": "This value is not allowed for your role.",
    "errors.check_digit": "The check digit does not match.",
    "errors.period_closed": "The accounting period is closed.",
    "errors.reference_in_use": "This record is referenced elsewhere and cannot be deleted.",
    "editor.textEditorLabel": "Text editor",
    "data.table.edit": "Edit",
    "data.table.delete": "Delete",
    "charts.card.noData": "No data for the selected period.",
    "charts.targetBar.target": "Target",
    "charts.heatmap.summary": "{total}, peak {peak} in a single day",
    "schedule.kind.deadline": "Statutory deadline",
    "schedule.kind.payroll": "Payroll run",
    "schedule.kind.filing": "Filing",
    "schedule.kind.completed": "Completed",
    "schedule.kind.absence": "Absence",
    "schedule.kind.reminder": "Reminder",
    "files.dropzone.idle": "Drag files here or click to browse",
    "files.dropzone.accepted": "Drop the files",
    "files.dropzone.rejected": "File rejected — check type and size",
    "files.dropzone.noStorage": "File uploads are not configured — <LiroFileStorageProvider> is missing.",
    "files.dropzone.select": "Select files",
    "files.dropzone.maxSize": "Up to {size} MB per file",
    "files.dropzone.uploadingCount": "Uploading {done} of {total}",
    "files.dropzone.uploadProgress": "Upload progress",
    "files.attachments.empty": "No attachments",
    "files.attachments.remove": "Remove attachment",
    "pdf.preview.loadError": "The PDF could not be loaded for preview.",
    "pdf.preview.previousPage": "Previous page",
    "pdf.preview.nextPage": "Next page",
    "pdf.preview.zoomOut": "Zoom out",
    "pdf.preview.zoomIn": "Zoom in",
    "pdf.picker.hint": "Drag the frame where the stamp should go, then confirm.",
    "pdf.picker.stamp": "Stamp",
    "pdf.picker.confirmPosition": "Confirm position",
    "templates.shell.search": "Search…",
    "templates.shell.notifications": "Notifications",
    "templates.shell.logout": "Log out",
    "templates.shell.menu": "Menu",
    "templates.shell.userMenu": "User menu",
    "templates.landing.lastUpdated": "Last updated",
    "templates.recordForm.unsavedChanges": "Unsaved changes",
    "templates.status.home": "Back to home",
    "templates.status.retry": "Try again",
    "templates.status.notFound.title": "Page not found",
    "templates.status.notFound.description": "Check the address, or return to the home page.",
    "templates.status.serverError.title": "Server error",
    "templates.status.serverError.description": "The problem is on our side and we are working on it. Please try again shortly.",
    "templates.status.forbidden.title": "Access denied",
    "templates.status.forbidden.description": "You are not authorised to view this content.",
    "templates.status.maintenance.title": "System unavailable",
    "templates.status.maintenance.description": "We are improving the system. Thank you for your patience.",
    "templates.status.suspended.title": "Account locked",
    "templates.status.suspended.description": "Your access has been suspended. Contact support for more information.",
    "dates.period.today": "Today",
    "dates.period.yesterday": "Yesterday",
    "dates.period.thisWeek": "This week",
    "dates.period.thisMonth": "This month",
    "dates.period.lastMonth": "Last month",
    "dates.period.thisQuarter": "This quarter",
    "dates.period.lastQuarter": "Last quarter",
    "dates.period.thisYear": "This year",
    "dates.period.lastYear": "Last year",
    "dates.period.last30": "Last 30 days",
    "dates.period.last90": "Last 90 days",
    "dates.period.yearToDate": "Year to date",
    "dates.dueDate.overdue": "Overdue",
    "dates.dueDate.dueToday": "Due today",
    "dates.dueDate.settled": "Settled",
    "dates.dueDate.overdueTooltip": {
      "one": "{overdue} day overdue · due {date}",
      "other": "{overdue} days overdue · due {date}"
    },
    "dates.dueDate.dueInDays": {
      "one": "In {days} day",
      "other": "In {days} days"
    },
    "dates.periodPicker.allPeriods": "All periods",
    "dates.periodPicker.customRange": "Custom range",
    "dates.periodPicker.clear": "Clear",
    "dates.accountingPeriod.label": "Accounting period",
    "forms.field.required": "This field is required",
    "forms.actions.save": "Save",
    "forms.actions.cancel": "Cancel",
    "forms.record.editTitle": "Edit record",
    "forms.record.createTitle": "New record",
    "forms.wizard.back": "Back",
    "forms.wizard.next": "Next",
    "forms.wizard.draftSaved": "Draft saved",
    "forms.wizard.unsavedChanges": "Unsaved changes",
    "forms.wizard.discardText": "You have unsaved data. Leaving now will discard it.",
    "forms.wizard.discardConfirm": "Discard and leave",
    "forms.wizard.stay": "Stay",
    "forms.errors.conflict": "Someone else changed this record in the meantime. Refresh and try again — your changes were not saved.",
    "forms.errors.forbidden": "You do not have permission to change this record.",
    "forms.errors.network": "Could not reach the server. Nothing was saved.",
    "forms.errors.generic": "Saving failed.",
    "forms.relation.selectPreviousFirst": "Select the previous field first",
    "forms.relation.loading": "Loading…",
    "forms.relation.noResults": "No results",
    "forms.upload.notConfigured": "File uploads are not configured for this application.",
    "forms.upload.fileTooLarge": "The file exceeds the {limit} MB limit.",
    "forms.upload.removeFile": "Remove file",
    "forms.upload.chooseFile": "Choose a file",
    "nav.toc.onThisPage": "On this page",
    "ui.toolbar.searchPlaceholder": "Search…",
    "ui.splitPanel.divider": "Panel divider",
    "ui.pageHeader.back": "Back",
    "ui.localePicker.language": "Language",
    "ui.writeMessage.placeholder": "Write a message…",
    "actions.splitAction.moreActions": "More actions",
    "ui.messages.noMessages": "No messages yet.",
    "ui.messages.send": "Send",
    "data.pagination.showing": "Showing",
    "data.pagination.of": "of",
    "data.pagination.perPage": "per page",
    "data.pagination.rowsPerPageAria": "Rows per page",
    "data.pagination.pageAria": "Page",
    "data.pagination.firstPageAria": "First page",
    "data.pagination.prevPageAria": "Previous page",
    "data.pagination.nextPageAria": "Next page",
    "data.pagination.lastPageAria": "Last page",
    "data.editableGrid.addRow": "Add row",
    "data.editableGrid.deleteRow": "Delete row",
    "data.editableGrid.total": "Total",
    "data.editableGrid.balanced": "Entry is balanced",
    "data.editableGrid.difference": "Difference",
    "data.editableGrid.hint": "Enter — next row · Shift+Enter — previous · Enter on last row adds one",
    "patterns.capacityTimeline.day": "Day",
    "patterns.capacityTimeline.week": "Week",
    "patterns.capacityTimeline.month": "Month",
    "patterns.capacityTimeline.today": "today",
    "patterns.capacityTimeline.overloadedResource": "Overloaded",
    "patterns.capacityTimeline.utilization": "Utilisation",
    "patterns.capacityTimeline.progress": "Progress",
    "feedback.notice.saved": "Saved",
    "feedback.notice.deleted": "Deleted",
    "feedback.notice.failed": "The action failed",
    "feedback.notice.undo": "Undo",
    "data.jobProgress.queued": "Queued",
    "data.jobProgress.running": "Running",
    "data.jobProgress.succeeded": "Completed",
    "data.jobProgress.failed": "Failed",
    "data.jobProgress.cancelled": "Cancelled",
    "data.jobProgress.cancel": "Cancel",
    "data.jobProgress.retry": "Retry",
    "data.jobProgress.downloadResult": "Download result",
    "data.jobProgress.elapsed": "Elapsed",
    "data.jobProgress.itemsFailed": "Failed",
    "feedback.recordStatus.draft": "Draft",
    "feedback.recordStatus.pending": "Pending",
    "feedback.recordStatus.inReview": "In review",
    "feedback.recordStatus.approved": "Approved",
    "feedback.recordStatus.posted": "Posted",
    "feedback.recordStatus.signed": "Signed",
    "feedback.recordStatus.sent": "Sent",
    "feedback.recordStatus.paid": "Paid",
    "feedback.recordStatus.partiallyPaid": "Partially paid",
    "feedback.recordStatus.overdue": "Overdue",
    "feedback.recordStatus.rejected": "Rejected",
    "feedback.recordStatus.cancelled": "Cancelled",
    "feedback.recordStatus.archived": "Archived",
    "feedback.recordStatus.locked": "Locked",
    "feedback.recordStatus.error": "Error",
    "data.bulk.selectedCount": {
      "one": "{count} item selected",
      "other": "{count} items selected"
    },
    "data.bulk.selectAllCount": "Select all {count}",
    "data.bulk.confirmCount": {
      "one": "This will be applied to {count} item. Continue?",
      "other": "This will be applied to {count} items. Continue?"
    },
    "data.bulk.clearSelection": "Clear selection",
    "data.bulk.confirmTitle.delete": "Delete",
    "data.bulk.confirmTitle.post": "Post",
    "data.bulk.confirmTitle.approve": "Approve",
    "data.bulk.confirmTitle.reject": "Reject",
    "data.bulk.confirmTitle.void": "Void",
    "data.bulk.confirmTitle.cancelDocument": "Cancel",
    "data.bulk.confirmFallback": "Confirm",
    "auth.login.title": "Sign in",
    "auth.login.email": "Email",
    "auth.login.password": "Password",
    "auth.login.rememberMe": "Remember me",
    "auth.login.forgotPassword": "Forgot password?",
    "auth.login.signIn": "Sign in",
    "auth.twoFactor.title": "Two-factor verification",
    "auth.twoFactor.description": "Enter the code from your authenticator app.",
    "auth.login.resendIn": "New code in {seconds}s",
    "auth.login.sendNewCode": "Send a new code",
    "patterns.approval.pending": "Awaiting decision",
    "patterns.approval.approved": "Approved",
    "patterns.approval.rejected": "Rejected",
    "patterns.approval.delegated": "Delegated",
    "patterns.approval.skipped": "Skipped",
    "patterns.checklist.checksPassed": "checks passed",
    "patterns.checklist.blocked": "Blocked",
    "patterns.checklist.passing": "Passing",
    "patterns.checklist.shareOfPassed": "Share of passed checks",
    "patterns.approvalChain.requiresAll": "All approvals are required.",
    "patterns.approvalChain.requiresOne": "A single approval is enough.",
    "patterns.approvalChain.missingReason": "Decision reason is missing.",
    "patterns.checklist.blockingCheck": "Blocking check",
    "patterns.stepWizard.close": "Close",
    "patterns.stockMovement.in": "Receipt",
    "patterns.stockMovement.out": "Issue",
    "patterns.stockMovement.transfer": "Transfer",
    "patterns.stockMovement.adjustment": "Adjustment",
    "patterns.stockMovement.count": "Stock count",
    "patterns.stockMovement.ledgerLabel": "Stock movement ledger",
    "patterns.stockMovement.currentBalance": "Current balance",
    "patterns.stockMovement.colType": "Type",
    "patterns.stockMovement.colDate": "Date",
    "patterns.stockMovement.colReference": "Reference",
    "patterns.stockMovement.colFromTo": "From → to",
    "patterns.stockMovement.colQuantity": "Quantity",
    "patterns.stockMovement.colBalance": "Balance",
    "patterns.rate.amountsIn": "Amounts in",
    "patterns.slotPicker.noSlots": "No free slots",
    "patterns.slotPicker.free": "free",
    "patterns.slotPicker.confirmSlot": "Confirm slot",
    "patterns.gallery.noPhotos": "No photos",
    "patterns.processMap.start": "Start",
    "patterns.processMap.task": "Task",
    "patterns.processMap.decision": "Decision",
    "patterns.processMap.end": "End",
    "actions.intent.create": "New",
    "actions.intent.save": "Save",
    "actions.intent.submit": "Submit",
    "actions.intent.confirm": "Confirm",
    "actions.intent.next": "Next",
    "actions.intent.verify": "Verify",
    "actions.intent.sign": "Sign",
    "actions.intent.send": "Send",
    "actions.intent.sync": "Sync",
    "actions.intent.pdf": "PDF",
    "actions.intent.print": "Print",
    "actions.intent.preview": "Preview",
    "actions.intent.download": "Download",
    "actions.intent.approve": "Approve",
    "actions.intent.post": "Post",
    "actions.intent.excel": "Excel",
    "actions.intent.complete": "Complete",
    "actions.intent.delete": "Delete",
    "actions.intent.reject": "Reject",
    "actions.intent.cancelDocument": "Reverse",
    "actions.intent.unlock": "Unlock",
    "actions.intent.revert": "Revert",
    "actions.intent.void": "Void",
    "actions.intent.edit": "Edit",
    "actions.intent.view": "View",
    "actions.intent.filter": "Filters",
    "actions.intent.refresh": "Refresh",
    "actions.intent.back": "Back",
    "actions.intent.cancel": "Cancel",
    "actions.intent.duplicate": "Duplicate",
    "actions.intent.import": "Import",
    "actions.intent.archive": "Archive",
    "actions.intent.settings": "Settings",
    "actions.intent.more": "More",
    "auth.profile.title": "Profile",
    "auth.profile.description": "What other people in your organisation see.",
    "auth.profile.changePhoto": "Change photo",
    "auth.profile.remove": "Remove",
    "auth.profile.photoHint": "PNG or JPG, up to 2 MB",
    "auth.profile.fullName": "Full name",
    "auth.profile.jobTitle": "Job title",
    "auth.profile.phone": "Phone",
    "auth.profile.emailChangeNote": "Changing the email address requires confirmation at the new one.",
    "auth.password.title": "Password",
    "auth.password.description": "Changing the password signs out other devices.",
    "auth.password.current": "Current password",
    "auth.password.new": "New password",
    "auth.password.minLength": "At least {min} characters",
    "auth.password.strength": "Password strength",
    "auth.password.hint": "Length beats complexity. Four random words beat Password1!.",
    "auth.password.repeat": "Repeat new password",
    "auth.password.mismatch": "Passwords do not match",
    "auth.password.change": "Change password",
    "auth.twoFactorCard.title": "Two-factor authentication",
    "auth.twoFactorCard.description": "An extra code when signing in from a new device.",
    "auth.twoFactorCard.on": "On",
    "auth.twoFactorCard.off": "Off",
    "auth.twoFactorCard.enabledHint": "Signing in from an unknown device will ask for a code from your authenticator app.",
    "auth.twoFactorCard.disabledHint": "Recommended for accounts that access payroll and tax data.",
    "auth.twoFactorCard.backupCodesLeft": "Backup codes left: {count}",
    "auth.twoFactorCard.generateNew": "Generate new",
    "auth.twoFactorCard.turnOff": "Turn off two-factor",
    "auth.twoFactorCard.turnOn": "Turn on",
    "auth.sessions.title": "Active sessions",
    "auth.sessions.signOutOthers": "Sign out others",
    "auth.sessions.thisDevice": "This device",
    "auth.sessions.signOutDevice": "Sign out device",
    "auth.sessions.noOtherSessions": "No other sessions",
    "auth.preferences.title": "Preferences",
    "auth.preferences.language": "Language",
    "auth.preferences.theme": "Theme",
    "auth.preferences.themeLight": "Light",
    "auth.preferences.themeDark": "Dark",
    "auth.preferences.themeSystem": "System",
    "auth.preferences.denseTables": "Dense tables",
    "auth.preferences.denseTablesHint": "More rows per screen. Useful when you work with lists all day.",
    "auth.preferences.emailNotifications": "Email notifications",
    "auth.preferences.emailNotificationsHint": "Deadlines, rejected filings and assigned tasks.",
    "auth.dangerZone.title": "Delete account",
    "auth.dangerZone.description": "The account and personal data are removed permanently. Accounting records are retained by law.",
    "auth.dangerZone.deleteAccount": "Delete account",
    "ui.personInfo.email": "Email:",
    "ui.personInfo.phone": "Phone:",
    "patterns.versionCompare.showUnchanged": "Show {hidden} unchanged",
    "patterns.versionCompare.noDifferences": "No differences between versions.",
    "nav.locked.badge": "UNAVAILABLE",
    "nav.moduleCard.lockedTooltip": "This module is not part of your plan.",
    "nav.launchpad.locked": "You do not have access to this module.",
    "feedback.status.active": "Active",
    "feedback.status.inactive": "Inactive",
    "data.progressCard.progress": "Progress",
    "data.progressCard.doneOfTotal": "{done} of {total}",
    "ui.colorScheme.toDark": "Switch to dark theme",
    "ui.colorScheme.toLight": "Switch to light theme",
    "data.table.columnWidth": "Column width",
    "data.table.actions": "Actions",
    "data.table.selectAll": "Select all",
    "data.table.selectRow": "Select row",
    "data.kanban.moveTo": "Move to",
    "data.kanban.dragHint": "Drag, or open the menu to move",
    "data.kanban.limitReached": "Limit reached",
    "data.detailDrawer.close": "Close",
    "data.detailDrawer.previous": "Previous record",
    "data.detailDrawer.next": "Next record",
    "data.permissionMatrix.lockedHint": "System role — permissions cannot be changed",
    "data.permissionMatrix.notApplicable": "Not applicable",
    "data.permissionMatrix.permissionColumn": "Permission",
    "feedback.achievement.locked": "Locked",
    "feedback.achievement.earned": "Earned",
    "feedback.achievement.level": "level",
    "feedback.confirmModal.cancel": "Cancel",
    "feedback.confirmModal.confirm": "Confirm",
    "feedback.confirmModal.deleteTitle": "Delete record",
    "feedback.confirmModal.deleteText": "This deletes the record permanently. It cannot be restored.",
    "feedback.confirmModal.deleteConfirm": "Delete",
    "feedback.conflictBanner.title": "This record changed while you were editing",
    "feedback.conflictBanner.changesNotSaved": "Your changes were not saved.",
    "feedback.conflictBanner.loadLatest": "Load latest",
    "feedback.conflictBanner.overwriteMine": "Overwrite with mine",
    "patterns.stepWizard.stepProgress": "Step progress",
    "patterns.stepWizard.working": "Working…",
    "patterns.stepWizard.finish": "Finish",
    "patterns.stepWizard.next": "Next",
    "nav.commandPalette.goTo": "Go to",
    "nav.commandPalette.actions": "Actions",
    "nav.commandPalette.placeholder": "Search screens and actions…",
    "nav.commandPalette.nothingFound": "Nothing found",
    "feedback.emptyState.empty.title": "Nothing here yet",
    "feedback.emptyState.empty.description": "Records you add will show up here.",
    "feedback.emptyState.noResults.title": "No results",
    "feedback.emptyState.noResults.description": "Change the search term or remove a filter.",
    "feedback.emptyState.error.title": "Could not load",
    "feedback.emptyState.error.description": "Try again. If it keeps happening, contact support."
  },
  'sr-Cyrl': {
    "errors.required": "Обавезно поље.",
    "errors.invalid": "Вредност није исправна.",
    "errors.too_short": "Најмање {min} знакова.",
    "errors.too_long": "Највише {max} знакова.",
    "errors.out_of_range": "Вредност мора бити између {min} и {max}.",
    "errors.already_exists": "Вредност {value} већ постоји.",
    "errors.not_found": "Запис није нађен.",
    "errors.immutable": "Поље се не може мењати након књижења.",
    "errors.forbidden_value": "Вредност није дозвољена за ову улогу.",
    "errors.check_digit": "Контролна цифра се не поклапа.",
    "errors.period_closed": "Обрачунски период је затворен.",
    "errors.reference_in_use": "Запис се користи на другом месту и не може се обрисати.",
    "editor.textEditorLabel": "Уређивач текста",
    "data.table.edit": "Измени",
    "data.table.delete": "Обриши",
    "charts.card.noData": "За изабрани период нема података.",
    "charts.targetBar.target": "Циљ",
    "charts.heatmap.summary": "{total}, највише {peak} у једном дану",
    "schedule.kind.deadline": "Законски рок",
    "schedule.kind.payroll": "Обрачун",
    "schedule.kind.filing": "Предаја и овера",
    "schedule.kind.completed": "Завршено",
    "schedule.kind.absence": "Одсуства и празници",
    "schedule.kind.reminder": "Подсетник",
    "files.dropzone.idle": "Превуците фајлове овде или кликните да изаберете",
    "files.dropzone.accepted": "Пустите фајлове",
    "files.dropzone.rejected": "Фајл није прихваћен — проверите тип и величину",
    "files.dropzone.noStorage": "Отпремање фајлова није подешено — недостаје <LiroFileStorageProvider>.",
    "files.dropzone.select": "Изабери фајлове",
    "files.dropzone.maxSize": "Највише {size} MB по фајлу",
    "files.dropzone.uploadingCount": "Отпремање {done} од {total}",
    "files.dropzone.uploadProgress": "Напредак отпремања",
    "files.attachments.empty": "Нема прилога",
    "files.attachments.remove": "Уклони прилог",
    "pdf.preview.loadError": "Није могуће учитати PDF за преглед.",
    "pdf.preview.previousPage": "Претходна страна",
    "pdf.preview.nextPage": "Следећа страна",
    "pdf.preview.zoomOut": "Умањи",
    "pdf.preview.zoomIn": "Увећај",
    "pdf.picker.hint": "Превуците оквир на место где желите печат, па потврдите.",
    "pdf.picker.stamp": "Печат",
    "pdf.picker.confirmPosition": "Потврди позицију",
    "templates.shell.search": "Претрага…",
    "templates.shell.notifications": "Обавештења",
    "templates.shell.logout": "Одјава",
    "templates.shell.menu": "Мени",
    "templates.shell.userMenu": "Кориснички мени",
    "templates.landing.lastUpdated": "Последња измена",
    "templates.recordForm.unsavedChanges": "Несачуване измене",
    "templates.status.home": "Назад на почетну",
    "templates.status.retry": "Покушај поново",
    "templates.status.notFound.title": "Страница није пронађена",
    "templates.status.notFound.description": "Проверите да ли је адреса тачно унета или се вратите на почетну страницу.",
    "templates.status.serverError.title": "Дошло је до грешке на серверу",
    "templates.status.serverError.description": "Проблем је до нас и радимо на решавању. Молимо Вас да покушате мало касније.",
    "templates.status.forbidden.title": "Приступ је одбијен",
    "templates.status.forbidden.description": "Немате овлашћења за преглед овог садржаја.",
    "templates.status.maintenance.title": "Систем је тренутно недоступан",
    "templates.status.maintenance.description": "Радимо на унапређењу система. Хвала Вам на стрпљењу.",
    "templates.status.suspended.title": "Налог је привремено закључан",
    "templates.status.suspended.description": "Приступ Вам је обустављен. За више информација можете контактирати подршку.",
    "dates.period.today": "Данас",
    "dates.period.yesterday": "Јуче",
    "dates.period.thisWeek": "Ова недеља",
    "dates.period.thisMonth": "Овај месец",
    "dates.period.lastMonth": "Прошли месец",
    "dates.period.thisQuarter": "Овај квартал",
    "dates.period.lastQuarter": "Прошли квартал",
    "dates.period.thisYear": "Ова година",
    "dates.period.lastYear": "Прошла година",
    "dates.period.last30": "Последњих 30 дана",
    "dates.period.last90": "Последњих 90 дана",
    "dates.period.yearToDate": "Од почетка године",
    "dates.dueDate.overdue": "У доцњи",
    "dates.dueDate.dueToday": "Доспева данас",
    "dates.dueDate.settled": "Измирено",
    "dates.dueDate.overdueTooltip": "{overdue} дана доцње · рок {date}",
    "dates.dueDate.dueInDays": "За {days} дана",
    "dates.periodPicker.allPeriods": "Сви периоди",
    "dates.periodPicker.customRange": "Произвољан опсег",
    "dates.periodPicker.clear": "Поништи",
    "dates.accountingPeriod.label": "Обрачунски период",
    "forms.field.required": "Поље је обавезно",
    "forms.actions.save": "Сачувај",
    "forms.actions.cancel": "Одустани",
    "forms.record.editTitle": "Измена податка",
    "forms.record.createTitle": "Нов унос",
    "forms.wizard.back": "Назад",
    "forms.wizard.next": "Даље",
    "forms.wizard.draftSaved": "Нацрт сачуван",
    "forms.wizard.unsavedChanges": "Несачуване измене",
    "forms.wizard.discardText": "Унели сте податке који нису сачувани. Ако изађете, биће изгубљени.",
    "forms.wizard.discardConfirm": "Изађи без чувања",
    "forms.wizard.stay": "Остани",
    "forms.errors.conflict": "Запис је у међувремену изменио неко други. Освежите страницу и покушајте поново.",
    "forms.errors.forbidden": "Немате право да измените овај запис.",
    "forms.errors.network": "Веза са сервером није успостављена. Подаци нису сачувани.",
    "forms.errors.generic": "Чување није успело.",
    "forms.relation.selectPreviousFirst": "Прво изаберите претходно поље",
    "forms.relation.loading": "Учитавање…",
    "forms.relation.noResults": "Нема резултата",
    "forms.upload.notConfigured": "Отпремање фајлова није подешено за ову апликацију.",
    "forms.upload.fileTooLarge": "Фајл је већи од дозвољених {limit} MB.",
    "forms.upload.removeFile": "Уклони фајл",
    "forms.upload.chooseFile": "Изаберите фајл",
    "nav.toc.onThisPage": "На овој страници",
    "ui.toolbar.searchPlaceholder": "Претрага…",
    "ui.splitPanel.divider": "Подела панела",
    "ui.pageHeader.back": "Назад",
    "ui.localePicker.language": "Језик",
    "ui.writeMessage.placeholder": "Напишите поруку…",
    "actions.splitAction.moreActions": "Још радњи",
    "ui.messages.noMessages": "Још нема порука.",
    "ui.messages.send": "Пошаљи",
    "data.pagination.showing": "Приказано",
    "data.pagination.of": "од",
    "data.pagination.perPage": "по страни",
    "data.pagination.rowsPerPageAria": "Број редова по страни",
    "data.pagination.pageAria": "Страна",
    "data.pagination.firstPageAria": "Прва страна",
    "data.pagination.prevPageAria": "Претходна страна",
    "data.pagination.nextPageAria": "Следећа страна",
    "data.pagination.lastPageAria": "Последња страна",
    "data.editableGrid.addRow": "Додај ред",
    "data.editableGrid.deleteRow": "Обриши ред",
    "data.editableGrid.total": "Укупно",
    "data.editableGrid.balanced": "Налог је у равнотежи",
    "data.editableGrid.difference": "Разлика",
    "data.editableGrid.hint": "Enter — следећи ред · Shift+Enter — претходни · Enter у последњем реду прави нови",
    "patterns.capacityTimeline.progress": "Напредак",
    "feedback.notice.saved": "Сачувано",
    "feedback.notice.deleted": "Обрисано",
    "feedback.notice.failed": "Радња није успела",
    "feedback.notice.undo": "Поништи",
    "data.jobProgress.queued": "У реду за обраду",
    "data.jobProgress.running": "Обрада у току",
    "data.jobProgress.succeeded": "Завршено",
    "data.jobProgress.failed": "Није успело",
    "data.jobProgress.cancelled": "Отказано",
    "data.jobProgress.cancel": "Прекини",
    "data.jobProgress.retry": "Покушај поново",
    "data.jobProgress.downloadResult": "Преузми резултат",
    "data.jobProgress.elapsed": "Протекло",
    "data.jobProgress.itemsFailed": "Неуспело",
    "feedback.recordStatus.draft": "Нацрт",
    "feedback.recordStatus.pending": "На чекању",
    "feedback.recordStatus.inReview": "У прегледу",
    "feedback.recordStatus.approved": "Одобрено",
    "feedback.recordStatus.posted": "Прокњижено",
    "feedback.recordStatus.signed": "Потписано",
    "feedback.recordStatus.sent": "Послато",
    "feedback.recordStatus.paid": "Плаћено",
    "feedback.recordStatus.partiallyPaid": "Делимично плаћено",
    "feedback.recordStatus.overdue": "Доспело",
    "feedback.recordStatus.rejected": "Одбијено",
    "feedback.recordStatus.cancelled": "Сторнирано",
    "feedback.recordStatus.archived": "Архивирано",
    "feedback.recordStatus.locked": "Закључано",
    "feedback.recordStatus.error": "Грешка",
    "data.bulk.selectedCount": {
      "one": "{count} ставка изабрана",
      "few": "{count} ставке изабране",
      "other": "{count} ставки изабрано"
    },
    "data.bulk.selectAllCount": "Изабери свих {count}",
    "data.bulk.confirmCount": {
      "one": "Радња ће се применити на {count} ставку. Наставити?",
      "few": "Радња ће се применити на {count} ставке. Наставити?",
      "other": "Радња ће се применити на {count} ставки. Наставити?"
    },
    "data.bulk.clearSelection": "Поништи избор",
    "data.bulk.confirmTitle.delete": "Брисање",
    "data.bulk.confirmTitle.post": "Књижење",
    "data.bulk.confirmTitle.approve": "Одобравање",
    "data.bulk.confirmTitle.reject": "Одбијање",
    "data.bulk.confirmTitle.void": "Сторнирање",
    "data.bulk.confirmTitle.cancelDocument": "Отказивање",
    "data.bulk.confirmFallback": "Потврда",
    "auth.login.title": "Пријава на систем",
    "auth.login.email": "Електронска пошта",
    "auth.login.password": "Лозинка",
    "auth.login.rememberMe": "Запамти ме",
    "auth.login.forgotPassword": "Заборављена лозинка?",
    "auth.login.signIn": "Пријави се",
    "auth.twoFactor.title": "Потврда у два корака",
    "auth.twoFactor.description": "Унесите код из апликације за потврду идентитета.",
    "auth.login.resendIn": "Нови код за {seconds}s",
    "auth.login.sendNewCode": "Пошаљи нови код",
    "patterns.approval.pending": "Чека одлуку",
    "patterns.approval.approved": "Одобрено",
    "patterns.approval.rejected": "Одбијено",
    "patterns.approval.delegated": "Прослеђено",
    "patterns.approval.skipped": "Прескочено",
    "patterns.checklist.blocked": "Блокирано",
    "patterns.checklist.passing": "Пролази",
    "patterns.checklist.shareOfPassed": "Удео прошлих провера",
    "patterns.stockMovement.in": "Улаз",
    "patterns.stockMovement.out": "Излаз",
    "patterns.stockMovement.transfer": "Пренос",
    "patterns.stockMovement.adjustment": "Исправка",
    "patterns.stockMovement.count": "Попис",
    "patterns.stockMovement.ledgerLabel": "Картица кретања стања",
    "patterns.slotPicker.noSlots": "Нема слободних термина",
    "patterns.gallery.noPhotos": "Нема фотографија",
    "actions.intent.create": "Ново",
    "actions.intent.save": "Сачувај",
    "actions.intent.submit": "Пошаљи",
    "actions.intent.confirm": "Потврди",
    "actions.intent.next": "Даље",
    "actions.intent.verify": "Овери",
    "actions.intent.sign": "Потпиши",
    "actions.intent.send": "Пошаљи",
    "actions.intent.sync": "Синхронизуј",
    "actions.intent.pdf": "ПДФ",
    "actions.intent.print": "Штампа",
    "actions.intent.preview": "Преглед",
    "actions.intent.download": "Преузми",
    "actions.intent.approve": "Одобри",
    "actions.intent.post": "Прокњижи",
    "actions.intent.excel": "Excel",
    "actions.intent.complete": "Заврши",
    "actions.intent.delete": "Обриши",
    "actions.intent.reject": "Одбиј",
    "actions.intent.cancelDocument": "Сторнирај",
    "actions.intent.unlock": "Откључај",
    "actions.intent.revert": "Врати",
    "actions.intent.void": "Поништи",
    "actions.intent.edit": "Измени",
    "actions.intent.view": "Прикажи",
    "actions.intent.filter": "Филтери",
    "actions.intent.refresh": "Освежи",
    "actions.intent.back": "Назад",
    "actions.intent.cancel": "Одустани",
    "actions.intent.duplicate": "Копирај",
    "actions.intent.import": "Увези",
    "actions.intent.archive": "Архивирај",
    "actions.intent.settings": "Подешавања",
    "actions.intent.more": "Више",
    "auth.profile.photoHint": "PNG или JPG, највише 2 MB",
    "auth.profile.fullName": "Име и презиме",
    "auth.profile.jobTitle": "Радно место",
    "auth.profile.phone": "Телефон",
    "auth.profile.emailChangeNote": "Промена адресе електронске поште иде кроз потврду на новој адреси.",
    "auth.password.current": "Тренутна лозинка",
    "auth.password.new": "Нова лозинка",
    "auth.password.minLength": "Најмање {min} знакова",
    "auth.password.strength": "Јачина лозинке",
    "auth.password.hint": "Дужа лозинка је јача од компликоване.",
    "auth.password.repeat": "Поновите нову лозинку",
    "auth.password.mismatch": "Лозинке се не поклапају",
    "auth.twoFactorCard.on": "Укључено",
    "auth.twoFactorCard.off": "Искључено",
    "auth.twoFactorCard.enabledHint": "При пријави са непознатог уређаја тражиће се код из апликације.",
    "auth.twoFactorCard.disabledHint": "Препоручено за налоге који приступају подацима о зарадама.",
    "auth.twoFactorCard.backupCodesLeft": "Резервних кодова: {count}",
    "auth.sessions.thisDevice": "Овај уређај",
    "auth.sessions.noOtherSessions": "Нема других пријава",
    "auth.preferences.language": "Језик",
    "auth.preferences.theme": "Тема",
    "auth.preferences.themeLight": "Светла",
    "auth.preferences.themeDark": "Тамна",
    "auth.preferences.themeSystem": "Системска",
    "auth.preferences.denseTables": "Густе табеле",
    "auth.preferences.denseTablesHint": "Више редова на екрану, мањи размак.",
    "auth.preferences.emailNotifications": "Обавештења мејлом",
    "auth.preferences.emailNotificationsHint": "Рокови, одбијене пријаве и додељени задаци.",
    "ui.personInfo.email": "Електронска пошта:",
    "ui.personInfo.phone": "Телефон:",
    "nav.locked.badge": "НЕДОСТУПНО",
    "nav.moduleCard.lockedTooltip": "Овај модул није укључен у ваш пакет.",
    "nav.launchpad.locked": "Немате право приступа овом модулу.",
    "feedback.status.active": "Активан",
    "feedback.status.inactive": "Неактиван",
    "data.progressCard.progress": "Напредак",
    "data.progressCard.doneOfTotal": "{done} од {total}",
    "ui.colorScheme.toDark": "Укључи тамну тему",
    "ui.colorScheme.toLight": "Укључи светлу тему",
    "data.table.columnWidth": "Ширина колоне",
    "data.table.actions": "Радње",
    "data.table.selectAll": "Изабери све",
    "data.table.selectRow": "Изабери ред",
    "data.kanban.moveTo": "Премести у",
    "data.kanban.dragHint": "Превуци или отвори мени за премештање",
    "data.kanban.limitReached": "Достигнуто ограничење",
    "data.detailDrawer.close": "Затвори",
    "data.detailDrawer.previous": "Претходни запис",
    "data.detailDrawer.next": "Следећи запис",
    "data.permissionMatrix.lockedHint": "Системска улога — дозволе се не могу мењати",
    "data.permissionMatrix.notApplicable": "Не односи се",
    "data.permissionMatrix.permissionColumn": "Дозвола",
    "feedback.achievement.locked": "Закључано",
    "feedback.achievement.earned": "Освојено",
    "feedback.achievement.level": "ниво",
    "feedback.confirmModal.cancel": "Одустани",
    "feedback.confirmModal.confirm": "Потврди",
    "feedback.confirmModal.deleteTitle": "Брисање податка",
    "feedback.confirmModal.deleteText": "Податак се брише трајно и не може се вратити.",
    "feedback.confirmModal.deleteConfirm": "Обриши",
    "feedback.conflictBanner.title": "Запис је измењен док сте уносили",
    "feedback.conflictBanner.changesNotSaved": "Ваше измене нису сачуване.",
    "patterns.stepWizard.stepProgress": "Напредак корака",
    "patterns.stepWizard.working": "Обрада у току…",
    "nav.commandPalette.goTo": "Иди на",
    "nav.commandPalette.actions": "Радње",
    "nav.commandPalette.placeholder": "Претражи екране и радње…",
    "nav.commandPalette.nothingFound": "Нема резултата",
    "feedback.emptyState.empty.title": "Нема података",
    "feedback.emptyState.empty.description": "Подаци које унесете појавиће се на овом месту.",
    "feedback.emptyState.noResults.title": "Нема резултата",
    "feedback.emptyState.noResults.description": "Промените појам претраге или уклоните неки филтер.",
    "feedback.emptyState.error.title": "Учитавање није успело",
    "feedback.emptyState.error.description": "Покушајте поново. Ако се понови, обратите се подршци."
  },
  'sr-Latn': {
    "errors.required": "Obavezno polje.",
    "errors.invalid": "Vrednost nije ispravna.",
    "errors.too_short": "Najmanje {min} znakova.",
    "errors.too_long": "Najviše {max} znakova.",
    "errors.out_of_range": "Vrednost mora biti između {min} i {max}.",
    "errors.already_exists": "Vrednost {value} već postoji.",
    "errors.not_found": "Zapis nije nađen.",
    "errors.immutable": "Polje se ne može menjati nakon knjiženja.",
    "errors.forbidden_value": "Vrednost nije dozvoljena za ovu ulogu.",
    "errors.check_digit": "Kontrolna cifra se ne poklapa.",
    "errors.period_closed": "Obračunski period je zatvoren.",
    "errors.reference_in_use": "Zapis se koristi na drugom mestu i ne može se obrisati.",
    "editor.textEditorLabel": "Uređivač teksta",
    "data.table.edit": "Izmeni",
    "data.table.delete": "Obriši",
    "charts.card.noData": "Za izabrani period nema podataka.",
    "charts.targetBar.target": "Cilj",
    "charts.heatmap.summary": "{total}, najviše {peak} u jednom danu",
    "schedule.kind.deadline": "Zakonski rok",
    "schedule.kind.payroll": "Obračun",
    "schedule.kind.filing": "Predaja i overa",
    "schedule.kind.completed": "Završeno",
    "schedule.kind.absence": "Odsustvo i praznici",
    "schedule.kind.reminder": "Podsetnik",
    "files.dropzone.idle": "Prevucite fajlove ovde ili kliknite da izaberete",
    "files.dropzone.accepted": "Pustite fajlove",
    "files.dropzone.rejected": "Fajl nije prihvaćen — proverite tip i veličinu",
    "files.dropzone.noStorage": "Otpremanje fajlova nije podešeno — nedostaje <LiroFileStorageProvider>.",
    "files.dropzone.select": "Izaberi fajlove",
    "files.dropzone.maxSize": "Najviše {size} MB po fajlu",
    "files.dropzone.uploadingCount": "Otpremanje {done} od {total}",
    "files.dropzone.uploadProgress": "Napredak otpremanja",
    "files.attachments.empty": "Nema priloga",
    "files.attachments.remove": "Ukloni prilog",
    "pdf.preview.loadError": "Nije moguće učitati PDF za pregled.",
    "pdf.preview.previousPage": "Prethodna strana",
    "pdf.preview.nextPage": "Sledeća strana",
    "pdf.preview.zoomOut": "Umanji",
    "pdf.preview.zoomIn": "Uvećaj",
    "pdf.picker.hint": "Prevucite okvir na mesto gde želite pečat, pa potvrdite.",
    "pdf.picker.stamp": "Pečat",
    "pdf.picker.confirmPosition": "Potvrdi poziciju",
    "templates.shell.search": "Pretraga…",
    "templates.shell.notifications": "Obaveštenja",
    "templates.shell.logout": "Odjava",
    "templates.shell.menu": "Meni",
    "templates.shell.userMenu": "Korisnički meni",
    "templates.landing.lastUpdated": "Poslednja izmena",
    "templates.recordForm.unsavedChanges": "Nesačuvane izmene",
    "templates.status.home": "Nazad na početnu",
    "templates.status.retry": "Pokušaj ponovo",
    "templates.status.notFound.title": "Stranica nije pronađena",
    "templates.status.notFound.description": "Proverite da li je adresa tačno uneta ili se vratite na početnu stranicu.",
    "templates.status.serverError.title": "Došlo je do greške na serveru",
    "templates.status.serverError.description": "Problem je do nas i radimo na rešavanju. Molimo Vas da pokušate malo kasnije.",
    "templates.status.forbidden.title": "Pristup je odbijen",
    "templates.status.forbidden.description": "Nemate ovlašćenja za pregled ovog sadržaja.",
    "templates.status.maintenance.title": "Sistem je trenutno nedostupan",
    "templates.status.maintenance.description": "Radimo na unapređenju sistema. Hvala Vam na strpljenju.",
    "templates.status.suspended.title": "Nalog je privremeno zaključan",
    "templates.status.suspended.description": "Pristup Vam je obustavljen. Za više informacija možete kontaktirati podršku.",
    "dates.period.today": "Danas",
    "dates.period.yesterday": "Juče",
    "dates.period.thisWeek": "Ova nedelja",
    "dates.period.thisMonth": "Ovaj mesec",
    "dates.period.lastMonth": "Prošli mesec",
    "dates.period.thisQuarter": "Ovaj kvartal",
    "dates.period.lastQuarter": "Prošli kvartal",
    "dates.period.thisYear": "Ova godina",
    "dates.period.lastYear": "Prošla godina",
    "dates.period.last30": "Poslednjih 30 dana",
    "dates.period.last90": "Poslednjih 90 dana",
    "dates.period.yearToDate": "Od početka godine",
    "dates.dueDate.overdue": "U docnji",
    "dates.dueDate.dueToday": "Dospeva danas",
    "dates.dueDate.settled": "Izmireno",
    "dates.dueDate.overdueTooltip": {
      "one": "{overdue} dan docnje · rok {date}",
      "few": "{overdue} dana docnje · rok {date}",
      "other": "{overdue} dana docnje · rok {date}"
    },
    "dates.dueDate.dueInDays": {
      "one": "Za {days} dan",
      "few": "Za {days} dana",
      "other": "Za {days} dana"
    },
    "dates.periodPicker.allPeriods": "Svi periodi",
    "dates.periodPicker.customRange": "Proizvoljan opseg",
    "dates.periodPicker.clear": "Poništi",
    "dates.accountingPeriod.label": "Obračunski period",
    "forms.field.required": "Polje je obavezno",
    "forms.actions.save": "Sačuvaj",
    "forms.actions.cancel": "Odustani",
    "forms.record.editTitle": "Izmena podatka",
    "forms.record.createTitle": "Novi unos",
    "forms.wizard.back": "Nazad",
    "forms.wizard.next": "Dalje",
    "forms.wizard.draftSaved": "Nacrt sačuvan",
    "forms.wizard.unsavedChanges": "Nesačuvane izmene",
    "forms.wizard.discardText": "Uneli ste podatke koji nisu sačuvani. Ako izađete, biće izgubljeni.",
    "forms.wizard.discardConfirm": "Izađi bez čuvanja",
    "forms.wizard.stay": "Ostani",
    "forms.errors.conflict": "Zapis je u međuvremenu izmenio neko drugi. Osvežite stranicu i pokušajte ponovo — vaše izmene nisu sačuvane.",
    "forms.errors.forbidden": "Nemate pravo da izmenite ovaj zapis.",
    "forms.errors.network": "Veza sa serverom nije uspostavljena. Podaci nisu sačuvani.",
    "forms.errors.generic": "Čuvanje nije uspelo.",
    "forms.relation.selectPreviousFirst": "Prvo izaberite prethodno polje",
    "forms.relation.loading": "Učitavanje…",
    "forms.relation.noResults": "Nema rezultata",
    "forms.upload.notConfigured": "Otpremanje fajlova nije podešeno za ovu aplikaciju.",
    "forms.upload.fileTooLarge": "Fajl je veći od dozvoljenih {limit} MB.",
    "forms.upload.removeFile": "Ukloni fajl",
    "forms.upload.chooseFile": "Izaberite fajl",
    "nav.toc.onThisPage": "Na ovoj stranici",
    "ui.toolbar.searchPlaceholder": "Pretraga…",
    "ui.splitPanel.divider": "Podela panela",
    "ui.pageHeader.back": "Nazad",
    "ui.localePicker.language": "Jezik",
    "ui.writeMessage.placeholder": "Napišite poruku…",
    "actions.splitAction.moreActions": "Još radnji",
    "ui.messages.noMessages": "Još nema poruka.",
    "ui.messages.send": "Pošalji",
    "data.pagination.showing": "Prikazano",
    "data.pagination.of": "od",
    "data.pagination.perPage": "po strani",
    "data.pagination.rowsPerPageAria": "Broj redova po strani",
    "data.pagination.pageAria": "Strana",
    "data.pagination.firstPageAria": "Prva strana",
    "data.pagination.prevPageAria": "Prethodna strana",
    "data.pagination.nextPageAria": "Sledeća strana",
    "data.pagination.lastPageAria": "Poslednja strana",
    "data.editableGrid.addRow": "Dodaj red",
    "data.editableGrid.deleteRow": "Obriši red",
    "data.editableGrid.total": "Ukupno",
    "data.editableGrid.balanced": "Nalog je u ravnoteži",
    "data.editableGrid.difference": "Razlika",
    "data.editableGrid.hint": "Enter — sledeći red · Shift+Enter — prethodni · Enter u poslednjem redu pravi novi",
    "patterns.capacityTimeline.day": "Dan",
    "patterns.capacityTimeline.week": "Nedelja",
    "patterns.capacityTimeline.month": "Mesec",
    "patterns.capacityTimeline.today": "danas",
    "patterns.capacityTimeline.overloadedResource": "Preopterećen resurs",
    "patterns.capacityTimeline.utilization": "Iskorišćenost",
    "patterns.capacityTimeline.progress": "Napredak",
    "feedback.notice.saved": "Sačuvano",
    "feedback.notice.deleted": "Obrisano",
    "feedback.notice.failed": "Radnja nije uspela",
    "feedback.notice.undo": "Poništi",
    "data.jobProgress.queued": "U redu za obradu",
    "data.jobProgress.running": "Obrada u toku",
    "data.jobProgress.succeeded": "Završeno",
    "data.jobProgress.failed": "Nije uspelo",
    "data.jobProgress.cancelled": "Otkazano",
    "data.jobProgress.cancel": "Prekini",
    "data.jobProgress.retry": "Pokušaj ponovo",
    "data.jobProgress.downloadResult": "Preuzmi rezultat",
    "data.jobProgress.elapsed": "Proteklo",
    "data.jobProgress.itemsFailed": "Neuspelo",
    "feedback.recordStatus.draft": "Nacrt",
    "feedback.recordStatus.pending": "Na čekanju",
    "feedback.recordStatus.inReview": "U pregledu",
    "feedback.recordStatus.approved": "Odobreno",
    "feedback.recordStatus.posted": "Proknjiženo",
    "feedback.recordStatus.signed": "Potpisano",
    "feedback.recordStatus.sent": "Poslato",
    "feedback.recordStatus.paid": "Plaćeno",
    "feedback.recordStatus.partiallyPaid": "Delimično plaćeno",
    "feedback.recordStatus.overdue": "Dospelo",
    "feedback.recordStatus.rejected": "Odbijeno",
    "feedback.recordStatus.cancelled": "Stornirano",
    "feedback.recordStatus.archived": "Arhivirano",
    "feedback.recordStatus.locked": "Zaključano",
    "feedback.recordStatus.error": "Greška",
    "data.bulk.selectedCount": {
      "one": "{count} stavka izabrana",
      "few": "{count} stavke izabrane",
      "other": "{count} stavki izabrano"
    },
    "data.bulk.selectAllCount": "Izaberi svih {count}",
    "data.bulk.confirmCount": {
      "one": "Radnja će se primeniti na {count} stavku. Nastaviti?",
      "few": "Radnja će se primeniti na {count} stavke. Nastaviti?",
      "other": "Radnja će se primeniti na {count} stavki. Nastaviti?"
    },
    "data.bulk.clearSelection": "Poništi izbor",
    "data.bulk.confirmTitle.delete": "Brisanje",
    "data.bulk.confirmTitle.post": "Knjiženje",
    "data.bulk.confirmTitle.approve": "Odobravanje",
    "data.bulk.confirmTitle.reject": "Odbijanje",
    "data.bulk.confirmTitle.void": "Storniranje",
    "data.bulk.confirmTitle.cancelDocument": "Otkazivanje",
    "data.bulk.confirmFallback": "Potvrda",
    "auth.login.title": "Prijava na sistem",
    "auth.login.email": "Elektronska pošta",
    "auth.login.password": "Lozinka",
    "auth.login.rememberMe": "Zapamti me",
    "auth.login.forgotPassword": "Zaboravljena lozinka?",
    "auth.login.signIn": "Prijavi se",
    "auth.twoFactor.title": "Potvrda u dva koraka",
    "auth.twoFactor.description": "Unesite kod iz aplikacije za potvrdu identiteta.",
    "auth.login.resendIn": "Novi kod za {seconds}s",
    "auth.login.sendNewCode": "Pošalji novi kod",
    "patterns.approval.pending": "Čeka odluku",
    "patterns.approval.approved": "Odobreno",
    "patterns.approval.rejected": "Odbijeno",
    "patterns.approval.delegated": "Prosleđeno",
    "patterns.approval.skipped": "Preskočeno",
    "patterns.checklist.checksPassed": "provera prošlo",
    "patterns.checklist.blocked": "Blokirano",
    "patterns.checklist.passing": "Prolazi",
    "patterns.checklist.shareOfPassed": "Udeo prošlih provera",
    "patterns.approvalChain.requiresAll": "Potrebna je saglasnost svih učesnika.",
    "patterns.approvalChain.requiresOne": "Dovoljna je saglasnost jednog učesnika.",
    "patterns.approvalChain.missingReason": "Nedostaje obrazloženje odluke.",
    "patterns.checklist.blockingCheck": "Obavezna provera",
    "patterns.stepWizard.close": "Zatvori",
    "patterns.stockMovement.in": "Ulaz",
    "patterns.stockMovement.out": "Izlaz",
    "patterns.stockMovement.transfer": "Prenos",
    "patterns.stockMovement.adjustment": "Ispravka",
    "patterns.stockMovement.count": "Popis",
    "patterns.stockMovement.ledgerLabel": "Kartica kretanja stanja",
    "patterns.stockMovement.currentBalance": "Trenutno stanje",
    "patterns.stockMovement.colType": "Vrsta",
    "patterns.stockMovement.colDate": "Datum",
    "patterns.stockMovement.colReference": "Osnov",
    "patterns.stockMovement.colFromTo": "Odakle → kuda",
    "patterns.stockMovement.colQuantity": "Količina",
    "patterns.stockMovement.colBalance": "Saldo",
    "patterns.rate.amountsIn": "Iznosi u",
    "patterns.slotPicker.noSlots": "Nema slobodnih termina",
    "patterns.slotPicker.free": "slobodno",
    "patterns.slotPicker.confirmSlot": "Potvrdi termin",
    "patterns.gallery.noPhotos": "Nema fotografija",
    "patterns.processMap.start": "Početak",
    "patterns.processMap.task": "Zadatak",
    "patterns.processMap.decision": "Odluka",
    "patterns.processMap.end": "Kraj",
    "actions.intent.create": "Novo",
    "actions.intent.save": "Sačuvaj",
    "actions.intent.submit": "Pošalji",
    "actions.intent.confirm": "Potvrdi",
    "actions.intent.next": "Dalje",
    "actions.intent.verify": "Overi",
    "actions.intent.sign": "Potpiši",
    "actions.intent.send": "Pošalji",
    "actions.intent.sync": "Sinhronizuj",
    "actions.intent.pdf": "PDF",
    "actions.intent.print": "Štampa",
    "actions.intent.preview": "Pregled",
    "actions.intent.download": "Preuzmi",
    "actions.intent.approve": "Odobri",
    "actions.intent.post": "Proknjiži",
    "actions.intent.excel": "Excel",
    "actions.intent.complete": "Završi",
    "actions.intent.delete": "Obriši",
    "actions.intent.reject": "Odbij",
    "actions.intent.cancelDocument": "Storniraj",
    "actions.intent.unlock": "Otključaj",
    "actions.intent.revert": "Vrati",
    "actions.intent.void": "Poništi",
    "actions.intent.edit": "Izmeni",
    "actions.intent.view": "Prikaži",
    "actions.intent.filter": "Filteri",
    "actions.intent.refresh": "Osveži",
    "actions.intent.back": "Nazad",
    "actions.intent.cancel": "Odustani",
    "actions.intent.duplicate": "Kopiraj",
    "actions.intent.import": "Uvezi",
    "actions.intent.archive": "Arhiviraj",
    "actions.intent.settings": "Podešavanja",
    "actions.intent.more": "Više",
    "auth.profile.title": "Profil",
    "auth.profile.description": "Podaci koje vide ostali korisnici u vašoj organizaciji.",
    "auth.profile.changePhoto": "Promeni sliku",
    "auth.profile.remove": "Ukloni",
    "auth.profile.photoHint": "PNG ili JPG, najviše 2 MB",
    "auth.profile.fullName": "Ime i prezime",
    "auth.profile.jobTitle": "Radno mesto",
    "auth.profile.phone": "Telefon",
    "auth.profile.emailChangeNote": "Promena adrese elektronske pošte ide kroz potvrdu na novoj adresi.",
    "auth.password.title": "Lozinka",
    "auth.password.description": "Promena lozinke odjavljuje ostale uređaje.",
    "auth.password.current": "Trenutna lozinka",
    "auth.password.new": "Nova lozinka",
    "auth.password.minLength": "Najmanje {min} znakova",
    "auth.password.strength": "Jačina lozinke",
    "auth.password.hint": "Duža lozinka je jača od komplikovane. Četiri nasumične reči rade bolje od Lozinka1!.",
    "auth.password.repeat": "Ponovite novu lozinku",
    "auth.password.mismatch": "Lozinke se ne poklapaju",
    "auth.password.change": "Promeni lozinku",
    "auth.twoFactorCard.title": "Dvofaktorna potvrda",
    "auth.twoFactorCard.description": "Dodatni kod pri prijavi sa novog uređaja.",
    "auth.twoFactorCard.on": "Uključeno",
    "auth.twoFactorCard.off": "Isključeno",
    "auth.twoFactorCard.enabledHint": "Pri prijavi sa nepoznatog uređaja tražiće se kod iz aplikacije za potvrdu.",
    "auth.twoFactorCard.disabledHint": "Preporučeno za naloge koji pristupaju podacima o zaradama i poreskim prijavama.",
    "auth.twoFactorCard.backupCodesLeft": "Rezervnih kodova: {count}",
    "auth.twoFactorCard.generateNew": "Generiši nove",
    "auth.twoFactorCard.turnOff": "Isključi dvofaktornu potvrdu",
    "auth.twoFactorCard.turnOn": "Uključi",
    "auth.sessions.title": "Prijavljeni uređaji",
    "auth.sessions.signOutOthers": "Odjavi sve ostale",
    "auth.sessions.thisDevice": "Ovaj uređaj",
    "auth.sessions.signOutDevice": "Odjavi uređaj",
    "auth.sessions.noOtherSessions": "Nema drugih prijava",
    "auth.preferences.title": "Podešavanja prikaza",
    "auth.preferences.language": "Jezik",
    "auth.preferences.theme": "Tema",
    "auth.preferences.themeLight": "Svetla",
    "auth.preferences.themeDark": "Tamna",
    "auth.preferences.themeSystem": "Sistemska",
    "auth.preferences.denseTables": "Guste tabele",
    "auth.preferences.denseTablesHint": "Više redova na ekranu, manji razmak. Korisno kada se ceo dan radi sa spiskovima.",
    "auth.preferences.emailNotifications": "Obaveštenja mejlom",
    "auth.preferences.emailNotificationsHint": "Rokovi, odbijene prijave i dodeljeni zadaci.",
    "auth.dangerZone.title": "Brisanje naloga",
    "auth.dangerZone.description": "Nalog i lični podaci se brišu trajno. Knjigovodstvena dokumentacija ostaje po zakonu.",
    "auth.dangerZone.deleteAccount": "Obriši nalog",
    "ui.personInfo.email": "Elektronska pošta:",
    "ui.personInfo.phone": "Telefon:",
    "patterns.versionCompare.showUnchanged": "Prikaži još {hidden} nepromenjenih",
    "patterns.versionCompare.noDifferences": "Nema razlika između verzija.",
    "nav.locked.badge": "NEDOSTUPNO",
    "nav.moduleCard.lockedTooltip": "Ovaj modul nije uključen u vaš paket.",
    "nav.launchpad.locked": "Nemate pravo pristupa ovom modulu.",
    "feedback.status.active": "Aktivan",
    "feedback.status.inactive": "Neaktivan",
    "data.progressCard.progress": "Napredak",
    "data.progressCard.doneOfTotal": "{done} od {total}",
    "ui.colorScheme.toDark": "Uključi tamnu temu",
    "ui.colorScheme.toLight": "Uključi svetlu temu",
    "data.table.columnWidth": "Širina kolone",
    "data.table.actions": "Radnje",
    "data.table.selectAll": "Izaberi sve",
    "data.table.selectRow": "Izaberi red",
    "data.kanban.moveTo": "Premesti u",
    "data.kanban.dragHint": "Prevuci ili otvori meni za premeštanje",
    "data.kanban.limitReached": "Dostignuto ograničenje",
    "data.detailDrawer.close": "Zatvori",
    "data.detailDrawer.previous": "Prethodni zapis",
    "data.detailDrawer.next": "Sledeći zapis",
    "data.permissionMatrix.lockedHint": "Sistemska uloga — dozvole se ne mogu menjati",
    "data.permissionMatrix.notApplicable": "Ne odnosi se",
    "data.permissionMatrix.permissionColumn": "Dozvola",
    "feedback.achievement.locked": "Zaključano",
    "feedback.achievement.earned": "Osvojeno",
    "feedback.achievement.level": "nivo",
    "feedback.confirmModal.cancel": "Odustani",
    "feedback.confirmModal.confirm": "Potvrdi",
    "feedback.confirmModal.deleteTitle": "Brisanje podatka",
    "feedback.confirmModal.deleteText": "Podatak se briše trajno i ne može se vratiti.",
    "feedback.confirmModal.deleteConfirm": "Obriši",
    "feedback.conflictBanner.title": "Zapis je izmenjen dok ste unosili",
    "feedback.conflictBanner.changesNotSaved": "Vaše izmene nisu sačuvane.",
    "feedback.conflictBanner.loadLatest": "Učitaj najnovije",
    "feedback.conflictBanner.overwriteMine": "Ipak sačuvaj moje izmene",
    "patterns.stepWizard.stepProgress": "Napredak koraka",
    "patterns.stepWizard.working": "Obrada u toku…",
    "patterns.stepWizard.finish": "Završi",
    "patterns.stepWizard.next": "Dalje",
    "nav.commandPalette.goTo": "Idi na",
    "nav.commandPalette.actions": "Radnje",
    "nav.commandPalette.placeholder": "Pretraži ekrane i radnje…",
    "nav.commandPalette.nothingFound": "Nema rezultata",
    "feedback.emptyState.empty.title": "Nema podataka",
    "feedback.emptyState.empty.description": "Podaci koje unesete pojaviće se na ovom mestu.",
    "feedback.emptyState.noResults.title": "Nema rezultata",
    "feedback.emptyState.noResults.description": "Promenite pojam pretrage ili uklonite neki filter.",
    "feedback.emptyState.error.title": "Učitavanje nije uspelo",
    "feedback.emptyState.error.description": "Pokušajte ponovo. Ako se ponovi, obratite se podršci."
  },
}
