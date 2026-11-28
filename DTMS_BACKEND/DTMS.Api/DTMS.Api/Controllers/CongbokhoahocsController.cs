using System.ComponentModel.DataAnnotations;
using DTMS.Api.Helpers;
using DTMS.Api.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace DTMS.Api.Controllers
{
    // NCS tự khai báo công bố khoa học của mình; NHD hướng dẫn thẩm định; PDT/ADMIN quản lý toàn bộ.
    // Khi NCS sửa, bản ghi quay về trạng thái chờ duyệt. Đã duyệt thì NCS không sửa được nữa.
    [Route("api/[controller]")]
    [ApiController]
    [Authorize(Roles = "ADMIN,PDT,TBM,NHD,NCS")]
    public class CongbokhoahocsController : ControllerBase
    {
        private readonly DtmsDbContext _context;
        private readonly IConfiguration _fileConfig;

        public CongbokhoahocsController(DtmsDbContext context, IConfiguration fileConfig)
        {
            _context = context;
            _fileConfig = fileConfig;
        }

        // GET: api/Congbokhoahocs
        [HttpGet]
        public async Task<IActionResult> GetCongbokhoahocs()
        {
            var query = _context.Congbokhoahocs.AsQueryable();

            var readable = await Access.ReadableNcsAsync(_context, User);
            if (readable != null)
            {
                query = query.Where(cb => readable.Contains(cb.MaNcs));
            }

            return Ok(await query.ToListAsync());
        }

        // GET: api/Congbokhoahocs/5
        [HttpGet("{macongbo:int}")]
        public async Task<ActionResult<Congbokhoahoc>> GetCongbokhoahoc(int macongbo)
        {
            var cb = await _context.Congbokhoahocs.FindAsync(macongbo);
            if (cb == null) return NotFound();

            if (!await Access.CanReadNcsAsync(_context, User, cb.MaNcs)) return NotFound();

            return Ok(cb);
        }

        // POST: api/Congbokhoahocs  (NCS khai báo cho chính mình; ADMIN/PDT nhập hộ)
        [HttpPost]
        [Authorize(Roles = "NCS,ADMIN,PDT")]
        public async Task<IActionResult> PostCongbokhoahoc([FromBody] CongboRequest dto)
        {
            var maNcs = await MaNcsGhiAsync(dto.MaNcs);
            if (string.IsNullOrWhiteSpace(maNcs))
            {
                return BadRequest(new { Success = false, Message = "Không xác định được nghiên cứu sinh." });
            }

            if (!await _context.Nghiencuusinhs.AnyAsync(n => n.MaNcs == maNcs))
            {
                return BadRequest(new { Success = false, Message = "Nghiên cứu sinh không tồn tại." });
            }

            if (!(StoredFileRules.ValidReference(dto.FileMinhChung, maNcs, "minhchung", _fileConfig, required: true)))
                return BadRequest(new { Success = false, Message = "Đường dẫn tệp không hợp lệ, không thuộc NCS hoặc chưa được tải lên đúng mục đích." });

            var cb = new Congbokhoahoc
            {
                MaNcs = maNcs,
                TenBaiBao = dto.TenBaiBao,
                TenTapChi = dto.TenTapChi,
                PhanLoai = dto.PhanLoai,
                DiemTapChi = dto.DiemTapChi,
                VaiTroTacGia = dto.VaiTroTacGia,
                CoTenNhd = dto.CoTenNhd,
                DiaChiTruong = dto.DiaChiTruong,
                LinkDoi = dto.LinkDoi,
                FileMinhChung = dto.FileMinhChung ?? string.Empty,
                TrangThaiDuyet = 0   // chờ duyệt
            };

            _context.Congbokhoahocs.Add(cb);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetCongbokhoahoc), new { macongbo = cb.MaCongBo }, cb);
        }

        // PUT: api/Congbokhoahocs/5  (NCS sửa bản ghi của mình khi chưa được duyệt; ADMIN/PDT sửa bất kỳ)
        [HttpPut("{macongbo:int}")]
        [Authorize(Roles = "NCS,ADMIN,PDT")]
        public async Task<IActionResult> PutCongbokhoahoc(int macongbo, [FromBody] CongboRequest dto)
        {
            var cb = await _context.Congbokhoahocs.FindAsync(macongbo);
            if (cb == null) return NotFound();

            if (!LaQuanTri())
            {
                var own = await Access.CurrentNcsAsync(_context, User);
                if (own == null || cb.MaNcs != own) return NotFound();

                if (cb.TrangThaiDuyet == 1)
                {
                    return Conflict(new { Success = false, Message = "Công bố đã được duyệt, không thể sửa." });
                }

                cb.TrangThaiDuyet = 0; // sửa xong phải duyệt lại
            }

            if (!StoredFileRules.ValidReference(dto.FileMinhChung, cb.MaNcs, "minhchung", _fileConfig,
                    cb.FileMinhChung, required: true))
                return BadRequest(new { Success = false, Message = "Đường dẫn tệp không hợp lệ, không thuộc NCS hoặc chưa được tải lên đúng mục đích." });

            cb.TenBaiBao = dto.TenBaiBao;
            cb.TenTapChi = dto.TenTapChi;
            cb.PhanLoai = dto.PhanLoai;
            cb.DiemTapChi = dto.DiemTapChi;
            cb.VaiTroTacGia = dto.VaiTroTacGia;
            cb.CoTenNhd = dto.CoTenNhd;
            cb.DiaChiTruong = dto.DiaChiTruong;
            cb.LinkDoi = dto.LinkDoi;
            cb.FileMinhChung = dto.FileMinhChung ?? string.Empty;

            await _context.SaveChangesAsync();
            return NoContent();
        }

        // PUT: api/Congbokhoahocs/5/duyet  (NHD của NCS đó, hoặc PDT/ADMIN)
        [HttpPut("{macongbo:int}/duyet")]
        [Authorize(Roles = "NHD,PDT,ADMIN")]
        public async Task<IActionResult> DuyetCongbo(int macongbo, [FromBody] DuyetCongboRequest dto)
        {
            if (dto.TrangThaiDuyet != 1 && dto.TrangThaiDuyet != -1)
            {
                return BadRequest(new { Success = false, Message = "Trạng thái duyệt chỉ nhận 1 (đồng ý) hoặc -1 (từ chối)." });
            }

            var cb = await _context.Congbokhoahocs.FindAsync(macongbo);
            if (cb == null) return NotFound();

            if (!LaQuanTri())
            {
                if (!await Access.SupervisesAsync(_context, User, cb.MaNcs)) return Forbid();
            }

            cb.TrangThaiDuyet = dto.TrangThaiDuyet;
            await _context.SaveChangesAsync();

            return Ok(new { Success = true, Message = "Cập nhật trạng thái thẩm định thành công." });
        }

        // DELETE: api/Congbokhoahocs/5  (chỉ ADMIN, PDT)
        [HttpDelete("{macongbo:int}")]
        [Authorize(Roles = "ADMIN,PDT")]
        public async Task<IActionResult> DeleteCongbokhoahoc(int macongbo)
        {
            var cb = await _context.Congbokhoahocs.FindAsync(macongbo);
            if (cb == null) return NotFound();

            _context.Congbokhoahocs.Remove(cb);
            await _context.SaveChangesAsync();
            return NoContent();
        }

        private bool LaQuanTri() => User.IsInRole("ADMIN") || User.IsInRole("PDT");

        // Người nhập liệu: ADMIN/PDT chọn NCS, NCS luôn là chính mình
        private async Task<string?> MaNcsGhiAsync(string? maNcsGui)
        {
            return LaQuanTri() ? maNcsGui : await Access.CurrentNcsAsync(_context, User);
        }
    }

    public class CongboRequest
    {
        public string? MaNcs { get; set; }                // chỉ ADMIN/PDT cần gửi

        [Required, StringLength(500)]
        public string TenBaiBao { get; set; } = null!;

        [Required, StringLength(300)]
        public string TenTapChi { get; set; } = null!;

        [Required, StringLength(50)]
        public string PhanLoai { get; set; } = null!;

        public float? DiemTapChi { get; set; }
        public sbyte VaiTroTacGia { get; set; }
        public bool CoTenNhd { get; set; }
        public bool DiaChiTruong { get; set; }
        public string? LinkDoi { get; set; }
        public string? FileMinhChung { get; set; }
    }

    public class DuyetCongboRequest
    {
        public sbyte TrangThaiDuyet { get; set; }        // 1: đồng ý, -1: từ chối
    }
}