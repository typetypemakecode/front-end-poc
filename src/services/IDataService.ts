import type { SidebarConfigData, SidebarItemData, Priority } from '../types/sidebar';
import type { TaskData, CreateTaskInput, UpdateTaskInput, TaskCounts } from '../types/task';
import type { IconName } from '../utils/iconMapper';
import type { NoteSection, JournalEntry, CreateSectionInput, UpdateSectionInput, CreateJournalEntryInput, UpdateJournalEntryInput } from '../types/notes';

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
  addArea(title: string, iconName?: IconName, priority?: Priority, description?: string): Promise<SidebarItemData>;

  /**
   * Adds a new project to the sidebar configuration
   * @param title - The title of the new project
   * @param iconName - The icon name from lucide-react
   * @param priority - The priority level
   * @param description - Optional description for the project
   * @param dueDate - Optional due date for the project (ISO format: YYYY-MM-DD)
   * @returns Promise<SidebarItemData> - The newly created project
   */
  addProject(title: string, iconName?: IconName, priority?: Priority, description?: string, dueDate?: string): Promise<SidebarItemData>;

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

  // Note section operations

  /**
   * Gets all sections for a project/area
   * @param listId - The project or area key
   * @returns Promise<NoteSection[]>
   */
  getSections(listId: string): Promise<NoteSection[]>;

  /**
   * Creates a new section in a project/area
   * @param listId - The project or area key
   * @param input - Section data
   * @returns Promise<NoteSection>
   */
  createSection(listId: string, input: CreateSectionInput): Promise<NoteSection>;

  /**
   * Updates a section
   * @param listId - The project or area key
   * @param sectionId - The section ID
   * @param updates - Partial section data
   * @returns Promise<NoteSection>
   */
  updateSection(listId: string, sectionId: string, updates: UpdateSectionInput): Promise<NoteSection>;

  /**
   * Deletes a section
   * @param listId - The project or area key
   * @param sectionId - The section ID
   * @returns Promise<void>
   */
  deleteSection(listId: string, sectionId: string): Promise<void>;

  /**
   * Reorders sections within a project/area
   * @param listId - The project or area key
   * @param sectionIds - Array of section IDs in new order
   * @returns Promise<void>
   */
  reorderSections(listId: string, sectionIds: string[]): Promise<void>;

  // Journal entry operations

  /**
   * Gets all journal entries for a project/area
   * @param listId - The project or area key
   * @returns Promise<JournalEntry[]>
   */
  getJournalEntries(listId: string): Promise<JournalEntry[]>;

  /**
   * Creates a new journal entry
   * @param listId - The project or area key
   * @param input - Entry data
   * @returns Promise<JournalEntry>
   */
  createJournalEntry(listId: string, input: CreateJournalEntryInput): Promise<JournalEntry>;

  /**
   * Updates a journal entry
   * @param listId - The project or area key
   * @param entryId - The entry ID
   * @param updates - Entry data
   * @returns Promise<JournalEntry>
   */
  updateJournalEntry(listId: string, entryId: string, updates: UpdateJournalEntryInput): Promise<JournalEntry>;

  /**
   * Deletes a journal entry
   * @param listId - The project or area key
   * @param entryId - The entry ID
   * @returns Promise<void>
   */
  deleteJournalEntry(listId: string, entryId: string): Promise<void>;

}