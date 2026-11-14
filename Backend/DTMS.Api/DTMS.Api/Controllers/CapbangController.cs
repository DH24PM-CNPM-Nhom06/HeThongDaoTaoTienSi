using DTMS.Api.Helpers;
using DTMS.Api.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace DTMS.Api.Controllers
{
    // Sau bảo vệ: giải trình, lưu chiểu, công khai luận án, quyết định cấp bằng (tài liệu nhóm 7).
    // Quy trình: bảo vệ đạt -> NCS giải trình (nếu có) -> PĐT lưu chiểu và công khai -> BGH ký quyết định cấp bằng.
    // Cấp bằng chỉ được ký khi đã đạt hội đồng cấp Trường, đã lưu chiểu và đã công khai.
    [Route("api/[controller]")]
    [ApiController]
    [Authorize(Roles = "ADMIN,PDT,BGH,NCS,NHD,TBM,KHOA")]
    public class CapbangController : ControllerBase
    {
        private readonly DtmsDbContext _context;
        private readonly IConfiguration _configuration;

        public CapbangController(DtmsDbContext context, IConfiguration configuration)
        {
            _context = context;
            _configuration = configuration;
        }

        // GET: api/Capbang/NCS01  (danh mục kiểm tra trạng thái sau bảo vệ)
        [HttpGet("{maNcs}")]
        public async Task<IActionResult> TrangThai(string maNcs)
        {
            if (!await Access.CanReadNcsAsync(_context, User, maNcs)) return NotFound();

            var dat = await DaDatBaoVeAsync(maNcs);
            var hoan = await _context.Hoanthienvatotnghieps.FirstOrDefaultAsync(h => h.MaNcs == maNcs);

            var coLuuChieu = !string.IsNullOrWhiteSpace(hoan?.BienNhanTvqg);
            var coCongKhai = hoan?.NgayCongKhaiWeb != null;
            var daCapBang = hoan?.NgayCapBang != null;

            return Ok(new
            {
                MaNcs = maNcs,
                DatBaoVe = dat,
                DaCoGiaiTrinh = hoan?.FileGiaiTrinhSauBv != null,
                DaLuuChieu = coLuuChieu,
                DaCongKhai = coCongKhai,
                DaCapBang = daCapBang,
                SanSangKyCapBang = dat && coLuuChieu && coCongKhai && !daCapBang,
                SoHieuBang = hoan?.SoHieuBang,
                SoQdCapBang = hoan?.SoQdcapBang,
                NgayCapBang = hoan?.NgayCapBang
            });
        }

        // POST: api/Capbang/NCS01/giai-trinh  (NCS nộp giải trình sau bảo vệ)
        [HttpPost("{maNcs}/giai-trinh")]
        [Authorize(Roles = "NCS")]
        public async Task<IActionResult> NopGiaiTrinh(string maNcs, [FromBody] FileRequest dto)
        {
            var cuaToi = await Access.CurrentNcsAsync(_context, User);
            if (cuaToi != maNcs) return NotFound();

            if (string.IsNullOrWhiteSpace(dto.FileUrl))
            {
                return BadRequest(new { Success = false, Message = "Thiếu tệp giải trình." });
            }

            var hoan = await _context.Hoanthienvatotnghieps.FirstOrDefaultAsync(h => h.MaNcs == maNcs);
            if (hoan == null)
            {
                return Conflict(new { Success = false, Message = "Hồ sơ chưa được tạo. Liên hệ phòng đào tạo." });
            }

            hoan.FileGiaiTrinhSauBv = dto.FileUrl;
            await _context.SaveChangesAsync();
            return Ok(new { Success = true, Message = "Đã nộp giải trình." });
        }

        // POST: api/Capbang/NCS01/luu-chieu  (PĐT ghi biên nhận lưu chiểu)
        [HttpPost("{maNcs}/luu-chieu")]
        [Authorize(Roles = "ADMIN,PDT")]
        public async Task<IActionResult> LuuChieu(string maNcs, [FromBody] LuuChieuRequest dto)
        {
            if (!await DaDatBaoVeAsync(maNcs))
            {
                return Conflict(new { Success = false, Message = "Chưa đạt bảo vệ cấp Trường, không thể lưu chiểu." });
            }

            if (string.IsNullOrWhiteSpace(dto.BienNhanTvqg))
            {
                return BadRequest(new { Success = false, Message = "Thiếu biên nhận lưu chiểu Thư viện Quốc gia." });
            }

            var hoan = await _context.Hoanthienvatotnghieps.FirstOrDefaultAsync(h => h.MaNcs == maNcs);
            if (hoan == null) return Conflict(new { Success = false, Message = "Hồ sơ chưa được tạo." });

            hoan.BienNhanTvqg = dto.BienNhanTvqg.Trim();
            hoan.BienNhanTvtruong = dto.BienNhanTvtruong;
            await _context.SaveChangesAsync();
            return Ok(new { Success = true, Message = "Đã ghi nhận lưu chiểu." });
        }

        // POST: api/Capbang/NCS01/cong-khai  (PĐT đưa luận án lên trang công khai của trường)
        [HttpPost("{maNcs}/cong-khai")]
        [Authorize(Roles = "ADMIN,PDT")]
        public async Task<IActionResult> CongKhai(string maNcs)
        {
            if (!await DaDatBaoVeAsync(maNcs))
            {
                return Conflict(new { Success = false, Message = "Chưa đạt bảo vệ cấp Trường, không thể công khai." });
            }

            var hoan = await _context.Hoanthienvatotnghieps.FirstOrDefaultAsync(h => h.MaNcs == maNcs);
            if (hoan == null) return Conflict(new { Success = false, Message = "Hồ sơ chưa được tạo." });
            if (string.IsNullOrWhiteSpace(hoan.BienNhanTvqg))
            {
                return Conflict(new { Success = false, Message = "Chưa hoàn thành lưu chiểu Thư viện Quốc gia." });
            }

            hoan.NgayCongKhaiWeb = DateOnly.FromDateTime(DateTime.Today);
            await _context.SaveChangesAsync();
            return Ok(new { Success = true, Message = "Đã công khai luận án trên website." });
        }

        // PUT: api/Capbang/NCS01/cap-bang  (BGH ký quyết định cấp bằng)
        [HttpPut("{maNcs}/cap-bang")]
        [Authorize(Roles = "BGH")]
        public async Task<IActionResult> CapBang(string maNcs, [FromBody] CapBangRequest dto)
        {
            if (string.IsNullOrWhiteSpace(dto.SoQdCapBang) || string.IsNullOrWhiteSpace(dto.SoHieuBang) || string.IsNullOrWhiteSpace(dto.SoVaoSoGoc))
            {
                return BadRequest(new { Success = false, Message = "Thiếu số quyết định, số hiệu bằng hoặc số vào sổ gốc." });
            }

            var hoan = await _context.Hoanthienvatotnghieps.FirstOrDefaultAsync(h => h.MaNcs == maNcs);
            if (hoan == null) return Conflict(new { Success = false, Message = "Hồ sơ chưa được tạo." });

            if (!await DaDatBaoVeAsync(maNcs) || string.IsNullOrWhiteSpace(hoan.BienNhanTvqg) || hoan.NgayCongKhaiWeb == null)
            {
                return Conflict(new { Success = false, Message = "Chưa đủ điều kiện ký cấp bằng (bảo vệ đạt, đã lưu chiểu, đã công khai)." });
            }

            if (hoan.NgayCapBang != null)
            {
                return Conflict(new { Success = false, Message = "Đã cấp bằng cho NCS này." });
            }

            if (await _context.Hoanthienvatotnghieps.AnyAsync(h => h.SoHieuBang == dto.SoHieuBang && h.MaNcs != maNcs))
            {
                return Conflict(new { Success = false, Message = "Số hiệu bằng đã được dùng." });
            }

            hoan.SoQdcapBang = dto.SoQdCapBang;
            hoan.SoHieuBang = dto.SoHieuBang;
            hoan.SoVaoSoGoc = dto.SoVaoSoGoc;
            hoan.NgayCapBang = DateOnly.FromDateTime(DateTime.Today);
            await _context.SaveChangesAsync();

            return Ok(new { Success = true, Message = "Đã ký quyết định cấp bằng." });
        }

        // Đạt bảo vệ cấp Trường: có hội đồng cấp Trường với kết luận đạt
        private async Task<bool> DaDatBaoVeAsync(string maNcs)
        {
            var loaiTruong = (sbyte)_configuration.GetValue<int>("Hoidong:LoaiTruong", 0);
            if (loaiTruong == 0) return false;

            return await _context.Hoidongdanhgia.AnyAsync(h =>
                h.MaNcs == maNcs && h.LoaiHoiDong == loaiTruong && h.KetLuan == 1);
        }
    }

    public class FileRequest
    {
        public string? FileUrl { get; set; }
    }

    public class LuuChieuRequest
    {
        public string? BienNhanTvqg { get; set; }
        public string? BienNhanTvtruong { get; set; }
    }

    public class CapBangRequest
    {
        public string? SoQdCapBang { get; set; }
        public string? SoHieuBang { get; set; }
        public string? SoVaoSoGoc { get; set; }
    }
}