using DTMS.Api.DTOs;
using DTMS.Api.Helpers;
using DTMS.Api.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace DTMS.Api.Controllers
{
    // Đọc: NCS xem hồ sơ của mình; NHD xem hồ sơ NCS mình hướng dẫn; ADMIN/PDT/TBM xem tất cả.
    // Ghi (thêm, sửa, xóa): chỉ ADMIN và PDT.
    [Route("api/[controller]")]
    [ApiController]
    [Authorize(Roles = "ADMIN,PDT,TBM,NHD,NCS")]
    public class NghiencuusinhsController : ControllerBase
    {
        private readonly DtmsDbContext _context;

        public NghiencuusinhsController(DtmsDbContext context)
        {
            _context = context;
        }

        // GET: api/Nghiencuusinhs
        [HttpGet]
        public async Task<IActionResult> GetNghiencuusinh()
        {
            var query = _context.Nghiencuusinhs.AsQueryable();

            var readable = await Access.ReadableNcsAsync(_context, User);
            if (readable != null)
            {
                query = query.Where(ncs => readable.Contains(ncs.MaNcs));
            }

            var ds = await query
                .Select(ncs => new NghiencuusinhDto
                {
                    MaNcs = ncs.MaNcs,
                    HoTen = ncs.HoTen,
                    NgaySinh = ncs.NgaySinh,
                    GioiTinh = ncs.GioiTinh,
                    MaNganh = ncs.MaNganh,
                    DoiTuongDauVao = ncs.DoiTuongDauVao,
                    SoQdtrungTuyen = ncs.SoQdtrungTuyen,
                    NgayNhapHoc = ncs.NgayNhapHoc,
                    TrangThaiHocVu = ncs.TrangThaiHocVu
                })
                .ToListAsync();

            return Ok(ds);
        }

        // GET: api/Nghiencuusinhs/NCS01
        // Không trả về MaNguoiDung để tránh lộ liên kết tới tài khoản đăng nhập.
        [HttpGet("{mancs}")]
        public async Task<ActionResult<NghiencuusinhDto>> GetNghiencuusinh(string mancs)
        {
            var ncs = await _context.Nghiencuusinhs
                .Where(x => x.MaNcs == mancs)
                .Select(x => new NghiencuusinhDto
                {
                    MaNcs = x.MaNcs,
                    HoTen = x.HoTen,
                    NgaySinh = x.NgaySinh,
                    GioiTinh = x.GioiTinh,
                    MaNganh = x.MaNganh,
                    DoiTuongDauVao = x.DoiTuongDauVao,
                    SoQdtrungTuyen = x.SoQdtrungTuyen,
                    NgayNhapHoc = x.NgayNhapHoc,
                    TrangThaiHocVu = x.TrangThaiHocVu
                })
                .FirstOrDefaultAsync();

            if (ncs == null) return NotFound();

            // Trả NotFound thay vì Forbid để không lộ việc hồ sơ có tồn tại
            if (!await Access.CanReadNcsAsync(_context, User, ncs.MaNcs)) return NotFound();

            return Ok(ncs);
        }

        // PUT: api/Nghiencuusinhs/NCS01  (chỉ ADMIN, PDT)
        [HttpPut("{mancs}")]
        [Authorize(Roles = "ADMIN,PDT")]
        public async Task<IActionResult> PutNghiencuusinh(string mancs, Nghiencuusinh nghiencuusinh)
        {
            if (mancs != nghiencuusinh.MaNcs)
            {
                return BadRequest();
            }

            _context.Entry(nghiencuusinh).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!await _context.Nghiencuusinhs.AnyAsync(e => e.MaNcs == mancs)) return NotFound();
                throw;
            }

            return NoContent();
        }

        // POST: api/Nghiencuusinhs  (chỉ ADMIN, PDT)
        [HttpPost]
        [Authorize(Roles = "ADMIN,PDT")]
        public async Task<ActionResult<Nghiencuusinh>> PostNghiencuusinh(Nghiencuusinh nghiencuusinh)
        {
            _context.Nghiencuusinhs.Add(nghiencuusinh);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetNghiencuusinh), new { mancs = nghiencuusinh.MaNcs }, nghiencuusinh);
        }

        // DELETE: api/Nghiencuusinhs/NCS01  (chỉ ADMIN, PDT)
        [HttpDelete("{mancs}")]
        [Authorize(Roles = "ADMIN,PDT")]
        public async Task<IActionResult> DeleteNghiencuusinh(string mancs)
        {
            var ncs = await _context.Nghiencuusinhs.FindAsync(mancs);
            if (ncs == null) return NotFound();

            _context.Nghiencuusinhs.Remove(ncs);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}