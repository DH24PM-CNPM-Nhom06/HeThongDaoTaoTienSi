using System.ComponentModel.DataAnnotations;
using DTMS.Api.Helpers;
using DTMS.Api.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace DTMS.Api.Controllers
{
    // Đề tài luận án: NCS đăng ký và sửa đề tài của mình khi chưa bị khóa;
    // NHD xem đề tài NCS mình hướng dẫn; PDT/ADMIN khóa hoặc mở khóa đề tài.
    [Route("api/[controller]")]
    [ApiController]
    [Authorize(Roles = "ADMIN,PDT,TBM,NHD,NCS,PBDL")]
    public class DetailuanansController : ControllerBase
    {
        private readonly DtmsDbContext _context;

        public DetailuanansController(DtmsDbContext context)
        {
            _context = context;
        }

        // GET: api/Detailuanans
        [HttpGet]
        public async Task<IActionResult> GetDetailuanans()
        {
            var query = _context.Detailuanans.AsQueryable();

            var readable = await Access.ReadableNcsAsync(_context, User);
            if (readable != null)
            {
                query = query.Where(d => readable.Contains(d.MaNcs));
            }

            return Ok(await query.ToListAsync());
        }

        // GET: api/Detailuanans/5
        [HttpGet("{made:int}")]
        public async Task<ActionResult<Detailuanan>> GetDetailuan(int made)
        {
            var d = await _context.Detailuanans.FindAsync(made);
            if (d == null) return NotFound();

            if (!await Access.CanReadNcsAsync(_context, User, d.MaNcs)) return NotFound();

            return Ok(d);
        }

        // POST: api/Detailuanans  (NCS đăng ký đề tài cho chính mình; ADMIN/PDT nhập hộ)
        [HttpPost]
        [Authorize(Roles = "NCS,ADMIN,PDT")]
        public async Task<IActionResult> PostDetailuan([FromBody] DeTaiRequest dto)
        {
            var maNcs = LaQuanTri() ? dto.MaNcs : await Access.CurrentNcsAsync(_context, User);
            if (string.IsNullOrWhiteSpace(maNcs))
            {
                return BadRequest(new { Success = false, Message = "Không xác định được nghiên cứu sinh." });
            }

            if (!await _context.Nghiencuusinhs.AnyAsync(n => n.MaNcs == maNcs))
            {
                return BadRequest(new { Success = false, Message = "Nghiên cứu sinh không tồn tại." });
            }

            var d = new Detailuanan
            {
                MaNcs = maNcs,
                TenDeTaiVn = dto.TenDeTaiVn,
                TenDeTaiEn = dto.TenDeTaiEn,
                SoQddieuChinh = dto.SoQddieuChinh,
                FileToanVan = dto.FileToanVan,
                FileTomTat = dto.FileTomTat,
                LanChinhSua = 0,
                TrangThaiKhoa = false
            };

            _context.Detailuanans.Add(d);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetDetailuan), new { made = d.MaDeTai }, d);
        }

        // PUT: api/Detailuanans/5  (NCS sửa đề tài của mình khi chưa khóa; ADMIN/PDT sửa bất kỳ)
        [HttpPut("{made:int}")]
        [Authorize(Roles = "NCS,ADMIN,PDT")]
        public async Task<IActionResult> PutDetailuan(int made, [FromBody] DeTaiRequest dto)
        {
            var d = await _context.Detailuanans.FindAsync(made);
            if (d == null) return NotFound();

            if (!LaQuanTri())
            {
                var own = await Access.CurrentNcsAsync(_context, User);
                if (own == null || d.MaNcs != own) return NotFound();

                if (d.TrangThaiKhoa == true)
                {
                    return Conflict(new { Success = false, Message = "Đề tài đã bị khóa, không thể sửa." });
                }
            }

            d.TenDeTaiVn = dto.TenDeTaiVn;
            d.TenDeTaiEn = dto.TenDeTaiEn;
            d.SoQddieuChinh = dto.SoQddieuChinh;
            d.FileToanVan = dto.FileToanVan;
            d.FileTomTat = dto.FileTomTat;

            await _context.SaveChangesAsync();
            return NoContent();
        }

        // PUT: api/Detailuanans/5/khoa  (chỉ ADMIN, PDT)
        [HttpPut("{made:int}/khoa")]
        [Authorize(Roles = "ADMIN,PDT")]
        public async Task<IActionResult> KhoaDetailuan(int made, [FromBody] KhoaDeTaiRequest dto)
        {
            var d = await _context.Detailuanans.FindAsync(made);
            if (d == null) return NotFound();

            d.TrangThaiKhoa = dto.TrangThaiKhoa;
            await _context.SaveChangesAsync();
            return Ok(new { Success = true, Message = dto.TrangThaiKhoa ? "Đã khóa đề tài." : "Đã mở khóa đề tài." });
        }

        // DELETE: api/Detailuanans/5  (chỉ ADMIN, PDT)
        [HttpDelete("{made:int}")]
        [Authorize(Roles = "ADMIN,PDT")]
        public async Task<IActionResult> DeleteDetailuan(int made)
        {
            var d = await _context.Detailuanans.FindAsync(made);
            if (d == null) return NotFound();

            _context.Detailuanans.Remove(d);
            await _context.SaveChangesAsync();
            return NoContent();
        }

        private bool LaQuanTri() => User.IsInRole("ADMIN") || User.IsInRole("PDT");
    }

    public class DeTaiRequest
    {
        public string? MaNcs { get; set; }                // chỉ ADMIN/PDT cần gửi

        [Required, StringLength(500)]
        public string TenDeTaiVn { get; set; } = null!;

        [Required, StringLength(500)]
        public string TenDeTaiEn { get; set; } = null!;

        [StringLength(100)]
        public string? SoQddieuChinh { get; set; }

        public string? FileToanVan { get; set; }
        public string? FileTomTat { get; set; }
    }

    public class KhoaDeTaiRequest
    {
        public bool TrangThaiKhoa { get; set; }
    }
}