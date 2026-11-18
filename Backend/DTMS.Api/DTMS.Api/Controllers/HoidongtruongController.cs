using DTMS.Api.Helpers;
using DTMS.Api.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MySqlConnector;
using System.ComponentModel.DataAnnotations;

namespace DTMS.Api.Controllers
{
    // Bỏ phiếu kín. Tất cả thao tác sửa thành viên và bỏ phiếu khóa hàng hội đồng
    // trong transaction để tránh ghi đè hoặc tổng hợp thiếu khi các request đến đồng thời.
    [Route("api/[controller]")]
    [ApiController]
    [Authorize(Roles = "ADMIN,PDT,NHD,TBM,KHOA,BGH,PBDL,NCS")]
    public class HoidongtruongController : ControllerBase
    {
        private readonly DtmsDbContext _context;
        private readonly IConfiguration _configuration;

        public HoidongtruongController(DtmsDbContext context, IConfiguration configuration)
        {
            _context = context;
            _configuration = configuration;
        }

        [HttpGet("{maHoiDong:int}/kiem-tra")]
        [Authorize(Roles = "ADMIN,PDT")]
        public async Task<IActionResult> KiemTraThanhPhan(int maHoiDong)
        {
            var hd = await _context.Hoidongdanhgia.FindAsync(maHoiDong);
            if (hd == null || hd.LoaiHoiDong != LoaiTruong()) return NotFound();
            var loi = await LoiThanhPhanAsync(maHoiDong);
            return Ok(new { HopLe = loi.Count == 0, Loi = loi });
        }

        [HttpPost("{maHoiDong:int}/bo-phieu")]
        [Authorize(Roles = "PBDL,NHD,TBM,KHOA,BGH,ADMIN,PDT")]
        public async Task<IActionResult> BoPhieu(int maHoiDong, [FromBody] BoPhieuRequest dto)
        {
            if (dto.DongY == null)
                return BadRequest(new { Success = false, Message = "Phải chọn đồng ý hoặc không đồng ý." });

            var maGv = await Access.CurrentGvAsync(_context, User);
            if (maGv == null) return Forbid();

            await using var tx = await _context.Database.BeginTransactionAsync();
            if (!await HoiDongLock.AcquireAsync(_context, maHoiDong)) return NotFound();

            var hd = await _context.Hoidongdanhgia.FindAsync(maHoiDong);
            if (hd == null || hd.LoaiHoiDong != LoaiTruong()) return NotFound();

            var laThanhVien = await _context.Thanhvienhoidongs.AnyAsync(tv =>
                tv.MaHoiDong == maHoiDong && tv.MaGv == maGv);
            if (!laThanhVien) return Forbid();

            var loi = await LoiThanhPhanAsync(maHoiDong);
            if (loi.Count > 0)
                return Conflict(new { Success = false, Message = "Hội đồng chưa hợp lệ: " + string.Join(" ", loi) });

            if (hd.TongSoPhieu != null || hd.SoPhieuTanThanh != null)
                return Conflict(new { Success = false, Message = "Hội đồng đã tổng hợp kết quả, không nhận phiếu mới." });

            if (await _context.PhieuBoPhieus.AnyAsync(p => p.MaHoiDong == maHoiDong && p.MaGv == maGv))
                return Conflict(new { Success = false, Message = "Bạn đã bỏ phiếu cho hội đồng này." });

            _context.PhieuBoPhieus.Add(new PhieuBoPhieu
            {
                MaHoiDong = maHoiDong,
                MaGv = maGv,
                LaDongY = (sbyte)(dto.DongY.Value ? 1 : 0),
                NgayBo = DateTime.Now
            });

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateException ex) when (ex.InnerException is MySqlException { Number: 1062 })
            {
                return Conflict(new { Success = false, Message = "Bạn đã bỏ phiếu cho hội đồng này." });
            }

            var soThanhVien = await _context.Thanhvienhoidongs.CountAsync(tv => tv.MaHoiDong == maHoiDong);
            var phieu = await _context.PhieuBoPhieus.Where(p => p.MaHoiDong == maHoiDong).ToListAsync();
            if (phieu.Count == soThanhVien)
            {
                int dongY = phieu.Count(p => p.LaDongY == 1);
                int tyLeDat = _configuration.GetValue<int>("Bophieu:TyLeDat", 50);
                bool dat = dongY * 100 >= tyLeDat * soThanhVien;

                hd.SoPhieuTanThanh = dongY;
                hd.TongSoPhieu = soThanhVien;
                hd.KetLuan = (sbyte)(dat ? 1 : 0);
                await _context.SaveChangesAsync();
            }

            await tx.CommitAsync();
            return Ok(new { Success = true, Message = "Đã ghi nhận phiếu bỏ kín của bạn." });
        }

        [HttpGet("{maHoiDong:int}/ket-qua")]
        [Authorize(Roles = "ADMIN,PDT")]
        public async Task<IActionResult> KetQua(int maHoiDong)
        {
            var hd = await _context.Hoidongdanhgia.FindAsync(maHoiDong);
            if (hd == null || hd.LoaiHoiDong != LoaiTruong()) return NotFound();

            var soThanhVien = await _context.Thanhvienhoidongs.CountAsync(tv => tv.MaHoiDong == maHoiDong);
            var daBo = await _context.PhieuBoPhieus.CountAsync(p => p.MaHoiDong == maHoiDong);
            if (soThanhVien == 0 || daBo < soThanhVien || hd.TongSoPhieu == null)
                return Ok(new { DaBoPhieu = daBo, TongThanhVien = soThanhVien, Message = "Chưa đủ phiếu, chưa có kết quả." });

            return Ok(new
            {
                DaBoPhieu = daBo,
                TongThanhVien = soThanhVien,
                SoPhieuTanThanh = hd.SoPhieuTanThanh,
                KetLuan = hd.KetLuan == 1 ? "ĐẠT" : "KHÔNG ĐẠT"
            });
        }

        private async Task<List<string>> LoiThanhPhanAsync(int maHoiDong)
        {
            var loi = new List<string>();
            int soCan = _configuration.GetValue<int>("Hoidong:SoThanhVienTruong", 5);
            int ngoaiToiThieu = _configuration.GetValue<int>("Hoidong:SoNgoaiTruongToiThieu", 2);

            var hd = await _context.Hoidongdanhgia.FindAsync(maHoiDong);
            if (hd == null) return new List<string> { "Hội đồng không tồn tại." };

            var thanhVien = await _context.Thanhvienhoidongs
                .Where(tv => tv.MaHoiDong == maHoiDong)
                .Select(tv => tv.MaGv)
                .ToListAsync();
            if (thanhVien.Count != soCan)
                loi.Add($"Cần đúng {soCan} thành viên (hiện có {thanhVien.Count}).");

            int soNgoai = await _context.Giangviens.CountAsync(g => thanhVien.Contains(g.MaGv) && g.LaCanBoNgoaiTruong == true);
            if (soNgoai < ngoaiToiThieu)
                loi.Add($"Cần tối thiểu {ngoaiToiThieu} thành viên ngoài trường (hiện có {soNgoai}).");

            var nhd = await _context.Phanconghuongdans
                .Where(pc => pc.MaNcs == hd.MaNcs && pc.TrangThai != false)
                .Select(pc => pc.MaGv)
                .ToListAsync();
            if (thanhVien.Any(g => nhd.Contains(g)))
                loi.Add("Người hướng dẫn không được là thành viên hội đồng.");

            return loi;
        }

        private sbyte LoaiTruong() => (sbyte)_configuration.GetValue<int>("Hoidong:LoaiTruong", 0);
    }

    public class BoPhieuRequest
    {
        [Required]
        public bool? DongY { get; set; }
    }
}
