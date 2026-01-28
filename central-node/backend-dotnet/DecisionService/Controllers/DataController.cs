using Microsoft.AspNetCore.Mvc;

namespace DecisionService.Controllers;

[ApiController]
[Route("api/[controller]")]
public class DataController : ControllerBase
{
    private static readonly List<string> _mockData = new() { "Item1", "Item2", "Item3" };

    [HttpGet]
    [ResponseCache(Duration = 60)] // Optimization: Cache header for 60 seconds
    public IActionResult GetData()
    {
        // Optimized Data Retrieval (Mock)
        // With 'Prisma' context, one would do: _context.Items.ToListAsync();
        
        return Ok(new 
        { 
            Data = _mockData, 
            Count = _mockData.Count, 
            Usage = "Demonstrating Data Optimization with Caching Headers" 
        });
    }

    [HttpPost]
    public IActionResult AddData([FromBody] string item)
    {
        if (string.IsNullOrWhiteSpace(item)) return BadRequest();
        _mockData.Add(item);
        return CreatedAtAction(nameof(GetData), new { item }, new { Message = "Added" });
    }
}
