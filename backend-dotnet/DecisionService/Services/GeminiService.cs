using System.Net.Http.Json;
using System.Text.Json.Serialization;

namespace DecisionService.Services;

public interface IGeminiService
{
    Task<string> GetDecisionAsync(string prompt);
}

public class GeminiService : IGeminiService
{
    private readonly HttpClient _httpClient;
    private readonly IConfiguration _configuration;

    public GeminiService(HttpClient httpClient, IConfiguration configuration)
    {
        _httpClient = httpClient;
        _configuration = configuration;
    }

    public async Task<string> GetDecisionAsync(string prompt)
    {
        var apiKey = _configuration["Gemini:ApiKey"];
        if (string.IsNullOrEmpty(apiKey))
        {
            return "Error: Gemini API Key not configured. Please add 'Gemini:ApiKey' to appsettings.json or environment variables.";
        }

        // Using gemini-1.5-flash as it is efficient for decisions
        var requestUri = $"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={apiKey}";
        
        var requestBody = new
        {
            contents = new[]
            {
                new
                {
                    parts = new[]
                    {
                        new { text = prompt }
                    }
                }
            }
        };

        try 
        {
            var response = await _httpClient.PostAsJsonAsync(requestUri, requestBody);
            
            if (!response.IsSuccessStatusCode)
            {
                 var errorContent = await response.Content.ReadAsStringAsync();
                 return $"Error calling Gemini API: {response.StatusCode} - {errorContent}";
            }

            var result = await response.Content.ReadFromJsonAsync<GeminiResponse>();
            return result?.Candidates?.FirstOrDefault()?.Content?.Parts?.FirstOrDefault()?.Text ?? "No response generated.";
        }
        catch (Exception ex)
        {
            return $"Exception: {ex.Message}";
        }
    }
}

public class GeminiResponse
{
    [JsonPropertyName("candidates")]
    public Candidate[]? Candidates { get; set; }
}

public class Candidate
{
    [JsonPropertyName("content")]
    public Content? Content { get; set; }
}

public class Content
{
    [JsonPropertyName("parts")]
    public Part[]? Parts { get; set; }
}

public class Part
{
    [JsonPropertyName("text")]
    public string? Text { get; set; }
}
