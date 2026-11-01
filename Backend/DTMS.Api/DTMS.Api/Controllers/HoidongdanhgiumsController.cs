using DTMS.Api.Helpers;
using DTMS.Api.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace DTMS.Api.Controllers
{
    // Đọc: ADMIN/PDT/TBM xem tất cả; NHD xem hội đồng của NCS mình hướng dẫn;
    // PBDL xem hội đồng của NCS được phân công phản biện hoặc hội đồng mình là thành viên.
    // Ghi: chỉ ADMIN, PDT.
    [Route("api/[controller]")]
    [ApiController]
    [Authorize(Roles = "ADMIN,PDT,TBM,NHD,PBDL,NCS")]
    public class HoidongdanhgiumsController : ControllerBase
    {
        private readonly DtmsDbContext _context;

        public HoidongdanhgiumsController(DtmsDbContext context)
        {
            _context = context;
        }

        // GET: api/Hoidongdanhgiums
        [HttpGet]
        public async Task<IActionResult> GetHoidongdanhgia()
        {
            var query = _context.Hoidongdanhgia.AsQueryable();

            var visible = await Access.VisibleHoiDongIdsAsync(_context, User);
            if (visible != null)
            {
                query = query.Where(h => visible.Contains(h.MaHoiDong));
            }

            return Ok(await query.ToListAsync());
        }

        // GET: api/Hoidongdanhgiums/5
        [HttpGet("{mahoidong:int}")]
        public async Task<ActionResult<Hoidongdanhgium>> GetHoidongdanhgium(int mahoidong)
        {
            var hd = await _context.Hoidongdanhgia.FindAsync(mahoidong);
            if (hd == null) return NotFound();

            var visible = await Access.VisibleHoiDongIdsAsync(_context, User);
            if (visible != null && !visible.Contains(mahoidong)) return NotFound();

            return Ok(hd);
        }

        // PUT: api/Hoidongdanhgiums/5  (chỉ ADMIN, PDT)
        [HttpPut("{mahoidong:int}")]
        [Authorize(Roles = "ADMIN,PDT")]
        public async Task<IActionResult> PutHoidongdanhgium(int mahoidong, Hoidongdanhgium hoidongdanhgium)
        {
            if (mahoidong != hoidongdanhgium.MaHoiDong) return BadRequest();

            _context.Entry(hoidongdanhgium).State = EntityState.Modified;
            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!await _context.Hoidongdanhgia.AnyAsync(e => e.MaHoiDong == mahoidong)) return NotFound();
                throw;
            }

            return NoContent();
        }

        // POST: api/Hoidongdanhgiums  (chỉ ADMIN, PDT)
        [HttpPost]
        [Authorize(Roles = "ADMIN,PDT")]
        public async Task<ActionResult<Hoidongdanhgium>> PostHoidongdanhgium(Hoidongdanhgium hoidongdanhgium)
        {
            _context.Hoidongdanhgia.Add(hoidongdanhgium);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetHoidongdanhgium), new { mahoidong = hoidongdanhgium.MaHoiDong }, hoidongdanhgium);
        }

        // DELETE: api/Hoidongdanhgiums/5  (chỉ ADMIN, PDT)
        [HttpDelete("{mahoidong:int}")]
        [Authorize(Roles = "ADMIN,PDT")]
        public async Task<IActionResult> DeleteHoidongdanhgium(int mahoidong)
        {
            var hd = await _context.Hoidongdanhgia.FindAsync(mahoidong);
            if (hd == null) return NotFound();

            _context.Hoidongdanhgia.Remove(hd);
            await _context.SaveChangesAsync();
            return NoContent();
        }
    }
}