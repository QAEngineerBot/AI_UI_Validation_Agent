import { Severity } from './common.types';

export type GeminiOverallStatus = 'PASS' | 'FAIL';

export type GeminiIssueCategory =
  | 'MISSING_ELEMENT'
  | 'EXTRA_ELEMENT'
  | 'ALIGNMENT_ISSUE'
  | 'COLOR_DIFFERENCE'
  | 'FONT_DIFFERENCE'
  | 'PADDING_ISSUE'
  | 'MARGIN_ISSUE'
  | 'SIZE_DIFFERENCE'
  | 'DESIGN_SYSTEM_VIOLATION'
  | 'OTHER';

export interface GeminiComparisonIssue {
  severity: Severity;
  category: GeminiIssueCategory;
  description: string;
  recommendation: string;
}

export interface GeminiComparisonResult {
  screenName: string;
  summary: string;
  overallStatus: GeminiOverallStatus;
  issues: GeminiComparisonIssue[];
}

export interface GeminiComparisonInput {
  screenName: string;
  expectedImagePath: string;
  actualImagePath: string;
}

export interface GeminiRawResponseArtifact {
  screenName: string;
  rawText: string;
  savedPath: string;
}