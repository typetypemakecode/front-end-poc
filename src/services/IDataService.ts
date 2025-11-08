import type { SidebarConfigData, SidebarItemData, Priority } from '../types/sidebar';
import type { TaskData, CreateTaskInput, UpdateTaskInput, TaskCounts } from '../types/task';

/**
 * Interface for data service implementations
 * Allows for different storage strategies (API, local storage, file system, etc.)
 */
export interface IDataService {
  /**
   * Fetches sidebar configuration data
   * @returns Promise<SidebarConfigData>
   */
  getSidebarConfig(): Promise<SidebarConfigData>;

  /**
   * Gets immediate access to cached data without async
   * @returns SidebarConfigData
   */
  getLocalSidebarConfig(): SidebarConfigData;

  /**
   * Adds a new area to the sidebar configuration
   * @param title - The title of the new area
   * @param iconName - The icon name from lucide-react
   * @param priority - The priority level
   * @param description - Optional description for the area
   * @returns Promise<SidebarItemData> - The newly created area
   */
  addArea(title: string, iconName?: string, priority?: Priority, description?: string): Promise<SidebarItemData>;

  /**
   * Adds a new project to the sidebar configuration
   * @param title - The title of the new project
   * @param iconName - The icon name from lucide-react
   * @param priority - The priority level
   * @param description - Optional description for the project
   * @param dueDate - Optional due date for the project (ISO format: YYYY-MM-DD)
   * @returns Promise<SidebarItemData> - The newly created project
   */
  addProject(title: string, iconName?: string, priority?: Priority, description?: string, dueDate?: string): Promise<SidebarItemData>;

  /**
   * Gets the current data source mode
   * @returns 'api' | 'local'
   */
  getDataSourceMode(): 'api' | 'local';

  // Task operations

  /**
   * Gets all tasks, optionally filtered by list ID
   * @param listId - Optional ID of smart list, area, or project to filter by
   * @returns Promise<TaskData[]>
   */
  getTasks(listId?: string, status?: 'active' | 'completed', page?: number, limit?: number): Promise<TaskData[]>;

  /**
   * Gets task counts by status
   * @param listId - Optional ID of smart list, area, or project to filter by
   * @returns Promise<TaskCounts>
   */
  getTaskCounts(listId?: string): Promise<TaskCounts>;

  /**
   * Gets a single task by ID
   * @param id - The task ID
   * @returns Promise<TaskData | null>
   */
  getTask(id: string): Promise<TaskData | null>;

  /**
   * Creates a new task
   * @param task - Task data without id, createdAt, updatedAt
   * @returns Promise<TaskData> - The newly created task
   */
  createTask(task: CreateTaskInput): Promise<TaskData>;

  /**
   * Updates an existing task
   * @param id - The task ID
   * @param updates - Partial task data to update
   * @returns Promise<TaskData> - The updated task
   */
  updateTask(id: string, updates: UpdateTaskInput): Promise<TaskData>;

  /**
   * Deletes a task
   * @param id - The task ID
   * @returns Promise<void>
   */
  deleteTask(id: string): Promise<void>;

  /**
   * Reorders tasks based on provided array of task IDs
   * @param taskIds - Array of task IDs in the new order
   * @returns Promise<void>
   */
  reorderTasks(taskIds: string[]): Promise<void>;

}