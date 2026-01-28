using Microsoft.AspNetCore.Mvc;
using DecisionService.Services;

namespace DecisionService.Controllers;

// MVC Controller for AI Operations
[ApiController]
[Route("api/[controller]")]
public class AiController : ControllerBase
{
    private readonly IGeminiService _geminiService;
    private readonly ILocalChatService _localChatService;
    private readonly IVectorSearchService _vectorSearchService;
    private readonly ILogger<AiController> _logger;

    public AiController(
        IGeminiService geminiService, 
        ILocalChatService localChatService, 
        IVectorSearchService vectorSearchService,
        ILogger<AiController> logger)
    {
        _geminiService = geminiService;
        _localChatService = localChatService;
        _vectorSearchService = vectorSearchService;
        _logger = logger;
    }

    [HttpPost("decision")]
    public async Task<IActionResult> GetDecision([FromBody] ChatRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Prompt))
        {
            return BadRequest(new { Error = "Prompt is required." });
        }

        try 
        {
            // Optimization: Potential caching here using IDistributedCache
            var decision = await _geminiService.GetDecisionAsync(request.Prompt);
            return Ok(new { Decision = decision, Source = "Cloud (Gemini)", Timestamp = DateTime.UtcNow });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting decision");
            return StatusCode(500, new { Error = "Internal Server Error" });
        }
    }

    [HttpPost("local")]
    public async Task<IActionResult> GetLocalDecision([FromBody] ChatRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Prompt))
        {
            return BadRequest(new { Error = "Prompt is required." });
        }
        
        var decision = await _localChatService.GetLocalDecisionAsync(request.Prompt);
        return Ok(new { Decision = decision, Source = "Local (Ollama)", Timestamp = DateTime.UtcNow });
    }

    [HttpPost("memory/save")]
    public async Task<IActionResult> SaveMemory([FromBody] SaveMemoryRequest request)
    {
        await _vectorSearchService.SaveMemoryAsync(request.Key, request.Description, request.Text);
        return Ok(new { Status = "Memory saved", Key = request.Key });
    }

    [HttpPost("memory/search")]
    public async Task<IActionResult> SearchMemory([FromBody] SearchMemoryRequest request)
    {
        var result = await _vectorSearchService.SearchMemoryAsync(request.Query);
        return Ok(new { Result = result });
    }
}

public record ChatRequest(string Prompt);
public record SaveMemoryRequest(string Key, string Description, string Text);
public record SearchMemoryRequest(string Query);
