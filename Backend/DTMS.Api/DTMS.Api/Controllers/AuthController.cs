using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using System.Text.RegularExpressions;
using DTMS.Api.DTOs;
using DTMS.Api.Models;
using DTMS.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;

namespace DTMS.Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        // Thứ tự ưu tiên khi chọn vai trò chính hiển thị (mã CSDL)
        private static readonly string[] RolePriority = { "ADMIN", "PDT", "BGH", "KHOA", "TBM", "NHD", "PBDL", "NCS" };

        private const string ThongBaoSai = "Sai tài khoản hoặc mật khẩu.";
        private static readonly Regex MatKhauHopLe = new Regex(@"^(?=.*[A-Za-z])(?=.*\d).{8,}$");

        private readonly DtmsDbContext _context;
        private readonly IConfiguration _configuration;
        private readonly EmailService _email;
        private readonly ILogger<AuthController> _logger;

        public AuthController(DtmsDbContext context, IConfiguration configuration, EmailService email, ILogger<AuthController> logger)
        {
            _context = context;
            _configuration = configuration;
            _email = email;
            _logger = logger;
        }

        // POST: api/Auth/login
        [HttpPost("login")]
        [AllowAnonymous]
        public async Task<IActionResult> Login([FromBody] LoginRequest request)
        {
            var username = (request.Username ?? string.Empty).Trim();
            if (string.IsNullOrEmpty(username))
            {
                return Unauthorized(new { Success = false, Message = ThongBaoSai });
            }

            var user = await _context.Nguoidungs
                .Include(u => u.MaVaiTros)
                .FirstOrDefaultAsync(u => u.TenDangNhap == username || u.Email == username);

            // Không tồn tại tài khoản: trả về cùng thông báo, không đếm lần thử
            if (user == null)
            {
                return Unauthorized(new { Success = false, Message = ThongBaoSai });
            }

            var now = DateTime.Now;

            // Đang bị khóa tạm thời: từ chối ngay, kể cả khi nhập đúng mật khẩu
            if (user.KhoaDenThoiDiem.HasValue && user.KhoaDenThoiDiem.Value > now)
            {
                return StatusCode(StatusCodes.Status423Locked, new
                {
                    Success = false,
                    Message = $"Tài khoản tạm khóa do nhập sai nhiều lần. Thử lại sau {user.KhoaDenThoiDiem.Value:HH:mm dd/MM/yyyy}."
                });
            }

            if (user.LaHoatDong != true)
            {
                return Unauthorized(new { Success = false, Message = "Tài khoản đã bị khóa." });
            }

            if (string.IsNullOrEmpty(request.Password) || !BCrypt.Net.BCrypt.Verify(request.Password, user.MatKhauHash))
            {
                user.SoLanSaiDangNhap++;

                if (user.SoLanSaiDangNhap >= MaxLoginAttempts())
                {
                    user.KhoaDenThoiDiem = now.AddMinutes(LockoutMinutes());
                    user.SoLanSaiDangNhap = 0;
                    await _context.SaveChangesAsync();

                    return StatusCode(StatusCodes.Status423Locked, new
                    {
                        Success = false,
                        Message = $"Nhập sai nhiều lần. Tài khoản bị tạm khóa {LockoutMinutes()} phút."
                    });
                }

                await _context.SaveChangesAsync();
                return Unauthorized(new { Success = false, Message = ThongBaoSai });
            }

            // Đăng nhập thành công: xóa bộ đếm sai
            user.SoLanSaiDangNhap = 0;
            user.KhoaDenThoiDiem = null;
            await _context.SaveChangesAsync();

            var roles = user.MaVaiTros.Select(v => v.MaVaiTro).ToList();
            if (roles.Count == 0)
            {
                return StatusCode(StatusCodes.Status403Forbidden,
                    new { Success = false, Message = "Tài khoản chưa được cấp vai trò. Vui lòng liên hệ quản trị viên." });
            }

            var authClaims = new List<Claim>
            {
                new Claim(ClaimTypes.Name, user.TenDangNhap),
                new Claim("UserId", user.MaNguoiDung.ToString())
            };
            foreach (var role in roles)
            {
                authClaims.Add(new Claim(ClaimTypes.Role, role));
            }

            string? hoTen = null;

            var ncs = await _context.Nghiencuusinhs.FirstOrDefaultAsync(n => n.MaNguoiDung == user.MaNguoiDung);
            if (ncs != null)
            {
                authClaims.Add(new Claim("MaNcs", ncs.MaNcs));
                hoTen = ncs.HoTen;
            }

            var gv = await _context.Giangviens.FirstOrDefaultAsync(g => g.MaNguoiDung == user.MaNguoiDung);
            if (gv != null)
            {
                authClaims.Add(new Claim("MaGv", gv.MaGv));
                hoTen ??= gv.HoTen;
            }

            hoTen ??= user.TenDangNhap;

            // Vai trò ngoài danh sách ưu tiên vẫn được đưa vào, sau các vai trò chuẩn
            var displayRoles = RolePriority
                .Where(r => roles.Contains(r))
                .Concat(roles.Where(r => !RolePriority.Contains(r)))
                .Select(ToFrontendRole)
                .Distinct()
                .ToList();

            var secretKey = _configuration["Jwt:Key"]
                ?? throw new InvalidOperationException("Thiếu cấu hình Jwt:Key.");
            var signingKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey));

            var token = new JwtSecurityToken(
                issuer: _configuration["Jwt:Issuer"],
                audience: _configuration["Jwt:Audience"],
                expires: DateTime.Now.AddHours(24),
                claims: authClaims,
                signingCredentials: new SigningCredentials(signingKey, SecurityAlgorithms.HmacSha256));

            return Ok(new LoginResponse
            {
                Success = true,
                Message = "Đăng nhập thành công",
                Token = new JwtSecurityTokenHandler().WriteToken(token),
                User = new UserInfoDto
                {
                    MaNguoiDung = user.MaNguoiDung,
                    HoTen = hoTen,
                    MaVaiTro = displayRoles.Count > 0 ? displayRoles[0] : roles[0],
                    Roles = displayRoles
                }
            });
        }

        // POST: api/Auth/quen-mat-khau  (luôn trả về cùng thông báo để không lộ email nào tồn tại)
        [HttpPost("quen-mat-khau")]
        [AllowAnonymous]
        public async Task<IActionResult> QuenMatKhau([FromBody] QuenMatKhauRequest request)
        {
            var email = (request.Email ?? string.Empty).Trim();
            const string thongBao = "Nếu email tồn tại trong hệ thống, hướng dẫn đặt lại mật khẩu đã được gửi.";

            var user = await _context.Nguoidungs.FirstOrDefaultAsync(u => u.Email == email && u.LaHoatDong == true);
            if (user == null)
            {
                return Ok(new { Success = true, Message = thongBao });
            }

            var token = Convert.ToBase64String(RandomNumberGenerator.GetBytes(32))
                .Replace('+', '-').Replace('/', '_').TrimEnd('=');

            user.ResetTokenHash = Bam(token);
            user.ResetTokenHetHan = DateTime.Now.AddMinutes(_configuration.GetValue<int>("Security:ResetTokenMinutes", 30));
            await _context.SaveChangesAsync();

            var resetUrl = _configuration["Frontend:ResetUrl"] ?? string.Empty;
            var noiDung = $"Chào {user.TenDangNhap},\n\nBạn đã yêu cầu đặt lại mật khẩu cho hệ thống DTMS.\n" +
                          $"Mở liên kết sau để đặt mật khẩu mới (có hiệu lực trong {_configuration.GetValue<int>("Security:ResetTokenMinutes", 30)} phút):\n" +
                          $"{resetUrl}?token={token}\n\nNếu bạn không yêu cầu, hãy bỏ qua email này.";

            try
            {
                await _email.GuiAsync(user.Email, "Đặt lại mật khẩu DTMS", noiDung);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Không gửi được email đặt lại mật khẩu cho tài khoản {MaNguoiDung}", user.MaNguoiDung);
            }

            return Ok(new { Success = true, Message = thongBao });
        }

        // POST: api/Auth/dat-lai-mat-khau
        [HttpPost("dat-lai-mat-khau")]
        [AllowAnonymous]
        public async Task<IActionResult> DatLaiMatKhau([FromBody] DatLaiMatKhauRequest request)
        {
            if (string.IsNullOrWhiteSpace(request.Token))
            {
                return BadRequest(new { Success = false, Message = "Liên kết không hợp lệ." });
            }

            if (string.IsNullOrEmpty(request.NewPassword) || !MatKhauHopLe.IsMatch(request.NewPassword))
            {
                return BadRequest(new { Success = false, Message = "Mật khẩu mới phải có ít nhất 8 ký tự, gồm cả chữ và số." });
            }

            var hash = Bam(request.Token.Trim());
            var user = await _context.Nguoidungs.FirstOrDefaultAsync(u => u.ResetTokenHash == hash);

            if (user == null || user.ResetTokenHetHan == null || user.ResetTokenHetHan < DateTime.Now)
            {
                return BadRequest(new { Success = false, Message = "Liên kết không hợp lệ hoặc đã hết hạn." });
            }

            user.MatKhauHash = BCrypt.Net.BCrypt.HashPassword(request.NewPassword);
            user.ResetTokenHash = null;
            user.ResetTokenHetHan = null;
            user.SoLanSaiDangNhap = 0;
            user.KhoaDenThoiDiem = null;
            await _context.SaveChangesAsync();

            return Ok(new { Success = true, Message = "Đặt lại mật khẩu thành công. Vui lòng đăng nhập lại." });
        }

        // POST: api/Auth/mo-khoa/5  (ADMIN, PDT mở khóa tài khoản bị khóa tạm)
        [HttpPost("mo-khoa/{manguoidung:int}")]
        [Authorize(Roles = "ADMIN,PDT")]
        public async Task<IActionResult> MoKhoaTaiKhoan(int manguoidung)
        {
            var user = await _context.Nguoidungs.FindAsync(manguoidung);
            if (user == null) return NotFound();

            user.SoLanSaiDangNhap = 0;
            user.KhoaDenThoiDiem = null;
            await _context.SaveChangesAsync();

            return Ok(new { Success = true, Message = "Đã mở khóa tài khoản." });
        }

        private int MaxLoginAttempts() => _configuration.GetValue<int>("Security:MaxLoginAttempts", 5);

        private int LockoutMinutes() => _configuration.GetValue<int>("Security:LockoutMinutes", 15);

        private static string Bam(string gia) =>
            Convert.ToHexString(SHA256.HashData(Encoding.UTF8.GetBytes(gia))).ToLowerInvariant();

        // Ánh xạ mã CSDL sang mã giao diện
        private static string ToFrontendRole(string code) => code switch
        {
            "TBM" => "BM",
            "ADMIN" => "PDT",
            "PBDL" => "HOIDONG",
            _ => code
        };
    }
}