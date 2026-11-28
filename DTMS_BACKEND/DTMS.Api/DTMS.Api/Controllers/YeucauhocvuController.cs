using System.ComponentModel.DataAnnotations;
using System.Security.Claims;
using DTMS.Api.Helpers;
using DTMS.Api.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace DTMS.Api.Controllers
{
    // Yêu cầu học vụ (tài liệu mục 3.8): đổi người hướng dẫn, đổi tên đề tài, gia hạn, tạm dừng.
    // Mỗi loại có chuỗi duyệt riêng. Bước sau chỉ mở khi bước trước đã đồng ý.
    // Khi duyệt xong, yêu cầu chuyển sang DA_DUYET. Cán bộ đào tạo áp dụng kết quả
    // bằng các API hiện có (phân công, đề tài, hồ sơ NCS).
    [Route("api/[controller]")]
    [ApiController]
    [Authorize(Roles = "NCS,NHD,TBM,KHOA,PDT,ADMIN,BGH")]
    public class YeucauhocvuController : ControllerBase
    {
        private static readonly Dictionary<string, string[]> ChuoiDuyet = new()
        {
            ["DOI_NHD"] = new[] { "NHD_CU", "NHD_MOI", "TBM", "KHOA", "BGH" },
            ["DOI_TEN_DE_TAI"] = new[] { "NHD", "TBM", "PDT", "BGH" },
            ["GIA_HAN"] = new[] { "PDT", "BGH" },
            ["TAM_DUNG"] = new[] { "PDT" },
        };

        private readonly DtmsDbContext _context;

        public YeucauhocvuController(DtmsDbContext context)
        {
            _context = context;
        }

        // POST: api/Yeucauhocvu  (NCS gửi yêu cầu)
        [HttpPost]
        [Authorize(Roles = "NCS")]
        public async Task<IActionResult> TaoYeuCau([FromBody] TaoYeuCauRequest dto)
        {
            var maNcs = await Access.CurrentNcsAsync(_context, User);
            if (maNcs == null) return Forbid();

            var loai = (dto.LoaiYeuCau ?? string.Empty).Trim().ToUpperInvariant();
            if (!ChuoiDuyet.ContainsKey(loai))
            {
                return BadRequest(new { Success = false, Message = "Loại yêu cầu không hợp lệ (DOI_NHD, DOI_TEN_DE_TAI, GIA_HAN, TAM_DUNG)." });
            }

            if (string.IsNullOrWhiteSpace(dto.NoiDung))
            {
                return BadRequest(new { Success = false, Message = "Vui lòng nhập nội dung yêu cầu." });
            }

            string? maGvMoi = null;
            if (loai == "DOI_NHD")
            {
                if (string.IsNullOrWhiteSpace(dto.MaGvMoi))
                {
                    return BadRequest(new { Success = false, Message = "Vui lòng chọn người hướng dẫn mới." });
                }

                if (!await _context.Giangviens.AnyAsync(g => g.MaGv == dto.MaGvMoi))
                {
                    return BadRequest(new { Success = false, Message = "Giảng viên được đề xuất không tồn tại." });
                }

                var homNay = DateOnly.FromDateTime(DateTime.Today);
                bool daHuongDan = await _context.Phanconghuongdans.AnyAsync(pc =>
                    pc.MaNcs == maNcs && pc.MaGv == dto.MaGvMoi && pc.TrangThai != false
                    && (pc.NgayKetThuc == null || pc.NgayKetThuc >= homNay));
                if (daHuongDan)
                {
                    return BadRequest(new { Success = false, Message = "Giảng viên này đã là người hướng dẫn của bạn." });
                }

                maGvMoi = dto.MaGvMoi;
            }

            if (loai == "GIA_HAN")
            {
                if (dto.SoThangGiaHan == null || dto.SoThangGiaHan < 6 || dto.SoThangGiaHan > 12)
                {
                    return BadRequest(new { Success = false, Message = "Thời gian gia hạn phải từ 6 đến 12 tháng." });
                }
            }

            var yc = new YeucauHocvu
            {
                MaNcs = maNcs,
                LoaiYeuCau = loai,
                NoiDung = dto.NoiDung.Trim(),
                LyDo = string.IsNullOrWhiteSpace(dto.LyDo) ? null : dto.LyDo.Trim(),
                MaGvMoi = maGvMoi,
                SoThangGiaHan = loai == "GIA_HAN" ? dto.SoThangGiaHan : null,
                TrangThai = "CHO_DUYET",
                NgayTao = DateTime.Now
            };
            // Lưu yêu cầu và toàn bộ bước duyệt trong một giao dịch:
            // nếu lưu bất kỳ bước nào thất bại thì không để lại yêu cầu mồ côi.
            await using var giaoDich = await _context.Database.BeginTransactionAsync();
            _context.YeucauHocvus.Add(yc);
            await _context.SaveChangesAsync();

            int thu = 1;
            foreach (var vaiTro in ChuoiDuyet[loai])
            {
                _context.YeucauHocvuBuocs.Add(new YeucauHocvuBuoc
                {
                    MaYeuCau = yc.MaYeuCau,
                    VaiTro = vaiTro,
                    Thu = thu++,
                    TrangThai = 0
                });
            }
            await _context.SaveChangesAsync();
            await giaoDich.CommitAsync();

            return Ok(new { Success = true, Message = "Đã gửi yêu cầu.", MaYeuCau = yc.MaYeuCau });
        }

        // GET: api/Yeucauhocvu  (danh sách theo phạm vi xem)
        [HttpGet]
        public async Task<IActionResult> DanhSach()
        {
            var query = _context.YeucauHocvus.AsQueryable();

            var readable = await Access.ReadableNcsAsync(_context, User);
            if (readable != null)
            {
                var maGv = await Access.CurrentGvAsync(_context, User);
                query = query.Where(y => readable.Contains(y.MaNcs) || (maGv != null && y.MaGvMoi == maGv));
            }

            var ds = await query.OrderByDescending(y => y.NgayTao).ToListAsync();
            return Ok(ds);
        }

        // GET: api/Yeucauhocvu/5  (chi tiết kèm các bước duyệt)
        [HttpGet("{id:int}")]
        public async Task<IActionResult> ChiTiet(int id)
        {
            var yc = await _context.YeucauHocvus.FindAsync(id);
            if (yc == null) return NotFound();

            var maGv = await Access.CurrentGvAsync(_context, User);
            bool duocXem = await Access.CanReadNcsAsync(_context, User, yc.MaNcs)
                           || (maGv != null && yc.MaGvMoi == maGv);
            if (!duocXem) return NotFound();

            var buoc = await _context.YeucauHocvuBuocs
                .Where(b => b.MaYeuCau == id)
                .OrderBy(b => b.Thu)
                .ToListAsync();

            return Ok(new { YeuCau = yc, BuocDuyet = buoc });
        }

        // PUT: api/Yeucauhocvu/5/duyet  (người có vai trò ở bước hiện tại duyệt hoặc từ chối)
        [HttpPut("{id:int}/duyet")]
        [Authorize(Roles = "NHD,TBM,KHOA,PDT,ADMIN,BGH")]
        public async Task<IActionResult> Duyet(int id, [FromBody] DuyetYeuCauRequest dto)
        {
            if (dto.TrangThai != 1 && dto.TrangThai != -1)
            {
                return BadRequest(new { Success = false, Message = "Trạng thái chỉ nhận 1 (đồng ý) hoặc -1 (từ chối)." });
            }

            var yc = await _context.YeucauHocvus.FindAsync(id);
            if (yc == null) return NotFound();

            if (yc.TrangThai != "CHO_DUYET")
            {
                return Conflict(new { Success = false, Message = "Yêu cầu đã kết thúc, không thể duyệt thêm." });
            }

            var buoc = await _context.YeucauHocvuBuocs
                .Where(b => b.MaYeuCau == id && b.TrangThai == 0)
                .OrderBy(b => b.Thu)
                .FirstOrDefaultAsync();
            if (buoc == null)
            {
                return Conflict(new { Success = false, Message = "Không còn bước duyệt nào." });
            }

            if (!await DuocDuyetBuocAsync(buoc.VaiTro, yc.MaNcs, yc.MaGvMoi, User))
            {
                return Forbid();
            }

            buoc.TrangThai = (sbyte)dto.TrangThai;
            buoc.NguoiDuyet = User.FindFirst(ClaimTypes.Name)?.Value;
            buoc.NgayDuyet = DateTime.Now;
            buoc.YKien = dto.YKien;

            if (dto.TrangThai == -1)
            {
                yc.TrangThai = "TU_CHOI";
                yc.NgayKetThuc = DateTime.Now;
            }
            else
            {
                // Bước hiện tại đã chuyển trạng thái trong DbContext nhưng chưa SaveChanges;
                // truy vấn SQL vẫn thấy trạng thái cũ là 0. Phải loại chính bước này.
                bool conBuoc = await _context.YeucauHocvuBuocs.AnyAsync(b =>
                    b.MaYeuCau == id && b.MaBuoc != buoc.MaBuoc && b.TrangThai == 0);
                if (!conBuoc)
                {
                    yc.TrangThai = "DA_DUYET";
                    yc.NgayKetThuc = DateTime.Now;
                }
            }

            await _context.SaveChangesAsync();

            return Ok(new
            {
                Success = true,
                Message = yc.TrangThai switch
                {
                    "DA_DUYET" => "Yêu cầu đã được duyệt đầy đủ. Cán bộ đào tạo áp dụng kết quả.",
                    "TU_CHOI" => "Yêu cầu đã bị từ chối.",
                    _ => "Đã ghi nhận ý kiến, chuyển sang bước tiếp theo."
                },
                TrangThai = yc.TrangThai
            });
        }

        // Kiểm tra người gọi có đúng vai trò của bước hiện tại không
        private async Task<bool> DuocDuyetBuocAsync(string buoc, string maNcs, string? maGvMoi, ClaimsPrincipal user)
        {
            switch (buoc)
            {
                case "NHD_CU":
                case "NHD":
                    return await Access.SupervisesAsync(_context, user, maNcs);

                case "NHD_MOI":
                    var maGv = await Access.CurrentGvAsync(_context, user);
                    return maGv != null && maGv == maGvMoi;

                case "TBM":
                    return user.IsInRole("TBM") && (await Access.NcsTrongPhamViAsync(_context, user)).Contains(maNcs);

                case "KHOA":
                    return user.IsInRole("KHOA") && (await Access.NcsTrongPhamViAsync(_context, user)).Contains(maNcs);

                case "PDT":
                    return user.IsInRole("PDT") || user.IsInRole("ADMIN");

                case "BGH":
                    return user.IsInRole("BGH");

                default:
                    return false;
            }
        }
    }

    public class TaoYeuCauRequest
    {
        [Required]
        public string LoaiYeuCau { get; set; } = null!;

        [Required]
        public string NoiDung { get; set; } = null!;

        public string? LyDo { get; set; }

        // Bắt buộc với DOI_NHD
        public string? MaGvMoi { get; set; }

        // Bắt buộc với GIA_HAN, từ 6 đến 12 tháng
        public int? SoThangGiaHan { get; set; }
    }

    public class DuyetYeuCauRequest
    {
        public int TrangThai { get; set; }   // 1: đồng ý, -1: từ chối
        public string? YKien { get; set; }
    }
}