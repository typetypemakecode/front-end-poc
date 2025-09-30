import type { IDataService } from './IDataService';
import type { SidebarConfigData, SidebarItemData, Priority } from '../types/sidebar';
import sidebarConfigData from '../data/sidebarConfig.json';

/**
 * Local implementation of IDataService
 * Uses localStorage for persistence in the browser
 * Falls back to JSON file data if localStorage is empty
 */
export class LocalDataService implements IDataService {
  private localData: SidebarConfigData;
  private readonly STORAGE_KEY = 'sidebarConfig';

  constructor() {
    // Load initial data from JSON or localStorage
    this.localData = this.loadFromLocalStorage() || ({ ...sidebarConfigData } as SidebarConfigData);
  }

  async getSidebarConfig(): Promise<SidebarConfigData> {
    // Return a copy to prevent external mutations
    return Promise.resolve({ ...this.localData });
  }

  getLocalSidebarConfig(): SidebarConfigData {
    return { ...this.localData };
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

    this.localData.areas.push(newArea);
    this.persistLocalData();

    return newArea;
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
}