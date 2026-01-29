import { NextResponse } from 'next/server';
import { portfolioData } from '@/lib/data';
import { supabase } from '@/lib/supabase';

export async function GET() {
    // 1. Try Go Backend (Preferred for Performance)
    try {
        const goRes = await fetch("http://localhost:8080/api/portfolio", { next: { revalidate: 10 } });
        if (goRes.ok) {
            const data = await goRes.json();
            return NextResponse.json(data);
        }
    } catch (err) {
        // Go backend might not be running, continue to next Strategy
        // console.warn("Go Backend unavailble, falling back to Supabase/Mock");
    }

    // 2. Try Supabase
    if (supabase) {
        try {
            const { data, error } = await supabase
                .from('portfolio')
                .select('*');

            if (!error && data && data.length > 0) {
                return NextResponse.json(data);
            }
            if (error) {
                console.error("Supabase Error:", error);
            }
        } catch (err) {
            console.error("Supabase Connection Error:", err);
        }
    }

    // 3. Fallback to Mock Data
    // Simulate database delay for realism
    await new Promise(resolve => setTimeout(resolve, 500));
    return NextResponse.json(portfolioData);
}
