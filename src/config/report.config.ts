import path from 'path';
import { env } from './env';

export const reportConfig = {
  reportsRoot: path.resolve(process.cwd(), env.reporting.reportsDir),
  htmlReportsDir: path.resolve(process.cwd(), env.reporting.reportsDir, 'html'),
  jsonReportsDir: path.resolve(process.cwd(), env.reporting.reportsDir, 'json'),

  artifactsRoot: path.resolve(process.cwd(), env.reporting.artifactsDir),
  actualDir: path.resolve(process.cwd(), env.reporting.artifactsDir, 'actual'),
  expectedDir: path.resolve(process.cwd(), env.reporting.artifactsDir, 'expected'),
  diffDir: path.resolve(process.cwd(), env.reporting.artifactsDir, 'diff'),
  rawDir: path.resolve(process.cwd(), env.reporting.artifactsDir, 'raw'),

  tempDir: path.resolve(process.cwd(), env.reporting.tempDir),
};