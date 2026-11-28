using Microsoft.EntityFrameworkCore;

namespace DTMS.Api.Models;

// Khai báo bảng phiếu bỏ kín mà không phải sửa file DbContext chính
public partial class DtmsDbContext
{
    public virtual DbSet<PhieuBoPhieu> PhieuBoPhieus { get; set; }
}