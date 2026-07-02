import { GeminiComparisonIssue, GeminiComparisonResult } from '../../core/types/gemini.types';
import { ValidationStatus } from '../../core/types/validation.types';
import { Severity } from '../../core/types/common.types';

export interface ComparisonDecisionConfig {
  failOnSeverityOrAbove: Severity;
}

export interface ComparisonDecisionResult {
  status: ValidationStatus;
  failureReason?: string;
  failedIssues: GeminiComparisonIssue[];
  comparison: GeminiComparisonResult;
}