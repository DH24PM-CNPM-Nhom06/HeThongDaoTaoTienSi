using DTMS.Api.DTOs;
using DTMS.Api.Helpers;
using DTMS.Api.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace DTMS.Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize(Roles = "ADMIN,PDT,TBM,NHD,NCS")]
    public class BaocaotiendoesController : ControllerBase
    {
        private readonly DtmsDbContext _context;

        public BaocaotiendoesController(DtmsDbContext context)
        {
            _context = context;
        }

        // GET: api/Baocaotiendoes
        [HttpGet]
        public async Task<IActionResult> GetBaocaotiendo()
        {
            var query = _context.Baocaotiendos.AsQueryable();

            var readable = await Access.ReadableNcsAsync(_context, User);
            if (readable != null)
            {
                query = query.Where(bc => readable.Contains(bc.MaNcs));
            }

            var ds = await query
                .Select(bc => new BaocaotiendoDto
                {
                    MaBaoCao = bc.MaBaoCao,
                    MaNcs = bc.MaNcs,
                    KyBaoCao = bc.KyBaoCao,
                    HanNop = bc.HanNop,
                    NgayNop = bc.NgayNop,
                    FileBaoCao = bc.FileBaoCao,
                    FileMinhChung = bc.FileMinhChung,
                    DanhGiaNhd = bc.DanhGiaNhd,
                    NhanXetNhd = bc.NhanXetNhd,
                    TrangThaiKhoa = bc.TrangThaiKhoa
                })
                .OrderByDescending(bc => bc.NgayNop)
                .ToListAsync();

            return Ok(ds);
        }

        // GET: api/Baocaotiendoes/5
        // Trước đây NHD đọc được báo cáo của mọi NCS qua mã; nay phải đúng NCS mình hướng dẫn.
        [HttpGet("{mabaocao:int}")]
        public async Task<ActionResult<Baocaotiendo>> GetBaocaotiendo(int mabaocao)
        {
            var bc = await _context.Baocaotiendos.FindAsync(mabaocao);
            if (bc == null) return NotFound();

            // Trả NotFound thay vì Forbid để không lộ việc báo cáo đó có tồn tại
            if (!await Access.CanReadNcsAsync(_context, User, bc.MaNcs)) return NotFound();

            return Ok(bc);
        }

        // POST: api/Baocaotiendoes  (NCS nộp báo cáo; ADMIN/PDT nhập hộ)
        // Dùng DTO: NCS không thể tự điền nhận xét của NHD hay khóa báo cáo khi nộp.
        [HttpPost]
        [Authorize(Roles = "ADMIN,PDT,NCS")]
        public async Task<IActionResult> PostBaocaotiendo([FromBody] CreateBaocaoRequest dto)
        {
            string? maNcs;
            if (User.IsInRole("ADMIN") || User.IsInRole("PDT"))
            {
                maNcs = dto.MaNcs;
            }
            else
            {
                maNcs = await Access.CurrentNcsAsync(_context, User);
            }

            if (string.IsNullOrWhiteSpace(maNcs))
            {
                return BadRequest(new { Success = false, Message = "Không xác định được nghiên cứu sinh." });
            }

            if (!await _context.Nghiencuusinhs.AnyAsync(n => n.MaNcs == maNcs))
            {
                return BadRequest(new { Success = false, Message = "Nghiên cứu sinh không tồn tại." });
            }

            if (string.IsNullOrWhiteSpace(dto.KyBaoCao))
            {
                return BadRequest(new { Success = false, Message = "Vui lòng nhập kỳ báo cáo." });
            }

            var bc = new Baocaotiendo
            {
                MaNcs = maNcs,
                KyBaoCao = dto.KyBaoCao,
                HanNop = dto.HanNop,
                NgayNop = DateTime.Now,
                FileBaoCao = dto.FileBaoCao,
                FileMinhChung = dto.FileMinhChung,
                DanhGiaNhd = null,
                NhanXetNhd = null,
                TrangThaiKhoa = false
            };

            _context.Baocaotiendos.Add(bc);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetBaocaotiendo), new { mabaocao = bc.MaBaoCao }, bc);
        }

        // PUT: api/Baocaotiendoes/5/nhanxet  (chỉ NHD của NCS đó, và khi báo cáo chưa khóa)
        [HttpPut("{mabaocao:int}/nhanxet")]
        [Authorize(Roles = "NHD")]
        public async Task<IActionResult> NhanXetCuaNhd(int mabaocao, [FromBody] NhanXetNhdDto dto)
        {
            var bc = await _context.Baocaotiendos.FindAsync(mabaocao);
            if (bc == null) return NotFound();

            if (!await Access.SupervisesAsync(_context, User, bc.MaNcs)) return Forbid();

            if (bc.TrangThaiKhoa == true)
            {
                return Conflict(new { Success = false, Message = "Báo cáo đã khóa, không thể nhận xét thêm." });
            }

            bc.DanhGiaNhd = dto.DanhGiaNhd;
            bc.NhanXetNhd = dto.NhanXetNhd;
            await _context.SaveChangesAsync();

            return Ok(new { Success = true, Message = "Lưu nhận xét thành công." });
        }

        // PUT: api/Baocaotiendoes/5  (chỉ ADMIN, PDT)
        [HttpPut("{mabaocao:int}")]
        [Authorize(Roles = "ADMIN,PDT")]
        public async Task<IActionResult> PutBaocaotiendo(int mabaocao, Baocaotiendo baocaotiendo)
        {
            if (mabaocao != baocaotiendo.MaBaoCao) return BadRequest();

            _context.Entry(baocaotiendo).State = EntityState.Modified;
            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!await _context.Baocaotiendos.AnyAsync(e => e.MaBaoCao == mabaocao)) return NotFound();
                throw;
            }
            return NoContent();
        }

        // DELETE: api/Baocaotiendoes/5  (chỉ ADMIN, PDT)
        [HttpDelete("{mabaocao:int}")]
        [Authorize(Roles = "ADMIN,PDT")]
        public async Task<IActionResult> DeleteBaocaotiendo(int mabaocao)
        {
            var bc = await _context.Baocaotiendos.FindAsync(mabaocao);
            if (bc == null) return NotFound();

            _context.Baocaotiendos.Remove(bc);
            await _context.SaveChangesAsync();
            return NoContent();
        }
    }

    // Dữ liệu NCS gửi khi nộp báo cáo
    public class CreateBaocaoRequest
    {
        public string? MaNcs { get; set; }                // chỉ ADMIN/PDT cần gửi
        public string KyBaoCao { get; set; } = null!;
        public DateOnly HanNop { get; set; }
        public string? FileBaoCao { get; set; }
        public string? FileMinhChung { get; set; }
    }
}