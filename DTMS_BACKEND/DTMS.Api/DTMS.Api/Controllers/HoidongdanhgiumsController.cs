using DTMS.Api.DTOs;
using DTMS.Api.Helpers;
using DTMS.Api.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MySqlConnector;

namespace DTMS.Api.Controllers
{
    // Đọc theo phạm vi trong Access; chỉ ADMIN/PDT được tạo/sửa/xóa hội đồng.
    // Trường kết quả bỏ phiếu chỉ do quy trình bỏ phiếu tự cập nhật.
    [Route("api/[controller]")]
    [ApiController]
    [Authorize(Roles = "ADMIN,PDT,BGH,TBM,KHOA,NHD,PBDL,NCS")]
    public class HoidongdanhgiumsController : ControllerBase
    {
        private readonly DtmsDbContext _context;
        private readonly IConfiguration _fileConfig;

        public HoidongdanhgiumsController(DtmsDbContext context, IConfiguration fileConfig)
        {
            _context = context;
            _fileConfig = fileConfig;
        }

        [HttpGet]
        public async Task<IActionResult> GetHoidongdanhgia()
        {
            var query = _context.Hoidongdanhgia.AsNoTracking().AsQueryable();
            var visible = await Access.VisibleHoiDongIdsAsync(_context, User);
            if (visible != null) query = query.Where(h => visible.Contains(h.MaHoiDong));
            var ds = await query.ToListAsync();
            return Ok(ds.Select(h => ToDto(h, DuocXemKetQua())).ToList());
        }

        [HttpGet("{mahoidong:int}")]
        public async Task<IActionResult> GetHoidongdanhgium(int mahoidong)
        {
            var hd = await _context.Hoidongdanhgia.AsNoTracking().FirstOrDefaultAsync(h => h.MaHoiDong == mahoidong);
            if (hd == null) return NotFound();
            var visible = await Access.VisibleHoiDongIdsAsync(_context, User);
            if (visible != null && !visible.Contains(mahoidong)) return NotFound();
            return Ok(ToDto(hd, DuocXemKetQua()));
        }

        [HttpPut("{mahoidong:int}")]
        [Authorize(Roles = "ADMIN,PDT")]
        public async Task<IActionResult> PutHoidongdanhgium(int mahoidong, [FromBody] HoidongdanhgiumDto request)
        {
            if (mahoidong != request.MaHoiDong)
                return BadRequest(new { Success = false, Message = "Mã hội đồng trong URL và nội dung không khớp." });
            if (string.IsNullOrWhiteSpace(request.MaNcs) || string.IsNullOrWhiteSpace(request.SoQuyetDinh))
                return BadRequest(new { Success = false, Message = "Mã NCS và số quyết định là bắt buộc." });

            await using var tx = await _context.Database.BeginTransactionAsync();
            if (!await HoiDongLock.AcquireAsync(_context, mahoidong)) return NotFound();
            var hd = await _context.Hoidongdanhgia.FindAsync(mahoidong);
            if (hd == null) return NotFound();

            if (await _context.PhieuBoPhieus.AnyAsync(p => p.MaHoiDong == mahoidong) ||
                await _context.Danhgiahocthuats.AnyAsync(d => d.MaHoiDong == mahoidong) ||
                hd.TongSoPhieu != null || hd.SoPhieuTanThanh != null)
                return Conflict(new { Success = false, Message = "Hội đồng đã có phiếu hoặc kết quả đánh giá, không được sửa." });

            var daCoThanhVien = await _context.Thanhvienhoidongs.AnyAsync(tv => tv.MaHoiDong == mahoidong);
            if (daCoThanhVien && (hd.MaNcs != request.MaNcs || hd.LoaiHoiDong != request.LoaiHoiDong))
                return Conflict(new { Success = false, Message = "Phải xóa hết thành viên trước khi đổi NCS hoặc loại hội đồng." });

            if (!await _context.Nghiencuusinhs.AnyAsync(n => n.MaNcs == request.MaNcs))
                return BadRequest(new { Success = false, Message = "Nghiên cứu sinh không tồn tại." });

            if (!StoredFileRules.ValidReference(request.FileQuyetDinh, request.MaNcs, "bienban", _fileConfig,
                    string.Equals(hd.MaNcs, request.MaNcs, StringComparison.Ordinal) ? hd.FileQuyetDinh : null))
                return BadRequest(new { Success = false, Message = "Đường dẫn tệp không hợp lệ, không thuộc NCS hoặc chưa được tải lên đúng mục đích." });

            // Không gán SoPhieuTanThanh/TongSoPhieu/KetLuan từ request (chống sửa kết quả bằng PUT).
            hd.MaNcs = request.MaNcs;
            hd.LoaiHoiDong = request.LoaiHoiDong;
            hd.SoQuyetDinh = request.SoQuyetDinh.Trim();
            hd.NgayThanhLap = request.NgayThanhLap;
            hd.NgayBaoVe = request.NgayBaoVe;
            hd.DiaDiem = request.DiaDiem;
            hd.FileQuyetDinh = request.FileQuyetDinh;
            await _context.SaveChangesAsync();
            await tx.CommitAsync();
            return NoContent();
        }

        [HttpPost]
        [Authorize(Roles = "ADMIN,PDT")]
        public async Task<ActionResult<Hoidongdanhgium>> PostHoidongdanhgium([FromBody] HoidongdanhgiumDto request)
        {
            if (string.IsNullOrWhiteSpace(request.MaNcs) || string.IsNullOrWhiteSpace(request.SoQuyetDinh))
                return BadRequest(new { Success = false, Message = "Mã NCS và số quyết định là bắt buộc." });
            if (!await _context.Nghiencuusinhs.AnyAsync(n => n.MaNcs == request.MaNcs))
                return BadRequest(new { Success = false, Message = "Nghiên cứu sinh không tồn tại." });

            if (!StoredFileRules.ValidReference(request.FileQuyetDinh, request.MaNcs, "bienban", _fileConfig))
                return BadRequest(new { Success = false, Message = "Đường dẫn tệp không hợp lệ, không thuộc NCS hoặc chưa được tải lên đúng mục đích." });

            var hd = new Hoidongdanhgium
            {
                MaNcs = request.MaNcs,
                LoaiHoiDong = request.LoaiHoiDong,
                SoQuyetDinh = request.SoQuyetDinh.Trim(),
                NgayThanhLap = request.NgayThanhLap,
                NgayBaoVe = request.NgayBaoVe,
                DiaDiem = request.DiaDiem,
                FileQuyetDinh = request.FileQuyetDinh,
                SoPhieuTanThanh = null,
                TongSoPhieu = null,
                KetLuan = 0
            };
            _context.Hoidongdanhgia.Add(hd);
            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateException ex) when (ex.InnerException is MySqlException { Number: 1452 })
            {
                return Conflict(new { Success = false, Message = "NCS liên kết không còn tồn tại." });
            }
            return CreatedAtAction(nameof(GetHoidongdanhgium), new { mahoidong = hd.MaHoiDong }, hd);
        }

        [HttpDelete("{mahoidong:int}")]
        [Authorize(Roles = "ADMIN,PDT")]
        public async Task<IActionResult> DeleteHoidongdanhgium(int mahoidong)
        {
            await using var tx = await _context.Database.BeginTransactionAsync();
            if (!await HoiDongLock.AcquireAsync(_context, mahoidong)) return NotFound();
            var hd = await _context.Hoidongdanhgia.FindAsync(mahoidong);
            if (hd == null) return NotFound();

            if (await _context.Thanhvienhoidongs.AnyAsync(tv => tv.MaHoiDong == mahoidong) ||
                await _context.PhieuBoPhieus.AnyAsync(p => p.MaHoiDong == mahoidong) ||
                await _context.Danhgiahocthuats.AnyAsync(d => d.MaHoiDong == mahoidong) ||
                hd.TongSoPhieu != null || hd.SoPhieuTanThanh != null)
                return Conflict(new { Success = false, Message = "Không thể xóa hội đồng có thành viên, phiếu hoặc kết quả đánh giá." });

            _context.Hoidongdanhgia.Remove(hd);
            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateException ex) when (ex.InnerException is MySqlException { Number: 1451 })
            {
                return Conflict(new { Success = false, Message = "Hội đồng còn dữ liệu tham chiếu, không thể xóa." });
            }
            await tx.CommitAsync();
            return NoContent();
        }
        private bool DuocXemKetQua() => User.IsInRole("ADMIN") || User.IsInRole("PDT");

        private static HoidongdanhgiumDto ToDto(Hoidongdanhgium h, bool duocXemKetQua) => new()
        {
            MaHoiDong = h.MaHoiDong,
            MaNcs = h.MaNcs,
            LoaiHoiDong = h.LoaiHoiDong,
            SoQuyetDinh = h.SoQuyetDinh,
            NgayThanhLap = h.NgayThanhLap,
            NgayBaoVe = h.NgayBaoVe,
            DiaDiem = h.DiaDiem,
            FileQuyetDinh = h.FileQuyetDinh,
            SoPhieuTanThanh = duocXemKetQua ? h.SoPhieuTanThanh : null,
            TongSoPhieu = duocXemKetQua ? h.TongSoPhieu : null,
            KetLuan = duocXemKetQua ? h.KetLuan : null
        };
    }
}
