export enum MetricStatus {
  OnTrack,
  AtRisk,
  OffTrack,
}

export enum MetricTrend {
    Up,
    Down,
    Flat
}

export interface ScorecardMetric {
  id: string;
  name: string;
  value: string;
  target: string;
  status: MetricStatus;
  trend: MetricTrend;
  description: string;
  actionPrompt: string;
}

export interface ActionItem {
  id:string;
  description: string;
  source: string;
  dueDate: string; // ISO Date String
  status: 'Pending' | 'Completed';
  completedAt?: string;
  sourceType: 'standalone' | 'recurring_task';
  attachmentCount?: number;
  commentCount?: number;
  sopLink?: string;
}

export interface Review {
  id: string;
  platform: 'Google' | 'Yelp' | 'TripAdvisor';
  rating: number;
  author: string;
  content: string;
  timestamp: string;
}

export interface Assignment {
  id: string;
  assetId: string;
  assetName: string;
  positionId: string;
  positionTitle: string;
}

/** An override for a specific granular permission, for a specific user, at a specific asset. */
export interface UserPermissionOverride {
  assetId: string; // Which asset this override applies to.
  permissionId: string; // The granular permission ID (e.g., 'pdp.can_approve_time_off').
  hasPermission: boolean; // True to grant, false to explicitly deny.
}


export interface User {
  id: string;
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  password?: string; // Hashed password
  isActive: boolean;
  assignments: Assignment[];
  globalPermissions?: string[];
  overrides?: UserPermissionOverride[];
}

export interface AssetType {
  id: string;
  name: string;
}

export interface Address {
  street: string;
  city: string;
  state: string;
  zip: string;
  country: string;
}

export interface Asset {
  id: string;
  name: string;
  location: Address;
  assetTypeId: string;
  status: 'Active' | 'Under Construction' | 'Inactive';
}

export interface PlaybookEntry {
    id: string;
    label: string;
    section: string;
    isCompleted: boolean;
    completedBy?: string;
    completedAt?: string;
}

export interface PlaybookLog {
    id: string;
    assetName: string;
    shiftDate: string;
    status: 'In Progress' | 'Completed';
    entries: PlaybookEntry[];
}


// --- ACCESS CONTROL HUB ---
// The new "Asset-Centric" hierarchical data model.

/** A specific, granular action a user can take. */
export interface GranularPermission {
  id: string;
  description: string;
}

/** A page or tool available within the application, containing its own set of permissions. */
export interface ConfigurablePage {
  id: string;
  name: string;
  icon: string;
  permissions: GranularPermission[];
}

/** A job title, which exists only within the context of an Asset Type. */
export interface Position {
  id: string;
  title: string;
}

/** The master configuration "Blueprint" for an entire category of assets. */
export interface AssetTypeConfig {
  id: string;
  name: string;
  positions: Position[];
  pages: ConfigurablePage[];
  // The matrix linking positions to permissions for this asset type.
  // Format: { [positionId]: { [permissionId]: boolean } }
  permissionMatrix: Record<string, Record<string, boolean>>;
}

// --- TEMPLATES BUILDER ---
export type TaskType = 'Task' | 'Recurring Task' | 'Sub-Project' | 'Learning Module' | 'File Requirement' | 'Discussion';
export type DueDateRefPoint = 'Project Start' | 'Project End' | 'Previous Step Completion';
export type DueDateDirection = 'Before' | 'After';
export type DueDateUnit = 'Days' | 'Weeks' | 'Months';
export type RecurrenceFreq = 'Daily' | 'Weekly' | 'Monthly' | 'Quarterly' | 'Annually';
export type AssetAssignmentRuleType = 'primary_only' | 'primary_district' | 'manual_list';

export interface TaskAssignment {
  roleIds: string[];
  userIds: string[];
  placeholderIds: string[];
}

export interface RelativeDueDate {
  value: number;
  unit: DueDateUnit;
  direction: DueDateDirection;
  ref: DueDateRefPoint;
}

export interface RecurrenceRule {
  freq: RecurrenceFreq;
  // For weekly
  daysOfWeek?: ('M' | 'T' | 'W' | 'Th' | 'F' | 'Sa' | 'Su')[];
  // For monthly
  dayOfMonth?: number; 
  // For annually
  monthOfYear?: number;
  dayOfWeek?: number; // e.g., 2nd Tuesday
  weekOfMonth?: number;
  time: string; // e.g., "09:00"
}


export interface BaseTask {
  id: string;
  title: string;
  displayOrder: number;
  assignment: TaskAssignment;
  dueDate: RelativeDueDate;
  attachmentCount?: number;
  commentCount?: number;
  sopLink?: string;
}

export type TemplateTask = BaseTask & (
  | { type: 'Task'; description: string; dependencies: string[]; }
  | { type: 'Recurring Task'; description: string; recurrence: RecurrenceRule; }
  | { type: 'Sub-Project'; subProjectTemplateId: string; trigger: 'Manual' | 'Automatic'; }
  | { type: 'Learning Module'; lmsCourseIds: string[]; requirement: 'Required' | 'Recommended'; }
  | { type: 'File Requirement'; description: string; requiresApproval: boolean; }
  | { type: 'Discussion'; prompt: string; }
);

export interface DefinedPlaceholder {
  id: string;
  name: string;
  description: string;
  defaultAssignment: TaskAssignment;
}

export interface ProjectTemplate {
  id: string;
  name: string;
  description: string;
  appliesToAssetTypeIds: string[];
  appliesToAssetIds?: string[];
  definedPlaceholders?: DefinedPlaceholder[];
  tasks: TemplateTask[];
  lastUpdated: string;
  assetAssignmentRule: {
    type: AssetAssignmentRuleType;
    assetIds?: string[];
  };
  accessPermissions: {
    userIds: string[];
    positionIds: string[];
  };
}

// --- ACTION CENTER ---
export type TaskSourceType = 'project' | 'recurring_task' | 'standalone';

export type ActiveTask = TemplateTask & {
  sourceType: TaskSourceType;
  status: 'Pending' | 'In Progress' | 'Completed' | 'Blocked';
  completedAt?: string;
  completedBy?: string; // userId
  absoluteDueDate: string; // ISO Date String
}

export interface ActiveProject {
  id: string;
  name: string;
  templateId: string;
  primaryAssetId: string;
  status: 'On Track' | 'At Risk' | 'Off Track';
  launchedAt: string;
  launchedBy: string; // userId
  tasks: ActiveTask[];
}

export interface DisplayTask {
  id: string; // Unique ID for the list
  title: string;
  status: ActiveTask['status'];
  assignment: TaskAssignment;
  absoluteDueDate: string;
  completedAt?: string;
  
  sourceType: TaskSourceType;
  
  // For project tasks
  projectId?: string;
  projectName?: string;
  originalTaskId?: string;
  
  // For standalone action items
  originalActionItemId?: string;

  // For recurring tasks
  isRecurringInstance?: boolean;
  
  // For display
  assetName?: string;
  attachmentCount?: number;
  commentCount?: number;
  sopLink?: string;
}


/** Configuration for sorting tables */
export type SortConfig = {
  key: string;
  direction: 'ascending' | 'descending';
} | null;

// --- UNIVERSITY ---

export interface UniversityCourse {
  id: string; // e.g., "LMS-101"
  title: string;
  description: string;
  assetTypeRelevance: string[]; // e.g., ['type-restaurant']
  recertificationRule?: {
    interval: number;
    unit: 'day' | 'week' | 'month' | 'year';
    method: 'refresher_exam' | 'full_course';
  };
  modules: CourseModule[];
}

export type ModuleType = 'Video' | 'Document' | 'Quiz' | 'Simulation' | 'LiveSession' | 'PeerReview';

export interface CourseModule {
  id: string;
  title: string;
  moduleType: ModuleType;
  order: number;
  content: VideoContent | DocumentContent | QuizContent | LiveSessionContent; // Example content types
}

export interface VideoContent {
  url: string;
  lengthMinutes: number;
}
export interface DocumentContent {
  url: string;
}
export interface QuizContent {
  questions: any[]; // Simplified for now
}
export interface LiveSessionContent {
    topic: string;
    instructor: string;
    startTime: string; // ISO String
    endTime: string; // ISO String
    meetingUrl: string;
}


export interface UserEnrollment {
  id: string;
  userId: string;
  courseId: string;
  status: 'Not Started' | 'In Progress' | 'Completed';
  completionDate?: string;
  score?: number;
  progress: number; // Percentage 0-100
}

export interface UserCertification {
  id: string;
  userId: string;
  courseId: string;
  issueDate: string;
  expirationDate?: string;
}

export interface LearningPath {
  id: string;
  title: string;
  description: string;
  unlockPrerequisites?: {
    requiredPathIds?: string[];
    requiredCertificationIds?: string[];
  };
  stages: LearningPathStage[];
}

export interface LearningPathStage {
  id: string;
  title: string;
  order: number;
  requirements: PathRequirement[];
}

export type PathRequirement = 
  | { type: 'course'; courseId: string; }
  | { type: 'project'; projectTemplateId: string; }
  | { type: 'manual_sign_off'; description: string; };

// --- RECURRING TEMPLATES ---
export interface RecurringTaskTemplate {
  id: string;
  title: string;
  description?: string;
  recurrenceRule: RecurrenceRule;
  appliesToAssetId: string;
  assignment: TaskAssignment;
  status: 'Active' | 'Paused';
}

export interface RecurringProjectTemplate {
  id: string;
  seriesName: string;
  baseProjectTemplateId: string;
  recurrenceRule: RecurrenceRule;
  defaultLead: TaskAssignment; // Should resolve to a single person ideally
  status: 'Active' | 'Paused';
}