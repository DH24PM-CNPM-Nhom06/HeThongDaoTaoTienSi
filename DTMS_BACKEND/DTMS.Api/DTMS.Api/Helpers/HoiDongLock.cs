using DTMS.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace DTMS.Api.Helpers;

// Phải gọi SAU BeginTransactionAsync(). Mọi thao tác làm thay đổi thành viên
// hoặc phiếu hội đồng đều khóa cùng một hàng trước khi đọc/ghi dữ liệu.
// Tránh hai yêu cầu đồng thời thay đổi thành phần/kết quả bỏ phiếu.
public static class HoiDongLock
{
    public static async Task<bool> AcquireAsync(DtmsDbContext db, int maHoiDong, CancellationToken ct = default)
    {
        // SqlQuery<int> nội suy tham số, không nối trực tiếp dữ liệu người dùng vào SQL.
        var ids = await db.Database.SqlQuery<int>(
            $"SELECT MaHoiDong AS Value FROM hoidongdanhgia WHERE MaHoiDong = {maHoiDong} FOR UPDATE")
            .ToListAsync(ct);
        return ids.Count == 1;
    }
}
