import { GeminiComparisonResult } from '../../core/types/gemini.types';
import { ComparisonDecisionEngine } from './comparison.decision';
import { ComparisonDecisionConfig, ComparisonDecisionResult } from './comparison.types';

export class ComparisonService {
  private readonly decisionEngine: ComparisonDecisionEngine;

  constructor(decisionEngine?: ComparisonDecisionEngine) {
    this.decisionEngine = decisionEngine ?? new ComparisonDecisionEngine();
  }

  evaluateComparison(
    comparison: GeminiComparisonResult,
    config: ComparisonDecisionConfig
  ): ComparisonDecisionResult {
    return this.decisionEngine.evaluate(comparison, config);
  }
}