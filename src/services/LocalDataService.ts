import type { IDataService } from './IDataService';
import type { SidebarConfigData, SidebarItemData, Priority } from '../types/sidebar';
import type { TaskData, CreateTaskInput, UpdateTaskInput, TaskCounts } from '../types/task';
import type { IconName } from '../utils/iconMapper';
import sidebarConfigData from '../data/initialSidebarConfig.json';
import initialTasks from '../data/initialTasks.json';

/**
 * Local implementation of IDataService
 * Uses localStorage for persistence in the browser
 * Falls back to JSON file data if localStorage is empty
 */
export class LocalDataService implements IDataService {
  private localData: SidebarConfigData;
  private tasks: TaskData[];
  private readonly STORAGE_KEY = 'sidebarConfig';
  private readonly TASKS_STORAGE_KEY = 'tasks';

  constructor() {
    // Load initial data from JSON or localStorage
    this.localData = this.loadFromLocalStorage() || ({ ...sidebarConfigData } as SidebarConfigData);
    this.tasks = this.loadTasksFromLocalStorage() || (initialTasks as TaskData[]);
  }

  async getSidebarConfig(): Promise<SidebarConfigData> {
    // Helper function to parse date strings consistently (as local dates, not UTC)
    const parseDate = (dateString: string): Date => {
      const [year, month, day] = dateString.split('-').map(Number);
      return new Date(year, month - 1, day); // month is 0-indexed
    };

    // Helper function to calculate smart list counts with special logic
    const getSmartListCount = (key: string): number => {
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Start of today

      const sevenDaysFromNow = new Date(today);
      sevenDaysFromNow.setDate(today.getDate() + 7);

      switch (key) {
        case 'inbox': {
          // Inbox = uncategorized tasks (no dueDate AND no listId)
          const inboxTasks = this.tasks.filter(task => {
            const isInbox = !task.dueDate && !task.listId && task.status !== 'completed';
            if (isInbox) {
              console.log(`[INBOX] ${task.title} - no due date, no list`);
            }
            return isInbox;
          });
          console.log(`[INBOX COUNT] ${inboxTasks.length} tasks`);
          return inboxTasks.length;
        }

        case 'today': {
          // Tasks due today
          const todayTasks = this.tasks.filter(task => {
            if (!task.dueDate || task.status === 'completed') return false;
            const dueDate = parseDate(task.dueDate);
            const isToday = dueDate.getFullYear() === today.getFullYear() &&
                           dueDate.getMonth() === today.getMonth() &&
                           dueDate.getDate() === today.getDate();
            if (isToday) {
              console.log(`[TODAY] ${task.title} - due: ${task.dueDate}, status: ${task.status}`);
            }
            return isToday;
          });
          console.log(`[TODAY COUNT] ${todayTasks.length} tasks`);
          return todayTasks.length;
        }

        case 'upcoming': {
          // Tasks due in the next 7 days (excluding today)
          const upcomingTasks = this.tasks.filter(task => {
            if (!task.dueDate || task.status === 'completed') return false;
            const dueDate = parseDate(task.dueDate);
            const isUpcoming = dueDate > today && dueDate <= sevenDaysFromNow;
            if (isUpcoming) {
              console.log(`[UPCOMING] ${task.title} - due: ${task.dueDate}, status: ${task.status}`);
            }
            return isUpcoming;
          });
          console.log(`[UPCOMING COUNT] ${upcomingTasks.length} tasks (today: ${today.toISOString().split('T')[0]}, through: ${sevenDaysFromNow.toISOString().split('T')[0]})`);
          return upcomingTasks.length;
        }

        case 'past_due': {
          // Tasks overdue (due date before today)
          const pastDueTasks = this.tasks.filter(task => {
            if (!task.dueDate || task.status === 'completed') return false;
            const dueDate = parseDate(task.dueDate);
            const isPastDue = dueDate < today;
            if (isPastDue) {
              console.log(`[PAST_DUE] ${task.title} - due: ${task.dueDate}, status: ${task.status}`);
            }
            return isPastDue;
          });
          console.log(`[PAST_DUE COUNT] ${pastDueTasks.length} tasks`);
          return pastDueTasks.length;
        }

        case 'tags': {
          // Tasks that have at least one tag (includes all statuses: active, completed, archived)
          const taggedTasks = this.tasks.filter(task => {
            const hasTags = task.tags && task.tags.length > 0;
            if (hasTags) {
              console.log(`[TAGS] ${task.title} - tags: ${task.tags?.join(', ')}`);
            }
            return hasTags;
          });
          console.log(`[TAGS COUNT] ${taggedTasks.length} tasks`);
          return taggedTasks.length;
        }

        default:
          // For other smart lists (anytime, someday, logbook, etc.)
          // These don't have special logic yet, so return 0
          console.log(`[${key.toUpperCase()} COUNT] 0 tasks (no special logic defined)`);
          return 0;
      }
    };

    // Calculate dynamic counts for smart lists, areas, and projects
    const configWithCounts: SidebarConfigData = {
      smartLists: this.localData.smartLists.map(item => ({
        ...item,
        count: getSmartListCount(item.key)
      })),
      areas: this.localData.areas.map(item => ({
        ...item,
        count: this.tasks.filter(task => task.listId === item.key && task.status !== 'completed').length
      })),
      projects: this.localData.projects.map(item => ({
        ...item,
        count: this.tasks.filter(task => task.listId === item.key && task.status !== 'completed').length
      }))
    };

    return Promise.resolve(configWithCounts);
  }

  getLocalSidebarConfig(): SidebarConfigData {
    return { ...this.localData };
  }

  async addArea(title: string, iconName: IconName = 'Circle', priority: Priority = 'medium', description?: string): Promise<SidebarItemData> {
    const newArea: SidebarItemData = {
      key: this.generateKey(title),
      iconName,
      title,
      description,
      count: 0,
      priority,
      showCount: false
    };

    this.localData.areas.push(newArea);
    this.persistLocalData();

    return newArea;
  }

  async addProject(title: string, iconName: IconName = 'Folder', priority: Priority = 'medium', description?: string, dueDate?: string): Promise<SidebarItemData> {
    const newProject: SidebarItemData = {
      key: this.generateKey(title),
      iconName,
      title,
      description,
      count: 0,
      priority,
      dueDate,
      showCount: false
    };

    this.localData.projects.push(newProject);
    this.persistLocalData();

    return newProject;
  }

  getDataSourceMode(): 'api' | 'local' {
    return 'local';
  }

  /**
   * Generates a unique key from a title
   */
  private generateKey(title: string): string {
    const baseKey = title.toLowerCase().replace(/\s+/g, '_');
    // Add timestamp suffix to ensure uniqueness
    return `${baseKey}_${Date.now()}`;
  }

  /**
   * Persists local data to localStorage
   */
  private persistLocalData(): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.localData));
      console.log('✅ Sidebar configuration saved to localStorage');
    } catch (error) {
      console.error('❌ Failed to persist local data:', error);
    }
  }

  /**
   * Loads data from localStorage if available
   */
  private loadFromLocalStorage(): SidebarConfigData | null {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        console.log('✅ Sidebar configuration loaded from localStorage');
        return JSON.parse(stored);
      }
    } catch (error) {
      console.error('❌ Failed to load from localStorage:', error);
    }
    return null;
  }

  /**
   * Resets data to the original JSON file
   * Useful for development/testing
   */
  public reset(): void {
    localStorage.removeItem(this.STORAGE_KEY);
    this.localData = { ...sidebarConfigData } as SidebarConfigData;
    console.log('🔄 Sidebar configuration reset to defaults');
  }

  // Task methods

  async getTasks(listId?: string, status?: 'active' | 'completed', page?: number, limit?: number): Promise<TaskData[]> {
    let filteredTasks = [...this.tasks];
    if (listId) {
      filteredTasks = filteredTasks.filter(task => task.listId === listId);
    }
    if (status) {
      filteredTasks = filteredTasks.filter(task => task.status === status);
    }

    // Sort by order field (tasks without order go to the end)
    filteredTasks.sort((a, b) => {
      if (a.order === undefined && b.order === undefined) return 0;
      if (a.order === undefined) return 1;
      if (b.order === undefined) return -1;
      return a.order - b.order;
    });

    if (page !== undefined && limit !== undefined) {
      const start = (page - 1) * limit;
      filteredTasks = filteredTasks.slice(start, start + limit);
    }
    return filteredTasks;
  }

  async getTaskCounts(listId?: string): Promise<TaskCounts> {
    let filteredTasks = [...this.tasks];

    if (listId) {
      filteredTasks = filteredTasks.filter(task => task.listId === listId);
    }

    return {
      all: filteredTasks.length,
      active: filteredTasks.filter(task => task.status === 'active').length,
      completed: filteredTasks.filter(task => task.status === 'completed').length,
      archived: filteredTasks.filter(task => task.status === 'archived').length,
    };
  }

  async getTask(id: string): Promise<TaskData | null> {
    const task = this.tasks.find(task => task.id === id);
    return task ? { ...task } : null;
  }

  async createTask(input: CreateTaskInput): Promise<TaskData> {
    const now = new Date().toISOString();

    // Auto-assign order if not provided
    let order = input.order;
    if (order === undefined) {
      // Find max order value and add 1
      const maxOrder = this.tasks.reduce((max, task) => {
        return task.order !== undefined && task.order > max ? task.order : max;
      }, -1);
      order = maxOrder + 1;
    }

    const newTask: TaskData = {
      id: this.generateTaskId(),
      title: input.title,
      description: input.description,
      priority: input.priority || 'medium',
      status: input.status || 'active',
      dueDate: input.dueDate,
      order,
      listId: input.listId,
      tags: input.tags || [],
      createdAt: now,
      updatedAt: now
    };

    this.tasks.push(newTask);
    this.persistTasks();

    return { ...newTask };
  }

  async updateTask(id: string, updates: UpdateTaskInput): Promise<TaskData> {
    const taskIndex = this.tasks.findIndex(task => task.id === id);
    if (taskIndex === -1) {
      throw new Error(`Task with id ${id} not found`);
    }

    const updatedTask: TaskData = {
      ...this.tasks[taskIndex],
      ...updates,
      updatedAt: new Date().toISOString()
    };

    this.tasks[taskIndex] = updatedTask;
    this.persistTasks();

    return { ...updatedTask };
  }

  async deleteTask(id: string): Promise<void> {
    const taskIndex = this.tasks.findIndex(task => task.id === id);
    if (taskIndex === -1) {
      throw new Error(`Task with id ${id} not found`);
    }

    this.tasks.splice(taskIndex, 1);
    this.persistTasks();
  }

  async reorderTasks(taskIds: string[]): Promise<void> {
    // Validation: check for duplicates
    const idSet = new Set(taskIds);
    if (idSet.size !== taskIds.length) {
      throw new Error('Duplicate task IDs in reorder list');
    }

    // Validation: ensure all task IDs exist
    const currentIds = new Set(this.tasks.map(task => task.id));
    for (const id of taskIds) {
      if (!currentIds.has(id)) {
        throw new Error(`Task ID ${id} not found in current tasks`);
      }
    }

    // Update order field for each task based on position in array
    taskIds.forEach((id, index) => {
      const task = this.tasks.find(t => t.id === id);
      if (task) {
        task.order = index;
        task.updatedAt = new Date().toISOString();
      }
    });

    this.persistTasks();
  }

  /**
   * Generates a unique ID for a new task
   */
  private generateTaskId(): string {
    return `task-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
  }

  /**
   * Persists tasks to localStorage
   */
  private persistTasks(): void {
    try {
      localStorage.setItem(this.TASKS_STORAGE_KEY, JSON.stringify(this.tasks));
      console.log('✅ Tasks saved to localStorage');
    } catch (error) {
      console.error('❌ Failed to persist tasks:', error);
    }
  }

  /**
   * Loads tasks from localStorage if available
   */
  private loadTasksFromLocalStorage(): TaskData[] | null {
    try {
      const stored = localStorage.getItem(this.TASKS_STORAGE_KEY);
      if (stored) {
        console.log('✅ Tasks loaded from localStorage');
        return JSON.parse(stored);
      }
    } catch (error) {
      console.error('❌ Failed to load tasks from localStorage:', error);
    }
    return null;
  }
}