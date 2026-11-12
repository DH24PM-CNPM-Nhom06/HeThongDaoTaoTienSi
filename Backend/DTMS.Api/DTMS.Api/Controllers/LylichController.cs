using DTMS.Api.Helpers;
using DTMS.Api.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace DTMS.Api.Controllers
{
    // Lý lịch khoa học (NCS) và hồ sơ khoa học của người hướng dẫn (tài liệu mục 3.1, nhóm 1).
    // Mỗi người chỉ thêm và xóa mục của chính mình. PĐT/ADMIN xem được của mọi người.
    [Route("api/[controller]")]
    [ApiController]
    [Authorize(Roles = "NCS,NHD,TBM,KHOA,PDT,ADMIN,BGH,PBDL")]
    public class LylichController : ControllerBase
    {
        private static readonly string[] LoaiMucHopLe =
        {
            "CONG_TRINH", "BAI_BAO", "GIAI_THUONG", "DE_TAI", "KINH_NGHIEM", "BANG_CAP", "KHAC"
        };

        private readonly DtmsDbContext _context;

        public LylichController(DtmsDbContext context)
        {
            _context = context;
        }

        // GET: api/Lylich  (của chính mình)
        // GET: api/Lylich?maNguoi=NCS01&vaiTro=NCS  (PĐT/ADMIN xem của người khác)
        [HttpGet]
        public async Task<IActionResult> DanhSach([FromQuery] string? maNguoi, [FromQuery] string? vaiTro)
        {
            var (maCuaToi, vaiTroCuaToi) = await MaCuaToiAsync();
            if (maCuaToi == null) return Forbid();

            bool quanTri = User.IsInRole("PDT") || User.IsInRole("ADMIN");
            string xem = maCuaToi;
            string vt = vaiTroCuaToi;

            if (!string.IsNullOrWhiteSpace(maNguoi) && quanTri)
            {
                xem = maNguoi;
                vt = string.IsNullOrWhiteSpace(vaiTro) ? vaiTroCuaToi : vaiTro.ToUpperInvariant();
            }
            else if (!string.IsNullOrWhiteSpace(maNguoi) && maNguoi != maCuaToi)
            {
                return Forbid();
            }

            var ds = await _context.LylichKhoahocs
                .Where(l => l.MaNguoi == xem && l.VaiTro == vt)
                .OrderByDescending(l => l.NamThucHien)
                .ToListAsync();

            return Ok(ds);
        }

        // POST: api/Lylich  (thêm mục vào lý lịch của chính mình)
        [HttpPost]
        public async Task<IActionResult> Them([FromBody] LylichRequest dto)
        {
            var (maCuaToi, vaiTro) = await MaCuaToiAsync();
            if (maCuaToi == null) return Forbid();

            var loai = (dto.LoaiMuc ?? string.Empty).Trim().ToUpperInvariant();
            if (!LoaiMucHopLe.Contains(loai))
            {
                return BadRequest(new { Success = false, Message = "Loại mục không hợp lệ." });
            }

            if (string.IsNullOrWhiteSpace(dto.NoiDung))
            {
                return BadRequest(new { Success = false, Message = "Vui lòng nhập nội dung." });
            }

            var muc = new LylichKhoahoc
            {
                MaNguoi = maCuaToi,
                VaiTro = vaiTro,
                LoaiMuc = loai,
                NoiDung = dto.NoiDung.Trim(),
                NamThucHien = dto.NamThucHien,
                NgayTao = DateTime.Now
            };
            _context.LylichKhoahocs.Add(muc);
            await _context.SaveChangesAsync();

            return Ok(new { Success = true, Message = "Đã thêm vào lý lịch.", MaLyLich = muc.MaLyLich });
        }

        // DELETE: api/Lylich/5  (xóa mục của chính mình; PĐT/ADMIN xóa được mọi mục)
        [HttpDelete("{id:int}")]
        public async Task<IActionResult> Xoa(int id)
        {
            var (maCuaToi, _) = await MaCuaToiAsync();
            if (maCuaToi == null) return Forbid();

            var muc = await _context.LylichKhoahocs.FindAsync(id);
            if (muc == null) return NotFound();

            bool quanTri = User.IsInRole("PDT") || User.IsInRole("ADMIN");
            if (muc.MaNguoi != maCuaToi && !quanTri) return NotFound();

            _context.LylichKhoahocs.Remove(muc);
            await _context.SaveChangesAsync();
            return NoContent();
        }

        // Mã người đang đăng nhập và vai trò hồ sơ (NCS hoặc GV)
        private async Task<(string? Ma, string VaiTro)> MaCuaToiAsync()
        {
            var maNcs = await Access.CurrentNcsAsync(_context, User);
            if (maNcs != null) return (maNcs, "NCS");

            var maGv = await Access.CurrentGvAsync(_context, User);
            if (maGv != null) return (maGv, "GV");

            return (null, string.Empty);
        }
    }

    public class LylichRequest
    {
        public string LoaiMuc { get; set; } = null!;
        public string NoiDung { get; set; } = null!;
        public int? NamThucHien { get; set; }
    }
}