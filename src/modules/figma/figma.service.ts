import fs from 'fs-extra';
import path from 'path';
import { logger } from '../../core/logger/logger';

export interface FigmaDownloadResult {
  screenName: string;
  nodeId: string;
  localPath: string;
  source: 'local' | 'cache';
}

export interface DownloadFrameOptions {
  /**
   * Kept for compatibility, but this service only resolves local/cache images.
   */
  forceRefresh?: boolean;
}

export class FigmaService {
  private readonly expectedDir: string;
  private readonly localExpectedDir: string;
  private readonly supportedImageExtensions = ['.png', '.jpg', '.jpeg', '.webp'];

  constructor() {
    this.expectedDir = path.join(process.cwd(), 'artifacts', 'expected');
    this.localExpectedDir = path.join(process.cwd(), 'input', 'expected');
  }

  /**
   * Resolve an expected image from the local input folder or the cache.
   */
  async downloadFrameByScreenName(
    screenName: string,
    options?: DownloadFrameOptions
  ): Promise<FigmaDownloadResult> {
    logger.info(
      `Resolving expected image for screen="${screenName}" (forceRefresh=${options?.forceRefresh ?? false})`
    );

    const localExpectedPath = await this.findLocalExpectedImage(screenName);

    if (localExpectedPath) {
      logger.info(`Using expected design from input/expected: ${localExpectedPath}`);

      return {
        screenName,
        nodeId: '',
        localPath: localExpectedPath,
        source: 'local',
      };
    }

    const cachedPath = await this.findCachedFrame(screenName);

    if (cachedPath) {
      logger.info(`Using cached expected design: ${cachedPath}`);

      return {
        screenName,
        nodeId: '',
        localPath: cachedPath,
        source: 'cache',
      };
    }

    throw new Error(
      `No expected image found for screen="${screenName}" in input/expected or artifacts/expected`
    );
  }

  async downloadFrameByNodeId(
    screenName: string,
    nodeId: string,
    options?: DownloadFrameOptions
  ): Promise<FigmaDownloadResult> {
    logger.info(
      `Resolving expected image for screen="${screenName}" using nodeId=${nodeId}`
    );

    return this.downloadFrameByScreenName(screenName, options);
  }

  private async findLocalExpectedImage(
    screenName: string
  ): Promise<string | null> {
    const directCandidates = this.supportedImageExtensions.map(ext =>
      path.join(this.localExpectedDir, `${screenName}${ext}`)
    );

    for (const candidate of directCandidates) {
      if (await fs.pathExists(candidate)) {
        return candidate;
      }
    }

    const screenFolder = path.join(this.localExpectedDir, screenName);
    const folderExists = await fs.pathExists(screenFolder);

    if (!folderExists) {
      return null;
    }

    const files = await fs.readdir(screenFolder);
    const imageFile = files.find(file =>
      this.supportedImageExtensions.includes(path.extname(file).toLowerCase())
    );

    if (!imageFile) {
      return null;
    }

    return path.join(screenFolder, imageFile);
  }

  private async findCachedFrame(
    screenName: string
  ): Promise<string | null> {
    const screenFolder = path.join(this.expectedDir, screenName);
    const folderExists = await fs.pathExists(screenFolder);

    if (!folderExists) {
      logger.info(`No cache folder found for screen="${screenName}"`);
      return null;
    }

    const files = await fs.readdir(screenFolder);
    const imageFiles = files.filter(file =>
      this.supportedImageExtensions.includes(path.extname(file).toLowerCase())
    );

    if (imageFiles.length === 0) {
      logger.info(`No cached expected image found for screen="${screenName}"`);
      return null;
    }

    const fileStats = await Promise.all(
      imageFiles.map(async file => {
        const filePath = path.join(screenFolder, file);
        const stat = await fs.stat(filePath);

        return {
          filePath,
          modified: stat.mtimeMs,
        };
      })
    );

    fileStats.sort((a, b) => b.modified - a.modified);
    return fileStats[0].filePath;
  }
}