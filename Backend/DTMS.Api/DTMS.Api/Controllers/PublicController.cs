using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using DTMS.Api.DTOs;
using DTMS.Api.Models;

namespace DTMS.Api.Controllers
{
    // API công khai: không cần đăng nhập
    [Route("api/[controller]")]
    [ApiController]
    [AllowAnonymous]
    public class PublicController : ControllerBase
    {
        private readonly DtmsDbContext _context;

        public PublicController(DtmsDbContext context)
        {
            _context = context;
        }

        // GET: api/Public/theses
        // Danh sách luận án công khai. Hiện chưa có dữ liệu được xác nhận công bố nên trả về mảng rỗng.
        [HttpGet("theses")]
        public IActionResult GetPublicTheses()
        {
            return Ok(new List<object>());
        }

        // GET: api/Public/diploma?code=...&name=...
        [HttpGet("diploma")]
        public IActionResult VerifyDiploma([FromQuery] string code, [FromQuery] string name)
        {
            if (string.IsNullOrWhiteSpace(code) || string.IsNullOrWhiteSpace(name))
            {
                return BadRequest(new DiplomaResponse { IsValid = false, Message = "Vui lòng nhập đủ số hiệu bằng và họ tên." });
            }

            var maCode = code.Trim();
            var tenNguoi = name.Trim().ToLower();

            var diploma = (from tn in _context.Hoanthienvatotnghieps
                           join ncs in _context.Nghiencuusinhs on tn.MaNcs equals ncs.MaNcs
                           join nganh in _context.Nganhdaotaos on ncs.MaNganh equals nganh.MaNganh
                           where tn.SoHieuBang == maCode && ncs.HoTen.ToLower() == tenNguoi
                           select new DiplomaDetailDto
                           {
                               SoHieuBang = tn.SoHieuBang,
                               HoTen = ncs.HoTen,
                               NganhDaoTao = nganh.TenNganh,
                               SoVaoSoGoc = tn.SoVaoSoGoc,
                               NgayCap = tn.NgayCapBang.HasValue ? tn.NgayCapBang.Value.ToString("yyyy-MM-dd") : null
                           }).FirstOrDefault();

            if (diploma == null)
            {
                return Ok(new DiplomaResponse
                {
                    IsValid = false,
                    Message = "Không tìm thấy thông tin văn bằng phù hợp."
                });
            }

            return Ok(new DiplomaResponse
            {
                IsValid = true,
                Message = "Xác thực thành công",
                Data = diploma
            });
        }
    }
}