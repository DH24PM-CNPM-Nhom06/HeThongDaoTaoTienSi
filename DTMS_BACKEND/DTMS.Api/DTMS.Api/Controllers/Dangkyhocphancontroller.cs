using System.ComponentModel.DataAnnotations;
using System.Data;
using DTMS.Api.Helpers;
using DTMS.Api.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MySqlConnector;

namespace DTMS.Api.Controllers
{
    // Đăng ký học phần tiến sĩ. Giữ nguyên routes và hình dạng phản hồi hiện tại.
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

        // POST: api/Dangkyhocphan
        [HttpPost]
        [Authorize(Roles = "NCS")]
        public async Task<IActionResult> DangKy([FromBody] DangKyRequest dto)
        {
            var maNcs = await Access.CurrentNcsAsync(_context, User);
            if (maNcs == null) return Forbid();

            var namHoc = dto.NamHoc?.Trim() ?? "";
            var maMonHoc = dto.MaMonHoc?.Trim() ?? "";
            var loai = dto.LoaiHocPhan?.Trim().ToUpperInvariant() ?? "";
            if (!HocPhanRules.NamHocHopLe(namHoc) || !HocPhanRules.HocKyHopLe(dto.HocKy))
                return BadRequest(new { Success = false, Message = "Năm học (YYYY-YYYY) hoặc học kỳ (1–3) không hợp lệ." });
            if (string.IsNullOrWhiteSpace(maMonHoc) || !LoaiHocPhanHopLe.Contains(loai))
                return BadRequest(new { Success = false, Message = "Mã môn học hoặc loại học phần không hợp lệ." });

            try
            {
                // Bảo đảm hai POST đăng ký cùng NCS không vượt giới hạn tín chỉ do race condition.
                await using var tx = await _context.Database.BeginTransactionAsync(IsolationLevel.ReadCommitted);
                if (!await HocPhanRules.KhoaNcsAsync(_context, tx, maNcs)) return Forbid();

                var ncs = await _context.Nghiencuusinhs
                    .Where(n => n.MaNcs == maNcs)
                    .Select(n => new { n.MaNganh, n.DoiTuongDauVao })
                    .SingleAsync();

                var homNay = DateOnly.FromDateTime(DateTime.Today);
                var dotMo = await _context.DotDangKyHocphans.AnyAsync(d =>
                    d.NamHoc == namHoc && d.HocKy == dto.HocKy &&
                    d.TuNgay <= homNay && homNay <= d.DenNgay &&
                    (d.MaNganh == null || d.MaNganh == ncs.MaNganh));
                if (!dotMo)
                    return Conflict(new { Success = false, Message = "Hiện không trong đợt đăng ký học phần." });

                var monHoc = await _context.Monhocs.FirstOrDefaultAsync(m => m.MaMonHoc == maMonHoc);
                if (monHoc == null)
                    return BadRequest(new { Success = false, Message = "Học phần không tồn tại." });
                if (monHoc.SoTinChi <= 0)
                    return Conflict(new { Success = false, Message = "Học phần có số tín chỉ không hợp lệ. Liên hệ Phòng Đào tạo." });

                var ctdt = await _context.CtdtHocphans
                    .Where(c => c.MaNganh == ncs.MaNganh && c.DoiTuongDauVao == ncs.DoiTuongDauVao && c.MaMonHoc == maMonHoc)
                    .Select(c => c.LoaiHocPhan)
                    .FirstOrDefaultAsync();

                if (loai == "BO_SUNG")
                {
                    // Học phần bổ sung không được trá hình thay cho học phần thuộc CTĐT.
                    if (ctdt != null)
                        return Conflict(new { Success = false, Message = "Môn này thuộc chương trình đào tạo; phải đăng ký đúng loại học phần của chương trình." });
                    if (monHoc.LoaiMon != 2)
                        return Conflict(new { Success = false, Message = "Môn này không được khai báo là học phần bổ sung (LoaiMon = 2)." });
                }
                else if (ctdt == null || !string.Equals(ctdt, loai, StringComparison.OrdinalIgnoreCase))
                {
                    return Conflict(new { Success = false, Message = "Học phần không thuộc CTĐT của ngành/đối tượng đầu vào hoặc loại học phần không khớp." });
                }

                var tienQuyet = await _context.MonhocTienquyets
                    .Where(t => t.MaMonHoc == maMonHoc)
                    .Select(t => t.MaTienQuyet)
                    .ToListAsync();
                if (tienQuyet.Count > 0)
                {
                    var daDat = await _context.Ketquahocphans
                        .Where(k => k.MaNcs == maNcs && k.TrangThaiKhoa &&
                                    k.DiemChu != null && k.DiemChu != "F" &&
                                    tienQuyet.Contains(k.MaMonHoc))
                        .Select(k => k.MaMonHoc).Distinct().ToListAsync();
                    var thieu = tienQuyet.Except(daDat).ToList();
                    if (thieu.Count > 0)
                        return Conflict(new { Success = false, Message = "Chưa đạt học phần tiên quyết: " + string.Join(", ", thieu) });
                }

                if (await _context.DangKyHocphans.AnyAsync(d =>
                    d.MaNcs == maNcs && d.MaMonHoc == maMonHoc && d.NamHoc == namHoc && d.HocKy == dto.HocKy))
                    return Conflict(new { Success = false, Message = "Bạn đã đăng ký học phần này trong học kỳ này." });

                var tinChiToiDa = _configuration.GetValue<int>("Dangky:TinChiToiDaKy", 12);
                if (tinChiToiDa <= 0) tinChiToiDa = 12;
                var daDangKy = await _context.DangKyHocphans
                    .Where(d => d.MaNcs == maNcs && d.NamHoc == namHoc && d.HocKy == dto.HocKy && d.TrangThai == "DA_DANG_KY")
                    .Select(d => d.MaMonHoc).ToListAsync();
                var tinChiDaCo = await _context.Monhocs
                    .Where(m => daDangKy.Contains(m.MaMonHoc))
                    .SumAsync(m => (int?)m.SoTinChi) ?? 0;
                if (tinChiDaCo + monHoc.SoTinChi > tinChiToiDa)
                    return Conflict(new { Success = false, Message = $"Vượt quá {tinChiToiDa} tín chỉ trong học kỳ." });

                var dk = new DangKyHocphan
                {
                    MaNcs = maNcs, MaMonHoc = maMonHoc, NamHoc = namHoc,
                    HocKy = dto.HocKy, LoaiHocPhan = loai,
                    NgayDangKy = DateTime.Now, TrangThai = "DA_DANG_KY"
                };
                _context.DangKyHocphans.Add(dk);
                await _context.SaveChangesAsync();
                await tx.CommitAsync();
                return Ok(new { Success = true, Message = "Đăng ký học phần thành công.", MaDangKy = dk.MaDangKy });
            }
            catch (DbUpdateException ex) when (ex.InnerException is MySqlException sql && sql.Number == 1062)
            {
                return Conflict(new { Success = false, Message = "Đăng ký bị trùng. Hãy tải lại danh sách học phần." });
            }
            catch (MySqlException ex) when (ex.Number is 1205 or 1213)
            {
                return Conflict(new { Success = false, Message = "Có thao tác đăng ký đồng thời, vui lòng thử lại." });
            }
        }

        // DELETE: api/Dangkyhocphan/5
        [HttpDelete("{id:int}")]
        [Authorize(Roles = "NCS")]
        public async Task<IActionResult> HuyDangKy(int id)
        {
            var maNcs = await Access.CurrentNcsAsync(_context, User);
            if (maNcs == null) return Forbid();
            await using var tx = await _context.Database.BeginTransactionAsync(IsolationLevel.ReadCommitted);
            if (!await HocPhanRules.KhoaNcsAsync(_context, tx, maNcs)) return Forbid();

            var dk = await _context.DangKyHocphans.FindAsync(id);
            if (dk == null || dk.MaNcs != maNcs) return NotFound();
            var maNganh = await _context.Nghiencuusinhs
                .Where(n => n.MaNcs == maNcs).Select(n => n.MaNganh).SingleAsync();
            var homNay = DateOnly.FromDateTime(DateTime.Today);
            var dotMo = await _context.DotDangKyHocphans.AnyAsync(d =>
                d.NamHoc == dk.NamHoc && d.HocKy == dk.HocKy &&
                d.TuNgay <= homNay && homNay <= d.DenNgay &&
                (d.MaNganh == null || d.MaNganh == maNganh));
            if (!dotMo)
                return Conflict(new { Success = false, Message = "Đã hết đợt đăng ký, không thể hủy học phần." });

            if (await _context.Ketquahocphans.AnyAsync(k =>
                k.MaNcs == maNcs && k.MaMonHoc == dk.MaMonHoc && k.TrangThaiKhoa))
                return Conflict(new { Success = false, Message = "Học phần đã có bảng điểm khóa, không thể hủy đăng ký." });

            _context.DangKyHocphans.Remove(dk);
            await _context.SaveChangesAsync();
            await tx.CommitAsync();
            return NoContent();
        }

        // GET: api/Dangkyhocphan?namHoc=2026-2027&hocKy=1
        [HttpGet]
        public async Task<IActionResult> DanhSach([FromQuery] string? namHoc, [FromQuery] sbyte? hocKy)
        {
            var query = _context.DangKyHocphans.AsNoTracking().AsQueryable();
            if (!string.IsNullOrWhiteSpace(namHoc)) query = query.Where(d => d.NamHoc == namHoc.Trim());
            if (hocKy != null) query = query.Where(d => d.HocKy == hocKy);
            var readable = await Access.ReadableNcsAsync(_context, User);
            if (readable != null) query = query.Where(d => readable.Contains(d.MaNcs));
            return Ok(await query.OrderBy(d => d.MaNcs).ThenBy(d => d.MaMonHoc).ToListAsync());
        }

        // POST: api/Dangkyhocphan/dot
        [HttpPost("dot")]
        [Authorize(Roles = "PDT,ADMIN")]
        public async Task<IActionResult> TaoDot([FromBody] DotDangKyRequest dto)
        {
            var namHoc = dto.NamHoc?.Trim() ?? "";
            var maNganh = string.IsNullOrWhiteSpace(dto.MaNganh) ? null : dto.MaNganh.Trim();
            if (!HocPhanRules.NamHocHopLe(namHoc) || !HocPhanRules.HocKyHopLe(dto.HocKy))
                return BadRequest(new { Success = false, Message = "Năm học (YYYY-YYYY) hoặc học kỳ (1–3) không hợp lệ." });
            if (dto.TuNgay == default || dto.DenNgay == default || dto.DenNgay < dto.TuNgay)
                return BadRequest(new { Success = false, Message = "Khoảng ngày mở đăng ký không hợp lệ." });
            if (maNganh != null && !await _context.Nganhdaotaos.AnyAsync(n => n.MaNganh == maNganh))
                return BadRequest(new { Success = false, Message = "Ngành đào tạo không tồn tại." });

            try
            {
                // SERIALIZABLE giúp hai yêu cầu tạo đợt cùng lúc không cùng vượt
                // qua kiểm tra giao thoa trước khi ghi vào MariaDB.
                await using var tx = await _context.Database.BeginTransactionAsync(IsolationLevel.Serializable);
                // Đợt chung (MaNganh null) xung đột với mọi ngành trong cùng kỳ;
                // hai đợt riêng cho các ngành khác nhau có thể mở cùng lúc.
                var chongNgay = await _context.DotDangKyHocphans.AnyAsync(d =>
                    d.NamHoc == namHoc && d.HocKy == dto.HocKy &&
                    d.TuNgay <= dto.DenNgay && dto.TuNgay <= d.DenNgay &&
                    (d.MaNganh == null || maNganh == null || d.MaNganh == maNganh));
                if (chongNgay)
                    return Conflict(new { Success = false, Message = "Đã tồn tại đợt đăng ký trùng khoảng thời gian và phạm vi ngành." });

                var dot = new DotDangKyHocphan
                {
                    NamHoc = namHoc, HocKy = dto.HocKy,
                    TuNgay = dto.TuNgay, DenNgay = dto.DenNgay,
                    MaNganh = maNganh, GhiChu = dto.GhiChu
                };
                _context.DotDangKyHocphans.Add(dot);
                await _context.SaveChangesAsync();
                await tx.CommitAsync();
                return Ok(new { Success = true, Message = "Đã thiết lập đợt đăng ký.", MaDot = dot.MaDot });
            }
            catch (MySqlException ex) when (ex.Number is 1205 or 1213)
            {
                return Conflict(new { Success = false, Message = "Có yêu cầu tạo đợt đồng thời, vui lòng tải lại danh sách." });
            }
            catch (DbUpdateException ex) when (ex.InnerException is MySqlException sql && sql.Number is 1205 or 1213)
            {
                return Conflict(new { Success = false, Message = "Có yêu cầu tạo đợt đồng thời, vui lòng tải lại danh sách." });
            }
        }

        // GET: api/Dangkyhocphan/dot
        [HttpGet("dot")]
        [Authorize(Roles = "PDT,ADMIN,NCS")]
        public async Task<IActionResult> DanhSachDot()
        {
            return Ok(await _context.DotDangKyHocphans.AsNoTracking().OrderByDescending(d => d.TuNgay).ToListAsync());
        }
    }

    public class DangKyRequest
    {
        [Required, StringLength(20)]
        public string MaMonHoc { get; set; } = null!;
        [Required, StringLength(20)]
        public string NamHoc { get; set; } = null!;
        [Range(1, 3)]
        public sbyte HocKy { get; set; }
        [Required, StringLength(20)]
        public string? LoaiHocPhan { get; set; }
    }

    public class DotDangKyRequest
    {
        [Required, StringLength(20)]
        public string NamHoc { get; set; } = null!;
        [Range(1, 3)]
        public sbyte HocKy { get; set; }
        public DateOnly TuNgay { get; set; }
        public DateOnly DenNgay { get; set; }
        [StringLength(20)]
        public string? MaNganh { get; set; }
        [StringLength(255)]
        public string? GhiChu { get; set; }
    }
}
