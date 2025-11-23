// Task data types - used for API/storage layer

// Re-export types from schemas for consistency
import type { Priority as TaskPriority, TaskStatus } from '../schemas';
export type { Priority as TaskPriority, TaskStatus } from '../schemas';

export interface TaskData {
  id: string;
  title: string;
  description?: string;
  priority: TaskPriority;
  status: TaskStatus;
  dueDate?: string;
  order?: number;
  listId?: string; // Smart list, area, or project ID
  tags?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateTaskInput {
  title: string;
  description?: string;
  priority?: TaskPriority;
  order?: number;
  status?: TaskStatus;
  dueDate?: string;
  listId?: string;
  tags?: string[];
}

export interface UpdateTaskInput {
  title?: string;
  description?: string;
  priority?: TaskPriority;
  order?: number;
  status?: TaskStatus;
  dueDate?: string;
  listId?: string;
  tags?: string[];
}

export interface TaskCounts {
  all: number;
  active: number;
  completed: number;
  archived: number;
}
