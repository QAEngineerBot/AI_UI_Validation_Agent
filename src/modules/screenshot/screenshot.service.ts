import fs from 'fs-extra';
import path from 'path';
import { reportConfig } from '../../config/report.config';
import { AppiumManager } from '../appium/appium.manager';
import { ensureDirectory } from '../../core/utils/file.util';
import { getCurrentTimestamp, getFileSafeTimestamp } from '../../core/utils/date.util';
import { CapturedScreenshot } from './screenshot.types';
import { logger } from '../../core/logger/logger';

export class ScreenshotService {
  constructor(private readonly appiumManager: AppiumManager) {}

  /**
   * Build the target path for the screenshot artifact.
   */
  private buildScreenshotPath(screenName: string): string {
    const safeScreenName = screenName.replace(/[^a-zA-Z0-9_-]/g, '_');
    const timestamp = getFileSafeTimestamp();

    return path.join(reportConfig.actualDir, `${safeScreenName}_${timestamp}.png`);
  }

  /**
   * Capture a screenshot from the current device screen and persist it.
   */
  async captureCurrentScreen(screenName: string): Promise<CapturedScreenshot> {
    logger.info(`Capturing screenshot for screen="${screenName}"`);

    await ensureDirectory(reportConfig.actualDir);

    const screenshotBase64 = await this.appiumManager.takeScreenshot();
    const screenshotBuffer = Buffer.from(screenshotBase64, 'base64');

    const targetPath = this.buildScreenshotPath(screenName);
    await fs.writeFile(targetPath, screenshotBuffer);

    logger.info(`Saved actual screenshot for screen="${screenName}" at path=${targetPath}`);

    return {
      screenName,
      localPath: targetPath,
      capturedAt: getCurrentTimestamp(),
    };
  }
}