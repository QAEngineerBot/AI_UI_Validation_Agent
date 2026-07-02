import { FigmaService } from '../figma/figma.service';
import { GeminiService } from '../gemini/gemini.service';
import { ComparisonService } from '../comparison/comparison.service';

import { ScreenValidationResult } from '../../core/types/validation.types';
import { ValidateScreenWorkflowInput } from './workflow.types';

import { logger } from '../../core/logger/logger';

export class UiValidationWorkflow {
  private readonly figmaService: FigmaService;
  private readonly geminiService: GeminiService;
  private readonly comparisonService: ComparisonService;

  constructor() {
    this.figmaService = new FigmaService();
    this.geminiService = new GeminiService();
    this.comparisonService = new ComparisonService();
  }

  /**
   * Validate a screen using:
   * 1. Expected image from local cache/Figma
   * 2. Manually captured app screenshot
   * 3. Gemini comparison
   */
  async validateScreen(
    input: ValidateScreenWorkflowInput
  ): Promise<ScreenValidationResult> {

    const failOnSeverityOrAbove =
      input.failOnSeverityOrAbove ?? 'MEDIUM';

    logger.info(
      `Starting UI validation for screen="${input.screenName}"`
    );

    //
    // Expected Image
    // Uses cache if available, otherwise downloads from Figma.
    //
    const figmaResult =
      await this.figmaService.downloadFrameByScreenName(
        input.screenName,
        {
          forceRefresh: input.forceRefresh ?? false,
        }
      );

    logger.info(
      `Expected image source: ${figmaResult.source}`
    );

    //
    // Gemini Comparison
    //
    const comparison =
      await this.geminiService.compareUi({
        screenName: input.screenName,
        expectedImagePath: figmaResult.localPath,
        actualImagePath: input.actualImagePath,
      });

    //
    // Evaluate comparison
    //
    const decision =
      this.comparisonService.evaluateComparison(
        comparison,
        {
          failOnSeverityOrAbove,
        }
      );

    logger.info(
      `Validation completed for "${input.screenName}" Status=${decision.status}`
    );

    return {
      screenName: input.screenName,
      status: decision.status,
      failureReason: decision.failureReason,
      expectedImagePath: figmaResult.localPath,
      actualImagePath: input.actualImagePath,
      comparison: decision.comparison,
      failedIssues: decision.failedIssues,
    };
  }
}