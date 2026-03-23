using Microsoft.EntityFrameworkCore;
using CongressService.Models;

namespace CongressService.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<Congress> Congresses => Set<Congress>();
    public DbSet<Favorite> Favorites => Set<Favorite>();
    public DbSet<Notification> Notifications => Set<Notification>();
    public DbSet<ScraperLog> ScraperLogs => Set<ScraperLog>();

    protected override void OnModelCreating(ModelBuilder m)
    {
        m.Entity<Congress>(e =>
        {
            e.ToTable("congresses");
            e.HasKey(x => x.Id);
            e.Property(x => x.Id).HasColumnName("id");
            e.Property(x => x.Name).HasColumnName("name");
            e.Property(x => x.Organizer).HasColumnName("organizer");
            e.Property(x => x.Field).HasColumnName("field");
            e.Property(x => x.City).HasColumnName("city");
            e.Property(x => x.Country).HasColumnName("country");
            e.Property(x => x.StartDate).HasColumnName("start_date");
            e.Property(x => x.EndDate).HasColumnName("end_date");
            e.Property(x => x.Deadline).HasColumnName("deadline");
            e.Property(x => x.Description).HasColumnName("description");
            e.Property(x => x.Url).HasColumnName("url");
            e.Property(x => x.Source).HasColumnName("source");
            e.Property(x => x.IsVerified).HasColumnName("is_verified");
            e.Property(x => x.IsActive).HasColumnName("is_active");
            e.Property(x => x.CreatedAt).HasColumnName("created_at");
            e.Property(x => x.UpdatedAt).HasColumnName("updated_at");
        });

        m.Entity<Favorite>(e =>
        {
            e.ToTable("favorites");
            e.HasKey(x => x.Id);
            e.Property(x => x.Id).HasColumnName("id");
            e.Property(x => x.UserId).HasColumnName("user_id");
            e.Property(x => x.CongressId).HasColumnName("congress_id");
            e.Property(x => x.CreatedAt).HasColumnName("created_at");
            e.HasOne(x => x.Congress).WithMany().HasForeignKey(x => x.CongressId);
            e.HasIndex(x => new { x.UserId, x.CongressId }).IsUnique();
        });

        m.Entity<Notification>(e =>
        {
            e.ToTable("notifications");
            e.HasKey(x => x.Id);
            e.Property(x => x.Id).HasColumnName("id");
            e.Property(x => x.UserId).HasColumnName("user_id");
            e.Property(x => x.Title).HasColumnName("title");
            e.Property(x => x.Message).HasColumnName("message");
            e.Property(x => x.IsRead).HasColumnName("is_read");
            e.Property(x => x.CreatedAt).HasColumnName("created_at");
        });

        m.Entity<ScraperLog>(e =>
        {
            e.ToTable("scraper_logs");
            e.HasKey(x => x.Id);
            e.Property(x => x.Id).HasColumnName("id");
            e.Property(x => x.Source).HasColumnName("source");
            e.Property(x => x.Status).HasColumnName("status");
            e.Property(x => x.CongressesFound).HasColumnName("congresses_found");
            e.Property(x => x.CongressesAdded).HasColumnName("congresses_added");
            e.Property(x => x.ErrorMessage).HasColumnName("error_message");
            e.Property(x => x.RanAt).HasColumnName("ran_at");
        });
    }
}
