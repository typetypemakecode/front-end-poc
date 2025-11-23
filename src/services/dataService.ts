import type { IDataService } from './IDataService';
import { LocalDataService } from './LocalDataService';
import { ApiDataService } from './ApiDataService';
import { ENV } from '../env';

/**
 * Configuration for the data service
 * Uses validated environment variables from src/env.ts
 */
const USE_API = ENV.USE_API;
const API_BASE_URL = ENV.API_BASE_URL;

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