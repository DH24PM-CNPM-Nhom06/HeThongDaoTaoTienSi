using DTMS.Api.Helpers;
using DTMS.Api.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace DTMS.Api.Controllers
{
    // Xét điều kiện tốt nghiệp (tài liệu mục 3.2.2, nhóm 7).
    // Số tín chỉ yêu cầu theo đối tượng đầu vào: cấu hình Totnghiep:TinChiTheoDoiTuong.
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
            var canNgoaiNgu = _configuration.GetValue<bool>("Totnghiep:CanChungChiNgoaiNgu", true);

            var danhSach = await _context.Nghiencuusinhs
                .Select(n => new { n.MaNcs, n.HoTen, n.MaNganh, n.DoiTuongDauVao })
                .ToListAsync();

            var daCongNhan = await _context.Hoanthienvatotnghieps.Select(h => h.MaNcs).ToListAsync();

            var ds = new List<KetQuaXetTotNghiepDto>();
            foreach (var ncs in danhSach)
            {
                var tinChiYeuCau = TinChiYeuCau(ncs.DoiTuongDauVao);
                var (duDieuKien, tinChiDat, lyDo) = await AcademicCalc.KiemTraTotNghiepAsync(
                    _context, ncs.MaNcs, tinChiYeuCau, canNgoaiNgu);

                ds.Add(new KetQuaXetTotNghiepDto
                {
                    MaNcs = ncs.MaNcs,
                    HoTen = ncs.HoTen,
                    MaNganh = ncs.MaNganh,
                    DoiTuongDauVao = ncs.DoiTuongDauVao,
                    TinChiDat = tinChiDat,
                    TinChiYeuCau = tinChiYeuCau,
                    DuDieuKien = duDieuKien,
                    DaCongNhan = daCongNhan.Contains(ncs.MaNcs),
                    LyDo = lyDo
                });
            }

            return Ok(ds);
        }

        // POST: api/Totnghiep/duyet-hang-loat
        // Chỉ công nhận NCS đủ điều kiện tại thời điểm duyệt và chưa được công nhận trước đó
        [HttpPost("duyet-hang-loat")]
        public async Task<IActionResult> DuyetHangLoat([FromBody] DuyetTotNghiepRequest request)
        {
            if (request.MaNcs == null || request.MaNcs.Count == 0)
            {
                return BadRequest(new { Success = false, Message = "Chưa chọn nghiên cứu sinh nào." });
            }

            var canNgoaiNgu = _configuration.GetValue<bool>("Totnghiep:CanChungChiNgoaiNgu", true);

            await using var giaoDich = await _context.Database.BeginTransactionAsync();

            var congNhan = new List<string>();
            var khongDuDieuKien = new List<string>();

            foreach (var ma in request.MaNcs.Distinct())
            {
                var doiTuong = await _context.Nghiencuusinhs
                    .Where(n => n.MaNcs == ma)
                    .Select(n => n.DoiTuongDauVao)
                    .FirstOrDefaultAsync();

                var (duDieuKien, _, _) = await AcademicCalc.KiemTraTotNghiepAsync(
                    _context, ma, TinChiYeuCau(doiTuong), canNgoaiNgu);

                if (!duDieuKien)
                {
                    khongDuDieuKien.Add(ma);
                    continue;
                }

                if (await _context.Hoanthienvatotnghieps.AnyAsync(h => h.MaNcs == ma)) continue;

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

        // Tín chỉ yêu cầu theo đối tượng đầu vào; không có cấu hình thì dùng mức chung
        private int TinChiYeuCau(sbyte doiTuongDauVao)
        {
            var mucChung = _configuration.GetValue<int>("Totnghiep:TinChiToiThieu", 90);
            return _configuration.GetValue<int?>($"Totnghiep:TinChiTheoDoiTuong:{doiTuongDauVao}") ?? mucChung;
        }
    }

    public class KetQuaXetTotNghiepDto
    {
        public string MaNcs { get; set; } = null!;
        public string HoTen { get; set; } = null!;
        public string MaNganh { get; set; } = null!;
        public sbyte DoiTuongDauVao { get; set; }
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