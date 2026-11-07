using DTMS.Api.DTOs;
using DTMS.Api.Helpers;
using DTMS.Api.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace DTMS.Api.Controllers
{
    // Xét điều kiện tốt nghiệp (mục 3.2.2). Phòng Đào tạo chạy xét khi cần, và duyệt hàng loạt.
    // Chỉ ADMIN và PDT được sử dụng.
    [Route("api/[controller]")]
    [ApiController]
    [Authorize(Roles = "ADMIN,PDT")]
    public class TotnghiepController : ControllerBase
    {
        private readonly DtmsDbContext _context;
        private readonly IConfiguration _configuration;

        public TotnghiepController(DtmsDbContext context, IConfiguration configuration)
        {
            _context = context;
            _configuration = configuration;
        }

        // GET: api/Totnghiep/xet
        [HttpGet("xet")]
        public async Task<IActionResult> XetTotNghiep()
        {
            var ds = new List<KetQuaXetTotNghiepDto>();
            var (tinChiYeuCau, canNgoaiNgu) = ThamSo();

            var danhSach = await _context.Nghiencuusinhs
                .Select(n => new { n.MaNcs, n.HoTen, n.MaNganh })
                .ToListAsync();

            var daXet = await _context.Hoanthienvatotnghieps.Select(h => h.MaNcs).ToListAsync();

            foreach (var ncs in danhSach)
            {
                var (duDieuKien, tinChiDat, lyDo) = await AcademicCalc.KiemTraTotNghiepAsync(
                    _context, ncs.MaNcs, tinChiYeuCau, canNgoaiNgu);

                ds.Add(new KetQuaXetTotNghiepDto
                {
                    MaNcs = ncs.MaNcs,
                    HoTen = ncs.HoTen,
                    MaNganh = ncs.MaNganh,
                    TinChiDat = tinChiDat,
                    TinChiYeuCau = tinChiYeuCau,
                    DuDieuKien = duDieuKien,
                    DaCongNhan = daXet.Contains(ncs.MaNcs),
                    LyDo = lyDo
                });
            }

            return Ok(ds);
        }

        // POST: api/Totnghiep/duyet-hang-loat
        // Chỉ công nhận những NCS đủ điều kiện tại thời điểm duyệt và chưa được công nhận trước đó
        [HttpPost("duyet-hang-loat")]
        public async Task<IActionResult> DuyetHangLoat([FromBody] DuyetTotNghiepRequest request)
        {
            if (request.MaNcs == null || request.MaNcs.Count == 0)
            {
                return BadRequest(new { Success = false, Message = "Chưa chọn nghiên cứu sinh nào." });
            }

            var (tinChiYeuCau, canNgoaiNgu) = ThamSo();

            await using var giaoDich = await _context.Database.BeginTransactionAsync();

            var congNhan = new List<string>();
            var khongDuDieuKien = new List<string>();

            foreach (var ma in request.MaNcs.Distinct())
            {
                var (duDieuKien, _, _) = await AcademicCalc.KiemTraTotNghiepAsync(_context, ma, tinChiYeuCau, canNgoaiNgu);
                if (!duDieuKien)
                {
                    khongDuDieuKien.Add(ma);
                    continue;
                }

                var daCoBanGhi = await _context.Hoanthienvatotnghieps.AnyAsync(h => h.MaNcs == ma);
                if (daCoBanGhi) continue;

                _context.Hoanthienvatotnghieps.Add(new Hoanthienvatotnghiep { MaNcs = ma });
                congNhan.Add(ma);
            }

            await _context.SaveChangesAsync();
            await giaoDich.CommitAsync();

            return Ok(new
            {
                Success = true,
                Message = $"Đã công nhận {congNhan.Count} nghiên cứu sinh.",
                CongNhan = congNhan,
                KhongDuDieuKien = khongDuDieuKien
            });
        }

        private (int TinChiYeuCau, bool CanNgoaiNgu) ThamSo()
        {
            var tinChi = _configuration.GetValue<int>("Totnghiep:TinChiToiThieu", 90);
            var ngoaiNgu = _configuration.GetValue<bool>("Totnghiep:CanChungChiNgoaiNgu", true);
            return (tinChi, ngoaiNgu);
        }
    }

    public class KetQuaXetTotNghiepDto
    {
        public string MaNcs { get; set; } = null!;
        public string HoTen { get; set; } = null!;
        public string MaNganh { get; set; } = null!;
        public int TinChiDat { get; set; }
        public int TinChiYeuCau { get; set; }
        public bool DuDieuKien { get; set; }
        public bool DaCongNhan { get; set; }
        public List<string> LyDo { get; set; } = new();
    }

    public class DuyetTotNghiepRequest
    {
        public List<string> MaNcs { get; set; } = new();
    }
}