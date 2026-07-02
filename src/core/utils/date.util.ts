/**
 * Returns current timestamp in ISO format.
 */
export function getCurrentTimestamp(): string {
  return new Date().toISOString();
}

/**
 * Returns a file-system-safe timestamp for naming artifacts.
 */
export function getFileSafeTimestamp(): string {
  return new Date().toISOString().replace(/[:.]/g, '-');
}