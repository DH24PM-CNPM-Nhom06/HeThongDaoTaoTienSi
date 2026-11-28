using System.ComponentModel.DataAnnotations;
using DTMS.Api.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace DTMS.Api.Controllers
{
    // Thông tin liên lạc của chính người đang đăng nhập (mọi vai trò đều dùng được)
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class ProfileController : ControllerBase
    {
        private readonly DtmsDbContext _context;

        public ProfileController(DtmsDbContext context)
        {
            _context = context;
        }

        // GET: api/Profile/me
        [HttpGet("me")]
        public async Task<IActionResult> GetMe()
        {
            var uid = CurrentUserId();
            if (uid == null) return Unauthorized();

            var nd = await _context.Nguoidungs.FirstOrDefaultAsync(u => u.MaNguoiDung == uid.Value);
            if (nd == null) return NotFound();

            // Họ tên và mã NCS lấy từ hồ sơ (chỉ đọc, do nhà trường quản lý)
            var maNcs = await _context.Nghiencuusinhs
                .Where(n => n.MaNguoiDung == nd.MaNguoiDung)
                .Select(n => n.MaNcs)
                .FirstOrDefaultAsync();

            var hoTen = await _context.Nghiencuusinhs
                .Where(n => n.MaNguoiDung == nd.MaNguoiDung)
                .Select(n => n.HoTen)
                .FirstOrDefaultAsync();

            if (hoTen == null)
            {
                hoTen = await _context.Giangviens
                    .Where(g => g.MaNguoiDung == nd.MaNguoiDung)
                    .Select(g => g.HoTen)
                    .FirstOrDefaultAsync();
            }

            return Ok(new
            {
                nd.MaNguoiDung,
                nd.TenDangNhap,
                nd.Email,
                nd.SoDienThoai,
                CoQuanCongTac = nd.CoQuanCongTac,
                HoTen = hoTen,
                MaNcs = maNcs
            });
        }

        // PUT: api/Profile/me  (email, số điện thoại, cơ quan công tác)
        [HttpPut("me")]
        public async Task<IActionResult> UpdateMe([FromBody] UpdateProfileRequest dto)
        {
            var uid = CurrentUserId();
            if (uid == null) return Unauthorized();

            var nd = await _context.Nguoidungs.FirstOrDefaultAsync(u => u.MaNguoiDung == uid.Value);
            if (nd == null) return NotFound();

            var email = dto.Email.Trim();
            if (await _context.Nguoidungs.AnyAsync(u => u.Email == email && u.MaNguoiDung != nd.MaNguoiDung))
            {
                return Conflict(new { Success = false, Message = "Email đã được sử dụng." });
            }

            nd.Email = email;
            nd.SoDienThoai = string.IsNullOrWhiteSpace(dto.SoDienThoai) ? null : dto.SoDienThoai.Trim();
            nd.CoQuanCongTac = string.IsNullOrWhiteSpace(dto.CoQuanCongTac) ? null : dto.CoQuanCongTac.Trim();

            await _context.SaveChangesAsync();

            return Ok(new { Success = true, Message = "Cập nhật thông tin liên lạc thành công." });
        }

        private int? CurrentUserId()
        {
            if (!int.TryParse(User.FindFirst("UserId")?.Value, out int id)) return null;
            return id;
        }
    }

    public class UpdateProfileRequest
    {
        [Required, EmailAddress, StringLength(100)]
        public string Email { get; set; } = null!;

        [StringLength(20)]
        public string? SoDienThoai { get; set; }

        [StringLength(200)]
        public string? CoQuanCongTac { get; set; }
    }
}