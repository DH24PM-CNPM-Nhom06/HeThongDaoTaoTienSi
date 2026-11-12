using Microsoft.EntityFrameworkCore;

namespace DTMS.Api.Models;

// Khai báo bảng CTĐT mà không phải sửa file DbContext chính
public partial class DtmsDbContext
{
    public virtual DbSet<CtdtHocphan> CtdtHocphans { get; set; }
}