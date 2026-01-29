import { describe, it, expect } from 'vitest';
import { formatCurrency, calculateVariance } from './financial-utils';

describe('Financial Utils', () => {
    describe('formatCurrency', () => {
        it('should format IDR correctly without decimals', () => {
            expect(formatCurrency(10000).replace(/\s/g, '\u00A0')).toBe('Rp 10.000');
            // Note: Intl might use non-breaking space, so regex replace might be needed or loose check.
            // Let's just check if it contains "Rp" and "10.000"
            const result = formatCurrency(10000);
            expect(result).toContain('Rp');
            expect(result).toContain('10.000');
        });

        it('should handle zero', () => {
            const result = formatCurrency(0);
            expect(result).toContain('0');
        });
    });

    describe('calculateVariance', () => {
        it('should calculate increase correctly', () => {
            const result = calculateVariance(150, 100);
            expect(result).toEqual({ percent: 50, isIncrease: true });
        });

        it('should calculate decrease correctly', () => {
            const result = calculateVariance(80, 100);
            expect(result).toEqual({ percent: 20, isIncrease: false });
        });

        it('should handle zero previous value', () => {
            const result = calculateVariance(100, 0);
            expect(result).toEqual({ percent: 100, isIncrease: true });
        });
    });
});
