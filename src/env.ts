import { z } from 'zod';

/**
 * Environment variable schema and validation
 * Ensures required env vars exist and are properly formatted at startup
 */

const envSchema = z.object({
  VITE_USE_API: z.string().optional().default('false'),
  VITE_API_BASE_URL: z.string().url().optional().default('http://localhost:3000/api'),
});

// Validate environment variables at module load time
const parseResult = envSchema.safeParse({
  VITE_USE_API: import.meta.env.VITE_USE_API,
  VITE_API_BASE_URL: import.meta.env.VITE_API_BASE_URL,
});

if (!parseResult.success) {
  console.error('❌ Environment variable validation failed:');
  console.error(parseResult.error.format());
  throw new Error('Invalid environment variables. Check console for details.');
}

const env = parseResult.data;

/**
 * Type-safe environment variables
 */
export const ENV = {
  /**
   * Whether to use API or local storage for data
   */
  USE_API: env.VITE_USE_API === 'true',

  /**
   * Base URL for API endpoints
   */
  API_BASE_URL: env.VITE_API_BASE_URL,
} as const;

/**
 * Log current environment configuration
 */
console.log(`🔧 Environment: ${ENV.USE_API ? 'API Mode' : 'Local Mode'}`);
if (ENV.USE_API) {
  console.log(`🌐 API Base URL: ${ENV.API_BASE_URL}`);
}
