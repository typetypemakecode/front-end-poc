import type { TaskData } from '../types/task';

export const mockTasks: TaskData[] = [
  // Inbox tasks (no dueDate, no listId - uncategorized)
  {
    id: 'task-1',
    title: 'Review Q1 budget proposal',
    description: 'Analyze the updated budget and provide feedback to finance team',
    priority: 'high',
    status: 'active',
    tags: ['finance', 'urgent'],
    createdAt: '2025-10-01T10:00:00Z',
    updatedAt: '2025-10-01T10:00:00Z'
  },
  {
    id: 'task-2',
    title: 'Update documentation',
    description: 'Add new API endpoints to developer docs',
    priority: 'low',
    status: 'active',
    createdAt: '2025-10-03T14:30:00Z',
    updatedAt: '2025-10-03T14:30:00Z'
  },
  {
    id: 'task-3',
    title: 'Read new design system article',
    priority: 'low',
    status: 'active',
    createdAt: '2025-10-04T14:30:00Z',
    updatedAt: '2025-10-04T14:30:00Z'
  },

  // Work area tasks
  {
    id: 'task-4',
    title: 'Complete feature branch merge',
    description: 'Merge authentication feature and resolve conflicts',
    priority: 'high',
    status: 'active',
    dueDate: '2025-10-08',
    listId: 'work',
    tags: ['development', 'git'],
    createdAt: '2025-10-07T08:00:00Z',
    updatedAt: '2025-10-07T08:00:00Z'
  },
  {
    id: 'task-5',
    title: 'Client presentation prep',
    priority: 'high',
    status: 'active',
    dueDate: '2025-10-08',
    listId: 'work',
    tags: ['presentation'],
    createdAt: '2025-10-08T06:00:00Z',
    updatedAt: '2025-10-08T06:00:00Z'
  },

  // Home area tasks
  {
    id: 'task-6',
    title: 'Fix leaky faucet',
    priority: 'medium',
    status: 'active',
    dueDate: '2025-10-12',
    listId: 'home',
    tags: ['maintenance'],
    createdAt: '2025-10-01T12:00:00Z',
    updatedAt: '2025-10-01T12:00:00Z'
  },
  {
    id: 'task-7',
    title: 'Organize garage',
    description: 'Sort through boxes and donate unused items',
    priority: 'low',
    status: 'active',
    listId: 'home',
    createdAt: '2025-10-04T16:00:00Z',
    updatedAt: '2025-10-04T16:00:00Z'
  },

  // Health area tasks
  {
    id: 'task-18',
    title: 'Schedule annual checkup',
    priority: 'medium',
    status: 'active',
    dueDate: '2025-10-20',
    listId: 'health',
    tags: ['medical'],
    createdAt: '2025-10-02T10:00:00Z',
    updatedAt: '2025-10-02T10:00:00Z'
  },
  {
    id: 'task-19',
    title: 'Refill prescriptions',
    priority: 'high',
    status: 'active',
    dueDate: '2025-10-14',
    listId: 'health',
    tags: ['medical'],
    createdAt: '2025-10-03T14:00:00Z',
    updatedAt: '2025-10-03T14:00:00Z'
  },

  // Work area tasks
  {
    id: 'task-8',
    title: 'Code review for Sarah',
    description: 'Review PR #234 - User authentication refactor',
    priority: 'high',
    status: 'active',
    dueDate: '2025-10-09',
    listId: 'work',
    tags: ['code-review', 'team'],
    createdAt: '2025-10-05T11:00:00Z',
    updatedAt: '2025-10-05T11:00:00Z'
  },
  {
    id: 'task-9',
    title: 'Update team wiki',
    priority: 'low',
    status: 'active',
    listId: 'work',
    createdAt: '2025-10-06T13:00:00Z',
    updatedAt: '2025-10-06T13:00:00Z'
  },

  // IOS App project tasks
  {
    id: 'task-10',
    title: 'Design login screen mockup',
    description: 'Create high-fidelity mockups for iOS',
    priority: 'high',
    status: 'active',
    dueDate: '2025-10-10',
    listId: 'ios_app',
    tags: ['design', 'ui'],
    createdAt: '2025-10-02T10:00:00Z',
    updatedAt: '2025-10-02T10:00:00Z'
  },
  {
    id: 'task-11',
    title: 'Implement push notifications',
    description: 'Set up Firebase Cloud Messaging for iOS',
    priority: 'medium',
    status: 'active',
    listId: 'ios_app',
    tags: ['development', 'notifications'],
    createdAt: '2025-10-03T15:00:00Z',
    updatedAt: '2025-10-03T15:00:00Z'
  },
  {
    id: 'task-12',
    title: 'Write unit tests for auth module',
    priority: 'medium',
    status: 'active',
    listId: 'ios_app',
    createdAt: '2025-10-04T09:00:00Z',
    updatedAt: '2025-10-04T09:00:00Z'
  },

  // Website project tasks
  {
    id: 'task-13',
    title: 'Finalize color palette',
    description: 'Choose final brand colors and create design tokens',
    priority: 'high',
    status: 'active',
    dueDate: '2025-10-11',
    listId: 'website',
    tags: ['design', 'branding'],
    createdAt: '2025-10-01T11:00:00Z',
    updatedAt: '2025-10-01T11:00:00Z'
  },
  {
    id: 'task-14',
    title: 'Migrate to new CMS',
    description: 'Set up Sanity.io and migrate existing content',
    priority: 'high',
    status: 'active',
    listId: 'website',
    tags: ['cms', 'migration'],
    createdAt: '2025-10-05T14:00:00Z',
    updatedAt: '2025-10-05T14:00:00Z'
  },
  {
    id: 'task-15',
    title: 'Optimize images for performance',
    priority: 'medium',
    status: 'active',
    listId: 'website',
    createdAt: '2025-10-06T10:00:00Z',
    updatedAt: '2025-10-06T10:00:00Z'
  },

  // Marketing project tasks
  {
    id: 'task-20',
    title: 'Plan Q4 campaign strategy',
    description: 'Develop marketing strategy for holiday season',
    priority: 'high',
    status: 'active',
    dueDate: '2025-10-15',
    listId: 'marketing',
    tags: ['strategy', 'planning'],
    createdAt: '2025-10-01T09:00:00Z',
    updatedAt: '2025-10-01T09:00:00Z'
  },
  {
    id: 'task-21',
    title: 'Create social media content calendar',
    priority: 'medium',
    status: 'active',
    dueDate: '2025-10-13',
    listId: 'marketing',
    tags: ['social-media', 'content'],
    createdAt: '2025-10-03T11:00:00Z',
    updatedAt: '2025-10-03T11:00:00Z'
  },

  // Past due tasks
  {
    id: 'task-16',
    title: 'Submit quarterly report',
    description: 'Q3 report was due last week',
    priority: 'high',
    status: 'active',
    dueDate: '2025-10-01',
    listId: 'work',
    tags: ['admin', 'overdue'],
    createdAt: '2025-09-20T09:00:00Z',
    updatedAt: '2025-09-20T09:00:00Z'
  },
  {
    id: 'task-17',
    title: 'Follow up with client',
    description: 'Client email from last Friday needs response',
    priority: 'medium',
    status: 'active',
    dueDate: '2025-10-05',
    listId: 'work',
    tags: ['client', 'email'],
    createdAt: '2025-09-28T10:00:00Z',
    updatedAt: '2025-09-28T10:00:00Z'
  },

  // Completed tasks
  {
    id: 'task-22',
    title: 'Submit expense report',
    priority: 'medium',
    status: 'completed',
    listId: 'work',
    tags: ['admin'],
    createdAt: '2025-09-28T09:00:00Z',
    updatedAt: '2025-10-01T16:00:00Z'
  },
  {
    id: 'task-23',
    title: 'Fix navigation bug',
    description: 'Resolved issue with mobile menu not closing',
    priority: 'high',
    status: 'completed',
    listId: 'website',
    tags: ['bug', 'mobile'],
    createdAt: '2025-09-30T10:00:00Z',
    updatedAt: '2025-10-02T15:00:00Z'
  }
];
