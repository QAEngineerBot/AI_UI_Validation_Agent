import fs from 'fs-extra';
import path from 'path';
import { figmaConfig } from '../../config/figma.config';
import { FigmaError } from '../../core/errors/figma.error';
import { logger } from '../../core/logger/logger';
import { FigmaClient } from './figma.client';
import { FigmaMapper } from './figma.mapper';

export interface FigmaDownloadResult {
  screenName: string;
  nodeId: string;
  localPath: string;
  source: 'cache' | 'figma';
}

export interface DownloadFrameOptions {
  /**
   * Force bypassing local cache and fetch a fresh frame from Figma.
   */
  forceRefresh?: boolean;
}

export class FigmaService {
  private readonly figmaClient: FigmaClient;
  private readonly figmaMapper: FigmaMapper;
  private readonly expectedDir: string;

  constructor() {
    this.figmaClient = new FigmaClient();
    this.figmaMapper = new FigmaMapper();
    this.expectedDir = path.join(process.cwd(), 'artifacts', 'expected');
  }

  /**
   * Resolve screen name -> node ID -> download frame (with cache support).
   */
  async downloadFrameByScreenName(
    screenName: string,
    options?: DownloadFrameOptions
  ): Promise<FigmaDownloadResult> {
    const nodeId = await this.figmaMapper.getNodeIdForScreen(screenName);
    return this.downloadFrameByNodeId(screenName, nodeId, options);
  }

  /**
   * Download a frame directly using node ID, with cache support.
   */
  async downloadFrameByNodeId(
  screenName: string,
  nodeId: string,
  options?: DownloadFrameOptions
): Promise<FigmaDownloadResult> {
  const fileKey = figmaConfig.fileKey;

  if (!fileKey) {
    throw new FigmaError(
      'FIGMA_FILE_KEY is missing. Please add it to your .env file.',
      'FIGMA_FILE_KEY_MISSING'
    );
  }

  const forceRefresh = options?.forceRefresh ?? false;

  logger.info(
    `Starting Figma frame download for screen="${screenName}", nodeId=${nodeId}, forceRefresh=${forceRefresh}`
  );

  // ---------- CACHE ----------
  if (!forceRefresh) {
    const cachedPath = await this.findCachedFrame(screenName);

    if (cachedPath) {
      return {
        screenName,
        nodeId,
        localPath: cachedPath,
        source: 'cache',
      };
    }
  }

  logger.info(
    `No cached expected design found. Downloading latest frame from Figma...`
  );

  // ---------- VALIDATE ----------
  await this.validateNode(fileKey, nodeId);

  // ---------- IMAGE URL ----------
  const imageUrl = await this.figmaClient.getRenderedImageUrl(
    fileKey,
    nodeId,
    'png',
    1
  );

  logger.info(
    `Received Figma image URL for screen="${screenName}"`
  );

  // ---------- DOWNLOAD ----------
  const imageBuffer = await this.figmaClient.downloadImage(imageUrl);

  const localPath = this.buildExpectedImagePath(screenName);

  await fs.ensureDir(path.dirname(localPath));

  await fs.writeFile(localPath, imageBuffer);

  logger.info(
    `Saved expected design for screen="${screenName}" at ${localPath}`
  );

  return {
    screenName,
    nodeId,
    localPath,
    source: 'figma',
  };
}

  /**
   * Validate that the configured node exists and returns metadata from Figma.
   */
  private async validateNode(fileKey: string, nodeId: string): Promise<void> {
    logger.info(`Validating Figma node. fileKey=${fileKey}, nodeId=${nodeId}`);

    const nodeResponse = await this.figmaClient.getNodes(fileKey, [nodeId]);

    logger.info(
      `Figma node response received for nodeId=${nodeId}. Returned node keys: ${Object.keys(
        nodeResponse.nodes ?? {}
      ).join(',')}`
    );

    const nodeData = nodeResponse.nodes?.[nodeId];

    if (!nodeData || !nodeData.document) {
      logger.error(
        `Figma node validation failed. fileKey=${fileKey}, nodeId=${nodeId}, rawResponse=${JSON.stringify(
          nodeResponse
        )}`
      );

      throw new FigmaError(
        `Node validation failed. No node metadata returned for nodeId=${nodeId}`,
        'FIGMA_NODE_NOT_FOUND',
        nodeResponse
      );
    }

    logger.info(
      `Validated Figma node successfully. nodeId=${nodeId}, nodeName=${nodeData.document.name}`
    );
  }

 private async findCachedFrame(
  screenName: string
): Promise<string | null> {

  const screenFolder = path.join(
    this.expectedDir,
    screenName
  );

  const folderExists = await fs.pathExists(screenFolder);

  if (!folderExists) {
    logger.info(
      `No cache folder found for screen="${screenName}"`
    );
    return null;
  }

  const files = await fs.readdir(screenFolder);

  const pngFiles = files.filter(file =>
    file.toLowerCase().endsWith(".png")
  );

  if (pngFiles.length === 0) {
    logger.info(
      `No cached PNG found for screen="${screenName}"`
    );
    return null;
  }

  // Sort by last modified time (newest first)
  const fileStats = await Promise.all(
    pngFiles.map(async file => {
      const filePath = path.join(screenFolder, file);
      const stat = await fs.stat(filePath);

      return {
        filePath,
        modified: stat.mtimeMs,
      };
    })
  );

  fileStats.sort((a, b) => b.modified - a.modified);

  logger.info(
    `Using cached expected design: ${fileStats[0].filePath}`
  );

  return fileStats[0].filePath;
}

  /**
   * Build a timestamped expected-image output path.
   */
private buildExpectedImagePath(
  screenName: string
): string {

  const screenFolder = path.join(
    this.expectedDir,
    screenName
  );

  fs.ensureDirSync(screenFolder);

  const timestamp = new Date()
    .toISOString()
    .replace(/[:.]/g, "-");

  return path.join(
    screenFolder,
    `${screenName}_${timestamp}.png`
  );
}
}