using Microsoft.AspNetCore.Mvc;

namespace DecisionService.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ImageController : ControllerBase
{
    // Simulation of an image optimization endpoint
    // In production, this would use ImageSharp or SkiaSharp to resize/compress images.
    
    [HttpGet("optimize")]
    public IActionResult OptimizeImage([FromQuery] string imageUrl, [FromQuery] int width = 0, [FromQuery] int height = 0)
    {
        // For now, we return a mock response or redirect.
        // If we were serving local files, we'd process them here.
        
        if (string.IsNullOrEmpty(imageUrl))
            return BadRequest("Image URL is required.");

        // Pretend processing...
        var processingMessage = $"Optimizing image {imageUrl} to {width}x{height} (if specified).";
        
        // Return structured data or the image itself
        return Ok(new 
        { 
            Status = "Optimized", 
            OriginalUrl = imageUrl, 
            OptimizedUrl = imageUrl, // In real scenario, return a cached/processed URL
            Params = new { width, height },
            Note = "This is a placeholder for server-side image optimization logic (e.g. WebP conversion)."
        });
    }
    
    [HttpGet("render-page")]
    public IActionResult GetPageRender([FromQuery] string pageName)
    {
        // Example of returning HTML content (Server Side Rendering fragment)
        // or data for a page.
        
        var htmlContent = $"<div><h1>Rendered {pageName}</h1><p>Optimized content via ASP.NET Core</p></div>";
        return Content(htmlContent, "text/html");
    }
}
