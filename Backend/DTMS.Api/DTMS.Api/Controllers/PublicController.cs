using Microsoft.AspNetCore.Mvc;
using DTMS.Api.DTOs;
using DTMS.Api.Models;

namespace DTMS.Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class PublicController : ControllerBase
    {
        private readonly DtmsDbContext _context;

        public PublicController(DtmsDbContext context)
        {
            _context = context;
        }

        [HttpGet("diploma")]
        public IActionResult VerifyDiploma([FromQuery] string code, [FromQuery] string name)
        {
            // TODO:
            // 1. Kiểm tra tham số đầu vào 'code' và 'name'
            // 2. Dùng _context truy vấn kết hợp các bảng:
            //    - hoanthienvatotnghiep (để kiểm tra SoHieuBang)
            //    - nghiencuusinh (để đối chiếu HoTen)
            //    - nganhdaotao (để lấy TenNganh)
            // 3. Nếu không tìm thấy, trả về IsValid = false
            // 4. Nếu tìm thấy, gán dữ liệu vào DiplomaDetailDto

            // KẾT QUẢ TẠM THỜI ĐỂ TEST (Yêu cầu bạn kia xóa và viết logic thật):
            var response = new DiplomaResponse
            {
                IsValid = true,
                Message = "Xác thực thành công",
                Data = new DiplomaDetailDto
                {
                    SoHieuBang = code,
                    HoTen = name,
                    NganhDaoTao = "Khoa học Môi trường", // Lấy từ DB
                    SoVaoSoGoc = "SG-TS-2026-012",       // Lấy từ DB
                    NgayCap = "2026-01-20"               // Lấy từ DB
                }
            };

            return Ok(response);
        }
    }
}