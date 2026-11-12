using System.Text.RegularExpressions;
using DTMS.Api.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace DTMS.Api.Controllers
{
    // Nhập danh sách NCS đã được công nhận chính thức theo lô (tài liệu mục 3.1, nhóm 1).
    // Tạo hồ sơ NCS và tài khoản đăng nhập vai trò NCS.
    // Kiểm tra toàn bộ trước; nếu có dòng lỗi thì không lưu dòng nào.
    [Route("api/[controller]")]
    [ApiController]
    [Authorize(Roles = "ADMIN,PDT")]
    public class NcsImportController : ControllerBase
    {
        private static readonly Regex MatKhauHopLe = new Regex(@"^(?=.*[A-Za-z])(?=.*\d).{8,}$");

        private readonly DtmsDbContext _context;
        private readonly ILogger<NcsImportController> _logger;

        public NcsImportController(DtmsDbContext context, ILogger<NcsImportController> logger)
        {
            _context = context;
            _logger = logger;
        }

        // POST: api/NcsImport
        [HttpPost]
        public async Task<IActionResult> Nhap([FromBody] List<NcsNhapRequest> ds)
        {
            if (ds == null || ds.Count == 0)
            {
                return BadRequest(new { Success = false, Message = "Danh sách trống." });
            }

            var loi = new List<object>();
            var maNcsTrongLo = new HashSet<string>(StringComparer.OrdinalIgnoreCase);
            var tenDnTrongLo = new HashSet<string>(StringComparer.OrdinalIgnoreCase);
            var emailTrongLo = new HashSet<string>(StringComparer.OrdinalIgnoreCase);

            var maNganhs = await _context.Nganhdaotaos.Select(n => n.MaNganh).ToListAsync();
            var maNcsDaCo = await _context.Nghiencuusinhs.Select(n => n.MaNcs).ToListAsync();
            var tenDnDaCo = await _context.Nguoidungs.Select(u => u.TenDangNhap).ToListAsync();
            var emailDaCo = await _context.Nguoidungs.Select(u => u.Email).ToListAsync();

            for (int i = 0; i < ds.Count; i++)
            {
                var r = ds[i];
                var dong = i + 1;

                void Loi(string noiDung) => loi.Add(new { Dong = dong, MaNcs = r.MaNcs, LoiNoiDung = noiDung });

                if (string.IsNullOrWhiteSpace(r.MaNcs)) Loi("Thiếu mã NCS.");
                if (string.IsNullOrWhiteSpace(r.HoTen)) Loi("Thiếu họ tên.");
                if (string.IsNullOrWhiteSpace(r.TenDangNhap)) Loi("Thiếu tên đăng nhập.");
                if (string.IsNullOrWhiteSpace(r.Email)) Loi("Thiếu email.");
                if (string.IsNullOrWhiteSpace(r.SoQdTrungTuyen)) Loi("Thiếu số quyết định trúng tuyển.");
                if (!maNganhs.Contains(r.MaNganh)) Loi("Ngành không tồn tại.");
                if (r.DoiTuongDauVao != 1 && r.DoiTuongDauVao != 2) Loi("Đối tượng đầu vào chỉ nhận 1 hoặc 2.");
                if (r.NgaySinh == default || r.NgayNhapHoc == default || r.NgayHetHanChuan == default || r.NgayHetHanToiDa == default)
                    Loi("Thiếu ngày sinh, ngày nhập học hoặc hạn đào tạo.");
                if (string.IsNullOrEmpty(r.MatKhauTam) || !MatKhauHopLe.IsMatch(r.MatKhauTam))
                    Loi("Mật khẩu tạm phải có ít nhất 8 ký tự, gồm chữ và số.");

                if (!string.IsNullOrWhiteSpace(r.MaNcs))
                {
                    if (maNcsDaCo.Contains(r.MaNcs, StringComparer.OrdinalIgnoreCase)) Loi("Mã NCS đã tồn tại.");
                    if (!maNcsTrongLo.Add(r.MaNcs)) Loi("Mã NCS bị trùng trong danh sách.");
                }
                if (!string.IsNullOrWhiteSpace(r.TenDangNhap))
                {
                    if (tenDnDaCo.Contains(r.TenDangNhap, StringComparer.OrdinalIgnoreCase)) Loi("Tên đăng nhập đã tồn tại.");
                    if (!tenDnTrongLo.Add(r.TenDangNhap)) Loi("Tên đăng nhập bị trùng trong danh sách.");
                }
                if (!string.IsNullOrWhiteSpace(r.Email))
                {
                    if (emailDaCo.Contains(r.Email, StringComparer.OrdinalIgnoreCase)) Loi("Email đã được sử dụng.");
                    if (!emailTrongLo.Add(r.Email)) Loi("Email bị trùng trong danh sách.");
                }
            }

            if (loi.Count > 0)
            {
                return BadRequest(new { Success = false, Message = $"Có {loi.Count} dòng lỗi. Chưa lưu dòng nào.", Loi = loi });
            }

            var vaiTroNcs = await _context.Vaitros.FirstAsync(v => v.MaVaiTro == "NCS");

            await using var giaoDich = await _context.Database.BeginTransactionAsync();
            foreach (var r in ds)
            {
                var nd = new Nguoidung
                {
                    TenDangNhap = r.TenDangNhap.Trim(),
                    Email = r.Email.Trim(),
                    MatKhauHash = BCrypt.Net.BCrypt.HashPassword(r.MatKhauTam),
                    LaHoatDong = true,
                    NgayTao = DateTime.Now
                };
                nd.MaVaiTros.Add(vaiTroNcs);
                _context.Nguoidungs.Add(nd);
                await _context.SaveChangesAsync();

                _context.Nghiencuusinhs.Add(new Nghiencuusinh
                {
                    MaNcs = r.MaNcs.Trim(),
                    MaNguoiDung = nd.MaNguoiDung,
                    HoTen = r.HoTen.Trim(),
                    NgaySinh = r.NgaySinh,
                    GioiTinh = r.GioiTinh,
                    MaNganh = r.MaNganh,
                    DoiTuongDauVao = r.DoiTuongDauVao,
                    SoQdtrungTuyen = r.SoQdTrungTuyen.Trim(),
                    NgayNhapHoc = r.NgayNhapHoc,
                    NgayHetHanChuan = r.NgayHetHanChuan,
                    NgayHetHanToiDa = r.NgayHetHanToiDa,
                    TrangThaiHocVu = 1
                });
                await _context.SaveChangesAsync();
            }
            await giaoDich.CommitAsync();

            _logger.LogInformation("Đã nhập {So} NCS mới.", ds.Count);
            return Ok(new { Success = true, Message = $"Đã nhập {ds.Count} nghiên cứu sinh.", SoLuong = ds.Count });
        }
    }

    public class NcsNhapRequest
    {
        public string MaNcs { get; set; } = null!;
        public string HoTen { get; set; } = null!;
        public DateOnly NgaySinh { get; set; }
        public bool GioiTinh { get; set; }
        public string MaNganh { get; set; } = null!;
        public sbyte DoiTuongDauVao { get; set; }
        public string SoQdTrungTuyen { get; set; } = null!;
        public DateOnly NgayNhapHoc { get; set; }
        public DateOnly NgayHetHanChuan { get; set; }
        public DateOnly NgayHetHanToiDa { get; set; }
        public string TenDangNhap { get; set; } = null!;
        public string Email { get; set; } = null!;
        public string MatKhauTam { get; set; } = null!;
    }
}