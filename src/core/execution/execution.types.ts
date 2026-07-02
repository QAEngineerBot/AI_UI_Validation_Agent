export type ExpectedSource = 'cache' | 'figma';

export interface StageMetric {
  name: string;
  startTime: number;
  endTime?: number;
  durationMs?: number;
}

export interface ExecutionMetrics {
  totalDurationMs: number;

  appiumDurationMs: number;

  figmaDurationMs: number;

  navigationDurationMs: number;

  screenshotDurationMs: number;

  geminiDurationMs: number;

  reportDurationMs: number;

  retries: number;
}

export interface ExecutionContextData {
  screenName: string;

  startTime: Date;

  endTime?: Date;

  expectedSource?: ExpectedSource;

  status?: 'PASS' | 'FAIL';

  metrics: ExecutionMetrics;
}