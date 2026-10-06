import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import {
	generateProjectReference,
	isProjectOverdue,
} from '../../src/helpers/project.helper';

describe('project helpers', () => {
	beforeEach(() => {
		vi.useFakeTimers();
		vi.setSystemTime(new Date('2026-01-15T12:00:00.000Z'));
	});

	afterEach(() => {
		vi.useRealTimers();
	});

	describe('generateProjectReference', () => {
		test('formats the project id with the PRJ prefix and four-digit padding', () => {
			expect(generateProjectReference(1)).toBe('PRJ-0001');
			expect(generateProjectReference(12345)).toBe('PRJ-12345');
		});
	});

	describe('isProjectOverdue', () => {
		test('returns true for a past-due project that is not completed', () => {
			expect(isProjectOverdue(new Date('2026-01-14T12:00:00.000Z'), 'IN_PROGRESS')).toBe(true);
		});

		test('returns false for completed projects and dates that are not past', () => {
			expect(isProjectOverdue(new Date('2026-01-14T12:00:00.000Z'), 'COMPLETED')).toBe(false);
			expect(isProjectOverdue(new Date('2026-01-15T12:00:00.000Z'), 'PLANNED')).toBe(false);
			expect(isProjectOverdue(new Date('2026-01-16T12:00:00.000Z'), 'IN_PROGRESS')).toBe(false);
		});
	});
});
