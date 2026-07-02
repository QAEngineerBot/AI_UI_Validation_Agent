import { GeminiComparisonInput } from '../../core/types/gemini.types';

/**
 * Build a strict prompt for comparing expected Figma design vs actual app screenshot.
 * The model must return ONLY valid JSON matching the required schema.
 */
export function buildGeminiComparisonPrompt(input: GeminiComparisonInput): string {
  return `
You are a senior mobile UI validation analyst and design QA reviewer.

Your job is to compare two mobile UI images for the screen "${input.screenName}":

1. EXPECTED IMAGE = the Figma design reference
2. ACTUAL IMAGE = the screenshot captured from the mobile app

You must identify UI differences between the ACTUAL image and the EXPECTED design.

Focus only on meaningful UI validation findings such as:
- missing elements
- extra elements
- alignment issues
- color differences
- font differences
- padding issues
- margin issues
- component size differences
- design system violations
- any obvious structural mismatch between expected and actual UI

Ignore insignificant differences caused by:
- image compression
- tiny anti-aliasing variations
- negligible rendering noise

Severity rules:
- CRITICAL = major blocker or completely broken screen / missing key CTA / impossible user flow
- HIGH = important UI mismatch affecting core UX or correctness
- MEDIUM = visible mismatch that should be fixed but does not block core flow
- LOW = minor cosmetic issue

You must return ONLY valid JSON.
Do not include markdown.
Do not include explanation before or after JSON.
Do not wrap the response in triple backticks.

Use exactly this JSON structure:

{
  "screenName": "${input.screenName}",
  "summary": "short summary",
  "overallStatus": "PASS or FAIL",
  "issues": [
    {
      "severity": "LOW | MEDIUM | HIGH | CRITICAL",
      "category": "MISSING_ELEMENT | EXTRA_ELEMENT | ALIGNMENT_ISSUE | COLOR_DIFFERENCE | FONT_DIFFERENCE | PADDING_ISSUE | MARGIN_ISSUE | SIZE_DIFFERENCE | DESIGN_SYSTEM_VIOLATION | OTHER",
      "description": "clear issue description",
      "recommendation": "clear recommendation"
    }
  ]
}

Rules:
- If no meaningful issue is found, return:
  {
    "screenName": "${input.screenName}",
    "summary": "No meaningful UI differences found",
    "overallStatus": "PASS",
    "issues": []
  }
- Keep descriptions specific and practical.
- Do not invent functionality issues that are not visible in the image.
- Compare visual UI only.
`.trim();
}