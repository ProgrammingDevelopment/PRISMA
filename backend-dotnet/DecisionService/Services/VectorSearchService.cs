#pragma warning disable SKEXP0001
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.SemanticKernel;
using Microsoft.SemanticKernel.Connectors.Qdrant;
using Microsoft.SemanticKernel.Memory;
using Microsoft.SemanticKernel.Embeddings;

namespace DecisionService.Services;

public interface IVectorSearchService
{
    Task SaveMemoryAsync(string key, string description, string text);
    Task<string> SearchMemoryAsync(string query);
}

// NOTE: This implementation is for demonstration of the pattern.
// In a real scenario, you need a Qdrant server running (e.g., via Docker).
// If no Qdrant is available, we will gracefully fallback or just show the pattern.
public class VectorSearchService : IVectorSearchService
{
#pragma warning disable SKEXP0001 // Type is for evaluation purposes only and is subject to change or removal in future updates. Suppress this diagnostic to proceed.
    private readonly ISemanticTextMemory _memory;
#pragma warning restore SKEXP0001 // Type is for evaluation purposes only and is subject to change or removal in future updates. Suppress this diagnostic to proceed.

#pragma warning disable SKEXP0001 // Type is for evaluation purposes only and is subject to change or removal in future updates. Suppress this diagnostic to proceed.
    public VectorSearchService(ISemanticTextMemory memory)
    {
        _memory = memory;
    }
#pragma warning restore SKEXP0001 // Type is for evaluation purposes only and is subject to change or removal in future updates. Suppress this diagnostic to proceed.

    public async Task SaveMemoryAsync(string key, string description, string text)
    {
        // Use a default collection "Decisions"
        await _memory.SaveReferenceAsync(
            collection: "Decisions",
            externalSourceName: "UserDecisions",
            externalId: key,
            description: description,
            text: text
        );
    }

    public async Task<string> SearchMemoryAsync(string query)
    {
        var results = _memory.SearchAsync(
            collection: "Decisions",
            query: query,
            limit: 3,
            minRelevanceScore: 0.5
        );

        var output = new List<string>();
        await foreach (var result in results) 
        {
            output.Add($"Found memory: {result.Metadata.Text} (Score: {result.Relevance})");
        }

        if (output.Count == 0) return "No relevant memories found.";
        return string.Join("\n", output);
    }
}
