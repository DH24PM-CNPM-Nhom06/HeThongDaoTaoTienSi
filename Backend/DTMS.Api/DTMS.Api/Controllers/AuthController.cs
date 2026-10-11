using Microsoft.AspNetCore.Mvc;
using DTMS.Api.DTOs;
using DTMS.Api.Models;

namespace DTMS.Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly DtmsDbContext _context;

        public AuthController(DtmsDbContext context)
        {
            _context = context;
        }

        [HttpPost("login")]
        public IActionResult Login([FromBody] LoginRequest request)
        {
            // TODO: Viết logic kiểm tra DB ở đây

            // KẾT QUẢ TẠM THỜI ĐỂ TEST:
            var response = new LoginResponse
            {
                Success = true,
                Message = "Đăng nhập thành công",
                Token = "day_la_chuoi_token_sau_khi_code_xong_JWT",
                User = new UserInfoDto
                {
                    MaNguoiDung = 8,
                    HoTen = "Nguyễn Văn Đạt",
                    MaVaiTro = "NCS"
                }
            };

            return Ok(response);
        }
    }
}