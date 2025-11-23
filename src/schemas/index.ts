import { z } from 'zod';

/**
 * Zod schemas for runtime validation of API responses and data structures
 */

// Priority enum - shared by both sidebar items and tasks
export const PrioritySchema = z.enum(['low', 'medium', 'high']);
export type Priority = z.infer<typeof PrioritySchema>;

// Task-specific schemas
export const TaskStatusSchema = z.enum(['active', 'completed', 'archived']);
export type TaskStatus = z.infer<typeof TaskStatusSchema>;

export const TaskDataSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string().optional(),
  priority: PrioritySchema,
  status: TaskStatusSchema,
  dueDate: z.string().optional(),
  order: z.number().optional(),
  listId: z.string().optional(),
  tags: z.array(z.string()).optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const CreateTaskInputSchema = z.object({
  title: z.string(),
  description: z.string().optional(),
  priority: PrioritySchema.optional(),
  status: TaskStatusSchema.optional(),
  dueDate: z.string().optional(),
  order: z.number().optional(),
  listId: z.string().optional(),
  tags: z.array(z.string()).optional(),
});

export const UpdateTaskInputSchema = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
  priority: PrioritySchema.optional(),
  status: TaskStatusSchema.optional(),
  dueDate: z.string().optional(),
  order: z.number().optional(),
  listId: z.string().optional(),
  tags: z.array(z.string()).optional(),
});

export const TaskCountsSchema = z.object({
  all: z.number(),
  active: z.number(),
  completed: z.number(),
  archived: z.number(),
});

// Re-export IconName from iconMapper for consistency
export type { IconName } from '../utils/iconMapper';

// Zod schema for icon names - must match iconMapper.ts
export const IconNameSchema = z.enum([
  'Activity',
  'Briefcase',
  'Calendar',
  'CalendarDays',
  'Circle',
  'Folder',
  'Globe',
  'House',
  'Inbox',
  'Megaphone',
  'Smartphone',
  'Tag',
  'TriangleAlert',
]);

// Sidebar schemas
export const SidebarItemDataSchema = z.object({
  key: z.string(),
  iconName: IconNameSchema,
  title: z.string(),
  description: z.string().optional(),
  count: z.number(),
  priority: PrioritySchema,
  dueDate: z.string().optional(),
  showCount: z.boolean().optional(),
});

export const SidebarConfigDataSchema = z.object({
  smartLists: z.array(SidebarItemDataSchema),
  areas: z.array(SidebarItemDataSchema),
  projects: z.array(SidebarItemDataSchema),
});

// Export type inference for TypeScript
export type TaskData = z.infer<typeof TaskDataSchema>;
export type CreateTaskInput = z.infer<typeof CreateTaskInputSchema>;
export type UpdateTaskInput = z.infer<typeof UpdateTaskInputSchema>;
export type TaskCounts = z.infer<typeof TaskCountsSchema>;
export type SidebarItemData = z.infer<typeof SidebarItemDataSchema>;
export type SidebarConfigData = z.infer<typeof SidebarConfigDataSchema>;
