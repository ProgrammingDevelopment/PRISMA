#pragma warning disable SKEXP0001
using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.SemanticKernel.Memory;
using Microsoft.SemanticKernel.Embeddings;

namespace DecisionService.Services;

// Simple in-memory store to avoid missing Reference errors
public class SimpleMemoryStore : IMemoryStore
{
    private readonly ConcurrentDictionary<string, ConcurrentDictionary<string, MemoryRecord>> _collections = new();

    public Task CreateCollectionAsync(string collectionName, CancellationToken cancellationToken = default)
    {
        _collections.TryAdd(collectionName, new ConcurrentDictionary<string, MemoryRecord>());
        return Task.CompletedTask;
    }

    public Task<bool> DoesCollectionExistAsync(string collectionName, CancellationToken cancellationToken = default)
    {
        return Task.FromResult(_collections.ContainsKey(collectionName));
    }

    public IAsyncEnumerable<string> GetCollectionsAsync(CancellationToken cancellationToken = default)
    {
        return _collections.Keys.ToAsyncEnumerable();
    }

    public Task DeleteCollectionAsync(string collectionName, CancellationToken cancellationToken = default)
    {
        _collections.TryRemove(collectionName, out _);
        return Task.CompletedTask;
    }

    public Task<string> UpsertAsync(string collectionName, MemoryRecord record, CancellationToken cancellationToken = default)
    {
        var collection = _collections.GetOrAdd(collectionName, new ConcurrentDictionary<string, MemoryRecord>());
        collection[record.Metadata.Id] = record;
        return Task.FromResult(record.Metadata.Id);
    }

    public async IAsyncEnumerable<string> UpsertBatchAsync(string collectionName, IEnumerable<MemoryRecord> records, CancellationToken cancellationToken = default)
    {
        foreach (var record in records)
        {
            await UpsertAsync(collectionName, record, cancellationToken);
            yield return record.Metadata.Id;
        }
    }

    public Task<MemoryRecord?> GetAsync(string collectionName, string key, bool withEmbedding = true, CancellationToken cancellationToken = default)
    {
        if (_collections.TryGetValue(collectionName, out var collection) && collection.TryGetValue(key, out var record))
        {
            return Task.FromResult<MemoryRecord?>(record);
        }
        return Task.FromResult<MemoryRecord?>(null);
    }

    public IAsyncEnumerable<MemoryRecord> GetBatchAsync(string collectionName, IEnumerable<string> keys, bool withEmbedding = true, CancellationToken cancellationToken = default)
    {
        return this.GetBatchAsync(collectionName, keys, withEmbedding, cancellationToken);
    }

    public Task RemoveAsync(string collectionName, string key, CancellationToken cancellationToken = default)
    {
        if (_collections.TryGetValue(collectionName, out var collection))
        {
            collection.TryRemove(key, out _);
        }
        return Task.CompletedTask;
    }

    public Task RemoveBatchAsync(string collectionName, IEnumerable<string> keys, CancellationToken cancellationToken = default)
    {
        foreach (var key in keys) RemoveAsync(collectionName, key, cancellationToken);
        return Task.CompletedTask;
    }

    public IAsyncEnumerable<(MemoryRecord, double)> GetNearestMatchesAsync(string collectionName, ReadOnlyMemory<float> embedding, int limit, double minRelevanceScore = 0, bool withEmbeddings = true, CancellationToken cancellationToken = default)
    {
         // Simple linear search (cosine similarity)
         if (!_collections.TryGetValue(collectionName, out var collection)) return AsyncEnumerable.Empty<(MemoryRecord, double)>();

         var results = collection.Values
            .Select(record => (record, Similarity: CosineSimilarity(record.Embedding, embedding)))
            .Where(x => x.Similarity >= minRelevanceScore)
            .OrderByDescending(x => x.Similarity)
            .Take(limit);
        
         return results.ToAsyncEnumerable();
    }

    public Task<(MemoryRecord, double)?> GetNearestMatchAsync(string collectionName, ReadOnlyMemory<float> embedding, double minRelevanceScore = 0, bool withEmbedding = true, CancellationToken cancellationToken = default)
    {
        throw new NotImplementedException();
    }

    private static double CosineSimilarity(ReadOnlyMemory<float> vecA, ReadOnlyMemory<float> vecB)
    {
        var spanA = vecA.Span;
        var spanB = vecB.Span;
        if (spanA.Length != spanB.Length) return 0;
        
        double dot = 0, magA = 0, magB = 0;
        for (int i = 0; i < spanA.Length; i++)
        {
            dot += spanA[i] * spanB[i];
            magA += spanA[i] * spanA[i];
            magB += spanB[i] * spanB[i];
        }
        return dot / (Math.Sqrt(magA) * Math.Sqrt(magB));
    }
}
