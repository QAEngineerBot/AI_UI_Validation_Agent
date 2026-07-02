export type Severity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export type ValidationStatus = 'PASS' | 'FAIL';

export interface TimestampedEntity {
  createdAt: string;
}