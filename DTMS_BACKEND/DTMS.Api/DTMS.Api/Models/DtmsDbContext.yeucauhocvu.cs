using Microsoft.EntityFrameworkCore;

namespace DTMS.Api.Models;

// Khai báo bảng mới mà không phải sửa file DtmsDbContext chính
public partial class DtmsDbContext
{
    public virtual DbSet<YeucauHocvu> YeucauHocvus { get; set; }

    public virtual DbSet<YeucauHocvuBuoc> YeucauHocvuBuocs { get; set; }
}