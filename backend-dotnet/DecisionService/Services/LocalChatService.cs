using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Net.Http.Json;
using System.Text.Json.Serialization;
using System.Threading.Tasks;
using Microsoft.Extensions.AI; // Keep for Interface if needed, or remove if direct
using Microsoft.Extensions.Logging;

namespace DecisionService.Services;

public interface ILocalChatService
{
    Task<string> GetLocalDecisionAsync(string prompt);
}

public class LocalChatService : ILocalChatService
{
    private readonly HttpClient _httpClient;
    private readonly string _modelId;
    private readonly string _endpoint;
    private readonly ILogger<LocalChatService> _logger;

    public LocalChatService(IConfiguration config, ILogger<LocalChatService> logger)
    {
        _endpoint = config["Ollama:Endpoint"] ?? "http://localhost:11434";
        _modelId = config["Ollama:ModelId"] ?? "llama3";
        _httpClient = new HttpClient();
        _logger = logger;
    }

    public async Task<string> GetLocalDecisionAsync(string prompt)
    {
        try
        {
            var requestUri = $"{_endpoint}/api/generate";
            var requestBody = new
            {
                model = _modelId,
                prompt = $"System: You are a helpful AI.\nUser: {prompt}",
                stream = false
            };

            var response = await _httpClient.PostAsJsonAsync(requestUri, requestBody);
            
            if (!response.IsSuccessStatusCode)
            {
                return $"Error: Ollama API returned {response.StatusCode}";
            }

            var result = await response.Content.ReadFromJsonAsync<OllamaResponse>();
            return result?.Response ?? "No response text.";
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error calling local chat model");
            return $"Error calling local chat model: {ex.Message}. Make sure Ollama is running at {_endpoint}";
        }
    }
}

public class OllamaResponse
{
    [JsonPropertyName("response")]
    public string? Response { get; set; }
}
