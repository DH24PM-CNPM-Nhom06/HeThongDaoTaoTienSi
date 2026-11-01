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

        // POST: api/Phanconghuongdans  (chỉ ADMIN, PDT)
        [HttpPost]
        [Authorize(Roles = "ADMIN,PDT")]
        public async Task<ActionResult<Phanconghuongdan>> PostPhanconghuongdan(Phanconghuongdan phanconghuongdan)
        {
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
    }
}