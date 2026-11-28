using Microsoft.EntityFrameworkCore;

namespace DTMS.Api.Models;

// Khai báo các bảng đợt 20A mà không phải sửa file DbContext chính
public partial class DtmsDbContext
{
    public virtual DbSet<MonhocTienquyet> MonhocTienquyets { get; set; }

    public virtual DbSet<LylichKhoahoc> LylichKhoahocs { get; set; }

    public virtual DbSet<KehoachLichsu> KehoachLichsus { get; set; }
}