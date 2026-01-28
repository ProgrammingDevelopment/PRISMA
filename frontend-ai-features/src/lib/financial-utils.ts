export function formatCurrency(amount: number): string {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(amount);
}

export function calculateVariance(current: number, previous: number): { percent: number, isIncrease: boolean } {
    if (previous === 0) return { percent: 100, isIncrease: true };
    const diff = current - previous;
    const percent = (diff / previous) * 100;
    return {
        percent: Math.abs(parseFloat(percent.toFixed(1))),
        isIncrease: diff > 0
    };
}
