import type { SidebarConfigData, SidebarItemData, Priority } from '../types/sidebar';

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
   * @returns Promise<SidebarItemData> - The newly created area
   */
  addArea(title: string, iconName?: string, priority?: Priority): Promise<SidebarItemData>;

  /**
   * Adds a new project to the sidebar configuration
   * @param title - The title of the new project
   * @param iconName - The icon name from lucide-react
   * @param priority - The priority level
   * @returns Promise<SidebarItemData> - The newly created project
   */
  addProject(title: string, iconName?: string, priority?: Priority): Promise<SidebarItemData>;

  /**
   * Gets the current data source mode
   * @returns 'api' | 'local'
   */
  getDataSourceMode(): 'api' | 'local';
}