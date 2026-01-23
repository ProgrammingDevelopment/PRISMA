// Configuration for API endpoints
const DECISION_SERVICE_URL = process.env.NEXT_PUBLIC_DECISION_SERVICE_URL || "http://localhost:5014";
const OPTIMIZATION_SERVICE_URL = process.env.NEXT_PUBLIC_OPTIMIZATION_SERVICE_URL || "http://localhost:5133";

export interface DecisionResponse {
    decision: string;
    source?: string;
}

export interface OptimizationInput {
    resourceA: number;
    resourceB: number;
    targetOutput: number;
}

export interface OptimizationResult {
    allocationA: number;
    allocationB: number;
    efficiency: number;
    status: string;
}

export const aiService = {
    // Use Gemini Cloud
    async getChatDecision(prompt: string): Promise<DecisionResponse> {
        return this._fetchDecision(`${DECISION_SERVICE_URL}/chat/decision`, prompt);
    },

    // Use Local Model (Ollama)
    async getLocalDecision(prompt: string): Promise<DecisionResponse> {
        return this._fetchDecision(`${DECISION_SERVICE_URL}/chat/local`, prompt);
    },

    // Helper
    async _fetchDecision(url: string, prompt: string): Promise<DecisionResponse> {
        try {
            const response = await fetch(url, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ prompt }),
            });

            if (!response.ok) {
                // Try to read error message
                const err = await response.text();
                throw new Error(`Service Error (${response.status}): ${err}`);
            }

            return await response.json();
        } catch (error: any) {
            console.error("Failed to get decision", error);
            return { decision: `Error: ${error.message || "Connection failed"}` };
        }
    },

    async optimizeResources(input: OptimizationInput): Promise<OptimizationResult> {
        try {
            const response = await fetch(`${OPTIMIZATION_SERVICE_URL}/optimize`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(input),
            });

            if (!response.ok) {
                throw new Error(`Optimization Service Error: ${response.statusText}`);
            }

            return await response.json();
        } catch (error) {
            console.error("Failed to optimize", error);
            throw error;
        }
    },

    // Vector Search Memory
    async saveMemory(key: string, description: string, text: string): Promise<string> {
        try {
            const response = await fetch(`${DECISION_SERVICE_URL}/memory/save`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ key, description, text }),
            });
            if (!response.ok) throw new Error("Failed to save");
            return "Saved successfully";
        } catch (e) {
            return "Error saving memory";
        }
    },

    async searchMemory(query: string): Promise<string> {
        try {
            const response = await fetch(`${DECISION_SERVICE_URL}/memory/search`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ query }),
            });
            if (!response.ok) throw new Error("Failed to search");
            const data = await response.json();
            return data.Result;
        } catch (e) {
            return "Error searching memory";
        }
    }
};
