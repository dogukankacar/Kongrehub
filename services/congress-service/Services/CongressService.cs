using Microsoft.EntityFrameworkCore;
using CongressService.Data;
using CongressService.DTOs;
using CongressService.Models;

namespace CongressService.Services;

public interface ICongressService
{
    Task<PagedResult<CongressDto>> GetAllAsync(CongressFilterRequest filter, Guid? userId);
    Task<CongressDto?> GetByIdAsync(Guid id, Guid? userId);
    Task<CongressDto> CreateAsync(CreateCongressRequest req);
    Task<CongressDto?> UpdateAsync(Guid id, UpdateCongressRequest req);
    Task<bool> DeleteAsync(Guid id);
    Task<CongressDto> UpsertFromScraperAsync(CreateCongressRequest req);
    Task<List<ScraperLogDto>> GetScraperLogsAsync();
    Task AddScraperLogAsync(ScraperLogDto log);
    Task<Dictionary<string, int>> GetStatsAsync();
}

public class CongressService : ICongressService
{
    private readonly AppDbContext _db;
    private readonly ICacheService _cache;

    public CongressService(AppDbContext db, ICacheService cache)
    {
        _db = db;
        _cache = cache;
    }

    public async Task<PagedResult<CongressDto>> GetAllAsync(CongressFilterRequest filter, Guid? userId)
    {
        var cacheKey = $"congresses:{filter.Field}:{filter.City}:{filter.Search}:{filter.UpcomingOnly}:{filter.Page}:{userId}";
        var cached = await _cache.GetAsync<PagedResult<CongressDto>>(cacheKey);
        if (cached != null) return cached;

        var query = _db.Congresses.Where(c => c.IsActive).AsQueryable();

        if (!string.IsNullOrWhiteSpace(filter.Field))
            query = query.Where(c => c.Field == filter.Field);

        if (!string.IsNullOrWhiteSpace(filter.City))
            query = query.Where(c => c.City != null && c.City.ToLower().Contains(filter.City.ToLower()));

        if (!string.IsNullOrWhiteSpace(filter.Search))
        {
            var s = filter.Search.ToLower();
            query = query.Where(c =>
                c.Name.ToLower().Contains(s) ||
                (c.Organizer != null && c.Organizer.ToLower().Contains(s)) ||
                (c.Description != null && c.Description.ToLower().Contains(s)));
        }

        if (filter.UpcomingOnly == true)
        {
            var today = DateOnly.FromDateTime(DateTime.UtcNow);
            query = query.Where(c => c.StartDate == null || c.StartDate >= today);
        }

        var total = await query.CountAsync();
        var items = await query
            .OrderByDescending(c => c.CreatedAt)
            .Skip((filter.Page - 1) * filter.PageSize)
            .Take(filter.PageSize)
            .ToListAsync();

        HashSet<Guid> favSet = new();
        if (userId.HasValue)
        {
            var favIds = await _db.Favorites
                .Where(f => f.UserId == userId.Value)
                .Select(f => f.CongressId)
                .ToListAsync();
            favSet = favIds.ToHashSet();
        }

        var dtos = items.Select(c => ToDto(c, favSet.Contains(c.Id))).ToList();
        var result = new PagedResult<CongressDto>(dtos, total, filter.Page, filter.PageSize);

        await _cache.SetAsync(cacheKey, result, TimeSpan.FromMinutes(15));
        return result;
    }

    public async Task<CongressDto?> GetByIdAsync(Guid id, Guid? userId)
    {
        var congress = await _db.Congresses.FindAsync(id);
        if (congress == null || !congress.IsActive) return null;

        bool isFav = false;
        if (userId.HasValue)
            isFav = await _db.Favorites.AnyAsync(f => f.UserId == userId.Value && f.CongressId == id);

        return ToDto(congress, isFav);
    }

    public async Task<CongressDto> CreateAsync(CreateCongressRequest req)
    {
        var congress = MapFromRequest(req);
        _db.Congresses.Add(congress);
        await _db.SaveChangesAsync();
        await _cache.RemoveByPatternAsync("congresses:*");
        return ToDto(congress, false);
    }

    public async Task<CongressDto?> UpdateAsync(Guid id, UpdateCongressRequest req)
    {
        var congress = await _db.Congresses.FindAsync(id);
        if (congress == null) return null;

        congress.Name = req.Name;
        congress.Organizer = req.Organizer;
        congress.Field = req.Field;
        congress.City = req.City;
        congress.Country = req.Country ?? "Türkiye";
        congress.StartDate = ParseDate(req.StartDate);
        congress.EndDate = ParseDate(req.EndDate);
        congress.Deadline = ParseDate(req.Deadline);
        congress.Description = req.Description;
        congress.Url = req.Url;
        congress.IsVerified = req.IsVerified;
        congress.UpdatedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync();
        await _cache.RemoveByPatternAsync("congresses:*");
        return ToDto(congress, false);
    }

    public async Task<bool> DeleteAsync(Guid id)
    {
        var congress = await _db.Congresses.FindAsync(id);
        if (congress == null) return false;
        congress.IsActive = false;
        congress.UpdatedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync();
        await _cache.RemoveByPatternAsync("congresses:*");
        return true;
    }

    public async Task<CongressDto> UpsertFromScraperAsync(CreateCongressRequest req)
    {
        // Check if congress with same name and field already exists
        var existing = await _db.Congresses
            .FirstOrDefaultAsync(c => c.Name == req.Name && c.Field == req.Field);

        if (existing != null)
        {
            existing.Url = req.Url ?? existing.Url;
            existing.Description = req.Description ?? existing.Description;
            existing.City = req.City ?? existing.City;
            existing.StartDate = ParseDate(req.StartDate) ?? existing.StartDate;
            existing.EndDate = ParseDate(req.EndDate) ?? existing.EndDate;
            existing.Deadline = ParseDate(req.Deadline) ?? existing.Deadline;
            existing.UpdatedAt = DateTime.UtcNow;
            await _db.SaveChangesAsync();
            return ToDto(existing, false);
        }

        var congress = MapFromRequest(req);
        _db.Congresses.Add(congress);
        await _db.SaveChangesAsync();
        await _cache.RemoveByPatternAsync("congresses:*");
        return ToDto(congress, false);
    }

    public async Task<List<ScraperLogDto>> GetScraperLogsAsync()
    {
        return await _db.ScraperLogs
            .OrderByDescending(l => l.RanAt)
            .Take(50)
            .Select(l => new ScraperLogDto(
                l.Id, l.Source, l.Status,
                l.CongressesFound, l.CongressesAdded,
                l.ErrorMessage, l.RanAt))
            .ToListAsync();
    }

    public async Task AddScraperLogAsync(ScraperLogDto log)
    {
        _db.ScraperLogs.Add(new ScraperLog
        {
            Source = log.Source,
            Status = log.Status,
            CongressesFound = log.CongressesFound,
            CongressesAdded = log.CongressesAdded,
            ErrorMessage = log.ErrorMessage,
            RanAt = log.RanAt
        });
        await _db.SaveChangesAsync();
    }

    public async Task<Dictionary<string, int>> GetStatsAsync()
    {
        var total = await _db.Congresses.CountAsync(c => c.IsActive);
        var today = DateOnly.FromDateTime(DateTime.UtcNow);
        var upcoming = await _db.Congresses.CountAsync(c => c.IsActive && (c.StartDate == null || c.StartDate >= today));
        var byField = await _db.Congresses
            .Where(c => c.IsActive)
            .GroupBy(c => c.Field)
            .Select(g => new { g.Key, Count = g.Count() })
            .ToDictionaryAsync(x => x.Key, x => x.Count);

        var result = new Dictionary<string, int>
        {
            ["total"] = total,
            ["upcoming"] = upcoming,
            ["thisMonth"] = await _db.Congresses.CountAsync(c =>
                c.IsActive &&
                c.StartDate != null &&
                c.StartDate.Value.Year == today.Year &&
                c.StartDate.Value.Month == today.Month)
        };

        foreach (var kv in byField)
            result[$"field_{kv.Key}"] = kv.Value;

        return result;
    }

    private static Congress MapFromRequest(CreateCongressRequest req) => new()
    {
        Name = req.Name,
        Organizer = req.Organizer,
        Field = req.Field,
        City = req.City,
        Country = req.Country ?? "Türkiye",
        StartDate = ParseDate(req.StartDate),
        EndDate = ParseDate(req.EndDate),
        Deadline = ParseDate(req.Deadline),
        Description = req.Description,
        Url = req.Url,
        Source = req.Source ?? "manual"
    };

    private static CongressDto ToDto(Congress c, bool isFav) => new(
        c.Id, c.Name, c.Organizer, c.Field, c.City, c.Country,
        c.StartDate?.ToString("yyyy-MM-dd"),
        c.EndDate?.ToString("yyyy-MM-dd"),
        c.Deadline?.ToString("yyyy-MM-dd"),
        c.Description, c.Url, c.Source, c.IsVerified, isFav, c.CreatedAt);

    private static DateOnly? ParseDate(string? s) =>
        DateOnly.TryParse(s, out var d) ? d : null;
}
