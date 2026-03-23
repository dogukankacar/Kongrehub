namespace CongressService.Models;

public class Congress
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string Name { get; set; } = string.Empty;
    public string? Organizer { get; set; }
    public string Field { get; set; } = string.Empty;
    public string? City { get; set; }
    public string Country { get; set; } = "Türkiye";
    public DateOnly? StartDate { get; set; }
    public DateOnly? EndDate { get; set; }
    public DateOnly? Deadline { get; set; }
    public string? Description { get; set; }
    public string? Url { get; set; }
    public string Source { get; set; } = "manual"; // ai | scraper | manual
    public bool IsVerified { get; set; } = false;
    public bool IsActive { get; set; } = true;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}

public class Favorite
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid UserId { get; set; }
    public Guid CongressId { get; set; }
    public Congress? Congress { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}

public class Notification
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid UserId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
    public bool IsRead { get; set; } = false;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}

public class ScraperLog
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string Source { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public int CongressesFound { get; set; }
    public int CongressesAdded { get; set; }
    public string? ErrorMessage { get; set; }
    public DateTime RanAt { get; set; } = DateTime.UtcNow;
}
