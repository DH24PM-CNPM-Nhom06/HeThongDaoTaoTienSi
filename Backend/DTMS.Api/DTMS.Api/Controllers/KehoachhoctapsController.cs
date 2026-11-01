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
    [Authorize(Roles = "NCS,NHD,TBM,PDT,ADMIN")]
    public class KehoachhoctapsController : ControllerBase
    {
        private readonly DtmsDbContext _context;

        public KehoachhoctapsController(DtmsDbContext context)
        {
            _context = context;
        }

        // GET: api/Kehoachhoctaps
        // NCS: chỉ kế hoạch của mình. NHD: kế hoạch của NCS mình hướng dẫn. ADMIN/PDT/TBM: tất cả.
        [HttpGet]
        public async Task<IActionResult> GetKehoachhoctaps()
        {
            var query = _context.Kehoachhoctaps.AsQueryable();

            var readable = await Access.ReadableNcsAsync(_context, User);
            if (readable != null)
            {
                query = query.Where(k => readable.Contains(k.MaNcs));
            }

            var ds = await query
                .Select(k => new KehoachhoctapDto
                {
                    MaKeHoach = k.MaKeHoach,
                    MaNcs = k.MaNcs,
                    NamHoc = k.NamHoc,
                    HocKy = k.HocKy,
                    MaMonHoc = k.MaMonHoc,
                    NoiDungKeHoach = k.NoiDungKeHoach,
                    DuyetNhd = k.DuyetNhd,
                    YkienNhd = k.YkienNhd,
                    DuyetTbm = k.DuyetTbm,
                    DuyetPdt = k.DuyetPdt,
                    NgayCapNhat = k.NgayCapNhat
                })
                .OrderByDescending(k => k.NgayCapNhat)
                .ToListAsync();

            return Ok(new { Success = true, Data = ds });
        }

        // POST: api/Kehoachhoctaps  (NCS nộp kế hoạch cho chính mình; ADMIN/PDT nhập hộ)
        [HttpPost]
        [Authorize(Roles = "NCS,ADMIN,PDT")]
        public async Task<IActionResult> PostKehoachhoctap([FromBody] KehoachhoctapDto dto)
        {
            string? maNcs;
            if (User.IsInRole("ADMIN") || User.IsInRole("PDT"))
            {
                maNcs = dto.MaNcs;
            }
            else
            {
                // NCS luôn nộp cho chính mình, không tin mã gửi lên
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

            if (string.IsNullOrWhiteSpace(dto.NoiDungKeHoach))
            {
                return BadRequest(new { Success = false, Message = "Vui lòng nhập nội dung kế hoạch." });
            }

            if (!string.IsNullOrEmpty(dto.MaMonHoc) &&
                !await _context.Monhocs.AnyAsync(m => m.MaMonHoc == dto.MaMonHoc))
            {
                return BadRequest(new { Success = false, Message = "Môn học không tồn tại trong hệ thống." });
            }

            var keHoach = new Kehoachhoctap
            {
                MaNcs = maNcs,
                NamHoc = dto.NamHoc,
                HocKy = dto.HocKy,
                MaMonHoc = dto.MaMonHoc,
                NoiDungKeHoach = dto.NoiDungKeHoach,
                DuyetNhd = 0,   // 0 = chờ duyệt
                DuyetTbm = 0,
                DuyetPdt = 0,
                NgayCapNhat = DateTime.Now
            };

            _context.Kehoachhoctaps.Add(keHoach);
            await _context.SaveChangesAsync();

            return Ok(new { Success = true, Message = "Đăng ký kế hoạch học tập thành công.", Data = keHoach.MaKeHoach });
        }

        // PUT: api/Kehoachhoctaps/{id}  (NCS sửa kế hoạch của mình; ADMIN/PDT sửa bất kỳ)
        // NCS chỉ sửa được khi NHD chưa duyệt. Sửa xong kế hoạch được gửi lại từ đầu.
        [HttpPut("{id:int}")]
        [Authorize(Roles = "NCS,ADMIN,PDT")]
        public async Task<IActionResult> PutKehoachhoctap(int id, [FromBody] KehoachhoctapDto dto)
        {
            var kh = await _context.Kehoachhoctaps.FindAsync(id);
            if (kh == null) return NotFound(new { Success = false, Message = "Không tìm thấy kế hoạch." });

            bool laQuanTri = User.IsInRole("ADMIN") || User.IsInRole("PDT");
            if (!laQuanTri)
            {
                var own = await Access.CurrentNcsAsync(_context, User);
                if (own == null || kh.MaNcs != own) return NotFound();

                if (kh.DuyetNhd == 1)
                {
                    return Conflict(new { Success = false, Message = "Kế hoạch đã được NHD duyệt, không thể sửa." });
                }

                kh.DuyetNhd = 0;
                kh.DuyetTbm = 0;
                kh.DuyetPdt = 0;
                kh.YkienNhd = null;
            }

            if (string.IsNullOrWhiteSpace(dto.NoiDungKeHoach))
            {
                return BadRequest(new { Success = false, Message = "Vui lòng nhập nội dung kế hoạch." });
            }

            if (!string.IsNullOrEmpty(dto.MaMonHoc) &&
                !await _context.Monhocs.AnyAsync(m => m.MaMonHoc == dto.MaMonHoc))
            {
                return BadRequest(new { Success = false, Message = "Môn học không tồn tại trong hệ thống." });
            }

            kh.NamHoc = dto.NamHoc;
            kh.HocKy = dto.HocKy;
            kh.MaMonHoc = dto.MaMonHoc;
            kh.NoiDungKeHoach = dto.NoiDungKeHoach;
            kh.NgayCapNhat = DateTime.Now;

            await _context.SaveChangesAsync();
            return Ok(new { Success = true, Message = "Cập nhật kế hoạch thành công." });
        }

        // PUT: api/Kehoachhoctaps/{id}/duyet
        // Luồng tuần tự: NHD duyệt -> TBM duyệt -> PDT duyệt.
        // Body có trường "Cap" để chọn đúng cấp đang duyệt (một người có thể giữ nhiều vai trò).
        [HttpPut("{id:int}/duyet")]
        [Authorize(Roles = "NHD,TBM,PDT,ADMIN")]
        public async Task<IActionResult> DuyetKeHoach(int id, [FromBody] DuyetKeHoachDto dto)
        {
            var cap = (dto.Cap ?? string.Empty).Trim().ToUpperInvariant();
            if (cap != "NHD" && cap != "TBM" && cap != "PDT")
            {
                return BadRequest(new { Success = false, Message = "Cấp duyệt không hợp lệ (NHD, TBM, PDT)." });
            }

            if (dto.TrangThaiDuyet != 1 && dto.TrangThaiDuyet != -1)
            {
                return BadRequest(new { Success = false, Message = "Trạng thái duyệt chỉ nhận 1 (đồng ý) hoặc -1 (từ chối)." });
            }

            // Người gọi phải đang giữ đúng vai trò của cấp đó
            bool dungVaiTro = cap switch
            {
                "NHD" => User.IsInRole("NHD"),
                "TBM" => User.IsInRole("TBM"),
                _ => User.IsInRole("PDT") || User.IsInRole("ADMIN")
            };
            if (!dungVaiTro) return Forbid();

            var kh = await _context.Kehoachhoctaps.FindAsync(id);
            if (kh == null)
            {
                return NotFound(new { Success = false, Message = "Không tìm thấy kế hoạch." });
            }

            switch (cap)
            {
                case "NHD":
                    // Chỉ NHD của NCS này mới được duyệt
                    if (!await Access.SupervisesAsync(_context, User, kh.MaNcs)) return Forbid();

                    // Đã qua cấp Bộ môn thì không được đổi ý ở cấp NHD
                    if (DaQuyetDinh(kh.DuyetTbm))
                    {
                        return Conflict(new { Success = false, Message = "Kế hoạch đã qua cấp Bộ môn, NHD không thể thay đổi." });
                    }

                    kh.DuyetNhd = dto.TrangThaiDuyet;
                    kh.YkienNhd = dto.Ykien;
                    break;

                case "TBM":
                    if (kh.DuyetNhd != 1)
                    {
                        return Conflict(new { Success = false, Message = "Cần NHD duyệt trước khi Bộ môn duyệt." });
                    }

                    if (DaQuyetDinh(kh.DuyetPdt))
                    {
                        return Conflict(new { Success = false, Message = "Phòng Đào tạo đã quyết định, Bộ môn không thể thay đổi." });
                    }

                    kh.DuyetTbm = dto.TrangThaiDuyet;
                    break;

                case "PDT":
                    if (kh.DuyetTbm != 1)
                    {
                        return Conflict(new { Success = false, Message = "Cần Bộ môn duyệt trước khi Phòng Đào tạo duyệt." });
                    }

                    kh.DuyetPdt = dto.TrangThaiDuyet;
                    break;
            }

            kh.NgayCapNhat = DateTime.Now;
            await _context.SaveChangesAsync();

            return Ok(new
            {
                Success = true,
                Message = "Cập nhật trạng thái duyệt thành công.",
                TrangThai = new { kh.DuyetNhd, kh.DuyetTbm, kh.DuyetPdt }
            });
        }

        // DELETE: api/Kehoachhoctaps/5  (chỉ ADMIN, PDT)
        [HttpDelete("{id:int}")]
        [Authorize(Roles = "ADMIN,PDT")]
        public async Task<IActionResult> DeleteKehoachhoctap(int id)
        {
            var kh = await _context.Kehoachhoctaps.FindAsync(id);
            if (kh == null) return NotFound();

            _context.Kehoachhoctaps.Remove(kh);
            await _context.SaveChangesAsync();
            return NoContent();
        }

        // 1 = đồng ý, -1 = từ chối. null hoặc 0 = chưa quyết định.
        private static bool DaQuyetDinh(sbyte? trangThai) => trangThai == 1 || trangThai == -1;
    }

    public class DuyetKeHoachDto
    {
        public string Cap { get; set; } = null!;          // "NHD", "TBM" hoặc "PDT"
        public sbyte TrangThaiDuyet { get; set; }         // 1: đồng ý, -1: từ chối
        public string? Ykien { get; set; }                // chỉ dùng ở cấp NHD
    }
}