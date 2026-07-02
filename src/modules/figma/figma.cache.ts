import fs from 'fs-extra';
import path from 'path';
import { reportConfig } from '../../config/report.config';
import { ensureDirectory } from '../../core/utils/file.util';
import { getFileSafeTimestamp } from '../../core/utils/date.util';

export class FigmaCache {
  /**
   * Build a stable file path for a downloaded expected design image.
   */
  buildExpectedImagePath(screenName: string, extension = 'png'): string {
    const safeTimestamp = getFileSafeTimestamp();
    const safeScreenName = screenName.replace(/[^a-zA-Z0-9_-]/g, '_');

    return path.join(reportConfig.expectedDir, `${safeScreenName}_${safeTimestamp}.${extension}`);
  }

  /**
   * Persist the downloaded Figma image to disk.
   */
  async saveExpectedImage(imageBuffer: Buffer, screenName: string, extension = 'png'): Promise<string> {
    await ensureDirectory(reportConfig.expectedDir);

    const filePath = this.buildExpectedImagePath(screenName, extension);
    await fs.writeFile(filePath, imageBuffer);

    return filePath;
  }
}