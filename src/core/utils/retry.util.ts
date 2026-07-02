import { logger } from '../logger/logger';

export interface RetryOptions {
  /** Maximum retry attempts (excluding the initial call). */
  maxRetries: number;

  /** Initial retry delay in milliseconds. */
  initialDelayMs?: number;

  /** Maximum retry delay in milliseconds. */
  maxDelayMs?: number;

  /** Exponential backoff multiplier. */
  backoffMultiplier?: number;

  /** HTTP status codes that should trigger a retry. */
  retryableStatusCodes?: number[];

  /** Friendly operation name for logging. */
  operationName?: string;

  /** Timeout for each individual attempt. */
  timeoutMs?: number;
}

export class RetryUtil {
  static async execute<T>(
    operation: () => Promise<T>,
    options: RetryOptions
  ): Promise<T> {
    const {
      maxRetries,
      initialDelayMs = 2000,
      maxDelayMs = 30000,
      backoffMultiplier = 2,
      retryableStatusCodes = [429, 500, 502, 503, 504],
      operationName = 'Operation',
      timeoutMs = 60000,
    } = options;

    const overallStart = Date.now();

    let attempt = 0;
    let delay = initialDelayMs;

    while (true) {
      try {
        const result = await Promise.race([
          operation(),
          this.timeout(timeoutMs),
        ]);

        logger.info(
          `[${operationName}] Completed successfully.
Attempts      : ${attempt + 1}
Retries Used  : ${attempt}
Total Duration: ${Date.now() - overallStart} ms`
        );

        return result;
      } catch (error: any) {
        attempt++;

        const status =
          error?.response?.status ??
          error?.status ??
          error?.error?.code ??
          error?.cause?.status ??
          error?.cause?.code ??
          error?.code;

        const message =
          error?.response?.data?.error?.message ??
          error?.error?.message ??
          error?.message ??
          String(error);

        const isTimeout =
          typeof message === 'string' &&
          message.toLowerCase().includes('timed out');

        const isRetryableStatus =
          typeof status === 'number' &&
          retryableStatusCodes.includes(status);

        const canRetry =
          (isRetryableStatus || isTimeout) &&
          attempt <= maxRetries;

        if (!canRetry) {
          logger.error(
            `[${operationName}] Permanent failure.
Status        : ${status ?? 'UNKNOWN'}
Attempts      : ${attempt}
Total Duration: ${Date.now() - overallStart} ms
Message       : ${message}`
          );

          throw error;
        }

        logger.warn(
          `[${operationName}] Retry ${attempt}/${maxRetries}
Status        : ${status ?? 'TIMEOUT'}
Message       : ${message}
Next Delay    : ${delay} ms`
        );

        await this.sleep(delay);

        // Exponential backoff
        const nextDelay = Math.min(
          delay * backoffMultiplier,
          maxDelayMs
        );

        // Add ±20% jitter
        const jitter =
          nextDelay * (Math.random() * 0.4 - 0.2);

        delay = Math.max(
          1000,
          Math.round(nextDelay + jitter)
        );
      }
    }
  }

  /**
   * Reject if an operation exceeds the configured timeout.
   */
  private static timeout(ms: number): Promise<never> {
    return new Promise((_, reject) => {
      const timer = setTimeout(() => {
        clearTimeout(timer);

        reject(
          new Error(
            `Operation timed out after ${ms} ms`
          )
        );
      }, ms);
    });
  }

  /**
   * Sleep for the specified duration.
   */
  private static sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}