using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using CongressService.DTOs;
using CongressService.Services;

namespace CongressService.Controllers;

[ApiController]
[Route("api/congresses")]
public class CongressController : ControllerBase
{
    private readonly ICongressService _svc;

    public CongressController(ICongressService svc) => _svc = svc;

    private Guid? GetUserId()
    {
        var claim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        return claim != null ? Guid.Parse(claim) : null;
    }

    // GET /api/congresses?field=tip&city=istanbul&search=...&upcomingOnly=true&page=1&pageSize=20
    [HttpGet]
    [AllowAnonymous]
    public async Task<IActionResult> GetAll([FromQuery] CongressFilterRequest filter)
    {
        var result = await _svc.GetAllAsync(filter, GetUserId());
        return Ok(result);
    }

    // GET /api/congresses/{id}
    [HttpGet("{id:guid}")]
    [AllowAnonymous]
    public async Task<IActionResult> GetById(Guid id)
    {
        var result = await _svc.GetByIdAsync(id, GetUserId());
        return result == null ? NotFound() : Ok(result);
    }

    // POST /api/congresses  (Admin only)
    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Create(CreateCongressRequest req)
    {
        var result = await _svc.CreateAsync(req);
        return CreatedAtAction(nameof(GetById), new { id = result.Id }, result);
    }

    // PUT /api/congresses/{id}  (Admin only)
    [HttpPut("{id:guid}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Update(Guid id, UpdateCongressRequest req)
    {
        var result = await _svc.UpdateAsync(id, req);
        return result == null ? NotFound() : Ok(result);
    }

    // DELETE /api/congresses/{id}  (Admin only)
    [HttpDelete("{id:guid}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var ok = await _svc.DeleteAsync(id);
        return ok ? NoContent() : NotFound();
    }

    // POST /api/congresses/scraper  (Internal - called by scraper service)
    [HttpPost("scraper")]
    [AllowAnonymous] // Secured by internal network in production
    public async Task<IActionResult> UpsertFromScraper(CreateCongressRequest req)
    {
        var result = await _svc.UpsertFromScraperAsync(req);
        return Ok(result);
    }

    // GET /api/congresses/stats
    [HttpGet("stats")]
    [Authorize]
    public async Task<IActionResult> GetStats()
    {
        var stats = await _svc.GetStatsAsync();
        return Ok(stats);
    }

    // GET /api/congresses/scraper-logs  (Admin only)
    [HttpGet("scraper-logs")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> GetScraperLogs()
    {
        var logs = await _svc.GetScraperLogsAsync();
        return Ok(logs);
    }

    // POST /api/congresses/scraper-logs  (Internal)
    [HttpPost("scraper-logs")]
    [AllowAnonymous]
    public async Task<IActionResult> AddScraperLog(ScraperLogDto log)
    {
        await _svc.AddScraperLogAsync(log);
        return Ok();
    }
}
