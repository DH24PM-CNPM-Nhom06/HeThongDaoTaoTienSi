using DTMS.Api.DTOs;
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
    public class DanhgiahocthuatsController : ControllerBase
    {
        private readonly DtmsDbContext _context;

        public DanhgiahocthuatsController(DtmsDbContext context)
        {
            _context = context;
        }

        // GET: api/Danhgiahocthuats
        [HttpGet]
        public async Task<IActionResult> GetDanhgiahocthuats()
        {
            var query = _context.Danhgiahocthuats.AsQueryable();

            var readable = await Access.ReadableNcsAsync(_context, User);
            if (readable != null)
            {
                query = query.Where(dg => readable.Contains(dg.MaNcs));
            }

            var ds = await query
                .Select(dg => new DanhgiahocthuatDto
                {
                    MaDanhGia = dg.MaDanhGia,
                    MaNcs = dg.MaNcs,
                    LoaiDanhGia = dg.LoaiDanhGia,
                    TenNoiDung = dg.TenNoiDung,
                    MaHoiDong = dg.MaHoiDong,
                    DiemTrungBinh = dg.DiemTrungBinh,
                    KetLuan = dg.KetLuan,
                    FileBaoCao = dg.FileBaoCao,
                    FileBienBan = dg.FileBienBan,
                    FileGiaiTrinh = dg.FileGiaiTrinh
                })
                .ToListAsync();

            return Ok(ds);
        }

        // GET: api/Danhgiahocthuats/5
        [HttpGet("{madanhgia:int}")]
        public async Task<ActionResult<Danhgiahocthuat>> GetDanhgiahocthuat(int madanhgia)
        {
            var dg = await _context.Danhgiahocthuats.FindAsync(madanhgia);
            if (dg == null) return NotFound();

            if (!await Access.CanReadNcsAsync(_context, User, dg.MaNcs)) return NotFound();

            return Ok(dg);
        }

        // POST: api/Danhgiahocthuats
        [HttpPost]
        [Authorize(Roles = "ADMIN,PDT,TBM,NHD")]
        public async Task<ActionResult<Danhgiahocthuat>> PostDanhgiahocthuat(Danhgiahocthuat danhgiahocthuat)
        {
            if (!await Access.CanWriteNcsAsync(_context, User, danhgiahocthuat.MaNcs)) return Forbid();

            danhgiahocthuat.MaDanhGia = 0;

            _context.Danhgiahocthuats.Add(danhgiahocthuat);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetDanhgiahocthuat), new { madanhgia = danhgiahocthuat.MaDanhGia }, danhgiahocthuat);
        }

        // PUT: api/Danhgiahocthuats/5
        [HttpPut("{madanhgia:int}")]
        [Authorize(Roles = "ADMIN,PDT,TBM,NHD")]
        public async Task<IActionResult> PutDanhgiahocthuat(int madanhgia, Danhgiahocthuat danhgiahocthuat)
        {
            if (madanhgia != danhgiahocthuat.MaDanhGia) return BadRequest();

            var cu = await _context.Danhgiahocthuats.AsNoTracking().FirstOrDefaultAsync(e => e.MaDanhGia == madanhgia);
            if (cu == null) return NotFound();

            if (!await Access.CanWriteNcsAsync(_context, User, cu.MaNcs) ||
                !await Access.CanWriteNcsAsync(_context, User, danhgiahocthuat.MaNcs))
            {
                return Forbid();
            }

            _context.Entry(danhgiahocthuat).State = EntityState.Modified;
            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!await _context.Danhgiahocthuats.AnyAsync(e => e.MaDanhGia == madanhgia)) return NotFound();
                throw;
            }

            return NoContent();
        }

        // DELETE: api/Danhgiahocthuats/5  (chỉ ADMIN, PDT)
        [HttpDelete("{madanhgia:int}")]
        [Authorize(Roles = "ADMIN,PDT")]
        public async Task<IActionResult> DeleteDanhgiahocthuat(int madanhgia)
        {
            var dg = await _context.Danhgiahocthuats.FindAsync(madanhgia);
            if (dg == null) return NotFound();

            _context.Danhgiahocthuats.Remove(dg);
            await _context.SaveChangesAsync();
            return NoContent();
        }
    }
}