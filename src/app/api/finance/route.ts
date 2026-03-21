import { NextRequest } from 'next/server';
import {
    apiSuccess, apiError, apiRateLimited,
    checkServerRateLimit, getClientIP,
} from '../middleware';
import fs from 'fs';
import path from 'path';

interface FinanceData {
    balance: string;
    income: string;
    expense: string;
    lastUpdate: string;
    expenses_detail: Array<{ item: string; amount: string }>;
    payment_methods: string[];
}

function loadFinanceData(): FinanceData {
    try {
        const dataPath = path.resolve(process.cwd(), 'scripts', 'data-store.json');
        const raw = fs.readFileSync(dataPath, 'utf-8');
        const data = JSON.parse(raw);
        return data.finance || {
            balance: 'N/A', income: 'N/A', expense: 'N/A',
            lastUpdate: 'N/A', expenses_detail: [], payment_methods: [],
        };
    } catch {
        return {
            balance: 'N/A', income: 'N/A', expense: 'N/A',
            lastUpdate: 'N/A', expenses_detail: [], payment_methods: [],
        };
    }
}

export async function GET(req: NextRequest) {
    const ip = getClientIP(req);
    const rateCheck = checkServerRateLimit(ip, 60, 60000);
    if (!rateCheck.allowed) return apiRateLimited(rateCheck.resetAt);

    try {
        const finance = loadFinanceData();
        return apiSuccess({
            summary: {
                balance: finance.balance,
                totalIncome: finance.income,
                totalExpense: finance.expense,
                lastUpdate: finance.lastUpdate,
            },
            expenses: finance.expenses_detail,
            paymentMethods: finance.payment_methods,
        });
    } catch (error) {
        console.error('[Finance API] GET error:', error);
        return apiError('Failed to fetch finance data', 500);
    }
}
