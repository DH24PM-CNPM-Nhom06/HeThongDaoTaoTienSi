using DTMS.Api.Helpers;
using DTMS.Api.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace DTMS.Api.Controllers
{
    // Đọc: theo phạm vi hội đồng (xem HoidongdanhgiumsController).
    // Ghi: chỉ ADMIN, PDT. Khóa chính gồm MaHoiDong và MaGv.
    [Route("api/[controller]")]
    [ApiController]
    [Authorize(Roles = "ADMIN,PDT,TBM,NHD,PBDL,NCS")]
    public class ThanhvienhoidongsController : ControllerBase
    {
        private readonly DtmsDbContext _context;

        public ThanhvienhoidongsController(DtmsDbContext context)
        {
            _context = context;
        }

        // GET: api/Thanhvienhoidongs
        [HttpGet]
        public async Task<IActionResult> GetThanhvienhoidongs()
        {
            var query = _context.Thanhvienhoidongs.AsQueryable();

            var visible = await Access.VisibleHoiDongIdsAsync(_context, User);
            if (visible != null)
            {
                query = query.Where(tv => visible.Contains(tv.MaHoiDong));
            }

            return Ok(await query.ToListAsync());
        }

        // GET: api/Thanhvienhoidongs/5/GV01
        [HttpGet("{mahoidong:int}/{magv}")]
        public async Task<ActionResult<Thanhvienhoidong>> GetThanhvienhoidong(int mahoidong, string magv)
        {
            var tv = await _context.Thanhvienhoidongs.FindAsync(mahoidong, magv);
            if (tv == null) return NotFound();

            var visible = await Access.VisibleHoiDongIdsAsync(_context, User);
            if (visible != null && !visible.Contains(mahoidong)) return NotFound();

            return Ok(tv);
        }

        // PUT: api/Thanhvienhoidongs/5/GV01  (chỉ ADMIN, PDT)
        [HttpPut("{mahoidong:int}/{magv}")]
        [Authorize(Roles = "ADMIN,PDT")]
        public async Task<IActionResult> PutThanhvienhoidong(int mahoidong, string magv, Thanhvienhoidong thanhvienhoidong)
        {
            if (mahoidong != thanhvienhoidong.MaHoiDong || magv != thanhvienhoidong.MaGv) return BadRequest();

            _context.Entry(thanhvienhoidong).State = EntityState.Modified;
            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!await _context.Thanhvienhoidongs.AnyAsync(e => e.MaHoiDong == mahoidong && e.MaGv == magv)) return NotFound();
                throw;
            }

            return NoContent();
        }

        // POST: api/Thanhvienhoidongs  (chỉ ADMIN, PDT)
        [HttpPost]
        [Authorize(Roles = "ADMIN,PDT")]
        public async Task<ActionResult<Thanhvienhoidong>> PostThanhvienhoidong(Thanhvienhoidong thanhvienhoidong)
        {
            _context.Thanhvienhoidongs.Add(thanhvienhoidong);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetThanhvienhoidong),
                new { mahoidong = thanhvienhoidong.MaHoiDong, magv = thanhvienhoidong.MaGv },
                thanhvienhoidong);
        }

        // DELETE: api/Thanhvienhoidongs/5/GV01  (chỉ ADMIN, PDT)
        [HttpDelete("{mahoidong:int}/{magv}")]
        [Authorize(Roles = "ADMIN,PDT")]
        public async Task<IActionResult> DeleteThanhvienhoidong(int mahoidong, string magv)
        {
            var tv = await _context.Thanhvienhoidongs.FindAsync(mahoidong, magv);
            if (tv == null) return NotFound();

            _context.Thanhvienhoidongs.Remove(tv);
            await _context.SaveChangesAsync();
            return NoContent();
        }
    }
}