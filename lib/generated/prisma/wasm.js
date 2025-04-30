
Object.defineProperty(exports, "__esModule", { value: true });

const {
  Decimal,
  objectEnumValues,
  makeStrictEnum,
  Public,
  getRuntime,
  skip
} = require('./runtime/index-browser.js')


const Prisma = {}

exports.Prisma = Prisma
exports.$Enums = {}

/**
 * Prisma Client JS version: 6.6.0
 * Query Engine version: f676762280b54cd07c770017ed3711ddde35f37a
 */
Prisma.prismaVersion = {
  client: "6.6.0",
  engine: "f676762280b54cd07c770017ed3711ddde35f37a"
}

Prisma.PrismaClientKnownRequestError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientKnownRequestError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)};
Prisma.PrismaClientUnknownRequestError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientUnknownRequestError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientRustPanicError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientRustPanicError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientInitializationError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientInitializationError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientValidationError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientValidationError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.Decimal = Decimal

/**
 * Re-export of sql-template-tag
 */
Prisma.sql = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`sqltag is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.empty = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`empty is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.join = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`join is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.raw = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`raw is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.validator = Public.validator

/**
* Extensions
*/
Prisma.getExtensionContext = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`Extensions.getExtensionContext is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.defineExtension = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`Extensions.defineExtension is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}

/**
 * Shorthand utilities for JSON filtering
 */
Prisma.DbNull = objectEnumValues.instances.DbNull
Prisma.JsonNull = objectEnumValues.instances.JsonNull
Prisma.AnyNull = objectEnumValues.instances.AnyNull

Prisma.NullTypes = {
  DbNull: objectEnumValues.classes.DbNull,
  JsonNull: objectEnumValues.classes.JsonNull,
  AnyNull: objectEnumValues.classes.AnyNull
}



/**
 * Enums
 */

exports.Prisma.TransactionIsolationLevel = makeStrictEnum({
  ReadUncommitted: 'ReadUncommitted',
  ReadCommitted: 'ReadCommitted',
  RepeatableRead: 'RepeatableRead',
  Serializable: 'Serializable'
});

exports.Prisma.UserScalarFieldEnum = {
  id: 'id',
  email: 'email',
  firstName: 'firstName',
  lastName: 'lastName',
  avatarUrl: 'avatarUrl',
  passwordHash: 'passwordHash',
  emailVerified: 'emailVerified',
  phoneNumber: 'phoneNumber',
  organizationId: 'organizationId',
  roleId: 'roleId',
  isActive: 'isActive',
  lastLogin: 'lastLogin',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  preferences: 'preferences'
};

exports.Prisma.OrganizationScalarFieldEnum = {
  id: 'id',
  name: 'name',
  slug: 'slug',
  logoUrl: 'logoUrl',
  isActive: 'isActive',
  subscriptionTier: 'subscriptionTier',
  subscriptionEnds: 'subscriptionEnds',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  settings: 'settings'
};

exports.Prisma.RoleScalarFieldEnum = {
  id: 'id',
  name: 'name',
  description: 'description',
  isSystemRole: 'isSystemRole',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  organizationId: 'organizationId',
  defaultWidgets: 'defaultWidgets'
};

exports.Prisma.PermissionScalarFieldEnum = {
  id: 'id',
  name: 'name',
  description: 'description',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.TeamScalarFieldEnum = {
  id: 'id',
  name: 'name',
  description: 'description',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  organizationId: 'organizationId'
};

exports.Prisma.TeamMemberScalarFieldEnum = {
  id: 'id',
  teamId: 'teamId',
  userId: 'userId',
  role: 'role',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.WidgetScalarFieldEnum = {
  id: 'id',
  name: 'name',
  description: 'description',
  widgetType: 'widgetType',
  icon: 'icon',
  defaultSize: 'defaultSize',
  minSize: 'minSize',
  maxSize: 'maxSize',
  defaultSettings: 'defaultSettings',
  isSystemWidget: 'isSystemWidget',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  organizationId: 'organizationId'
};

exports.Prisma.DashboardScalarFieldEnum = {
  id: 'id',
  name: 'name',
  description: 'description',
  isDefault: 'isDefault',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  organizationId: 'organizationId'
};

exports.Prisma.DashboardLayoutScalarFieldEnum = {
  id: 'id',
  deviceType: 'deviceType',
  layoutJson: 'layoutJson',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  dashboardId: 'dashboardId',
  userId: 'userId',
  organizationId: 'organizationId'
};

exports.Prisma.DashboardWidgetScalarFieldEnum = {
  id: 'id',
  positionX: 'positionX',
  positionY: 'positionY',
  width: 'width',
  height: 'height',
  settings: 'settings',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  widgetId: 'widgetId',
  dashboardLayoutId: 'dashboardLayoutId'
};

exports.Prisma.ProjectScalarFieldEnum = {
  id: 'id',
  name: 'name',
  description: 'description',
  startDate: 'startDate',
  targetEndDate: 'targetEndDate',
  actualEndDate: 'actualEndDate',
  status: 'status',
  progress: 'progress',
  thumbnailUrl: 'thumbnailUrl',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  organizationId: 'organizationId'
};

exports.Prisma.MilestoneScalarFieldEnum = {
  id: 'id',
  name: 'name',
  description: 'description',
  targetDate: 'targetDate',
  actualDate: 'actualDate',
  status: 'status',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  projectId: 'projectId'
};

exports.Prisma.TaskScalarFieldEnum = {
  id: 'id',
  title: 'title',
  description: 'description',
  status: 'status',
  priority: 'priority',
  dueDate: 'dueDate',
  estimatedHours: 'estimatedHours',
  actualHours: 'actualHours',
  isOnCriticalPath: 'isOnCriticalPath',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  projectId: 'projectId',
  assigneeId: 'assigneeId',
  creatorId: 'creatorId'
};

exports.Prisma.TaskDependencyScalarFieldEnum = {
  id: 'id',
  dependentTaskId: 'dependentTaskId',
  prerequisiteTaskId: 'prerequisiteTaskId'
};

exports.Prisma.NotificationScalarFieldEnum = {
  id: 'id',
  title: 'title',
  message: 'message',
  type: 'type',
  category: 'category',
  priority: 'priority',
  actionLink: 'actionLink',
  isRead: 'isRead',
  readAt: 'readAt',
  createdAt: 'createdAt',
  recipientId: 'recipientId',
  senderId: 'senderId',
  organizationId: 'organizationId'
};

exports.Prisma.NotificationSettingScalarFieldEnum = {
  id: 'id',
  emailNotifications: 'emailNotifications',
  pushNotifications: 'pushNotifications',
  taskNotifications: 'taskNotifications',
  messageNotifications: 'messageNotifications',
  systemNotifications: 'systemNotifications',
  weatherNotifications: 'weatherNotifications',
  adminNotifications: 'adminNotifications',
  quietHoursStart: 'quietHoursStart',
  quietHoursEnd: 'quietHoursEnd',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  userId: 'userId'
};

exports.Prisma.VerificationTokenScalarFieldEnum = {
  id: 'id',
  token: 'token',
  userId: 'userId',
  expiresAt: 'expiresAt',
  createdAt: 'createdAt'
};

exports.Prisma.ResetTokenScalarFieldEnum = {
  id: 'id',
  token: 'token',
  userId: 'userId',
  expiresAt: 'expiresAt',
  createdAt: 'createdAt'
};

exports.Prisma.ReportScalarFieldEnum = {
  id: 'id',
  name: 'name',
  description: 'description',
  reportType: 'reportType',
  isTemplate: 'isTemplate',
  isFavorite: 'isFavorite',
  isPublic: 'isPublic',
  thumbnailUrl: 'thumbnailUrl',
  config: 'config',
  lastRunAt: 'lastRunAt',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  creatorId: 'creatorId',
  organizationId: 'organizationId'
};

exports.Prisma.ReportScheduleScalarFieldEnum = {
  id: 'id',
  frequency: 'frequency',
  dayOfWeek: 'dayOfWeek',
  dayOfMonth: 'dayOfMonth',
  timeOfDay: 'timeOfDay',
  format: 'format',
  deliveryMethod: 'deliveryMethod',
  recipients: 'recipients',
  isActive: 'isActive',
  lastExecuted: 'lastExecuted',
  nextExecution: 'nextExecution',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  reportId: 'reportId'
};

exports.Prisma.MetricDefinitionScalarFieldEnum = {
  id: 'id',
  name: 'name',
  description: 'description',
  dataSource: 'dataSource',
  calculation: 'calculation',
  unit: 'unit',
  aggregation: 'aggregation',
  isSystemMetric: 'isSystemMetric',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  organizationId: 'organizationId'
};

exports.Prisma.DashboardMetricScalarFieldEnum = {
  id: 'id',
  displayName: 'displayName',
  visualizationType: 'visualizationType',
  size: 'size',
  refreshInterval: 'refreshInterval',
  chartConfig: 'chartConfig',
  filterConfig: 'filterConfig',
  positionX: 'positionX',
  positionY: 'positionY',
  width: 'width',
  height: 'height',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  metricId: 'metricId',
  reportId: 'reportId',
  dashboardId: 'dashboardId'
};

exports.Prisma.KpiTargetScalarFieldEnum = {
  id: 'id',
  targetValue: 'targetValue',
  minThreshold: 'minThreshold',
  maxThreshold: 'maxThreshold',
  direction: 'direction',
  timePeriod: 'timePeriod',
  startDate: 'startDate',
  endDate: 'endDate',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  metricId: 'metricId',
  projectId: 'projectId'
};

exports.Prisma.AnalyticsSnapshotScalarFieldEnum = {
  id: 'id',
  snapshotDate: 'snapshotDate',
  data: 'data',
  snapshotType: 'snapshotType',
  createdAt: 'createdAt',
  organizationId: 'organizationId',
  projectId: 'projectId'
};

exports.Prisma.SortOrder = {
  asc: 'asc',
  desc: 'desc'
};

exports.Prisma.JsonNullValueInput = {
  JsonNull: Prisma.JsonNull
};

exports.Prisma.NullableJsonNullValueInput = {
  DbNull: Prisma.DbNull,
  JsonNull: Prisma.JsonNull
};

exports.Prisma.QueryMode = {
  default: 'default',
  insensitive: 'insensitive'
};

exports.Prisma.JsonNullValueFilter = {
  DbNull: Prisma.DbNull,
  JsonNull: Prisma.JsonNull,
  AnyNull: Prisma.AnyNull
};

exports.Prisma.NullsOrder = {
  first: 'first',
  last: 'last'
};
exports.WidgetSize = exports.$Enums.WidgetSize = {
  SMALL: 'SMALL',
  NORMAL: 'NORMAL',
  LARGE: 'LARGE',
  XLARGE: 'XLARGE'
};

exports.DeviceType = exports.$Enums.DeviceType = {
  MOBILE: 'MOBILE',
  TABLET: 'TABLET',
  DESKTOP: 'DESKTOP'
};

exports.ProjectStatus = exports.$Enums.ProjectStatus = {
  NOT_STARTED: 'NOT_STARTED',
  IN_PROGRESS: 'IN_PROGRESS',
  ON_HOLD: 'ON_HOLD',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED'
};

exports.MilestoneStatus = exports.$Enums.MilestoneStatus = {
  NOT_STARTED: 'NOT_STARTED',
  IN_PROGRESS: 'IN_PROGRESS',
  COMPLETED: 'COMPLETED',
  MISSED: 'MISSED'
};

exports.TaskStatus = exports.$Enums.TaskStatus = {
  TO_DO: 'TO_DO',
  IN_PROGRESS: 'IN_PROGRESS',
  BLOCKED: 'BLOCKED',
  DONE: 'DONE',
  CANCELLED: 'CANCELLED'
};

exports.TaskPriority = exports.$Enums.TaskPriority = {
  LOW: 'LOW',
  MEDIUM: 'MEDIUM',
  HIGH: 'HIGH',
  CRITICAL: 'CRITICAL'
};

exports.NotificationType = exports.$Enums.NotificationType = {
  TASK: 'TASK',
  MESSAGE: 'MESSAGE',
  SYSTEM: 'SYSTEM',
  WEATHER: 'WEATHER',
  ADMIN: 'ADMIN'
};

exports.NotificationPriority = exports.$Enums.NotificationPriority = {
  LOW: 'LOW',
  NORMAL: 'NORMAL',
  HIGH: 'HIGH',
  CRITICAL: 'CRITICAL'
};

exports.ReportType = exports.$Enums.ReportType = {
  PROJECT_PERFORMANCE: 'PROJECT_PERFORMANCE',
  FINANCIAL: 'FINANCIAL',
  RESOURCE_UTILIZATION: 'RESOURCE_UTILIZATION',
  TASK_ANALYSIS: 'TASK_ANALYSIS',
  TEAM_PERFORMANCE: 'TEAM_PERFORMANCE',
  QUALITY_METRICS: 'QUALITY_METRICS',
  CUSTOM: 'CUSTOM'
};

exports.ScheduleFrequency = exports.$Enums.ScheduleFrequency = {
  DAILY: 'DAILY',
  WEEKLY: 'WEEKLY',
  MONTHLY: 'MONTHLY',
  QUARTERLY: 'QUARTERLY'
};

exports.ReportFormat = exports.$Enums.ReportFormat = {
  PDF: 'PDF',
  EXCEL: 'EXCEL',
  CSV: 'CSV',
  INTERACTIVE: 'INTERACTIVE'
};

exports.DeliveryMethod = exports.$Enums.DeliveryMethod = {
  EMAIL: 'EMAIL',
  DASHBOARD: 'DASHBOARD',
  DOWNLOAD: 'DOWNLOAD'
};

exports.AggregationType = exports.$Enums.AggregationType = {
  SUM: 'SUM',
  AVERAGE: 'AVERAGE',
  COUNT: 'COUNT',
  MIN: 'MIN',
  MAX: 'MAX',
  LAST: 'LAST',
  FIRST: 'FIRST'
};

exports.VisualizationType = exports.$Enums.VisualizationType = {
  BAR_CHART: 'BAR_CHART',
  LINE_CHART: 'LINE_CHART',
  PIE_CHART: 'PIE_CHART',
  AREA_CHART: 'AREA_CHART',
  TABLE: 'TABLE',
  KPI_CARD: 'KPI_CARD',
  GAUGE: 'GAUGE',
  HEAT_MAP: 'HEAT_MAP',
  SCATTER_PLOT: 'SCATTER_PLOT',
  CUSTOM: 'CUSTOM'
};

exports.TargetDirection = exports.$Enums.TargetDirection = {
  HIGHER_BETTER: 'HIGHER_BETTER',
  LOWER_BETTER: 'LOWER_BETTER',
  TARGET_EXACT: 'TARGET_EXACT'
};

exports.TimePeriod = exports.$Enums.TimePeriod = {
  DAILY: 'DAILY',
  WEEKLY: 'WEEKLY',
  MONTHLY: 'MONTHLY',
  QUARTERLY: 'QUARTERLY',
  YEARLY: 'YEARLY',
  PROJECT_DURATION: 'PROJECT_DURATION'
};

exports.SnapshotType = exports.$Enums.SnapshotType = {
  DAILY_METRICS: 'DAILY_METRICS',
  WEEKLY_SUMMARY: 'WEEKLY_SUMMARY',
  MONTHLY_PERFORMANCE: 'MONTHLY_PERFORMANCE',
  PROJECT_MILESTONE: 'PROJECT_MILESTONE'
};

exports.Prisma.ModelName = {
  User: 'User',
  Organization: 'Organization',
  Role: 'Role',
  Permission: 'Permission',
  Team: 'Team',
  TeamMember: 'TeamMember',
  Widget: 'Widget',
  Dashboard: 'Dashboard',
  DashboardLayout: 'DashboardLayout',
  DashboardWidget: 'DashboardWidget',
  Project: 'Project',
  Milestone: 'Milestone',
  Task: 'Task',
  TaskDependency: 'TaskDependency',
  Notification: 'Notification',
  NotificationSetting: 'NotificationSetting',
  VerificationToken: 'VerificationToken',
  ResetToken: 'ResetToken',
  Report: 'Report',
  ReportSchedule: 'ReportSchedule',
  MetricDefinition: 'MetricDefinition',
  DashboardMetric: 'DashboardMetric',
  KpiTarget: 'KpiTarget',
  AnalyticsSnapshot: 'AnalyticsSnapshot'
};

/**
 * This is a stub Prisma Client that will error at runtime if called.
 */
class PrismaClient {
  constructor() {
    return new Proxy(this, {
      get(target, prop) {
        let message
        const runtime = getRuntime()
        if (runtime.isEdge) {
          message = `PrismaClient is not configured to run in ${runtime.prettyName}. In order to run Prisma Client on edge runtime, either:
- Use Prisma Accelerate: https://pris.ly/d/accelerate
- Use Driver Adapters: https://pris.ly/d/driver-adapters
`;
        } else {
          message = 'PrismaClient is unable to run in this browser environment, or has been bundled for the browser (running in `' + runtime.prettyName + '`).'
        }

        message += `
If this is unexpected, please open an issue: https://pris.ly/prisma-prisma-bug-report`

        throw new Error(message)
      }
    })
  }
}

exports.PrismaClient = PrismaClient

Object.assign(exports, Prisma)
