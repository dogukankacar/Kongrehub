using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using CongressService.Services;

namespace CongressService.Controllers;

[ApiController]
[Route("api/favorites")]
[Authorize]
public class FavoriteController : ControllerBase
{
    private readonly IFavoriteService _svc;
    public FavoriteController(IFavoriteService svc) => _svc = svc;

    private Guid UserId => Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

    // GET /api/favorites
    [HttpGet]
    public async Task<IActionResult> GetFavorites()
        => Ok(await _svc.GetUserFavoritesAsync(UserId));

    // POST /api/favorites/{congressId}
    [HttpPost("{congressId:guid}")]
    public async Task<IActionResult> Add(Guid congressId)
    {
        var ok = await _svc.AddFavoriteAsync(UserId, congressId);
        return ok ? Ok(new { message = "Favorilere eklendi." }) : Conflict(new { message = "Zaten favorilerde." });
    }

    // DELETE /api/favorites/{congressId}
    [HttpDelete("{congressId:guid}")]
    public async Task<IActionResult> Remove(Guid congressId)
    {
        var ok = await _svc.RemoveFavoriteAsync(UserId, congressId);
        return ok ? Ok(new { message = "Favorilerden çıkarıldı." }) : NotFound();
    }
}
