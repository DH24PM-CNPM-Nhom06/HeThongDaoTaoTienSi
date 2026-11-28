using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
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
        private readonly IConfiguration _configuration;

        public PublicController(DtmsDbContext context, IConfiguration configuration)
        {
            _context = context;
            _configuration = configuration;
        }

        // GET: api/Public/theses
        // Công khai thông tin luận án trước ngày bảo vệ dự kiến 30 ngày (tài liệu nhóm 6).
        // Chỉ công khai tên NCS, ngành, tên đề tài và ngày bảo vệ. Toàn văn và tóm tắt cần đăng nhập để tải.
        [HttpGet("theses")]
        public async Task<IActionResult> GetPublicTheses()
        {
            var loaiTruong = (sbyte)_configuration.GetValue<int>("Hoidong:LoaiTruong", 0);
            if (loaiTruong == 0) return Ok(new List<object>());

            var soNgay = _configuration.GetValue<int>("Congkhai:SoNgayTruocBaoVe", 30);
            var homNay = DateTime.Today;

            var hoiDong = await _context.Hoidongdanhgia
                .Where(h => h.LoaiHoiDong == loaiTruong && h.NgayBaoVe != null)
                .ToListAsync();

            var ketQua = new List<object>();
            foreach (var hd in hoiDong)
            {
                if (hd.NgayBaoVe!.Value.Date.AddDays(-soNgay) > homNay) continue;

                var ncs = await _context.Nghiencuusinhs
                    .Where(n => n.MaNcs == hd.MaNcs)
                    .Select(n => new { n.HoTen, n.MaNganh })
                    .FirstOrDefaultAsync();
                if (ncs == null) continue;

                var deTai = await _context.Detailuanans
                    .Where(d => d.MaNcs == hd.MaNcs && d.TrangThaiDuyet == 1)
                    .Select(d => new { d.TenDeTaiVn, d.TenDeTaiEn })
                    .FirstOrDefaultAsync();

                ketQua.Add(new
                {
                    MaNcs = hd.MaNcs,
                    HoTen = ncs.HoTen,
                    MaNganh = ncs.MaNganh,
                    TenDeTaiVn = deTai?.TenDeTaiVn,
                    TenDeTaiEn = deTai?.TenDeTaiEn,
                    NgayBaoVe = hd.NgayBaoVe!.Value.ToString("yyyy-MM-dd")
                });
            }

            return Ok(ketQua);
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
                return Ok(new DiplomaResponse { IsValid = false, Message = "Không tìm thấy thông tin văn bằng phù hợp." });
            }

            return Ok(new DiplomaResponse { IsValid = true, Message = "Xác thực thành công", Data = diploma });
        }
    }
}