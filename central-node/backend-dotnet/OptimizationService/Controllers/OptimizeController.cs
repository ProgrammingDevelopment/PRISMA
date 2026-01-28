using Microsoft.AspNetCore.Mvc;
using OptimizationService.Services;

namespace OptimizationService.Controllers;

[ApiController]
[Route("[controller]")] 
// Note: Keeping route simple to match previous "/optimize" if possible, 
// but standard is /Optimization. 
// We will Map a specific route to be safe or use [Route("optimize")]
public class OptimizeController : ControllerBase
{
    private readonly IOptimizer _optimizer;
    private readonly ILogger<OptimizeController> _logger;

    public OptimizeController(IOptimizer optimizer, ILogger<OptimizeController> logger)
    {
        _optimizer = optimizer;
        _logger = logger;
    }

    [HttpPost] // Maps to POST /optimize
    [Route("/optimize")] 
    public IActionResult Optimize([FromBody] OptimizationInput input)
    {
        _logger.LogInformation("Received optimization request for target {Target}", input.TargetOutput);
        
        if (input.TargetOutput < 0)
        {
            return BadRequest("Target output must be non-negative.");
        }

        var result = _optimizer.OptimizeResources(input);
        return Ok(result);
    }
}
