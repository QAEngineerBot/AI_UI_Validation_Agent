import { GeminiComparisonIssue, GeminiComparisonResult } from '../../core/types/gemini.types';
import { Severity } from '../../core/types/common.types';
import { ComparisonDecisionConfig, ComparisonDecisionResult } from './comparison.types';

export class ComparisonDecisionEngine {
  private readonly severityRank: Record<Severity, number> = {
    LOW: 1,
    MEDIUM: 2,
    HIGH: 3,
    CRITICAL: 4,
  };

  /**
   * Evaluate Gemini comparison issues against the configured failure threshold.
   */
  evaluate(
    comparison: GeminiComparisonResult,
    config: ComparisonDecisionConfig
  ): ComparisonDecisionResult {
    const thresholdRank = this.severityRank[config.failOnSeverityOrAbove];

    const failedIssues = comparison.issues.filter((issue) => {
      const issueRank = this.severityRank[issue.severity];
      return issueRank >= thresholdRank;
    });

    if (failedIssues.length > 0 || comparison.overallStatus === 'FAIL') {
      return {
        status: 'FAIL',
        failureReason: 'One or more UI issues met the failure threshold.',
        failedIssues,
        comparison,
      };
    }

    return {
      status: 'PASS',
      failedIssues: [],
      comparison,
    };
  }
}