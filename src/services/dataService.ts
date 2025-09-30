import type { IDataService } from './IDataService';
import { LocalDataService } from './LocalDataService';
import { ApiDataService } from './ApiDataService';

/**
 * Configuration for the data service
 * Set USE_API to true to fetch from API endpoints
 * Set USE_API to false to use local storage
 */
const USE_API = import.meta.env.VITE_USE_API === 'true';
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

/**
 * Factory function to create the appropriate data service implementation
 * @param useApi - Whether to use API or local storage
 * @param apiBaseUrl - Base URL for API endpoints (only used if useApi is true)
 * @returns IDataService implementation
 */
export function createDataService(useApi: boolean = USE_API, apiBaseUrl: string = API_BASE_URL): IDataService {
  if (useApi) {
    console.log('🌐 Using API Data Service');
    return new ApiDataService(apiBaseUrl);
  } else {
    console.log('💾 Using Local Data Service');
    return new LocalDataService();
  }
}

/**
 * Singleton instance of the data service
 * Use this throughout your application for data operations
 */
export const dataService: IDataService = createDataService();

// Export interface and implementations for testing or custom usage
export type { IDataService };
export { LocalDataService, ApiDataService };