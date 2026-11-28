using DTMS.Api.Helpers;
using DTMS.Api.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace DTMS.Api.Controllers
{
    // Biến động học vụ (gia hạn, tạm dừng, ...): NCS xem của mình; NHD xem NCS mình hướng dẫn;
    // ADMIN/PDT/TBM xem tất cả. Ghi: chỉ ADMIN, PDT.
    [Route("api/[controller]")]
    [ApiController]
    [Authorize(Roles = "ADMIN,PDT,TBM,NHD,NCS")]
    public class BiendonghocvusController : ControllerBase
    {
        private readonly DtmsDbContext _context;
        private readonly IConfiguration _fileConfig;

        public BiendonghocvusController(DtmsDbContext context, IConfiguration fileConfig)
        {
            _context = context;
            _fileConfig = fileConfig;
        }

        // GET: api/Biendonghocvus
        [HttpGet]
        public async Task<IActionResult> GetBiendonghocvus()
        {
            var query = _context.Biendonghocvus.AsQueryable();

            var readable = await Access.ReadableNcsAsync(_context, User);
            if (readable != null)
            {
                query = query.Where(b => readable.Contains(b.MaNcs));
            }

            return Ok(await query.ToListAsync());
        }

        // GET: api/Biendonghocvus/5
        [HttpGet("{mabiendong:int}")]
        public async Task<ActionResult<Biendonghocvu>> GetBiendonghocvu(int mabiendong)
        {
            var b = await _context.Biendonghocvus.FindAsync(mabiendong);
            if (b == null) return NotFound();

            if (!await Access.CanReadNcsAsync(_context, User, b.MaNcs)) return NotFound();

            return Ok(b);
        }

        // PUT: api/Biendonghocvus/5  (chỉ ADMIN, PDT)
        [HttpPut("{mabiendong:int}")]
        [Authorize(Roles = "ADMIN,PDT")]
        public async Task<IActionResult> PutBiendonghocvu(int mabiendong, Biendonghocvu biendonghocvu)
        {
            if (mabiendong != biendonghocvu.MaBienDong) return BadRequest();

            var original = await _context.Biendonghocvus.AsNoTracking()
                .FirstOrDefaultAsync(x => x.MaBienDong == mabiendong);
            if (original == null) return NotFound();
            if (!string.Equals(biendonghocvu.MaNcs, original.MaNcs, StringComparison.Ordinal))
                return BadRequest(new { Success = false, Message = "Không được đổi NCS sở hữu bản ghi qua PUT." });
            if (!StoredFileRules.ValidReference(biendonghocvu.FileQuyetDinh, biendonghocvu.MaNcs,
                    "bienban", _fileConfig, original.FileQuyetDinh))
                return BadRequest(new { Success = false, Message = "Đường dẫn tệp không hợp lệ, không thuộc NCS hoặc chưa được tải lên đúng mục đích." });

            _context.Entry(biendonghocvu).State = EntityState.Modified;
            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!await _context.Biendonghocvus.AnyAsync(e => e.MaBienDong == mabiendong)) return NotFound();
                throw;
            }

            return NoContent();
        }

        // POST: api/Biendonghocvus  (chỉ ADMIN, PDT)
        [HttpPost]
        [Authorize(Roles = "ADMIN,PDT")]
        public async Task<ActionResult<Biendonghocvu>> PostBiendonghocvu(Biendonghocvu biendonghocvu)
        {
            if (!StoredFileRules.ValidReference(biendonghocvu.FileQuyetDinh, biendonghocvu.MaNcs, "bienban", _fileConfig))
                return BadRequest(new { Success = false, Message = "Đường dẫn tệp không hợp lệ, không thuộc NCS hoặc chưa được tải lên đúng mục đích." });

            _context.Biendonghocvus.Add(biendonghocvu);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetBiendonghocvu), new { mabiendong = biendonghocvu.MaBienDong }, biendonghocvu);
        }

        // DELETE: api/Biendonghocvus/5  (chỉ ADMIN, PDT)
        [HttpDelete("{mabiendong:int}")]
        [Authorize(Roles = "ADMIN,PDT")]
        public async Task<IActionResult> DeleteBiendonghocvu(int mabiendong)
        {
            var b = await _context.Biendonghocvus.FindAsync(mabiendong);
            if (b == null) return NotFound();

            _context.Biendonghocvus.Remove(b);
            await _context.SaveChangesAsync();
            return NoContent();
        }
    }
}