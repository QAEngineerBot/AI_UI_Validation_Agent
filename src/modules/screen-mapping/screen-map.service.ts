import path from 'path';
import { ScreenMap, ScreenMapEntry } from '../../core/types/screen.types';
import { readJsonFile } from '../../core/utils/json.util';
import { BaseFrameworkError } from '../../core/errors/base.error';

export class ScreenMapService {
  private readonly screenMapPath: string;

  constructor(screenMapPath?: string) {
    this.screenMapPath =
      screenMapPath ??
      path.resolve(process.cwd(), 'src', 'modules', 'screen-mapping', 'screen-map.json');
  }

  /**
   * Load the full screen map JSON.
   */
  async loadScreenMap(): Promise<ScreenMap> {
    try {
      return await readJsonFile<ScreenMap>(this.screenMapPath);
    } catch (error) {
      throw new BaseFrameworkError(
        `Failed to load screen map from path: ${this.screenMapPath}`,
        'SCREEN_MAP_LOAD_ERROR',
        error
      );
    }
  }

  /**
   * Resolve a single screen entry by screen name.
   */
  async getScreen(screenName: string): Promise<ScreenMapEntry> {
    const screenMap = await this.loadScreenMap();
    const entry = screenMap[screenName];

    if (!entry) {
      throw new BaseFrameworkError(
        `Screen "${screenName}" not found in screen map`,
        'SCREEN_NOT_FOUND'
      );
    }

    return entry;
  }

  /**
   * Return all registered screen names.
   */
  async getAllScreenNames(): Promise<string[]> {
    const screenMap = await this.loadScreenMap();
    return Object.keys(screenMap);
  }
}