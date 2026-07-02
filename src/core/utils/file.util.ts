import fs from 'fs-extra';
import path from 'path';

/**
 * Ensure a directory exists. Creates it if missing.
 */
export async function ensureDirectory(dirPath: string): Promise<void> {
  await fs.ensureDir(dirPath);
}

/**
 * Ensure multiple directories exist.
 */
export async function ensureDirectories(dirPaths: string[]): Promise<void> {
  for (const dirPath of dirPaths) {
    await ensureDirectory(dirPath);
  }
}

/**
 * Check whether a file exists.
 */
export async function fileExists(filePath: string): Promise<boolean> {
  return fs.pathExists(filePath);
}

/**
 * Resolve an absolute path from project root.
 */
export function resolveFromRoot(...segments: string[]): string {
  return path.resolve(process.cwd(), ...segments);
}