import type { IDataService } from './IDataService';
import type { SidebarConfigData, SidebarItemData, Priority } from '../types/sidebar';
import sidebarConfigData from '../data/sidebarConfig.json';

/**
 * API-based implementation of IDataService
 * Fetches and persists data to a backend API
 * Falls back to local data if API requests fail
 */
export class ApiDataService implements IDataService {
  private baseUrl: string;
  private cachedData: SidebarConfigData;

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
}