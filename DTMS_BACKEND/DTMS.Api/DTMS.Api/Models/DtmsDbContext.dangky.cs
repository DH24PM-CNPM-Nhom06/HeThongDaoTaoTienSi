using Microsoft.EntityFrameworkCore;

namespace DTMS.Api.Models;

// Khai báo bảng đăng ký học phần mà không phải sửa file DbContext chính
public partial class DtmsDbContext
{
    public virtual DbSet<DotDangKyHocphan> DotDangKyHocphans { get; set; }

    public virtual DbSet<DangKyHocphan> DangKyHocphans { get; set; }
}