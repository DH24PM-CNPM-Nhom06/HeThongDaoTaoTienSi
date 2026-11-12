using DTMS.Api.Helpers;
using DTMS.Api.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace DTMS.Api.Controllers
{
    // Đăng ký học phần tiến sĩ (tài liệu mục 3.2, FR-HP).
    // NCS chỉ đăng ký trong đợt đang mở. PĐT thiết lập đợt đăng ký.
    // Giới hạn tín chỉ trong mỗi học kỳ: cấu hình Dangky:TinChiToiDaKy.
    [Route("api/[controller]")]
    [ApiController]
    [Authorize(Roles = "NCS,NHD,TBM,KHOA,PDT,ADMIN,BGH")]
    public class DangkyhocphanController : ControllerBase
    {
        private static readonly string[] LoaiHocPhanHopLe = { "BAT_BUOC", "TU_CHON", "BO_SUNG" };

        private readonly DtmsDbContext _context;
        private readonly IConfiguration _configuration;

        public DangkyhocphanController(DtmsDbContext context, IConfiguration configuration)
        {
            _context = context;
            _configuration = configuration;
        }

        // POST: api/Dangkyhocphan  (NCS đăng ký học phần cho chính mình)
        [HttpPost]
        [Authorize(Roles = "NCS")]
        public async Task<IActionResult> DangKy([FromBody] DangKyRequest dto)
        {
            var maNcs = await Access.CurrentNcsAsync(_context, User);
            if (maNcs == null) return Forbid();

            var loai = (dto.LoaiHocPhan ?? string.Empty).Trim().ToUpperInvariant();
            if (!LoaiHocPhanHopLe.Contains(loai))
            {
                return BadRequest(new { Success = false, Message = "Loại học phần không hợp lệ (BAT_BUOC, TU_CHON, BO_SUNG)." });
            }

            var ncs = await _context.Nghiencuusinhs
                .Where(n => n.MaNcs == maNcs)
                .Select(n => new { n.MaNganh })
                .FirstAsync();

            // Phải có đợt đăng ký đang mở cho ngành này
            var homNay = DateOnly.FromDateTime(DateTime.Today);
            bool dotMo = await _context.DotDangKyHocphans.AnyAsync(d =>
                d.NamHoc == dto.NamHoc && d.HocKy == dto.HocKy
                && d.TuNgay <= homNay && homNay <= d.DenNgay
                && (d.MaNganh == null || d.MaNganh == ncs.MaNganh));
            if (!dotMo)
            {
                return Conflict(new { Success = false, Message = "Hiện không trong đợt đăng ký học phần." });
            }

            var monHoc = await _context.Monhocs.FirstOrDefaultAsync(m => m.MaMonHoc == dto.MaMonHoc);
            if (monHoc == null)
            {
                return BadRequest(new { Success = false, Message = "Học phần không tồn tại." });
            }

            // Học phần tiên quyết: phải đạt (điểm đã khóa, khác F) trước khi đăng ký
            var tienQuyet = await _context.MonhocTienquyets
                .Where(t => t.MaMonHoc == dto.MaMonHoc)
                .Select(t => t.MaTienQuyet)
                .ToListAsync();
            if (tienQuyet.Count > 0)
            {
                var daDat = await _context.Ketquahocphans
                    .Where(k => k.MaNcs == maNcs && k.TrangThaiKhoa && k.DiemChu != null && k.DiemChu != "F"
                                && tienQuyet.Contains(k.MaMonHoc))
                    .Select(k => k.MaMonHoc)
                    .Distinct()
                    .ToListAsync();
                var thieu = tienQuyet.Except(daDat).ToList();
                if (thieu.Count > 0)
                {
                    return Conflict(new { Success = false, Message = "Chưa đạt học phần tiên quyết: " + string.Join(", ", thieu) });
                }
            }

            if (await _context.DangKyHocphans.AnyAsync(d =>
                d.MaNcs == maNcs && d.MaMonHoc == dto.MaMonHoc && d.NamHoc == dto.NamHoc && d.HocKy == dto.HocKy))
            {
                return Conflict(new { Success = false, Message = "Bạn đã đăng ký học phần này trong học kỳ này." });
            }

            var tinChiToiDa = _configuration.GetValue<int>("Dangky:TinChiToiDaKy", 12);
            var daDangKy = await _context.DangKyHocphans
                .Where(d => d.MaNcs == maNcs && d.NamHoc == dto.NamHoc && d.HocKy == dto.HocKy)
                .Select(d => d.MaMonHoc)
                .ToListAsync();
            var tinChiDaCo = await _context.Monhocs
                .Where(m => daDangKy.Contains(m.MaMonHoc))
                .SumAsync(m => (int?)m.SoTinChi) ?? 0;

            if (tinChiDaCo + monHoc.SoTinChi > tinChiToiDa)
            {
                return Conflict(new { Success = false, Message = $"Vượt quá {tinChiToiDa} tín chỉ trong học kỳ." });
            }

            var dk = new DangKyHocphan
            {
                MaNcs = maNcs,
                MaMonHoc = dto.MaMonHoc,
                NamHoc = dto.NamHoc,
                HocKy = dto.HocKy,
                LoaiHocPhan = loai,
                NgayDangKy = DateTime.Now,
                TrangThai = "DA_DANG_KY"
            };
            _context.DangKyHocphans.Add(dk);
            await _context.SaveChangesAsync();

            return Ok(new { Success = true, Message = "Đăng ký học phần thành công.", MaDangKy = dk.MaDangKy });
        }

        // DELETE: api/Dangkyhocphan/5  (NCS hủy đăng ký trong đợt đang mở)
        [HttpDelete("{id:int}")]
        [Authorize(Roles = "NCS")]
        public async Task<IActionResult> HuyDangKy(int id)
        {
            var maNcs = await Access.CurrentNcsAsync(_context, User);
            var dk = await _context.DangKyHocphans.FindAsync(id);
            if (dk == null || dk.MaNcs != maNcs) return NotFound();

            var homNay = DateOnly.FromDateTime(DateTime.Today);
            bool dotMo = await _context.DotDangKyHocphans.AnyAsync(d =>
                d.NamHoc == dk.NamHoc && d.HocKy == dk.HocKy && d.TuNgay <= homNay && homNay <= d.DenNgay);
            if (!dotMo)
            {
                return Conflict(new { Success = false, Message = "Đã hết đợt đăng ký, không thể hủy học phần." });
            }

            _context.DangKyHocphans.Remove(dk);
            await _context.SaveChangesAsync();
            return NoContent();
        }

        // GET: api/Dangkyhocphan?namHoc=2026-2027&hocKy=1
        [HttpGet]
        public async Task<IActionResult> DanhSach([FromQuery] string? namHoc, [FromQuery] sbyte? hocKy)
        {
            var query = _context.DangKyHocphans.AsQueryable();

            if (!string.IsNullOrWhiteSpace(namHoc)) query = query.Where(d => d.NamHoc == namHoc);
            if (hocKy != null) query = query.Where(d => d.HocKy == hocKy);

            var readable = await Access.ReadableNcsAsync(_context, User);
            if (readable != null)
            {
                query = query.Where(d => readable.Contains(d.MaNcs));
            }

            return Ok(await query.OrderBy(d => d.MaNcs).ThenBy(d => d.MaMonHoc).ToListAsync());
        }

        // POST: api/Dangkyhocphan/dot  (PĐT thiết lập đợt đăng ký)
        [HttpPost("dot")]
        [Authorize(Roles = "PDT,ADMIN")]
        public async Task<IActionResult> TaoDot([FromBody] DotDangKyRequest dto)
        {
            if (dto.DenNgay < dto.TuNgay)
            {
                return BadRequest(new { Success = false, Message = "Ngày kết thúc phải sau hoặc bằng ngày bắt đầu." });
            }

            var dot = new DotDangKyHocphan
            {
                NamHoc = dto.NamHoc,
                HocKy = dto.HocKy,
                TuNgay = dto.TuNgay,
                DenNgay = dto.DenNgay,
                MaNganh = string.IsNullOrWhiteSpace(dto.MaNganh) ? null : dto.MaNganh.Trim(),
                GhiChu = dto.GhiChu
            };
            _context.DotDangKyHocphans.Add(dot);
            await _context.SaveChangesAsync();

            return Ok(new { Success = true, Message = "Đã thiết lập đợt đăng ký.", MaDot = dot.MaDot });
        }

        // GET: api/Dangkyhocphan/dot
        [HttpGet("dot")]
        [Authorize(Roles = "PDT,ADMIN,NCS")]
        public async Task<IActionResult> DanhSachDot()
        {
            return Ok(await _context.DotDangKyHocphans.OrderByDescending(d => d.TuNgay).ToListAsync());
        }
    }

    public class DangKyRequest
    {
        public string MaMonHoc { get; set; } = null!;
        public string NamHoc { get; set; } = null!;
        public sbyte HocKy { get; set; }
        public string? LoaiHocPhan { get; set; }
    }

    public class DotDangKyRequest
    {
        public string NamHoc { get; set; } = null!;
        public sbyte HocKy { get; set; }
        public DateOnly TuNgay { get; set; }
        public DateOnly DenNgay { get; set; }
        public string? MaNganh { get; set; }
        public string? GhiChu { get; set; }
    }
}