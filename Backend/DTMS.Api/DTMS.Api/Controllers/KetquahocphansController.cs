using DTMS.Api.Helpers;
using DTMS.Api.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace DTMS.Api.Controllers
{
    // Đọc: NCS xem của mình; NHD xem NCS mình hướng dẫn; ADMIN/PDT/TBM xem tất cả.
    // Ghi: ADMIN/PDT/TBM toàn quyền; NHD chỉ với NCS mình hướng dẫn; NCS không được ghi.
    [Route("api/[controller]")]
    [ApiController]
    [Authorize(Roles = "ADMIN,PDT,TBM,NHD,NCS")]
    public class KetquahocphansController : ControllerBase
    {
        private readonly DtmsDbContext _context;

        public KetquahocphansController(DtmsDbContext context)
        {
            _context = context;
        }

        // GET: api/Ketquahocphans
        [HttpGet]
        public async Task<IActionResult> GetKetquahocphans()
        {
            var query = _context.Ketquahocphans.AsQueryable();

            var readable = await Access.ReadableNcsAsync(_context, User);
            if (readable != null)
            {
                query = query.Where(kq => readable.Contains(kq.MaNcs));
            }

            var ds = await query
                .Select(kq => new
                {
                    kq.MaKetQua,
                    kq.MaNcs,
                    kq.MaMonHoc,
                    kq.DiemThi,
                    kq.TrangThaiDat
                })
                .ToListAsync();

            return Ok(ds);
        }

        // GET: api/Ketquahocphans/5
        [HttpGet("{maketqua:int}")]
        public async Task<ActionResult<Ketquahocphan>> GetKetquahocphan(int maketqua)
        {
            var kq = await _context.Ketquahocphans.FindAsync(maketqua);
            if (kq == null) return NotFound();

            if (!await Access.CanReadNcsAsync(_context, User, kq.MaNcs)) return NotFound();

            return Ok(kq);
        }

        // POST: api/Ketquahocphans
        [HttpPost]
        [Authorize(Roles = "ADMIN,PDT,TBM,NHD")]
        public async Task<ActionResult<Ketquahocphan>> PostKetquahocphan(Ketquahocphan ketquahocphan)
        {
            if (!await Access.CanWriteNcsAsync(_context, User, ketquahocphan.MaNcs)) return Forbid();

            // Không cho client tự chỉ định khóa chính khi thêm mới
            ketquahocphan.MaKetQua = 0;

            _context.Ketquahocphans.Add(ketquahocphan);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetKetquahocphan), new { maketqua = ketquahocphan.MaKetQua }, ketquahocphan);
        }

        // PUT: api/Ketquahocphans/5
        [HttpPut("{maketqua:int}")]
        [Authorize(Roles = "ADMIN,PDT,TBM,NHD")]
        public async Task<IActionResult> PutKetquahocphan(int maketqua, Ketquahocphan ketquahocphan)
        {
            if (maketqua != ketquahocphan.MaKetQua) return BadRequest();

            // Kiểm tra quyền trên CẢ bản ghi cũ lẫn mã NCS mới (tránh chuyển điểm sang NCS khác)
            var cu = await _context.Ketquahocphans.AsNoTracking().FirstOrDefaultAsync(e => e.MaKetQua == maketqua);
            if (cu == null) return NotFound();

            if (!await Access.CanWriteNcsAsync(_context, User, cu.MaNcs) ||
                !await Access.CanWriteNcsAsync(_context, User, ketquahocphan.MaNcs))
            {
                return Forbid();
            }

            _context.Entry(ketquahocphan).State = EntityState.Modified;
            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!await _context.Ketquahocphans.AnyAsync(e => e.MaKetQua == maketqua)) return NotFound();
                throw;
            }

            return NoContent();
        }

        // DELETE: api/Ketquahocphans/5  (chỉ ADMIN, PDT)
        [HttpDelete("{maketqua:int}")]
        [Authorize(Roles = "ADMIN,PDT")]
        public async Task<IActionResult> DeleteKetquahocphan(int maketqua)
        {
            var kq = await _context.Ketquahocphans.FindAsync(maketqua);
            if (kq == null) return NotFound();

            _context.Ketquahocphans.Remove(kq);
            await _context.SaveChangesAsync();
            return NoContent();
        }
    }
}