import { ApiConfig } from "../config/apiConfig";

export interface DataResponse {
    data: string[];
    count: number;
    usage: string;
}

export const dataService = {
    async getData(): Promise<DataResponse> {
        try {
            const start = performance.now();
            const response = await fetch(`${ApiConfig.baseUrl.decisionService}/api/Data`, {
                method: "GET",
                headers: { "Content-Type": "application/json" }
            });
            const end = performance.now();

            if (!response.ok) throw new Error("Failed to fetch data");

            const result = await response.json();
            // Append client-side timing for demonstration
            result.usage += ` | Client Latency: ${(end - start).toFixed(2)}ms`;
            return result;
        } catch (e) {
            console.error(e);
            return { data: [], count: 0, usage: "Error fetching data" };
        }
    },

    async addData(item: string): Promise<boolean> {
        try {
            const response = await fetch(`${ApiConfig.baseUrl.decisionService}/api/Data`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(item)
            });
            return response.ok;
        } catch (e) {
            return false;
        }
    }
};
