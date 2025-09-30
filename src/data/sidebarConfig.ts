import type { SidebarConfigData } from '../types/sidebar';
import sidebarConfigData from './sidebarConfig.json';

/**
 * Legacy export for backward compatibility
 * Data is now loaded from sidebarConfig.json
 */
export const sidebarConfig: SidebarConfigData = sidebarConfigData as SidebarConfigData;

/**
 * Fetches sidebar configuration
 * This is a simple wrapper that returns the JSON data
 * Use dataService.getSidebarConfig() for a more robust solution with API support
 */
export async function fetchSidebarConfig(): Promise<SidebarConfigData> {
  // Return a copy to prevent mutations
  return Promise.resolve({ ...sidebarConfigData } as SidebarConfigData);
}