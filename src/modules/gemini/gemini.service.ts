import fs from 'fs-extra';
import path from 'path';
import { GeminiClient } from './gemini.client';
import { GeminiParser } from './gemini.parser';
import { buildGeminiComparisonPrompt } from './gemini.prompt';
import {
  GeminiComparisonInput,
  GeminiComparisonResult,
  GeminiRawResponseArtifact,
} from '../../core/types/gemini.types';
import { logger } from '../../core/logger/logger';
import { reportConfig } from '../../config/report.config';
import { ensureDirectory } from '../../core/utils/file.util';
import { getFileSafeTimestamp } from '../../core/utils/date.util';

export class GeminiService {
  private readonly geminiClient: GeminiClient;
  private readonly geminiParser: GeminiParser;

  constructor(geminiClient?: GeminiClient, geminiParser?: GeminiParser) {
    this.geminiClient = geminiClient ?? new GeminiClient();
    this.geminiParser = geminiParser ?? new GeminiParser();
  }

  /**
   * Save raw Gemini response for debugging and auditability.
   */
  private async saveRawResponse(screenName: string, rawText: string): Promise<GeminiRawResponseArtifact> {
    await ensureDirectory(reportConfig.rawDir);

    const safeScreenName = screenName.replace(/[^a-zA-Z0-9_-]/g, '_');
    const fileName = `${safeScreenName}_gemini_raw_${getFileSafeTimestamp()}.txt`;
    const filePath = path.join(reportConfig.rawDir, fileName);

    await fs.writeFile(filePath, rawText, 'utf-8');

    return {
      screenName,
      rawText,
      savedPath: filePath,
    };
  }

  /**
   * Compare expected design vs actual screenshot using Gemini.
   */
  async compareUi(input: GeminiComparisonInput): Promise<GeminiComparisonResult> {
    logger.info(`Starting Gemini UI comparison for screen="${input.screenName}"`);

    const prompt = buildGeminiComparisonPrompt(input);

    const rawText = await this.geminiClient.compareImages(
      prompt,
      input.expectedImagePath,
      input.actualImagePath
    );

    const rawArtifact = await this.saveRawResponse(input.screenName, rawText);
    logger.info(`Saved raw Gemini response at path=${rawArtifact.savedPath}`);

    const parsedResult = this.geminiParser.parseComparisonResult(rawText);

    logger.info(
      `Gemini comparison completed for screen="${input.screenName}" with status=${parsedResult.overallStatus}`
    );

    return parsedResult;
  }
}