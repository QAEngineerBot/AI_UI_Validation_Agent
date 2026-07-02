import fs from 'fs-extra';

/**
 * Reads and parses a JSON file.
 */
export async function readJsonFile<T>(filePath: string): Promise<T> {
  return fs.readJson(filePath) as Promise<T>;
}

/**
 * Writes JSON with pretty formatting.
 */
export async function writeJsonFile(filePath: string, data: unknown): Promise<void> {
  await fs.writeJson(filePath, data, { spaces: 2 });
}