namespace AuthService.DTOs;

public record RegisterRequest(
    string Email,
    string Password,
    string FullName,
    string? University,
    string? Department
);

public record LoginRequest(string Email, string Password);

public record AuthResponse(
    string Token,
    string Email,
    string FullName,
    string Role,
    Guid UserId
);

public record UpdateProfileRequest(
    string FullName,
    string? University,
    string? Department
);

public record UserDto(
    Guid Id,
    string Email,
    string FullName,
    string? University,
    string? Department,
    string Role,
    bool IsActive,
    DateTime CreatedAt
);
