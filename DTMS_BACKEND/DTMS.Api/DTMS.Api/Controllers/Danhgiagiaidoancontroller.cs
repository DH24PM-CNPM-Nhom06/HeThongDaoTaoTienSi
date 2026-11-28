using DTMS.Api.Helpers;
using DTMS.Api.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace DTMS.Api.Controllers
{
    // Đánh giá các giai đoạn chuyên môn (tài liệu nhóm 3):
    // tiểu luận tổng quan (tiểu ban 3 thành viên), đề cương (hội đồng 5 thành viên),
    // chuyên đề tiến sĩ (tối đa 3 chuyên đề, mỗi chuyên đề 2 tín chỉ, tiểu ban 3 thành viên).
    // Kết luận: 0 không thông qua, 1 thông qua, 2 thông qua có chỉnh sửa.
    // NHD của NCS không được là thành viên hội đồng/tiểu ban đánh giá NCS đó.
    [Route("api/[controller]")]
    [ApiController]
    [Authorize(Roles = "ADMIN,PDT,TBM,NHD,KHOA,NCS,BGH")]
    public class DanhgiagiaidoanController : ControllerBase
    {
        private readonly DtmsDbContext _context;
        private readonly IConfiguration _configuration;

        public DanhgiagiaidoanController(DtmsDbContext context, IConfiguration configuration)
        {
            _context = context;
            _configuration = configuration;
        }

        // GET: api/Danhgiagiaidoan?maNcs=NCS01
        [HttpGet]
        public async Task<IActionResult> DanhSach([FromQuery] string? maNcs)
        {
            var query = _context.Danhgiahocthuats.AsQueryable();

            var readable = await Access.ReadableNcsAsync(_context, User);
            if (readable != null) query = query.Where(d => readable.Contains(d.MaNcs));
            if (!string.IsNullOrWhiteSpace(maNcs)) query = query.Where(d => d.MaNcs == maNcs);

            return Ok(await query.OrderBy(d => d.MaNcs).ThenBy(d => d.LoaiDanhGia).ToListAsync());
        }

        // POST: api/Danhgiagiaidoan  (ghi kết quả đánh giá một giai đoạn)
        [HttpPost]
        [Authorize(Roles = "ADMIN,PDT,TBM,KHOA,NHD")]
        public async Task<IActionResult> Ghi([FromBody] GhiDanhGiaRequest dto)
        {
            if (!LaLoaiHopLe(dto.LoaiDanhGia))
            {
                return BadRequest(new { Success = false, Message = "Loại đánh giá không hợp lệ (TIEU_LUAN, DE_CUONG, CHUYEN_DE)." });
            }

            var maLoai = _configuration.GetValue<int>($"Danhgia:Loai:{dto.LoaiDanhGia}", 0);
            if (maLoai == 0)
            {
                return StatusCode(500, new { Success = false, Message = "Chưa cấu hình mã loại đánh giá trong appsettings.json (Danhgia:Loai)." });
            }
            var loai = (sbyte)maLoai;

            if (dto.KetLuan < 0 || dto.KetLuan > 2)
            {
                return BadRequest(new { Success = false, Message = "Kết luận chỉ nhận 0 (không thông qua), 1 (thông qua), 2 (thông qua có chỉnh sửa)." });
            }

            if (!await Access.CanWriteNcsAsync(_context, User, dto.MaNcs)) return Forbid();

            if (!await _context.Nghiencuusinhs.AnyAsync(n => n.MaNcs == dto.MaNcs))
            {
                return BadRequest(new { Success = false, Message = "Nghiên cứu sinh không tồn tại." });
            }

            // Kiểm tra hội đồng/tiểu ban
            if (dto.MaHoiDong == null)
            {
                return BadRequest(new { Success = false, Message = "Thiếu mã hội đồng/tiểu ban." });
            }

            var hoiDong = await _context.Hoidongdanhgia.FindAsync(dto.MaHoiDong.Value);
            if (hoiDong == null)
            {
                return BadRequest(new { Success = false, Message = "Hội đồng/tiểu ban không tồn tại." });
            }

            if (hoiDong.LoaiHoiDong != loai)
            {
                return BadRequest(new { Success = false, Message = "Hội đồng không đúng loại đánh giá này." });
            }

            // Ngăn ghi đánh giá NCS A bằng hội đồng đã thành lập cho NCS B.
            if (hoiDong.MaNcs != dto.MaNcs)
            {
                return BadRequest(new { Success = false, Message = "Hội đồng không thuộc nghiên cứu sinh cần đánh giá." });
            }

            var loiThanhPhan = await KiemTraThanhPhanAsync(dto.MaNcs, dto.MaHoiDong.Value, dto.LoaiDanhGia);
            if (loiThanhPhan != null) return Conflict(new { Success = false, Message = loiThanhPhan });

            // Chuyên đề: tối đa số lượng cấu hình
            if (dto.LoaiDanhGia == "CHUYEN_DE")
            {
                var toiDa = _configuration.GetValue<int>("Danhgia:SoChuyenDeToiDa", 3);
                var soDaCo = await _context.Danhgiahocthuats.CountAsync(d => d.MaNcs == dto.MaNcs && d.LoaiDanhGia == loai);
                if (soDaCo >= toiDa)
                {
                    return Conflict(new { Success = false, Message = $"NCS đã đủ {toiDa} chuyên đề." });
                }
            }

            if (!StoredFileRules.ValidReference(dto.FileBienBan, dto.MaNcs, "bienban", _configuration))
                return BadRequest(new { Success = false, Message = "Đường dẫn tệp không hợp lệ, không thuộc NCS hoặc chưa được tải lên đúng mục đích." });

            var ghi = new Danhgiahocthuat
            {
                MaNcs = dto.MaNcs,
                LoaiDanhGia = loai,
                TenNoiDung = dto.TenNoiDung.Trim(),
                MaHoiDong = dto.MaHoiDong,
                DiemTrungBinh = dto.DiemTrungBinh,
                KetLuan = (sbyte)dto.KetLuan,
                FileBienBan = dto.FileBienBan
            };
            _context.Danhgiahocthuats.Add(ghi);
            await _context.SaveChangesAsync();

            return Ok(new { Success = true, Message = "Đã ghi kết quả đánh giá.", MaDanhGia = ghi.MaDanhGia });
        }

        // Thành phần: đúng số thành viên theo loại; NHD của NCS không có mặt trong hội đồng
        private async Task<string?> KiemTraThanhPhanAsync(string maNcs, int maHoiDong, string loaiDanhGia)
        {
            var soCanCo = _configuration.GetValue<int>($"Danhgia:SoThanhVien:{loaiDanhGia}", 0);
            var thanhVien = await _context.Thanhvienhoidongs
                .Where(tv => tv.MaHoiDong == maHoiDong)
                .Select(tv => tv.MaGv)
                .ToListAsync();

            if (thanhVien.Count != soCanCo)
            {
                return $"Hội đồng/tiểu ban phải có đúng {soCanCo} thành viên (hiện có {thanhVien.Count}).";
            }

            var nhdCuaNcs = await _context.Phanconghuongdans
                .Where(pc => pc.MaNcs == maNcs && pc.TrangThai != false)
                .Select(pc => pc.MaGv)
                .ToListAsync();

            if (thanhVien.Any(gv => nhdCuaNcs.Contains(gv)))
            {
                return "Người hướng dẫn của NCS không được là thành viên hội đồng/tiểu ban đánh giá NCS này.";
            }

            return null;
        }

        private bool LaLoaiHopLe(string loai) => loai == "TIEU_LUAN" || loai == "DE_CUONG" || loai == "CHUYEN_DE";
    }

    public class GhiDanhGiaRequest
    {
        public string MaNcs { get; set; } = null!;

        // TIEU_LUAN, DE_CUONG hoặc CHUYEN_DE
        public string LoaiDanhGia { get; set; } = null!;

        public string TenNoiDung { get; set; } = null!;

        public int? MaHoiDong { get; set; }

        public float? DiemTrungBinh { get; set; }

        // 0 không thông qua, 1 thông qua, 2 thông qua có chỉnh sửa
        public int KetLuan { get; set; }

        public string? FileBienBan { get; set; }
    }
}