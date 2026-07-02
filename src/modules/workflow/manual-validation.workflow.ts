import { GeminiService } from '../gemini/gemini.service';
import { ComparisonService } from '../comparison/comparison.service';
import { ScreenValidationResult } from '../../core/types/validation.types';
import { logger } from '../../core/logger/logger';

export interface ManualValidationInput {
  screenName: string;
  expectedImagePath: string;
  actualImagePath: string;
  failOnSeverityOrAbove?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
}

export class ManualValidationWorkflow {
  private readonly geminiService: GeminiService;
  private readonly comparisonService: ComparisonService;

  constructor() {
    this.geminiService = new GeminiService();
    this.comparisonService = new ComparisonService();
  }

  async validate(
    input: ManualValidationInput
  ): Promise<ScreenValidationResult> {

    const failOnSeverityOrAbove =
      input.failOnSeverityOrAbove ?? 'MEDIUM';

    logger.info(
      `Starting manual validation for screen="${input.screenName}"`
    );

    // Gemini Comparison
    const comparison =
      await this.geminiService.compareUi({
        screenName: input.screenName,
        expectedImagePath: input.expectedImagePath,
        actualImagePath: input.actualImagePath,
      });

    // Apply pass/fail rules
    const decision =
      this.comparisonService.evaluateComparison(
        comparison,
        {
          failOnSeverityOrAbove,
        }
      );

    logger.info(
      `Manual validation completed. Status=${decision.status}`
    );

    return {
      screenName: input.screenName,
      status: decision.status,
      failureReason: decision.failureReason,
      expectedImagePath: input.expectedImagePath,
      actualImagePath: input.actualImagePath,
      comparison: decision.comparison,
      failedIssues: decision.failedIssues,
    };
  }
}