import { logger } from '../core/logger/logger';
import { FigmaMapper } from '../modules/figma/figma.mapper';
import { FigmaService } from '../modules/figma/figma.service';

async function run(): Promise<void> {
  const screenName = process.argv[2];

  if (!screenName) {
    throw new Error(
      'Screen name is required. Usage: npm run figma:download -- <ScreenName>'
    );
  }

  logger.info(`Figma download runner started for screen="${screenName}"`);

  const figmaMapper = new FigmaMapper();
  const figmaService = new FigmaService();

  const nodeId = await figmaMapper.getNodeIdForScreen(screenName);
  logger.info(`Resolved screen="${screenName}" to nodeId=${nodeId}`);

  const result = await figmaService.downloadFrameByNodeId(screenName, nodeId);

  logger.info(`Figma frame downloaded successfully.`);
  logger.info(`Screen: ${result.screenName}`);
  logger.info(`Node ID: ${result.nodeId}`);
  logger.info(`Saved file: ${result.localPath}`);
}

run().catch((error) => {
  logger.error(
    `Figma download runner failed: ${error instanceof Error ? error.message : String(error)}`
  );
  process.exit(1);
});