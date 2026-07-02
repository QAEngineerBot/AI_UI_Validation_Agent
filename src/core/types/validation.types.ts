import { GeminiComparisonIssue, GeminiComparisonResult } from './gemini.types';
import { ExecutionContext } from '../execution/execution.context';

export type ValidationStatus = 'PASS' | 'FAIL';

export interface ScreenValidationResult {
  screenName: string;
  status: ValidationStatus;
  failureReason?: string;
  expectedImagePath: string;
  actualImagePath: string;
  comparison: GeminiComparisonResult;
  failedIssues: GeminiComparisonIssue[];
  execution?: ExecutionContext;
}