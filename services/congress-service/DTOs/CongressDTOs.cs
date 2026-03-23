namespace CongressService.DTOs;

public record CongressDto(
    Guid Id,
    string Name,
    string? Organizer,
    string Field,
    string? City,
    string Country,
    string? StartDate,
    string? EndDate,
    string? Deadline,
    string? Description,
    string? Url,
    string Source,
    bool IsVerified,
    bool IsFavorite,
    DateTime CreatedAt
);

public record CreateCongressRequest(
    string Name,
    string? Organizer,
    string Field,
    string? City,
    string? Country,
    string? StartDate,
    string? EndDate,
    string? Deadline,
    string? Description,
    string? Url,
    string? Source
);

public record UpdateCongressRequest(
    string Name,
    string? Organizer,
    string Field,
    string? City,
    string? Country,
    string? StartDate,
    string? EndDate,
    string? Deadline,
    string? Description,
    string? Url,
    bool IsVerified
);

public record CongressFilterRequest(
    string? Field,
    string? City,
    string? Search,
    bool? UpcomingOnly,
    int Page = 1,
    int PageSize = 20
);

public record PagedResult<T>(List<T> Items, int Total, int Page, int PageSize);

public record ScraperLogDto(
    Guid Id,
    string Source,
    string Status,
    int CongressesFound,
    int CongressesAdded,
    string? ErrorMessage,
    DateTime RanAt
);
