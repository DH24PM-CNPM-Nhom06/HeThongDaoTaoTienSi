using DTMS.Api.Helpers;
using DTMS.Api.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace DTMS.Api.Controllers
{
    // Phân công người hướng dẫn.
    // Đọc: ADMIN/PDT/TBM xem tất cả; NHD và NCS xem phân công của NCS mình liên quan (NCS: của mình).
    // Ghi: chỉ ADMIN, PDT.
    [Route("api/[controller]")]
    [ApiController]
    [Authorize(Roles = "ADMIN,PDT,TBM,NHD,NCS")]
    public class PhanconghuongdansController : ControllerBase
    {
        private readonly DtmsDbContext _context;

        public PhanconghuongdansController(DtmsDbContext context)
        {
            _context = context;
        }

        // GET: api/Phanconghuongdans
        [HttpGet]
        public async Task<IActionResult> GetPhanconghuongdans()
        {
            var query = _context.Phanconghuongdans.AsQueryable();

            var readable = await Access.ReadableNcsAsync(_context, User);
            if (readable != null)
            {
                query = query.Where(pc => readable.Contains(pc.MaNcs));
            }

            return Ok(await query.ToListAsync());
        }

        // GET: api/Phanconghuongdans/5
        [HttpGet("{maphancong:int}")]
        public async Task<ActionResult<Phanconghuongdan>> GetPhanconghuongdan(int maphancong)
        {
            var pc = await _context.Phanconghuongdans.FindAsync(maphancong);
            if (pc == null) return NotFound();

            if (!await Access.CanReadNcsAsync(_context, User, pc.MaNcs)) return NotFound();

            return Ok(pc);
        }

        // PUT: api/Phanconghuongdans/5  (chỉ ADMIN, PDT)
        [HttpPut("{maphancong:int}")]
        [Authorize(Roles = "ADMIN,PDT")]
        public async Task<IActionResult> PutPhanconghuongdan(int maphancong, Phanconghuongdan phanconghuongdan)
        {
            if (maphancong != phanconghuongdan.MaPhanCong) return BadRequest();

            var loi = await KiemTraPhanCongAsync(phanconghuongdan, maphancong);
            if (loi != null) return loi;

            _context.Entry(phanconghuongdan).State = EntityState.Modified;
            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!await _context.Phanconghuongdans.AnyAsync(e => e.MaPhanCong == maphancong)) return NotFound();
                throw;
            }

            return NoContent();
        }

        // POST: api/Phanconghuongdans  (chỉ ADMIN, PDT; có kiểm tra hợp lệ)
        [HttpPost]
        [Authorize(Roles = "ADMIN,PDT")]
        public async Task<IActionResult> PostPhanconghuongdan(Phanconghuongdan phanconghuongdan)
        {
            var loi = await KiemTraPhanCongAsync(phanconghuongdan, 0);
            if (loi != null) return loi;

            phanconghuongdan.MaPhanCong = 0;
            _context.Phanconghuongdans.Add(phanconghuongdan);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetPhanconghuongdan), new { maphancong = phanconghuongdan.MaPhanCong }, phanconghuongdan);
        }

        // DELETE: api/Phanconghuongdans/5  (chỉ ADMIN, PDT)
        [HttpDelete("{maphancong:int}")]
        [Authorize(Roles = "ADMIN,PDT")]
        public async Task<IActionResult> DeletePhanconghuongdan(int maphancong)
        {
            var pc = await _context.Phanconghuongdans.FindAsync(maphancong);
            if (pc == null) return NotFound();

            _context.Phanconghuongdans.Remove(pc);
            await _context.SaveChangesAsync();
            return NoContent();
        }

        // Kiểm tra quy tắc phân công: đủ thông tin, mã tồn tại, không trùng, một hướng dẫn chính,
        // tối đa hai người hướng dẫn đang hiệu lực cho một NCS
        private async Task<IActionResult?> KiemTraPhanCongAsync(Phanconghuongdan pc, int maPhanCongHienTai)
        {
            if (string.IsNullOrWhiteSpace(pc.SoQuyetDinh))
            {
                return BadRequest(new { Success = false, Message = "Vui lòng nhập số quyết định phân công." });
            }

            if (pc.VaiTro != 1 && pc.VaiTro != 2)
            {
                return BadRequest(new { Success = false, Message = "Vai trò chỉ nhận 1 (hướng dẫn chính) hoặc 2 (hướng dẫn phụ)." });
            }

            if (pc.NgayKetThuc.HasValue && pc.NgayKetThuc.Value < pc.NgayHieuLuc)
            {
                return BadRequest(new { Success = false, Message = "Ngày kết thúc phải sau hoặc bằng ngày hiệu lực." });
            }

            if (!await _context.Nghiencuusinhs.AnyAsync(n => n.MaNcs == pc.MaNcs))
            {
                return BadRequest(new { Success = false, Message = "Nghiên cứu sinh không tồn tại." });
            }

            if (!await _context.Giangviens.AnyAsync(g => g.MaGv == pc.MaGv))
            {
                return BadRequest(new { Success = false, Message = "Giảng viên không tồn tại." });
            }

            var homNay = DateOnly.FromDateTime(DateTime.Today);
            var dangHieuLuc = await _context.Phanconghuongdans
                .Where(x => x.MaNcs == pc.MaNcs
                            && x.MaPhanCong != maPhanCongHienTai
                            && x.TrangThai != false
                            && (x.NgayKetThuc == null || x.NgayKetThuc >= homNay))
                .ToListAsync();

            if (dangHieuLuc.Any(x => x.MaGv == pc.MaGv))
            {
                return Conflict(new { Success = false, Message = "Giảng viên này đã được phân công hướng dẫn NCS này." });
            }

            if (pc.VaiTro == 1 && dangHieuLuc.Any(x => x.VaiTro == 1))
            {
                return Conflict(new { Success = false, Message = "NCS này đã có người hướng dẫn chính." });
            }

            if (dangHieuLuc.Count >= 2)
            {
                return Conflict(new { Success = false, Message = "NCS này đã đủ tối đa hai người hướng dẫn." });
            }

            // Định mức số NCS đang hướng dẫn (tài liệu mục 3.1): GS tối đa 4, PGS/TS tối đa 3
            var hocHam = await _context.Giangviens
                .Where(g => g.MaGv == pc.MaGv)
                .Select(g => g.HocHam)
                .FirstOrDefaultAsync();
            int dinhMuc = hocHam == "GS" ? 4 : 3;

            var soNcsDangHuongDan = await _context.Phanconghuongdans
                .Where(x => x.MaGv == pc.MaGv
                            && x.MaNcs != pc.MaNcs
                            && x.TrangThai != false
                            && (x.NgayKetThuc == null || x.NgayKetThuc >= homNay))
                .Select(x => x.MaNcs)
                .Distinct()
                .CountAsync();

            if (soNcsDangHuongDan >= dinhMuc)
            {
                return Conflict(new { Success = false, Message = $"Giảng viên đã hướng dẫn đủ {dinhMuc} NCS theo định mức." });
            }

            return null;
        }
    }
}