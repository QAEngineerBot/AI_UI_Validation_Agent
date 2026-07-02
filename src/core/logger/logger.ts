import winston from 'winston';
import { env } from '../../config/env';

const { combine, timestamp, printf, colorize } = winston.format;

/**
 * Custom log line format.
 */
const logFormat = printf(({ level, message, timestamp }) => {
  return `[${timestamp}] ${level}: ${message}`;
});

/**
 * Central logger for the framework.
 */
export const logger = winston.createLogger({
  level: env.execution.logLevel,
  format: combine(timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), logFormat),
  transports: [
    new winston.transports.Console({
      format: combine(colorize(), timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), logFormat),
    }),
  ],
});