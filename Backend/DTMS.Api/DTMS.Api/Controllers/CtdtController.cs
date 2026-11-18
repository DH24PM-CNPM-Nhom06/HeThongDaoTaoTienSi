using DTMS.Api.Helpers;
using DTMS.Api.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace DTMS.Api.Controllers
{
    // Chương trình đào tạo theo ngành và đối tượng đầu vào (tài liệu mục 3.2, nhóm 2).
    // PĐT quản lý. NCS chỉ xem chương trình của ngành và đối tượng mình.
    [Route("api/[controller]")]
    [ApiController]
    [Authorize(Roles = "ADMIN,PDT,TBM,KHOA,NHD,NCS,BGH")]
    public class CtdtController : ControllerBase
    {
        private static readonly string[] LoaiHocPhanHopLe = { "BAT_BUOC", "TU_CHON" };

        private readonly DtmsDbContext _context;

        public CtdtController(DtmsDbContext context)
        {
            _context = context;
        }

        // GET: api/Ctdt?maNganh=KTPM&doiTuongDauVao=1
        [HttpGet]
        public async Task<IActionResult> DanhSach([FromQuery] string? maNganh, [FromQuery] sbyte? doiTuongDauVao)
        {
            var query = _context.CtdtHocphans.AsQueryable();

            // NCS chỉ xem chương trình của ngành và đối tượng của mình
            if (User.IsInRole("NCS") && !Access.LaToanQuyen(User) && !Access.LaQuanTri(User))
            {
                var maNcs = await Access.CurrentNcsAsync(_context, User);
                if (maNcs == null) return Forbid();

                var hoSo = await _context.Nghiencuusinhs
                    .Where(n => n.MaNcs == maNcs)
                    .Select(n => new { n.MaNganh, n.DoiTuongDauVao })
                    .FirstAsync();

                query = query.Where(c => c.MaNganh == hoSo.MaNganh && c.DoiTuongDauVao == hoSo.DoiTuongDauVao);
            }
            else
            {
                if (!string.IsNullOrWhiteSpace(maNganh)) query = query.Where(c => c.MaNganh == maNganh);
                if (doiTuongDauVao != null) query = query.Where(c => c.DoiTuongDauVao == doiTuongDauVao);
            }

            var ds = await query
                .Join(_context.Monhocs, c => c.MaMonHoc, m => m.MaMonHoc,
                    (c, m) => new
                    {
                        c.MaCtdt,
                        c.MaNganh,
                        c.DoiTuongDauVao,
                        c.MaMonHoc,
                        m.TenMonHoc,
                        m.SoTinChi,
                        c.LoaiHocPhan
                    })
                .OrderBy(x => x.LoaiHocPhan).ThenBy(x => x.MaMonHoc)
                .ToListAsync();

            return Ok(ds);
        }

        // POST: api/Ctdt  (PĐT thêm học phần vào chương trình)
        [HttpPost]
        [Authorize(Roles = "ADMIN,PDT")]
        public async Task<IActionResult> Them([FromBody] CtdtRequest dto)
        {
            if (string.IsNullOrWhiteSpace(dto.MaNganh) || string.IsNullOrWhiteSpace(dto.MaMonHoc))
                return BadRequest(new { Success = false, Message = "Mã ngành và mã môn học không được rỗng." });
            dto.MaNganh = dto.MaNganh.Trim();
            dto.MaMonHoc = dto.MaMonHoc.Trim();

            if (dto.DoiTuongDauVao != 1 && dto.DoiTuongDauVao != 2)
            {
                return BadRequest(new { Success = false, Message = "Đối tượng đầu vào chỉ nhận 1 hoặc 2." });
            }

            var loai = (dto.LoaiHocPhan ?? string.Empty).Trim().ToUpperInvariant();
            if (!LoaiHocPhanHopLe.Contains(loai))
            {
                return BadRequest(new { Success = false, Message = "Loại học phần chỉ nhận BAT_BUOC hoặc TU_CHON." });
            }

            if (!await _context.Nganhdaotaos.AnyAsync(n => n.MaNganh == dto.MaNganh))
            {
                return BadRequest(new { Success = false, Message = "Ngành không tồn tại." });
            }

            if (!await _context.Monhocs.AnyAsync(m => m.MaMonHoc == dto.MaMonHoc))
            {
                return BadRequest(new { Success = false, Message = "Học phần không tồn tại." });
            }

            if (await _context.CtdtHocphans.AnyAsync(c =>
                c.MaNganh == dto.MaNganh && c.DoiTuongDauVao == dto.DoiTuongDauVao && c.MaMonHoc == dto.MaMonHoc))
            {
                return Conflict(new { Success = false, Message = "Học phần đã có trong chương trình này." });
            }

            var c = new CtdtHocphan
            {
                MaNganh = dto.MaNganh,
                DoiTuongDauVao = dto.DoiTuongDauVao,
                MaMonHoc = dto.MaMonHoc,
                LoaiHocPhan = loai
            };
            _context.CtdtHocphans.Add(c);
            await _context.SaveChangesAsync();

            return Ok(new { Success = true, Message = "Đã thêm học phần vào chương trình.", MaCtdt = c.MaCtdt });
        }

        // DELETE: api/Ctdt/5  (PĐT xóa học phần khỏi chương trình)
        [HttpDelete("{id:int}")]
        [Authorize(Roles = "ADMIN,PDT")]
        public async Task<IActionResult> Xoa(int id)
        {
            var c = await _context.CtdtHocphans.FindAsync(id);
            if (c == null) return NotFound();

            // Ngăn xóa CTĐT khi NCS đúng ngành + đối tượng đã có đăng ký học phần.
            // Bảng dangky_hocphan không có FK đến CTĐT nên không thể dựa vào DB tự chặn.
            var daSuDung = await (
                from dk in _context.DangKyHocphans
                join ncs in _context.Nghiencuusinhs on dk.MaNcs equals ncs.MaNcs
                where dk.MaMonHoc == c.MaMonHoc &&
                      ncs.MaNganh == c.MaNganh &&
                      ncs.DoiTuongDauVao == c.DoiTuongDauVao
                select dk.MaDangKy
            ).AnyAsync();
            if (daSuDung)
                return Conflict(new { Success = false, Message = "Không thể xóa môn khỏi CTĐT vì đã có NCS đăng ký học phần này." });

            var daCoKeHoach = await (
                from kh in _context.Kehoachhoctaps
                join ncs in _context.Nghiencuusinhs on kh.MaNcs equals ncs.MaNcs
                where kh.MaMonHoc == c.MaMonHoc &&
                      ncs.MaNganh == c.MaNganh &&
                      ncs.DoiTuongDauVao == c.DoiTuongDauVao
                select kh.MaKeHoach
            ).AnyAsync();
            if (daCoKeHoach)
                return Conflict(new { Success = false, Message = "Không thể xóa môn khỏi CTĐT vì đã có kế hoạch học tập liên quan." });

            _context.CtdtHocphans.Remove(c);
            await _context.SaveChangesAsync();
            return NoContent();
        }
    }

    public class CtdtRequest
    {
        [System.ComponentModel.DataAnnotations.Required, System.ComponentModel.DataAnnotations.StringLength(20)]
        public string MaNganh { get; set; } = null!;
        [System.ComponentModel.DataAnnotations.Range(1, 2)]
        public sbyte DoiTuongDauVao { get; set; }
        [System.ComponentModel.DataAnnotations.Required, System.ComponentModel.DataAnnotations.StringLength(20)]
        public string MaMonHoc { get; set; } = null!;
        [System.ComponentModel.DataAnnotations.Required, System.ComponentModel.DataAnnotations.StringLength(20)]
        public string LoaiHocPhan { get; set; } = null!;
    }
}