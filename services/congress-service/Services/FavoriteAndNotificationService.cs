using Microsoft.EntityFrameworkCore;
using CongressService.Data;
using CongressService.DTOs;
using CongressService.Models;

namespace CongressService.Services;

// ── Favorite Service ──────────────────────────────────────────────

public interface IFavoriteService
{
    Task<List<CongressDto>> GetUserFavoritesAsync(Guid userId);
    Task<bool> AddFavoriteAsync(Guid userId, Guid congressId);
    Task<bool> RemoveFavoriteAsync(Guid userId, Guid congressId);
}

public class FavoriteService : IFavoriteService
{
    private readonly AppDbContext _db;
    public FavoriteService(AppDbContext db) => _db = db;

    public async Task<List<CongressDto>> GetUserFavoritesAsync(Guid userId)
    {
        return await _db.Favorites
            .Where(f => f.UserId == userId)
            .Include(f => f.Congress)
            .Where(f => f.Congress != null && f.Congress.IsActive)
            .OrderByDescending(f => f.CreatedAt)
            .Select(f => new CongressDto(
                f.Congress!.Id,
                f.Congress.Name,
                f.Congress.Organizer,
                f.Congress.Field,
                f.Congress.City,
                f.Congress.Country,
                f.Congress.StartDate != null ? f.Congress.StartDate.Value.ToString("yyyy-MM-dd") : null,
                f.Congress.EndDate != null ? f.Congress.EndDate.Value.ToString("yyyy-MM-dd") : null,
                f.Congress.Deadline != null ? f.Congress.Deadline.Value.ToString("yyyy-MM-dd") : null,
                f.Congress.Description,
                f.Congress.Url,
                f.Congress.Source,
                f.Congress.IsVerified,
                true,
                f.Congress.CreatedAt))
            .ToListAsync();
    }

    public async Task<bool> AddFavoriteAsync(Guid userId, Guid congressId)
    {
        if (await _db.Favorites.AnyAsync(f => f.UserId == userId && f.CongressId == congressId))
            return false;

        if (!await _db.Congresses.AnyAsync(c => c.Id == congressId && c.IsActive))
            return false;

        _db.Favorites.Add(new Favorite { UserId = userId, CongressId = congressId });
        await _db.SaveChangesAsync();
        return true;
    }

    public async Task<bool> RemoveFavoriteAsync(Guid userId, Guid congressId)
    {
        var fav = await _db.Favorites
            .FirstOrDefaultAsync(f => f.UserId == userId && f.CongressId == congressId);
        if (fav == null) return false;
        _db.Favorites.Remove(fav);
        await _db.SaveChangesAsync();
        return true;
    }
}

// ── Notification Service ──────────────────────────────────────────

public interface INotificationService
{
    Task<List<NotificationDto>> GetUserNotificationsAsync(Guid userId);
    Task MarkAllReadAsync(Guid userId);
    Task SendToAllAsync(string title, string message);
}

public record NotificationDto(Guid Id, string Title, string Message, bool IsRead, DateTime CreatedAt);

public class NotificationService : INotificationService
{
    private readonly AppDbContext _db;
    public NotificationService(AppDbContext db) => _db = db;

    public async Task<List<NotificationDto>> GetUserNotificationsAsync(Guid userId)
    {
        return await _db.Notifications
            .Where(n => n.UserId == userId)
            .OrderByDescending(n => n.CreatedAt)
            .Take(50)
            .Select(n => new NotificationDto(n.Id, n.Title, n.Message, n.IsRead, n.CreatedAt))
            .ToListAsync();
    }

    public async Task MarkAllReadAsync(Guid userId)
    {
        var notifs = await _db.Notifications
            .Where(n => n.UserId == userId && !n.IsRead)
            .ToListAsync();
        notifs.ForEach(n => n.IsRead = true);
        await _db.SaveChangesAsync();
    }

    public async Task SendToAllAsync(string title, string message)
    {
        // In production, get user IDs from auth service; here we use a placeholder
        // This endpoint is called by admin to broadcast notifications
        // For now, store a generic notification — extend with user list as needed
        await Task.CompletedTask;
    }
}
