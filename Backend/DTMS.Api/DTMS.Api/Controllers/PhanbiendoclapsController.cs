using DTMS.Api.DTOs;
using DTMS.Api.Helpers;
using DTMS.Api.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace DTMS.Api.Controllers
{
    // ADMIN/PDT: xem và quản lý tất cả phân công.
    // PBDL: chỉ xem và nhập nhận xét cho phân công của chính mình.
    [Route("api/[controller]")]
    [ApiController]
    [Authorize(Roles = "ADMIN,PDT,PBDL")]
    public class PhanbiendoclapsController : ControllerBase
    {
        private readonly DtmsDbContext _context;

        public PhanbiendoclapsController(DtmsDbContext context)
        {
            _context = context;
        }

        // GET: api/Phanbiendoclaps
        [HttpGet]
        public async Task<IActionResult> GetPhanbiendoclaps()
        {
            var query = _context.Phanbiendoclaps.AsQueryable();

            // PBDL (không kiêm ADMIN/PDT) chỉ thấy phân công của mình
            if (IsPbdlOnly())
            {
                var maGv = await Access.CurrentGvAsync(_context, User);
                if (maGv == null) return Forbid();

                query = query.Where(pb => pb.MaGv == maGv);
            }

            var ds = await query
                .Select(pb => new PhanbiendoclapDto
                {
                    MaPhanBien = pb.MaPhanBien,
                    MaNcs = pb.MaNcs,
                    MaGv = pb.MaGv,
                    NgayGui = pb.NgayGui,
                    NgayNhan = pb.NgayNhan,
                    KetQua = pb.KetQua,
                    FileNhanXet = pb.FileNhanXet
                })
                .ToListAsync();

            return Ok(ds);
        }

        // GET: api/Phanbiendoclaps/5
        [HttpGet("{maphanbien:int}")]
        public async Task<ActionResult<Phanbiendoclap>> GetPhanbiendoclap(int maphanbien)
        {
            var pb = await _context.Phanbiendoclaps.FindAsync(maphanbien);
            if (pb == null) return NotFound();

            if (IsPbdlOnly())
            {
                var maGv = await Access.CurrentGvAsync(_context, User);
                if (maGv == null || pb.MaGv != maGv) return NotFound();
            }

            return Ok(pb);
        }

        // PUT: api/Phanbiendoclaps/5/nhanxet  (chỉ PBDL, và chỉ cho phân công của chính mình)
        [HttpPut("{maphanbien:int}/nhanxet")]
        [Authorize(Roles = "PBDL")]
        public async Task<IActionResult> NhanXetPbdl(int maphanbien, [FromBody] CapNhatNhanXetPbdlDto dto)
        {
            var pb = await _context.Phanbiendoclaps.FindAsync(maphanbien);
            if (pb == null)
            {
                return NotFound(new { Success = false, Message = "Không tìm thấy thông tin phân công." });
            }

            var maGv = await Access.CurrentGvAsync(_context, User);
            if (maGv == null || pb.MaGv != maGv) return Forbid();

            pb.KetQua = dto.KetQua;
            pb.FileNhanXet = dto.FileNhanXet;
            pb.NgayNhan = DateOnly.FromDateTime(DateTime.Now);

            await _context.SaveChangesAsync();

            return Ok(new { Success = true, Message = "Cập nhật nhận xét thành công." });
        }

        // PUT: api/Phanbiendoclaps/5  (chỉ ADMIN, PDT)
        [HttpPut("{maphanbien:int}")]
        [Authorize(Roles = "ADMIN,PDT")]
        public async Task<IActionResult> PutPhanbiendoclap(int maphanbien, Phanbiendoclap phanbiendoclap)
        {
            if (maphanbien != phanbiendoclap.MaPhanBien) return BadRequest();

            _context.Entry(phanbiendoclap).State = EntityState.Modified;
            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!await _context.Phanbiendoclaps.AnyAsync(e => e.MaPhanBien == maphanbien)) return NotFound();
                throw;
            }

            return NoContent();
        }

        // POST: api/Phanbiendoclaps  (chỉ ADMIN, PDT)
        [HttpPost]
        [Authorize(Roles = "ADMIN,PDT")]
        public async Task<ActionResult<Phanbiendoclap>> PostPhanbiendoclap(Phanbiendoclap phanbiendoclap)
        {
            phanbiendoclap.MaPhanBien = 0;

            _context.Phanbiendoclaps.Add(phanbiendoclap);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetPhanbiendoclap), new { maphanbien = phanbiendoclap.MaPhanBien }, phanbiendoclap);
        }

        // DELETE: api/Phanbiendoclaps/5  (chỉ ADMIN, PDT)
        [HttpDelete("{maphanbien:int}")]
        [Authorize(Roles = "ADMIN,PDT")]
        public async Task<IActionResult> DeletePhanbiendoclap(int maphanbien)
        {
            var pb = await _context.Phanbiendoclaps.FindAsync(maphanbien);
            if (pb == null) return NotFound();

            _context.Phanbiendoclaps.Remove(pb);
            await _context.SaveChangesAsync();
            return NoContent();
        }

        // Người này chỉ có vai trò PBDL, không kiêm ADMIN hay PDT
        private bool IsPbdlOnly()
        {
            return User.IsInRole("PBDL") && !User.IsInRole("ADMIN") && !User.IsInRole("PDT");
        }
    }
}