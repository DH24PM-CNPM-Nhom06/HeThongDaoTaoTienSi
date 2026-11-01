using DTMS.Api.Helpers;
using DTMS.Api.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace DTMS.Api.Controllers
{
    // Hoàn thiện và cấp bằng: NCS xem của mình; NHD xem NCS mình hướng dẫn; ADMIN/PDT/TBM xem tất cả.
    // Ghi: chỉ ADMIN, PDT.
    [Route("api/[controller]")]
    [ApiController]
    [Authorize(Roles = "ADMIN,PDT,TBM,NHD,NCS")]
    public class HoanthienvatotnghiepsController : ControllerBase
    {
        private readonly DtmsDbContext _context;

        public HoanthienvatotnghiepsController(DtmsDbContext context)
        {
            _context = context;
        }

        // GET: api/Hoanthienvatotnghieps
        [HttpGet]
        public async Task<IActionResult> GetHoanthienvatotnghieps()
        {
            var query = _context.Hoanthienvatotnghieps.AsQueryable();

            var readable = await Access.ReadableNcsAsync(_context, User);
            if (readable != null)
            {
                query = query.Where(h => readable.Contains(h.MaNcs));
            }

            return Ok(await query.ToListAsync());
        }

        // GET: api/Hoanthienvatotnghieps/5
        [HttpGet("{matotnghiep:int}")]
        public async Task<ActionResult<Hoanthienvatotnghiep>> GetHoanthienvatotnghiep(int matotnghiep)
        {
            var h = await _context.Hoanthienvatotnghieps.FindAsync(matotnghiep);
            if (h == null) return NotFound();

            if (!await Access.CanReadNcsAsync(_context, User, h.MaNcs)) return NotFound();

            return Ok(h);
        }

        // PUT: api/Hoanthienvatotnghieps/5  (chỉ ADMIN, PDT)
        [HttpPut("{matotnghiep:int}")]
        [Authorize(Roles = "ADMIN,PDT")]
        public async Task<IActionResult> PutHoanthienvatotnghiep(int matotnghiep, Hoanthienvatotnghiep hoanthienvatotnghiep)
        {
            if (matotnghiep != hoanthienvatotnghiep.MaTotNghiep) return BadRequest();

            _context.Entry(hoanthienvatotnghiep).State = EntityState.Modified;
            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!await _context.Hoanthienvatotnghieps.AnyAsync(e => e.MaTotNghiep == matotnghiep)) return NotFound();
                throw;
            }

            return NoContent();
        }

        // POST: api/Hoanthienvatotnghieps  (chỉ ADMIN, PDT)
        [HttpPost]
        [Authorize(Roles = "ADMIN,PDT")]
        public async Task<ActionResult<Hoanthienvatotnghiep>> PostHoanthienvatotnghiep(Hoanthienvatotnghiep hoanthienvatotnghiep)
        {
            _context.Hoanthienvatotnghieps.Add(hoanthienvatotnghiep);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetHoanthienvatotnghiep), new { matotnghiep = hoanthienvatotnghiep.MaTotNghiep }, hoanthienvatotnghiep);
        }

        // DELETE: api/Hoanthienvatotnghieps/5  (chỉ ADMIN, PDT)
        [HttpDelete("{matotnghiep:int}")]
        [Authorize(Roles = "ADMIN,PDT")]
        public async Task<IActionResult> DeleteHoanthienvatotnghiep(int matotnghiep)
        {
            var h = await _context.Hoanthienvatotnghieps.FindAsync(matotnghiep);
            if (h == null) return NotFound();

            _context.Hoanthienvatotnghieps.Remove(h);
            await _context.SaveChangesAsync();
            return NoContent();
        }
    }
}