using Microsoft.EntityFrameworkCore;
using AuthService.Data;
using AuthService.DTOs;
using AuthService.Models;

namespace AuthService.Services;

public interface IAuthService
{
    Task<AuthResponse?> RegisterAsync(RegisterRequest req);
    Task<AuthResponse?> LoginAsync(LoginRequest req);
    Task<UserDto?> GetUserAsync(Guid id);
    Task<bool> UpdateProfileAsync(Guid id, UpdateProfileRequest req);
    Task<List<UserDto>> GetAllUsersAsync();
    Task<bool> SetUserActiveAsync(Guid id, bool isActive);
}

public class AuthService : IAuthService
{
    private readonly AppDbContext _db;
    private readonly IJwtService _jwt;

    public AuthService(AppDbContext db, IJwtService jwt)
    {
        _db = db;
        _jwt = jwt;
    }

    public async Task<AuthResponse?> RegisterAsync(RegisterRequest req)
    {
        if (await _db.Users.AnyAsync(u => u.Email == req.Email))
            return null;

        var user = new User
        {
            Email = req.Email,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(req.Password),
            FullName = req.FullName,
            University = req.University,
            Department = req.Department,
            Role = "Hoca"
        };

        _db.Users.Add(user);
        await _db.SaveChangesAsync();

        return new AuthResponse(_jwt.GenerateToken(user), user.Email, user.FullName, user.Role, user.Id);
    }

    public async Task<AuthResponse?> LoginAsync(LoginRequest req)
    {
        var user = await _db.Users.FirstOrDefaultAsync(u => u.Email == req.Email && u.IsActive);
        if (user == null || !BCrypt.Net.BCrypt.Verify(req.Password, user.PasswordHash))
            return null;

        return new AuthResponse(_jwt.GenerateToken(user), user.Email, user.FullName, user.Role, user.Id);
    }

    public async Task<UserDto?> GetUserAsync(Guid id)
    {
        var user = await _db.Users.FindAsync(id);
        return user == null ? null : ToDto(user);
    }

    public async Task<bool> UpdateProfileAsync(Guid id, UpdateProfileRequest req)
    {
        var user = await _db.Users.FindAsync(id);
        if (user == null) return false;

        user.FullName = req.FullName;
        user.University = req.University;
        user.Department = req.Department;
        user.UpdatedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync();
        return true;
    }

    public async Task<List<UserDto>> GetAllUsersAsync() =>
        await _db.Users.Select(u => ToDto(u)).ToListAsync();

    public async Task<bool> SetUserActiveAsync(Guid id, bool isActive)
    {
        var user = await _db.Users.FindAsync(id);
        if (user == null) return false;
        user.IsActive = isActive;
        user.UpdatedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync();
        return true;
    }

    private static UserDto ToDto(User u) => new(
        u.Id, u.Email, u.FullName, u.University, u.Department, u.Role, u.IsActive, u.CreatedAt);
}
