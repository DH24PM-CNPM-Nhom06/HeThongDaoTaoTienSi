using System.ComponentModel.DataAnnotations;
using System.Data;
using MySqlConnector;
using DTMS.Api.Helpers;
using DTMS.Api.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace DTMS.Api.Controllers
{
    // Bảng điểm học phần.
    // Đọc: NCS xem của mình; NHD xem NCS mình hướng dẫn; ADMIN, PDT, TBM xem tất cả.
    // Nhập điểm: ADMIN, PDT, TBM và NHD (chỉ với NCS mình hướng dẫn). Điểm tổng kết và điểm chữ được tính tự động.
    // Khóa bảng điểm: khi đã khóa, không ai sửa được cho đến khi PDT hoặc ADMIN mở khóa.
    [Route("api/[controller]")]
    [ApiController]
    [Authorize(Roles = "ADMIN,PDT,TBM,NHD,NCS")]
    public class KetquahocphansController : ControllerBase
    {
        private readonly DtmsDbContext _context;

        public KetquahocphansController(DtmsDbContext context)
        {
            _context = context;
        }

        // GET: api/Ketquahocphans
        [HttpGet]
        public async Task<IActionResult> GetKetquahocphans()
        {
            var query = _context.Ketquahocphans.AsQueryable();

            var readable = await Access.ReadableNcsAsync(_context, User);
            if (readable != null)
            {
                query = query.Where(kq => readable.Contains(kq.MaNcs));
            }

            var ds = await query
                .Select(kq => new KetQuaDto
                {
                    MaKetQua = kq.MaKetQua,
                    MaNcs = kq.MaNcs,
                    MaMonHoc = kq.MaMonHoc,
                    DiemChuyenCan = kq.DiemChuyenCan,
                    DiemGiuaKy = kq.DiemGiuaKy,
                    DiemThiCuoiKy = kq.DiemThiCuoiKy,
                    DiemTongKet = kq.DiemTongKet,
                    DiemChu = kq.DiemChu,
                    DiemHe4 = kq.DiemHe4,
                    TrangThaiKhoa = kq.TrangThaiKhoa
                })
                .ToListAsync();

            return Ok(ds);
        }

        // GET: api/Ketquahocphans/5
        [HttpGet("{maketqua:int}")]
        public async Task<ActionResult<KetQuaDto>> GetKetquahocphan(int maketqua)
        {
            var kq = await _context.Ketquahocphans
                .Where(x => x.MaKetQua == maketqua)
                .Select(x => new KetQuaDto
                {
                    MaKetQua = x.MaKetQua,
                    MaNcs = x.MaNcs,
                    MaMonHoc = x.MaMonHoc,
                    DiemChuyenCan = x.DiemChuyenCan,
                    DiemGiuaKy = x.DiemGiuaKy,
                    DiemThiCuoiKy = x.DiemThiCuoiKy,
                    DiemTongKet = x.DiemTongKet,
                    DiemChu = x.DiemChu,
                    DiemHe4 = x.DiemHe4,
                    TrangThaiKhoa = x.TrangThaiKhoa
                })
                .FirstOrDefaultAsync();

            if (kq == null) return NotFound();

            if (!await Access.CanReadNcsAsync(_context, User, kq.MaNcs)) return NotFound();

            return Ok(kq);
        }

        // POST: api/Ketquahocphans (nhập điểm mới)
        [HttpPost]
        [Authorize(Roles = "ADMIN,PDT,TBM,NHD")]
        public async Task<IActionResult> PostKetquahocphan([FromBody] NhapDiemRequest dto)
        {
            if (!await Access.CanWriteNcsAsync(_context, User, dto.MaNcs)) return Forbid();

            try
            {
                await using var tx = await _context.Database.BeginTransactionAsync(IsolationLevel.ReadCommitted);
                // Tuần tự hóa POST điểm của cùng NCS để không tạo 2 điểm cho cùng môn.
                if (!await HocPhanRules.KhoaNcsAsync(_context, tx, dto.MaNcs))
                    return BadRequest(new { Success = false, Message = "Nghiên cứu sinh không tồn tại." });

                if (!await _context.Monhocs.AnyAsync(m => m.MaMonHoc == dto.MaMonHoc))
                    return BadRequest(new { Success = false, Message = "Môn học không tồn tại." });

                if (await _context.Ketquahocphans.AnyAsync(k => k.MaNcs == dto.MaNcs && k.MaMonHoc == dto.MaMonHoc))
                    return Conflict(new { Success = false, Message = "NCS này đã có điểm cho môn học này. Hãy sửa bản ghi hiện có." });

                var kq = new Ketquahocphan
                {
                    MaNcs = dto.MaNcs,
                    MaMonHoc = dto.MaMonHoc,
                    TrangThaiKhoa = false
                };
                CapNhatDiem(kq, dto);
                _context.Ketquahocphans.Add(kq);
                await _context.SaveChangesAsync();
                await tx.CommitAsync();
                return CreatedAtAction(nameof(GetKetquahocphan), new { maketqua = kq.MaKetQua }, KetQuaDto.From(kq));
            }
            catch (MySqlException ex) when (ex.Number is 1205 or 1213)
            {
                return Conflict(new { Success = false, Message = "Dữ liệu đang được cập nhật đồng thời, vui lòng thử lại." });
            }
        }

        // PUT: api/Ketquahocphans/5  (sửa điểm khi bảng điểm chưa khóa)
        [HttpPut("{maketqua:int}")]
        [Authorize(Roles = "ADMIN,PDT,TBM,NHD")]
        public async Task<IActionResult> PutKetquahocphan(int maketqua, [FromBody] NhapDiemRequest dto)
        {
            var kq = await _context.Ketquahocphans.FindAsync(maketqua);
            if (kq == null) return NotFound();

            if (!await Access.CanWriteNcsAsync(_context, User, kq.MaNcs)) return Forbid();

            if (kq.TrangThaiKhoa)
            {
                return Conflict(new { Success = false, Message = "Bảng điểm đã khóa. Cần PDT hoặc ADMIN mở khóa trước khi sửa." });
            }

            // PUT chỉ cập nhật điểm; không chấp nhận request mang định danh của hồ sơ khác.
            if (!string.Equals(dto.MaNcs, kq.MaNcs, StringComparison.Ordinal) ||
                !string.Equals(dto.MaMonHoc, kq.MaMonHoc, StringComparison.Ordinal))
            {
                return BadRequest(new { Success = false, Message = "Mã NCS và mã môn học không được thay đổi khi cập nhật điểm." });
            }

            CapNhatDiem(kq, dto);
            await _context.SaveChangesAsync();

            return Ok(KetQuaDto.From(kq));
        }

        // PUT: api/Ketquahocphans/5/khoa  (khóa bảng điểm sau khi đã nhập đủ)
        [HttpPut("{maketqua:int}/khoa")]
        [Authorize(Roles = "ADMIN,PDT,TBM,NHD")]
        public async Task<IActionResult> KhoaBangDiem(int maketqua)
        {
            var kq = await _context.Ketquahocphans.FindAsync(maketqua);
            if (kq == null) return NotFound();

            if (!await Access.CanWriteNcsAsync(_context, User, kq.MaNcs)) return Forbid();

            if (kq.DiemTongKet == null)
            {
                return Conflict(new { Success = false, Message = "Chưa có điểm tổng kết, không thể khóa." });
            }

            kq.TrangThaiKhoa = true;
            await _context.SaveChangesAsync();

            return Ok(new { Success = true, Message = "Đã khóa bảng điểm và công bố kết quả." });
        }

        // PUT: api/Ketquahocphans/5/mo-khoa  (chỉ PDT, ADMIN)
        [HttpPut("{maketqua:int}/mo-khoa")]
        [Authorize(Roles = "ADMIN,PDT")]
        public async Task<IActionResult> MoKhoaBangDiem(int maketqua)
        {
            var kq = await _context.Ketquahocphans.FindAsync(maketqua);
            if (kq == null) return NotFound();

            kq.TrangThaiKhoa = false;
            await _context.SaveChangesAsync();

            return Ok(new { Success = true, Message = "Đã mở khóa bảng điểm." });
        }

        // DELETE: api/Ketquahocphans/5  (chỉ ADMIN, PDT, và chưa khóa)
        [HttpDelete("{maketqua:int}")]
        [Authorize(Roles = "ADMIN,PDT")]
        public async Task<IActionResult> DeleteKetquahocphan(int maketqua)
        {
            var kq = await _context.Ketquahocphans.FindAsync(maketqua);
            if (kq == null) return NotFound();

            if (kq.TrangThaiKhoa)
            {
                return Conflict(new { Success = false, Message = "Bảng điểm đã khóa, cần mở khóa trước khi xóa." });
            }

            _context.Ketquahocphans.Remove(kq);
            await _context.SaveChangesAsync();
            return NoContent();
        }

        // Ghi điểm thành phần, tính điểm tổng kết và quy đổi
        private static void CapNhatDiem(Ketquahocphan kq, NhapDiemRequest dto)
        {
            kq.DiemChuyenCan = dto.DiemChuyenCan;
            kq.DiemGiuaKy = dto.DiemGiuaKy;
            kq.DiemThiCuoiKy = dto.DiemThiCuoiKy;
            kq.DiemThi = dto.DiemThiCuoiKy;

            var tong = GradeScale.TinhDiemTongKet(dto.DiemChuyenCan, dto.DiemGiuaKy, dto.DiemThiCuoiKy);
            var (chu, he4) = GradeScale.QuyDoi(tong);

            kq.DiemTongKet = tong;
            kq.DiemChu = chu;
            kq.DiemHe4 = he4;
            kq.TrangThaiDat = GradeScale.LaDat(chu);
        }
    }

    public class NhapDiemRequest
    {
        [Required, StringLength(20)]
        public string MaNcs { get; set; } = null!;

        [Required, StringLength(20)]
        public string MaMonHoc { get; set; } = null!;

        [Range(0, 10)]
        public float DiemChuyenCan { get; set; }

        [Range(0, 10)]
        public float DiemGiuaKy { get; set; }

        [Range(0, 10)]
        public float DiemThiCuoiKy { get; set; }
    }

    public class KetQuaDto
    {
        public int MaKetQua { get; set; }
        public string MaNcs { get; set; } = null!;
        public string MaMonHoc { get; set; } = null!;
        public float? DiemChuyenCan { get; set; }
        public float? DiemGiuaKy { get; set; }
        public float? DiemThiCuoiKy { get; set; }
        public float? DiemTongKet { get; set; }
        public string? DiemChu { get; set; }
        public float? DiemHe4 { get; set; }
        public bool TrangThaiKhoa { get; set; }

        public static KetQuaDto From(Ketquahocphan kq) => new KetQuaDto
        {
            MaKetQua = kq.MaKetQua,
            MaNcs = kq.MaNcs,
            MaMonHoc = kq.MaMonHoc,
            DiemChuyenCan = kq.DiemChuyenCan,
            DiemGiuaKy = kq.DiemGiuaKy,
            DiemThiCuoiKy = kq.DiemThiCuoiKy,
            DiemTongKet = kq.DiemTongKet,
            DiemChu = kq.DiemChu,
            DiemHe4 = kq.DiemHe4,
            TrangThaiKhoa = kq.TrangThaiKhoa
        };
    }
}