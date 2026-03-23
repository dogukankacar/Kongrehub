using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using CongressService.Services;

namespace CongressService.Controllers;

[ApiController]
[Route("api/notifications")]
[Authorize]
public class NotificationController : ControllerBase
{
    private readonly INotificationService _svc;
    public NotificationController(INotificationService svc) => _svc = svc;

    private Guid UserId => Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

    // GET /api/notifications
    [HttpGet]
    public async Task<IActionResult> GetAll()
        => Ok(await _svc.GetUserNotificationsAsync(UserId));

    // PUT /api/notifications/read-all
    [HttpPut("read-all")]
    public async Task<IActionResult> MarkAllRead()
    {
        await _svc.MarkAllReadAsync(UserId);
        return Ok(new { message = "Tümü okundu olarak işaretlendi." });
    }

    // POST /api/notifications/broadcast  (Admin only)
    [HttpPost("broadcast")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Broadcast([FromBody] BroadcastRequest req)
    {
        await _svc.SendToAllAsync(req.Title, req.Message);
        return Ok(new { message = "Bildirim gönderildi." });
    }
}

public record BroadcastRequest(string Title, string Message);
