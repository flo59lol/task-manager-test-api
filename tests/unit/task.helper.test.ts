import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import {
  generateTaskReference,
  isTaskOverdue,
  validateTaskTitle,
} from '../../src/helpers/task.helper';

describe('task helpers', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-01-15T12:00:00.000Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('validateTaskTitle', () => {
    test('accepts titles with at least three non-whitespace characters', () => {
      expect(validateTaskTitle('ABC')).toBe(true);
      expect(validateTaskTitle('  Task  ')).toBe(true);
    });

    test('rejects titles shorter than three characters after trimming', () => {
      expect(validateTaskTitle(' AB ')).toBe(false);
      expect(validateTaskTitle('   ')).toBe(false);
    });
  });

  describe('generateTaskReference', () => {
    test('formats the task id with the TSK prefix and four-digit padding', () => {
      expect(generateTaskReference(1)).toBe('TSK-0001');
      expect(generateTaskReference(12345)).toBe('TSK-12345');
    });
  });

  describe('isTaskOverdue', () => {
    test('returns true for a past-due task that is not completed', () => {
      expect(isTaskOverdue(new Date('2026-01-14T12:00:00.000Z'), 'TODO')).toBe(true);
    });

    test('returns false for completed tasks and dates that are not past', () => {
      expect(isTaskOverdue(new Date('2026-01-14T12:00:00.000Z'), 'COMPLETED')).toBe(false);
      expect(isTaskOverdue(new Date('2026-01-15T12:00:00.000Z'), 'IN_PROGRESS')).toBe(false);
      expect(isTaskOverdue(new Date('2026-01-16T12:00:00.000Z'), 'TODO')).toBe(false);
    });
  });
});