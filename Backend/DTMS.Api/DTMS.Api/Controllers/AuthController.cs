using DTMS.Api.DTOs;
using DTMS.Api.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace DTMS.Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [AllowAnonymous]
    public class AuthController : ControllerBase
    {
        // Thứ tự ưu tiên khi chọn vai trò chính hiển thị (mã CSDL)
        private static readonly string[] RolePriority = { "ADMIN", "PDT", "TBM", "NHD", "PBDL", "NCS" };

        private readonly DtmsDbContext _context;
        private readonly IConfiguration _configuration;

        public AuthController(DtmsDbContext context, IConfiguration configuration)
        {
            _context = context;
            _configuration = configuration;
        }

        [HttpPost("login")]
        public IActionResult Login([FromBody] LoginRequest request)
        {
            // Đăng nhập bằng tên đăng nhập (mã số) hoặc email
            var username = (request.Username ?? string.Empty).Trim();
            if (string.IsNullOrEmpty(username) || string.IsNullOrEmpty(request.Password))
            {
                return Unauthorized(new { Success = false, Message = "Sai tài khoản hoặc mật khẩu" });
            }

            var user = _context.Nguoidungs
                .Include(u => u.MaVaiTros)
                .FirstOrDefault(u => u.TenDangNhap == username || u.Email == username);

            if (user == null || !BCrypt.Net.BCrypt.Verify(request.Password, user.MatKhauHash))
            {
                return Unauthorized(new { Success = false, Message = "Sai tài khoản hoặc mật khẩu" });
            }

            if (user.LaHoatDong != true)
            {
                return Unauthorized(new { Success = false, Message = "Tài khoản đã bị khóa" });
            }

            var roles = user.MaVaiTros.Select(v => v.MaVaiTro).ToList();
            if (roles.Count == 0)
            {
                return StatusCode(StatusCodes.Status403Forbidden,
                    new { Success = false, Message = "Tài khoản chưa được cấp vai trò. Vui lòng liên hệ quản trị viên." });
            }

            // Token giữ MÃ CSDL của mọi vai trò để phân quyền ở backend
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

            var ncs = _context.Nghiencuusinhs.FirstOrDefault(n => n.MaNguoiDung == user.MaNguoiDung);
            if (ncs != null)
            {
                authClaims.Add(new Claim("MaNcs", ncs.MaNcs));
                hoTen = ncs.HoTen;
            }

            var gv = _context.Giangviens.FirstOrDefault(g => g.MaNguoiDung == user.MaNguoiDung);
            if (gv != null)
            {
                authClaims.Add(new Claim("MaGv", gv.MaGv));
                if (hoTen == null) hoTen = gv.HoTen;
            }

            if (string.IsNullOrEmpty(hoTen))
            {
                hoTen = user.TenDangNhap;
            }

            // Danh sách vai trò hiển thị trên giao diện, sắp theo thứ tự ưu tiên
            var displayRoles = RolePriority
                .Where(r => roles.Contains(r))
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
                signingCredentials: new SigningCredentials(signingKey, SecurityAlgorithms.HmacSha256)
            );

            var tokenString = new JwtSecurityTokenHandler().WriteToken(token);

            return Ok(new LoginResponse
            {
                Success = true,
                Message = "Đăng nhập thành công",
                Token = tokenString,
                User = new UserInfoDto
                {
                    MaNguoiDung = user.MaNguoiDung,
                    HoTen = hoTen,
                    MaVaiTro = displayRoles[0],
                    Roles = displayRoles
                }
            });
        }

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