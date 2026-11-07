using DTMS.Api.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using Microsoft.AspNetCore.Mvc.Infrastructure;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace DTMS.Api.Filters
{
    // Ghi nhật ký mọi thao tác thêm, sửa, xóa và cả lần đăng nhập (kể cả thất bại).
    // Không ghi nội dung gửi lên (để tránh lưu mật khẩu) và không ghi thao tác đọc.
    public class AuditFilter : IAsyncActionFilter
    {
        private readonly DtmsDbContext _db;

        public AuditFilter(DtmsDbContext db)
        {
            _db = db;
        }

        public async Task OnActionExecutionAsync(ActionExecutingContext context, ActionExecutionDelegate next)
        {
            var executed = await next();

            var http = context.HttpContext;
            var method = http.Request.Method;
            if (method == HttpMethods.Get || method == HttpMethods.Options || method == HttpMethods.Head)
            {
                return;
            }

            int? maNguoiDung = null;
            if (int.TryParse(http.User.FindFirst("UserId")?.Value, out var uid))
            {
                maNguoiDung = uid;
            }

            var tenDangNhap = http.User.FindFirst(ClaimTypes.Name)?.Value;

            int status = 200;
            if (executed.Exception != null)
            {
                status = 500;
            }
            else if (executed.Result is IStatusCodeActionResult statusResult && statusResult.StatusCode.HasValue)
            {
                status = statusResult.StatusCode.Value;
            }

            var duongDan = http.Request.Path.Value ?? string.Empty;
            if (duongDan.Length > 255) duongDan = duongDan.Substring(0, 255);

            var diaChi = http.Connection.RemoteIpAddress?.ToString();
            var thoiDiem = DateTime.Now;

            try
            {
                await _db.Database.ExecuteSqlInterpolatedAsync($@"
                    INSERT INTO nhatky_thaotac (ThoiDiem, MaNguoiDung, TenDangNhap, HanhDong, DuongDan, MaTrangThai, DiaChi)
                    VALUES ({thoiDiem}, {maNguoiDung}, {tenDangNhap}, {method}, {duongDan}, {status}, {diaChi})");
            }
            catch (Exception)
            {
                // Lỗi ghi nhật ký không được làm hỏng nghiệp vụ chính
            }
        }
    }
}