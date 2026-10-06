import { test, expect } from 'vitest';
import { sum, multiply } from '../../src/utils/sum.js';
test('Test sum 2 + 3 = 5', () => {
    const a = 2, b = 3;
    const result = sum(a, b);
    expect(result).toBe(5);
});
test('Test sum 2 + 3 != 10', () => {
    const a = 2, b = 3;
    const result = sum(a, b);
    expect(result).not.toBe(10);
});
test('Test multiply 2 * 3 = 6', () => {
    const a = 2, b = 3;
    const result = multiply(a, b);
    expect(result).toBe(6);
});
test('Test multiply 2 * 3 != 10', () => {
    const a = 2, b = 3;
    const result = multiply(a, b);
    expect(result).not.toBe(10);
});
//# sourceMappingURL=sum.test.js.map