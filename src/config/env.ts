import dotenv from 'dotenv';
import path from 'path';

/**
 * Load environment variables from the project root .env file.
 */
dotenv.config({
  path: path.resolve(process.cwd(), '.env'),
});

/**
 * Helper function to fetch required environment variables.
 * Throws a clear error if a required variable is missing.
 */
function getEnv(key: string, required = true): string {
  const value = process.env[key];

  if (required && (!value || value.trim() === '')) {
    throw new Error(`Missing required environment variable: ${key}`);
  }

  return value ?? '';
}

/**
 * Centralized environment object used across the framework.
 * All modules should import values from here instead of reading process.env directly.
 */
export const env = {
  app: {
    name: getEnv('APP_NAME'),
    platformName: getEnv('PLATFORM_NAME'),
    deviceName: getEnv('DEVICE_NAME'),
    androidPlatformVersion: getEnv('ANDROID_PLATFORM_VERSION', false),
    appPackage: getEnv('APP_PACKAGE'),
    appActivity: getEnv('APP_ACTIVITY', false),
  },
  figma: {
    apiToken: getEnv('FIGMA_API_TOKEN', false),
    fileKey: getEnv('FIGMA_FILE_KEY', false),
  },
  gemini: {
    apiKey: getEnv('GEMINI_API_KEY', false),
    model: getEnv('GEMINI_MODEL', false) || 'gemini-2.5-flash',
  },
  reporting: {
    reportsDir: getEnv('REPORTS_DIR'),
    artifactsDir: getEnv('ARTIFACTS_DIR'),
    tempDir: getEnv('TEMP_DIR'),
  },
  execution: {
    logLevel: getEnv('LOG_LEVEL', false) || 'info',
    failOnSeverity: getEnv('FAIL_ON_SEVERITY', false) || 'HIGH',
  },
};