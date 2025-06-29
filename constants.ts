import { ScorecardMetric, ActionItem, Review, MetricStatus, MetricTrend, User, Assignment, Asset, AssetTypeConfig, PlaybookLog, ProjectTemplate, TemplateTask, ActiveProject, ActiveTask, UniversityCourse, UserEnrollment, UserCertification, LearningPath, RecurringTaskTemplate, RecurringProjectTemplate } from './types';
import { addDays } from 'date-fns';

const today = new Date();

export const MOCK_SCORECARD_DATA: ScorecardMetric[] = [
  {
    id: 'sales',
    name: 'Sales vs Goal',
    value: '$5,210',
    target: '$5,000',
    status: MetricStatus.OnTrack,
    trend: MetricTrend.Up,
    description: 'Net sales for today compared to the daily target.',
    actionPrompt: 'Great job! See which items are selling best today.'
  },
  {
    id: 'labor',
    name: 'Labor %',
    value: '31.5%',
    target: '< 28%',
    status: MetricStatus.OffTrack,
    trend: MetricTrend.Down,
    description: 'Labor cost as a percentage of total sales.',
    actionPrompt: 'Labor is high. Check for early clock-ins or consider sending someone home.'
  },
  {
    id: 'food_cost',
    name: 'Food Cost %',
    value: '26.2%',
    target: '< 27%',
    status: MetricStatus.OnTrack,
    trend: MetricTrend.Flat,
    description: 'Cost of goods sold as a percentage of sales.',
    actionPrompt: 'On track. Review waste log to find more savings.'
  },
  {
    id: 'speed',
    name: 'Speed of Service',
    value: '3:15 min',
    target: '< 3:00 min',
    status: MetricStatus.AtRisk,
    trend: MetricTrend.Up,
    description: 'Average time from order to delivery.',
    actionPrompt: 'Service is slowing. Let\'s rally the team on the line!'
  }
];

export const MOCK_ACTION_ITEMS: ActionItem[] = [
  {
    id: '1',
    description: 'Fix leaking faucet in back sink.',
    source: 'HEA on 2024-07-28',
    dueDate: addDays(today, -2).toISOString(),
    status: 'Pending',
    sourceType: 'standalone',
    commentCount: 2,
  },
  {
    id: '2',
    description: 'Restock all front-of-house napkin dispensers.',
    source: 'Self-generated',
    dueDate: today.toISOString(),
    status: 'Pending',
    sourceType: 'recurring_task',
    sopLink: '/sop/foh-stocking',
  },
  {
    id: '3',
    description: 'Coach new hire Sarah on upselling combos.',
    source: 'DM Follow-up',
    dueDate: addDays(today, 3).toISOString(),
    status: 'Pending',
    sourceType: 'standalone',
  },
   {
    id: '4',
    description: 'Clean the walk-in freezer floor.',
    source: 'HEA on 2024-07-28',
    dueDate: addDays(today, -1).toISOString(),
    status: 'Completed',
    completedAt: addDays(today, -1).toISOString(),
    sourceType: 'standalone',
  }
];

export const MOCK_REVIEWS: Review[] = [
  {
    id: 'r1',
    platform: 'Google',
    rating: 5,
    author: 'Jane D.',
    content: "The staff was incredibly friendly and my order was perfect! Best location in the city.",
    timestamp: '2 hours ago',
  },
  {
    id: 'r2',
    platform: 'Yelp',
    rating: 3,
    author: 'Mike P.',
    content: "It was okay, but they forgot the pickles on my sandwich. The wait was also a bit long for a weekday lunch.",
    timestamp: '8 hours ago',
  },
  {
    id: 'r3',
    platform: 'Google',
    rating: 4,
    author: 'Carlos R.',
    content: "Clean restaurant and fresh ingredients. Will be back.",
    timestamp: '1 day ago',
  }
];

export const MOCK_GLOBAL_PERMISSIONS = [
    { id: 'perm-1', name: 'ACCESS_ADMIN_PANEL', description: 'Can access the global admin panel.' },
    { id: 'perm-2', name: 'VIEW_ALL_RESTAURANT_REPORTS', description: 'Can view P&L for all restaurant assets.' },
    { id: 'perm-3', name: 'MANAGE_ALL_USERS', description: 'Can create, edit, and deactivate any user.' },
];

// --- HIERARCHICAL ACCESS CONTROL CONFIG ---
export const MOCK_ACCESS_CONTROL_CONFIGS: AssetTypeConfig[] = [
  {
    id: 'type-restaurant',
    name: 'Restaurant',
    positions: [
      { id: 'pos-res-sm', title: 'Store Manager' },
      { id: 'pos-res-sl', title: 'Shift Lead' },
      { id: 'pos-res-crew', title: 'Crew Member' },
    ],
    pages: [
      { id: 'page-res-dash', name: 'Dashboard', icon: 'home', permissions: [] },
      { 
        id: 'page-res-playbook', name: 'Shift Playbook', icon: 'clipboard-document-list', 
        permissions: [
          { id: 'perm-playbook-complete', description: 'Can complete items' },
          { id: 'perm-playbook-submit', description: 'Can submit & close shift' },
        ]
      },
      { 
        id: 'page-res-reports', name: 'Reports', icon: 'chart-bar', 
        permissions: [
          { id: 'perm-reports-view-pnl', description: 'Can view P&L Report' },
          { id: 'perm-reports-view-sales', description: 'Can view Sales Report' },
        ]
      },
    ],
    permissionMatrix: {
      'pos-res-sm': { // Store Manager
        'perm-playbook-complete': true,
        'perm-playbook-submit': true,
        'perm-reports-view-pnl': true,
        'perm-reports-view-sales': true,
        'page-res-dash': true,
        'page-res-playbook': true,
        'page-res-reports': true,
      },
      'pos-res-sl': { // Shift Lead
        'perm-playbook-complete': true,
        'perm-playbook-submit': true,
        'perm-reports-view-pnl': false,
        'perm-reports-view-sales': true,
        'page-res-dash': true,
        'page-res-playbook': true,
        'page-res-reports': true,
      },
      'pos-res-crew': { // Crew Member
        'perm-playbook-complete': true,
        'perm-playbook-submit': false,
        'perm-reports-view-pnl': false,
        'perm-reports-view-sales': false,
        'page-res-dash': true,
        'page-res-playbook': true,
        'page-res-reports': false,
      },
    }
  },
  {
    id: 'type-hotel',
    name: 'Hotel',
    positions: [
      { id: 'pos-hot-gm', title: 'General Manager' },
      { id: 'pos-hot-fdm', title: 'Front Desk Manager' },
      { id: 'pos-hot-fda', title: 'Front Desk Agent' },
      { id: 'pos-hot-na', title: 'Night Auditor' },
    ],
    pages: [
      { id: 'page-hot-dash', name: 'Hotel Dashboard', icon: 'home', permissions: [] },
      { 
        id: 'page-hot-reservations', name: 'Reservations', icon: 'users', 
        permissions: [
          { id: 'perm-res-view', description: 'Can view all reservations' },
          { id: 'perm-res-create', description: 'Can create new reservations' },
          { id: 'perm-res-cancel', description: 'Can cancel reservations' },
        ]
      },
      { 
        id: 'page-hot-eod', name: 'End of Day Report', icon: 'chart-bar',
        permissions: [
            { id: 'perm-eod-view', description: 'Can view EOD reports' },
            { id: 'perm-eod-run', description: 'Can run and close out the day' },
        ]
      }
    ],
    permissionMatrix: {
      'pos-hot-gm': {
        'page-hot-dash': true, 'page-hot-reservations': true, 'page-hot-eod': true,
        'perm-res-view': true, 'perm-res-create': true, 'perm-res-cancel': true,
        'perm-eod-view': true, 'perm-eod-run': true,
      },
      'pos-hot-fdm': {
        'page-hot-dash': true, 'page-hot-reservations': true, 'page-hot-eod': true,
        'perm-res-view': true, 'perm-res-create': true, 'perm-res-cancel': true,
        'perm-eod-view': true, 'perm-eod-run': false,
      },
      'pos-hot-fda': {
        'page-hot-dash': true, 'page-hot-reservations': true, 'page-hot-eod': false,
        'perm-res-view': true, 'perm-res-create': true, 'perm-res-cancel': false,
        'perm-eod-view': false, 'perm-eod-run': false,
      },
      'pos-hot-na': {
        'page-hot-dash': true, 'page-hot-reservations': true, 'page-hot-eod': true,
        'perm-res-view': true, 'perm-res-create': false, 'perm-res-cancel': false,
        'perm-eod-view': true, 'perm-eod-run': true,
      }
    }
  },
];

export const MOCK_ASSETS: Asset[] = [
  { id: 'asset-store-0142', name: 'Lumina Cafe #0142', location: { street: '123 Main St', city: 'Anytown', state: 'CA', zip: '90210', country: 'USA' }, assetTypeId: 'type-restaurant', status: 'Active' },
  { id: 'asset-store-0255', name: 'Lumina Cafe #0255', location: { street: '456 Oak Ave', city: 'Otherville', state: 'NY', zip: '10001', country: 'USA' }, assetTypeId: 'type-restaurant', status: 'Active' },
  { id: 'asset-hotel-1', name: 'Pebble Beach Hotel', location: { street: '789 Ocean Blvd', city: 'Seaside', state: 'FL', zip: '33139', country: 'USA' }, assetTypeId: 'type-hotel', status: 'Active' },
  { id: 'asset-hotel-2', name: 'Mountain View Lodge', location: { street: '101 Ridge Rd', city: 'Summits', state: 'CO', zip: '80401', country: 'USA' }, assetTypeId: 'type-hotel', status: 'Under Construction' },
];


export const MOCK_USERS: User[] = [
  {
    id: 'user-admin',
    firstName: 'Admin',
    lastName: 'User',
    username: 'admin',
    email: 'admin@lumina-pebble.com',
    password: 'admin',
    isActive: true,
    assignments: [],
    globalPermissions: ['ACCESS_ADMIN_PANEL'],
    overrides: [],
  },
  {
    id: 'user-alex-chen',
    firstName: 'Alex',
    lastName: 'Chen',
    username: 'achen',
    email: 'alex.chen@lumina-pebble.com',
    password: 'password123',
    isActive: true,
    assignments: [
      { id: 'assign-ac-1', assetId: 'asset-store-0142', assetName: 'Lumina Cafe #0142', positionId: 'pos-res-sm', positionTitle: 'Store Manager' },
    ],
     globalPermissions: [],
     overrides: [
       { assetId: 'asset-store-0142', permissionId: 'perm-reports-view-pnl', hasPermission: false }, // Explicitly revoked
     ]
  },
  {
    id: 'user-maria-garcia',
    firstName: 'Maria',
    lastName: 'Garcia',
    username: 'mgarcia',
    email: 'maria.garcia@lumina-pebble.com',
    password: 'password123',
    isActive: true,
    assignments: [
      { id: 'assign-mg-1', assetId: 'asset-store-0142', assetName: 'Lumina Cafe #0142', positionId: 'pos-res-crew', positionTitle: 'Crew Member' },
    ],
    overrides: [],
  },
  {
    id: 'user-sam-jones',
    firstName: 'Sam',
    lastName: 'Jones',
    username: 'sjones',
    email: 'sam.jones@lumina-pebble.com',
    password: 'password123',
    isActive: false,
    assignments: [
      { id: 'assign-sj-1', assetId: 'asset-hotel-1', assetName: 'Pebble Beach Hotel', positionId: 'pos-hot-fda', positionTitle: 'Front Desk Agent' },
    ],
    overrides: [],
  },
  {
    id: 'user-jenna-williams',
    firstName: 'Jenna',
    lastName: 'Williams',
    username: 'jwilliams',
    email: 'jenna.williams@lumina-pebble.com',
    password: 'password123',
    isActive: true,
    assignments: [],
    globalPermissions: [],
    overrides: [],
  },
];

// --- SHIFT PLAYBOOK MOCK DATA ---
export const MOCK_SHIFT_PLAYBOOK_LOG: PlaybookLog = {
  id: 'playbook-log-1',
  assetName: 'Lumina Cafe #0142',
  shiftDate: new Date().toISOString().split('T')[0],
  status: 'In Progress',
  entries: [
    // Opening Tasks
    { id: 'e1', section: 'Opening', label: 'Unlock all doors', isCompleted: true, completedBy: 'Alex Chen', completedAt: '2024-07-30T07:02:11Z' },
    { id: 'e2', section: 'Opening', label: 'Check cash in drawer ($150)', isCompleted: true, completedBy: 'Alex Chen', completedAt: '2024-07-30T07:05:23Z' },
    { id: 'e3', section: 'Opening', label: 'Turn on all ovens and fryers', isCompleted: false },
    // Food Safety
    { id: 'e4', section: 'Food Safety', label: 'Check walk-in temperature (below 40°F)', isCompleted: true, completedBy: 'Maria Garcia', completedAt: '2024-07-30T07:15:45Z' },
    { id: 'e5', section: 'Food Safety', label: 'Check sanitizer bucket concentration', isCompleted: false },
    { id: 'e6', section: 'Food Safety', label: 'All employees washed hands upon entry', isCompleted: false },
    // Closing Tasks
    { id: 'e7', section: 'Closing', label: 'Clean grease traps', isCompleted: false },
    { id: 'e8', section: 'Closing', label: 'Take out all trash and recycling', isCompleted: false },
    { id: 'e9', section: 'Closing', label: 'Lock all doors and set alarm', isCompleted: false },
  ]
};

// --- PROJECT TEMPLATES MOCK DATA ---
export const MOCK_PROJECT_TEMPLATES: ProjectTemplate[] = [
  {
    id: 'template-1',
    name: 'New Restaurant Employee Onboarding',
    description: 'Standard onboarding checklist for all new restaurant hires (crew, shift lead).',
    appliesToAssetTypeIds: ['type-restaurant'],
    appliesToAssetIds: [],
    definedPlaceholders: [
      { id: 'ph-new-hire', name: 'New Hire', description: 'The person being onboarded.', defaultAssignment: { roleIds: [], userIds: [], placeholderIds: [] } },
      { id: 'ph-hiring-manager', name: 'Hiring Manager', description: 'The manager responsible for the new hire.', defaultAssignment: { roleIds: ['pos-res-sm'], userIds: [], placeholderIds: [] } },
    ],
    lastUpdated: '2024-07-29T14:20:11Z',
    assetAssignmentRule: { type: 'primary_only' },
    accessPermissions: { userIds: [], positionIds: ['pos-res-sm', 'pos-hot-gm'] },
    tasks: [
      { displayOrder: 1, id: 't1-1', type: 'Task', title: 'Complete I-9 and W-4 forms', description: 'HR must receive all paperwork before first shift.', assignment: { roleIds: [], userIds: [], placeholderIds: ['ph-hiring-manager'] }, dueDate: { value: 0, unit: 'Days', direction: 'After', ref: 'Project Start' }, dependencies: [], attachmentCount: 1 },
      { displayOrder: 2, id: 't1-2', type: 'Learning Module', title: 'Watch "Welcome to Lumina" video', lmsCourseIds: ['LMS-101'], requirement: 'Required', assignment: { roleIds: [], userIds: [], placeholderIds: ['ph-new-hire'] }, dueDate: { value: 1, unit: 'Days', direction: 'After', ref: 'Project Start' } },
      { displayOrder: 3, id: 't1-3', type: 'File Requirement', title: 'Upload Signed Handbook', description: 'Upload the final page of the employee handbook acknowledging you have read it.', requiresApproval: true, assignment: { roleIds: [], userIds: [], placeholderIds: ['ph-new-hire'] }, dueDate: { value: 2, unit: 'Days', direction: 'After', ref: 'Project Start' }, sopLink: '/sop/handbook-signing' },
    ]
  },
  {
    id: 'template-2',
    name: 'Hotel Front Desk Onboarding',
    description: 'Onboarding for all hotel front-of-house staff.',
    appliesToAssetTypeIds: ['type-hotel'],
    appliesToAssetIds: [],
    definedPlaceholders: [
      { id: 'ph-hot-new-hire', name: 'New Hire', description: 'The new front desk employee.', defaultAssignment: { roleIds: [], userIds: [], placeholderIds: [] } }
    ],
    lastUpdated: '2024-07-25T09:00:00Z',
    assetAssignmentRule: { type: 'primary_only' },
    accessPermissions: { userIds: [], positionIds: ['pos-hot-gm', 'pos-hot-fdm'] },
    tasks: [
      { displayOrder: 1, id: 't2-1', type: 'Task', title: 'Complete HR Paperwork', description: '', assignment: { roleIds: ['pos-hot-gm'], userIds: [], placeholderIds: [] }, dueDate: { value: 0, unit: 'Days', direction: 'After', ref: 'Project Start' }, dependencies: [] },
      { displayOrder: 2, id: 't2-2', type: 'Learning Module', title: 'Property Management System (PMS) Training', lmsCourseIds: ['LMS-201', 'LMS-202'], requirement: 'Required', assignment: { roleIds: [], userIds: [], placeholderIds: ['ph-hot-new-hire'] }, dueDate: { value: 2, unit: 'Days', direction: 'After', ref: 'Project Start' } },
      { displayOrder: 3, id: 't2-3', type: 'Task', title: 'Shadow a senior front desk agent', description: 'Minimum 4 hours of shadowing required.', assignment: { roleIds: [], userIds: [], placeholderIds: ['ph-hot-new-hire'] }, dueDate: { value: 1, unit: 'Days', direction: 'After', ref: 'Previous Step Completion' }, dependencies: ['t2-2'] },
    ]
  },
  {
    id: 'template-3',
    name: 'New Store Opening Playbook',
    description: 'Comprehensive plan for opening a new restaurant location from lease signing to grand opening.',
    appliesToAssetTypeIds: ['type-restaurant'],
    appliesToAssetIds: [],
    definedPlaceholders: [
        { id: 'ph-nro-pm', name: 'Project Manager', description: 'Overall lead for the NRO project', defaultAssignment: { userIds: ['user-admin'], roleIds: [], placeholderIds: [] } },
        { id: 'ph-nro-cl', name: 'Construction Lead', description: 'Lead for all construction-related activities', defaultAssignment: { userIds: [], roleIds: [], placeholderIds: [] } }
    ],
    lastUpdated: '2024-06-15T11:00:00Z',
    assetAssignmentRule: { type: 'primary_district' },
    accessPermissions: { userIds: ['user-admin'], positionIds: [] },
    tasks: [
        { displayOrder: 1, id: 't3-1', type: 'Sub-Project', title: 'Phase 1: Pre-Construction', subProjectTemplateId: 'template-pre-con-generic', trigger: 'Automatic', assignment: { roleIds: [], userIds: [], placeholderIds: ['ph-nro-cl'] }, dueDate: { value: 0, unit: 'Days', direction: 'After', ref: 'Project Start' }},
        { displayOrder: 2, id: 't3-2', type: 'Recurring Task', title: 'Weekly Project Sync Meeting', description: 'All stakeholders to attend.', recurrence: { freq: 'Weekly', daysOfWeek: ['M'], time: '10:00' }, assignment: { roleIds: [], userIds: [], placeholderIds: ['ph-nro-pm'] }, dueDate: { value: 1, unit: 'Weeks', direction: 'After', ref: 'Project Start' }},
        { displayOrder: 3, id: 't3-3', type: 'Discussion', title: 'Finalize Grand Opening Marketing Plan', prompt: 'Please post final versions of all marketing materials and tag the marketing team for approval.', assignment: { roleIds: [], userIds: [], placeholderIds: ['ph-nro-pm'] }, dueDate: { value: 4, unit: 'Weeks', direction: 'Before', ref: 'Project End' }},
    ]
  },
];

const launchDate = new Date('2024-07-29T10:00:00Z');
// --- ACTIVE PROJECTS MOCK DATA ---
export const MOCK_ACTIVE_PROJECTS: ActiveProject[] = [
    {
        id: 'proj-1',
        name: 'Onboard Maria Garcia',
        templateId: 'template-1',
        primaryAssetId: 'asset-store-0142',
        status: 'On Track',
        launchedAt: launchDate.toISOString(),
        launchedBy: 'user-alex-chen',
        tasks: MOCK_PROJECT_TEMPLATES[0].tasks.map((t): ActiveTask => {
          const absoluteDueDate = t.dueDate.ref === 'Project Start'
            ? addDays(launchDate, t.dueDate.value)
            : addDays(launchDate, 5); // Fallback for other refs in mock

          return {
            ...t,
            sourceType: 'project',
            assignment: {
              ...t.assignment,
              // Simulate resolution for Maria's onboarding
              userIds: t.assignment.placeholderIds.includes('ph-new-hire') ? ['user-maria-garcia'] : t.assignment.userIds,
              roleIds: t.assignment.placeholderIds.includes('ph-hiring-manager') ? ['pos-res-sm'] : t.assignment.roleIds,
              placeholderIds: [], // Resolved
            },
            status: t.id === 't1-1' ? 'Completed' : 'Pending',
            completedAt: t.id === 't1-1' ? '2024-07-29T11:30:00Z' : undefined,
            completedBy: t.id === 't1-1' ? 'Alex Chen' : undefined,
            absoluteDueDate: absoluteDueDate.toISOString(),
          }
        })
    }
];

// --- RECURRING TEMPLATES MOCK DATA ---
export const MOCK_RECURRING_TASK_TEMPLATES: RecurringTaskTemplate[] = [
  {
    id: 'rectask-1',
    title: 'Weekly Store Cleanliness Audit',
    description: 'Complete the attached cleanliness checklist for all areas of the store.',
    recurrenceRule: { freq: 'Weekly', daysOfWeek: ['M'], time: '09:00' },
    appliesToAssetId: 'asset-store-0142',
    assignment: { roleIds: ['pos-res-sm'], userIds: [], placeholderIds: [] },
    status: 'Active',
  },
  {
    id: 'rectask-2',
    title: 'End of Day Cash Count',
    recurrenceRule: { freq: 'Daily', time: '22:00' },
    appliesToAssetId: 'asset-store-0142',
    assignment: { roleIds: ['pos-res-sl'], userIds: [], placeholderIds: [] },
    status: 'Active',
  },
];

export const MOCK_RECURRING_PROJECT_TEMPLATES: RecurringProjectTemplate[] = [
    {
        id: 'recproj-1',
        seriesName: 'Monthly Financial Close',
        baseProjectTemplateId: 'template-3', // Just an example
        recurrenceRule: { freq: 'Monthly', dayOfMonth: 1, time: '08:00' },
        defaultLead: { userIds: ['user-alex-chen'], roleIds: [], placeholderIds: [] },
        status: 'Active'
    }
];


// --- UNIVERSITY MOCK DATA ---

export const MOCK_COURSES: UniversityCourse[] = [
  {
    id: 'LMS-101',
    title: 'Welcome to Lumina',
    description: 'A foundational course for all new employees covering company culture, values, and our mission.',
    assetTypeRelevance: ['type-restaurant', 'type-hotel'],
    modules: [
      { id: 'm101-1', title: 'Our Story', moduleType: 'Video', order: 1, content: { url: '...', lengthMinutes: 5 } },
      { id: 'm101-2', title: 'Company Handbook Review', moduleType: 'Document', order: 2, content: { url: '...' } },
      { id: 'm101-3', title: 'Culture Quiz', moduleType: 'Quiz', order: 3, content: { questions: [] } },
    ]
  },
  {
    id: 'LMS-201',
    title: 'Property Management System (PMS) Basics',
    description: 'Learn the fundamentals of our PMS, including check-ins, check-outs, and reservation management.',
    assetTypeRelevance: ['type-hotel'],
    recertificationRule: { interval: 1, unit: 'year', method: 'refresher_exam' },
    modules: [
      { id: 'm201-1', title: 'Navigating the Dashboard', moduleType: 'Video', order: 1, content: { url: '...', lengthMinutes: 10 } },
      { id: 'm201-2', title: 'Handling a Guest Check-in', moduleType: 'Simulation', order: 2, content: { questions: [] } },
      { id: 'm201-3', title: 'Final Exam', moduleType: 'Quiz', order: 3, content: { questions: [] } },
    ]
  },
  {
    id: 'LMS-202',
    title: 'Guest Service Excellence',
    description: 'Master the art of providing 5-star service to every guest, every time.',
    assetTypeRelevance: ['type-hotel'],
    modules: []
  },
  {
    id: 'LMS-301',
    title: 'Food Safety & Handling',
    description: 'A critical course for all food service staff on proper safety and handling procedures.',
    assetTypeRelevance: ['type-restaurant'],
    recertificationRule: { interval: 2, unit: 'year', method: 'full_course' },
    modules: []
  },
];

export const MOCK_ENROLLMENTS: UserEnrollment[] = [
  { id: 'enroll-1', userId: 'user-maria-garcia', courseId: 'LMS-101', status: 'Completed', completionDate: '2024-07-30T10:00:00Z', score: 95, progress: 100 },
  { id: 'enroll-2', userId: 'user-maria-garcia', courseId: 'LMS-301', status: 'In Progress', progress: 50 },
  { id: 'enroll-3', userId: 'user-alex-chen', courseId: 'LMS-101', status: 'Completed', completionDate: '2024-05-15T10:00:00Z', score: 100, progress: 100 },
  { id: 'enroll-4', userId: 'user-alex-chen', courseId: 'LMS-301', status: 'Completed', completionDate: '2024-05-20T10:00:00Z', score: 92, progress: 100 },
  { id: 'enroll-5', userId: 'user-sam-jones', courseId: 'LMS-201', status: 'Not Started', progress: 0 },
  { id: 'enroll-6', userId: 'user-sam-jones', courseId: 'LMS-202', status: 'In Progress', progress: 25 },
];

export const MOCK_CERTIFICATIONS: UserCertification[] = [
    { id: 'cert-1', userId: 'user-alex-chen', courseId: 'LMS-301', issueDate: '2024-05-20T10:00:00Z', expirationDate: '2026-05-20T10:00:00Z' },
    { id: 'cert-2', userId: 'user-maria-garcia', courseId: 'LMS-101', issueDate: '2024-07-30T10:00:00Z' },
];

export const MOCK_LEARNING_PATHS: LearningPath[] = [
    {
        id: 'path-1',
        title: 'Restaurant Manager Certification',
        description: 'Complete this path to become certified as a Store Manager within the Lumina system.',
        stages: [
            { id: 'ps-1-1', title: 'Phase 1: Foundational Skills', order: 1, requirements: [
                { type: 'course', courseId: 'LMS-101' },
                { type: 'course', courseId: 'LMS-301' },
            ]},
            { id: 'ps-1-2', title: 'Phase 2: Leadership Training', order: 2, requirements: [
                { type: 'project', projectTemplateId: 'template-1' }, // Onboarding a new hire
                { type: 'manual_sign_off', description: 'Demonstrate ability to run a shift solo.' },
            ]},
        ]
    },
    {
        id: 'path-2',
        title: 'Hotel General Manager Track',
        description: 'The complete career path for aspiring General Managers.',
        unlockPrerequisites: { requiredCertificationIds: ['cert-1'] }, // Example: needs food safety cert
        stages: []
    }
];