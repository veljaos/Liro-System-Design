export {
  AppShellTemplate,
  type AppShellTemplateProps,
  type Crumb,
  type UserMenuItem,
} from './AppShellTemplate'

export {
  ListPageTemplate,
  DetailPageTemplate,
  DashboardTemplate,
  type ListPageTemplateProps,
  type DetailPageTemplateProps,
  type DashboardTemplateProps,
} from './PageTemplates'

export { LoadingTemplate, type LoadingTemplateProps, type LoadingVariant } from './LoadingTemplate'

export {
  NotFoundTemplate,
  ServerErrorTemplate,
  ForbiddenTemplate,
  MaintenanceTemplate,
  SuspendedTemplate,
  SessionExpiredTemplate,
  PaymentRequiredTemplate,
  type ServerErrorTemplateProps,
  type SessionExpiredTemplateProps,
} from './StatusTemplates'

export {
  LandingTemplate,
  LegalPageTemplate,
  type LandingTemplateProps,
  type LandingAction,
  type LandingFeature,
  type LegalPageTemplateProps,
} from './LandingTemplate'

export { RouteProgress, startRouteProgress, completeRouteProgress } from './RouteProgress'

export { RecordFormTemplate, type RecordFormTemplateProps } from './RecordFormTemplate'
