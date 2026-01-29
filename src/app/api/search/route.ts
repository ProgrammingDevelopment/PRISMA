import { NextResponse } from 'next/server';

const SERPAPI_KEY = "50b0f3f6b1339fc9725b11b1768c10c0943f80f2b84c1bdb3fe4e7cf733515b0";
const BASE_URL = "https://serpapi.com/search.json";

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get('q');
    const type = searchParams.get('type') || 'search'; // search, maps, etc

    if (!q) {
        return NextResponse.json({ error: "Query parameter 'q' is required" }, { status: 400 });
    }

    let params: Record<string, string> = {
        api_key: SERPAPI_KEY,
        q: q,
        engine: "google", // Default
    };

    if (type === 'maps') {
        params.engine = "google_maps";
    } else if (type === 'local') {
        params.engine = "google_local";
    } else if (type === 'autocomplete') {
        // SerpAPI doesn't have a direct "autocomplete" engine like this usually, 
        // but Google Autocomplete API is different. 
        // For this demo, using standard google search is safer or using specific serpapi endpoint if exists.
        // We will stick to google search for now.
    }

    const queryString = new URLSearchParams(params).toString();

    try {
        const res = await fetch(`${BASE_URL}?${queryString}`);
        if (!res.ok) {
            throw new Error(`SerpAPI Error: ${res.statusText}`);
        }
        const data = await res.json();
        return NextResponse.json(data);
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch from SerpAPI" }, { status: 500 });
    }
}
