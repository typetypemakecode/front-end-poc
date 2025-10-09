import type { IDataService } from './IDataService';
import type { SidebarConfigData, SidebarItemData, Priority } from '../types/sidebar';
import type { TaskData, CreateTaskInput, UpdateTaskInput, TaskCounts } from '../types/task';
import sidebarConfigData from '../data/sidebarConfig.json';

/**
 * API-based implementation of IDataService
 * Fetches and persists data to a backend API
 * Falls back to local data if API requests fail
 */
export class ApiDataService implements IDataService {
  private baseUrl: string;
  private cachedData: SidebarConfigData;
  private cachedTasks: TaskData[] = [];

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
    // Initialize with fallback data
    this.cachedData = { ...sidebarConfigData } as SidebarConfigData;
  }

  async getSidebarConfig(): Promise<SidebarConfigData> {
    try {
      const response = await fetch(`${this.baseUrl}/sidebar-config`);

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      // Update cache
      this.cachedData = data;
      console.log('✅ Sidebar configuration loaded from API');
      return data;
    } catch (error) {
      console.error('❌ Failed to fetch sidebar config from API, using cached data:', error);
      // Fallback to cached data
      return { ...this.cachedData };
    }
  }

  getLocalSidebarConfig(): SidebarConfigData {
    return { ...this.cachedData };
  }

  async addArea(title: string, iconName: string = 'Circle', priority: Priority = 'medium'): Promise<SidebarItemData> {
    const newArea: SidebarItemData = {
      key: this.generateKey(title),
      iconName,
      title,
      count: 0,
      priority,
      showCount: false
    };

    try {
      const response = await fetch(`${this.baseUrl}/areas`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newArea),
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status} ${response.statusText}`);
      }

      const createdArea = await response.json();
      // Update cache
      this.cachedData.areas.push(createdArea);
      console.log('✅ Area created via API');
      return createdArea;
    } catch (error) {
      console.error('❌ Failed to add area via API:', error);
      throw error; // Re-throw to let caller handle
    }
  }

  async addProject(title: string, iconName: string = 'Folder', priority: Priority = 'medium'): Promise<SidebarItemData> {
    const newProject: SidebarItemData = {
      key: this.generateKey(title),
      iconName,
      title,
      count: 0,
      priority,
      showCount: false
    };

    try {
      const response = await fetch(`${this.baseUrl}/projects`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newProject),
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status} ${response.statusText}`);
      }

      const createdProject = await response.json();
      // Update cache
      this.cachedData.projects.push(createdProject);
      console.log('✅ Project created via API');
      return createdProject;
    } catch (error) {
      console.error('❌ Failed to add project via API:', error);
      throw error; // Re-throw to let caller handle
    }
  }

  getDataSourceMode(): 'api' | 'local' {
    return 'api';
  }

  /**
   * Generates a unique key from a title
   */
  private generateKey(title: string): string {
    const baseKey = title.toLowerCase().replace(/\s+/g, '_');
    return `${baseKey}_${Date.now()}`;
  }

  /**
   * Sets the base URL for API requests
   * Useful for switching between environments
   */
  public setBaseUrl(url: string): void {
    this.baseUrl = url;
    console.log(`🔄 API base URL updated to: ${url}`);
  }

  // Task methods

  async getTasks(listId?: string, status?: 'active' | 'completed', page?: number, limit?: number): Promise<TaskData[]> {
    try {
      const params = new URLSearchParams();
      if (listId) params.append('listId', listId);
      if (status) params.append('status', status);
      if (page) params.append('page', page.toString());
      if (limit) params.append('limit', limit.toString());
      const queryString = params.toString();
      const fullUrl = queryString ? `${this.baseUrl}/tasks?${queryString}` : `${this.baseUrl}/tasks`;

      const response = await fetch(fullUrl);

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status} ${response.statusText}`);
      }

      const tasks = await response.json();
      // Update cache
      this.cachedTasks = tasks;
      console.log('✅ Tasks loaded from API');
      return tasks;
    } catch (error) {
      console.error('❌ Failed to fetch tasks from API, using cached data:', error);

      // Fallback to cached data with same filtering logic
      let filtered = [...this.cachedTasks];

      if (listId) {
        filtered = filtered.filter(task => task.listId === listId);
      }

      if (status) {
        filtered = filtered.filter(task => task.status === status);
      }

      return filtered;
    }
  }

  async getTaskCounts(listId?: string): Promise<TaskCounts> {
    try {
      const params = new URLSearchParams();
      if (listId) params.append('listId', listId);

      const queryString = params.toString();
      const url = queryString ? `${this.baseUrl}/tasks/counts?${queryString}` : `${this.baseUrl}/tasks/counts`;

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status} ${response.statusText}`);
      }

      const counts = await response.json();
      console.log('✅ Task counts loaded from API');
      return counts;
    } catch (error) {
      console.error('❌ Failed to fetch task counts from API, calculating from cache:', error);

      // Fallback to calculating counts from cached data
      let filteredTasks = [...this.cachedTasks];

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
  }

  async getTask(id: string): Promise<TaskData | null> {
    try {
      const response = await fetch(`${this.baseUrl}/tasks/${id}`);

      if (response.status === 404) {
        return null;
      }

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status} ${response.statusText}`);
      }

      const task = await response.json();
      console.log('✅ Task loaded from API');
      return task;
    } catch (error) {
      console.error('❌ Failed to fetch task from API, checking cache:', error);
      // Fallback to cached data
      const task = this.cachedTasks.find(task => task.id === id);
      return task ? { ...task } : null;
    }
  }

  async createTask(input: CreateTaskInput): Promise<TaskData> {
    try {
      const response = await fetch(`${this.baseUrl}/tasks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(input),
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status} ${response.statusText}`);
      }

      const createdTask = await response.json();
      // Update cache
      this.cachedTasks.push(createdTask);
      console.log('✅ Task created via API');
      return createdTask;
    } catch (error) {
      console.error('❌ Failed to create task via API:', error);
      throw error;
    }
  }

  async updateTask(id: string, updates: UpdateTaskInput): Promise<TaskData> {
    try {
      const response = await fetch(`${this.baseUrl}/tasks/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status} ${response.statusText}`);
      }

      const updatedTask = await response.json();
      // Update cache
      const taskIndex = this.cachedTasks.findIndex(task => task.id === id);
      if (taskIndex !== -1) {
        this.cachedTasks[taskIndex] = updatedTask;
      }
      console.log('✅ Task updated via API');
      return updatedTask;
    } catch (error) {
      console.error('❌ Failed to update task via API:', error);
      throw error;
    }
  }

  async deleteTask(id: string): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/tasks/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status} ${response.statusText}`);
      }

      // Update cache
      const taskIndex = this.cachedTasks.findIndex(task => task.id === id);
      if (taskIndex !== -1) {
        this.cachedTasks.splice(taskIndex, 1);
      }
      console.log('✅ Task deleted via API');
    } catch (error) {
      console.error('❌ Failed to delete task via API:', error);
      throw error;
    }
  }
}