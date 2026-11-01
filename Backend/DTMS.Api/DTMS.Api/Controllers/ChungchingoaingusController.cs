using System.ComponentModel.DataAnnotations;
using DTMS.Api.Helpers;
using DTMS.Api.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace DTMS.Api.Controllers
{
    // Minh chứng ngoại ngữ: NCS tải lên; PDT/ADMIN duyệt. Đã duyệt thì NCS không sửa được.
    [Route("api/[controller]")]
    [ApiController]
    [Authorize(Roles = "ADMIN,PDT,TBM,NHD,NCS")]
    public class ChungchingoaingusController : ControllerBase
    {
        private readonly DtmsDbContext _context;

        public ChungchingoaingusController(DtmsDbContext context)
        {
            _context = context;
        }

        // GET: api/Chungchingoaingus
        [HttpGet]
        public async Task<IActionResult> GetChungchingoaingus()
        {
            var query = _context.Chungchingoaingus.AsQueryable();

            var readable = await Access.ReadableNcsAsync(_context, User);
            if (readable != null)
            {
                query = query.Where(cc => readable.Contains(cc.MaNcs));
            }

            return Ok(await query.ToListAsync());
        }

        // GET: api/Chungchingoaingus/5
        [HttpGet("{machungchi:int}")]
        public async Task<ActionResult<Chungchingoaingu>> GetChungchingoaingu(int machungchi)
        {
            var cc = await _context.Chungchingoaingus.FindAsync(machungchi);
            if (cc == null) return NotFound();

            if (!await Access.CanReadNcsAsync(_context, User, cc.MaNcs)) return NotFound();

            return Ok(cc);
        }

        // POST: api/Chungchingoaingus  (NCS nộp minh chứng của mình; ADMIN/PDT nhập hộ)
        [HttpPost]
        [Authorize(Roles = "NCS,ADMIN,PDT")]
        public async Task<IActionResult> PostChungchingoaingu([FromBody] ChungChiRequest dto)
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

            var cc = new Chungchingoaingu
            {
                MaNcs = maNcs,
                TenChungChi = dto.TenChungChi,
                DiemSo = dto.DiemSo,
                NgayCap = dto.NgayCap,
                NgayHetHan = dto.NgayHetHan,
                NoiCap = dto.NoiCap,
                FileMinhChung = dto.FileMinhChung ?? string.Empty,
                TrangThaiDuyet = 0   // chờ duyệt
            };

            _context.Chungchingoaingus.Add(cc);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetChungchingoaingu), new { machungchi = cc.MaChungChi }, cc);
        }

        // PUT: api/Chungchingoaingus/5  (NCS sửa minh chứng của mình khi chưa được duyệt; ADMIN/PDT sửa bất kỳ)
        [HttpPut("{machungchi:int}")]
        [Authorize(Roles = "NCS,ADMIN,PDT")]
        public async Task<IActionResult> PutChungchingoaingu(int machungchi, [FromBody] ChungChiRequest dto)
        {
            var cc = await _context.Chungchingoaingus.FindAsync(machungchi);
            if (cc == null) return NotFound();

            if (!LaQuanTri())
            {
                var own = await Access.CurrentNcsAsync(_context, User);
                if (own == null || cc.MaNcs != own) return NotFound();

                if (cc.TrangThaiDuyet == 1)
                {
                    return Conflict(new { Success = false, Message = "Minh chứng đã được duyệt, không thể sửa." });
                }

                cc.TrangThaiDuyet = 0; // sửa xong phải duyệt lại
            }

            cc.TenChungChi = dto.TenChungChi;
            cc.DiemSo = dto.DiemSo;
            cc.NgayCap = dto.NgayCap;
            cc.NgayHetHan = dto.NgayHetHan;
            cc.NoiCap = dto.NoiCap;
            cc.FileMinhChung = dto.FileMinhChung ?? string.Empty;

            await _context.SaveChangesAsync();
            return NoContent();
        }

        // PUT: api/Chungchingoaingus/5/duyet  (chỉ PDT, ADMIN)
        [HttpPut("{machungchi:int}/duyet")]
        [Authorize(Roles = "ADMIN,PDT")]
        public async Task<IActionResult> DuyetChungChi(int machungchi, [FromBody] DuyetChungChiRequest dto)
        {
            if (dto.TrangThaiDuyet != 1 && dto.TrangThaiDuyet != -1)
            {
                return BadRequest(new { Success = false, Message = "Trạng thái duyệt chỉ nhận 1 (đồng ý) hoặc -1 (từ chối)." });
            }

            var cc = await _context.Chungchingoaingus.FindAsync(machungchi);
            if (cc == null) return NotFound();

            cc.TrangThaiDuyet = dto.TrangThaiDuyet;
            await _context.SaveChangesAsync();
            return Ok(new { Success = true, Message = "Cập nhật trạng thái duyệt thành công." });
        }

        // DELETE: api/Chungchingoaingus/5  (chỉ ADMIN, PDT)
        [HttpDelete("{machungchi:int}")]
        [Authorize(Roles = "ADMIN,PDT")]
        public async Task<IActionResult> DeleteChungchingoaingu(int machungchi)
        {
            var cc = await _context.Chungchingoaingus.FindAsync(machungchi);
            if (cc == null) return NotFound();

            _context.Chungchingoaingus.Remove(cc);
            await _context.SaveChangesAsync();
            return NoContent();
        }

        private bool LaQuanTri() => User.IsInRole("ADMIN") || User.IsInRole("PDT");
    }

    public class ChungChiRequest
    {
        public string? MaNcs { get; set; }                // chỉ ADMIN/PDT cần gửi

        [Required, StringLength(200)]
        public string TenChungChi { get; set; } = null!;

        [Required, StringLength(50)]
        public string DiemSo { get; set; } = null!;

        public DateOnly NgayCap { get; set; }
        public DateOnly? NgayHetHan { get; set; }

        [Required, StringLength(200)]
        public string NoiCap { get; set; } = null!;

        public string? FileMinhChung { get; set; }
    }

    public class DuyetChungChiRequest
    {
        public sbyte TrangThaiDuyet { get; set; }        // 1: đồng ý, -1: từ chối
    }
}