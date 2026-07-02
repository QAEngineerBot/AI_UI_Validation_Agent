import { GeminiError } from '../../core/errors/gemini.error';
import { GeminiComparisonResult } from '../../core/types/gemini.types';

export class GeminiParser {
  /**
   * Remove common markdown fences if the model returns them accidentally.
   */
  private sanitizeRawText(rawText: string): string {
    return rawText
      .replace(/^```json\s*/i, '')
      .replace(/^```\s*/i, '')
      .replace(/\s*```$/i, '')
      .trim();
  }

  /**
   * Parse and validate the Gemini JSON response.
   */
  parseComparisonResult(rawText: string): GeminiComparisonResult {
    const sanitized = this.sanitizeRawText(rawText);

    let parsed: unknown;

    try {
      parsed = JSON.parse(sanitized);
    } catch (error) {
      throw new GeminiError(
        `Failed to parse Gemini response as JSON. Raw response: ${rawText}`,
        'GEMINI_JSON_PARSE_FAILED',
        error
      );
    }

    if (!this.isValidComparisonResult(parsed)) {
      throw new GeminiError(
        `Gemini response does not match expected schema. Raw response: ${rawText}`,
        'GEMINI_INVALID_SCHEMA',
        parsed
      );
    }

    return parsed;
  }

  /**
   * Basic runtime validation of GeminiComparisonResult shape.
   */
  private isValidComparisonResult(value: unknown): value is GeminiComparisonResult {
    if (!value || typeof value !== 'object') {
      return false;
    }

    const candidate = value as GeminiComparisonResult;

    return (
      typeof candidate.screenName === 'string' &&
      typeof candidate.summary === 'string' &&
      (candidate.overallStatus === 'PASS' || candidate.overallStatus === 'FAIL') &&
      Array.isArray(candidate.issues)
    );
  }
}