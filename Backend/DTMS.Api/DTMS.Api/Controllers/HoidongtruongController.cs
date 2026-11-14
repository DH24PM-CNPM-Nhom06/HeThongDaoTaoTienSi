using DTMS.Api.Helpers;
using DTMS.Api.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace DTMS.Api.Controllers
{
    // Hội đồng đánh giá cấp Trường (tài liệu nhóm 6).
    // Thành phần: 5 thành viên, tối thiểu 2 thành viên ngoài trường (2/5).
    // NHD của NCS không được là thành viên. Bỏ phiếu kín: mỗi thành viên bỏ một lần,
    // chỉ PĐT/ADMIN xem kết quả tổng hợp, không xem phiếu của từng người.
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

        // GET: api/Hoidongtruong/5/kiem-tra  (kiểm tra thành phần hội đồng)
        [HttpGet("{maHoiDong:int}/kiem-tra")]
        [Authorize(Roles = "ADMIN,PDT")]
        public async Task<IActionResult> KiemTraThanhPhan(int maHoiDong)
        {
            var loi = await LoiThanhPhanAsync(maHoiDong);
            return Ok(new { HopLe = loi.Count == 0, Loi = loi });
        }

        // POST: api/Hoidongtruong/5/bo-phieu  (thành viên bỏ phiếu một lần)
        [HttpPost("{maHoiDong:int}/bo-phieu")]
        [Authorize(Roles = "PBDL,NHD,TBM,KHOA,BGH,ADMIN,PDT")]
        public async Task<IActionResult> BoPhieu(int maHoiDong, [FromBody] BoPhieuRequest dto)
        {
            var maGv = await Access.CurrentGvAsync(_context, User);
            if (maGv == null) return Forbid();

            var hd = await _context.Hoidongdanhgia.FindAsync(maHoiDong);
            if (hd == null || hd.LoaiHoiDong != LoaiTruong()) return NotFound();

            var laThanhVien = await _context.Thanhvienhoidongs.AnyAsync(tv => tv.MaHoiDong == maHoiDong && tv.MaGv == maGv);
            if (!laThanhVien) return Forbid();

            if (await Access.SupervisesAsync(_context, User, hd.MaNcs)) return Forbid();

            var loi = await LoiThanhPhanAsync(maHoiDong);
            if (loi.Count > 0)
            {
                return Conflict(new { Success = false, Message = "Hội đồng chưa đủ thành phần: " + string.Join(" ", loi) });
            }

            if (await _context.PhieuBoPhieus.AnyAsync(p => p.MaHoiDong == maHoiDong && p.MaGv == maGv))
            {
                return Conflict(new { Success = false, Message = "Bạn đã bỏ phiếu cho hội đồng này." });
            }

            _context.PhieuBoPhieus.Add(new PhieuBoPhieu
            {
                MaHoiDong = maHoiDong,
                MaGv = maGv,
                LaDongY = (sbyte)(dto.DongY ? 1 : 0),
                NgayBo = DateTime.Now
            });
            await _context.SaveChangesAsync();

            // Khi đủ phiếu thì tổng hợp kết quả vào hồ sơ hội đồng
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

            return Ok(new { Success = true, Message = "Đã ghi nhận phiếu bỏ kín của bạn." });
        }

        // GET: api/Hoidongtruong/5/ket-qua  (PĐT/ADMIN: chỉ tổng hợp, không có phiếu từng người)
        [HttpGet("{maHoiDong:int}/ket-qua")]
        [Authorize(Roles = "ADMIN,PDT")]
        public async Task<IActionResult> KetQua(int maHoiDong)
        {
            var hd = await _context.Hoidongdanhgia.FindAsync(maHoiDong);
            if (hd == null || hd.LoaiHoiDong != LoaiTruong()) return NotFound();

            var soThanhVien = await _context.Thanhvienhoidongs.CountAsync(tv => tv.MaHoiDong == maHoiDong);
            var daBo = await _context.PhieuBoPhieus.CountAsync(p => p.MaHoiDong == maHoiDong);

            if (soThanhVien == 0 || daBo < soThanhVien)
            {
                return Ok(new { DaBoPhieu = daBo, TongThanhVien = soThanhVien, Message = "Chưa đủ phiếu, chưa có kết quả." });
            }

            return Ok(new
            {
                DaBoPhieu = daBo,
                TongThanhVien = soThanhVien,
                SoPhieuTanThanh = hd.SoPhieuTanThanh,
                KetLuan = hd.KetLuan == 1 ? "ĐẠT" : "KHÔNG ĐẠT"
            });
        }

        // Lỗi thành phần: đúng số thành viên, đủ số thành viên ngoài trường, không có NHD trong hội đồng
        private async Task<List<string>> LoiThanhPhanAsync(int maHoiDong)
        {
            var loi = new List<string>();
            int soCan = _configuration.GetValue<int>("Hoidong:SoThanhVienTruong", 5);
            int ngoaiToiThieu = _configuration.GetValue<int>("Hoidong:SoNgoaiTruongToiThieu", 2);

            var hd = await _context.Hoidongdanhgia.FindAsync(maHoiDong);
            if (hd == null) return new List<string> { "Hội đồng không tồn tại." };

            var thanhVien = await _context.Thanhvienhoidongs
                .Where(tv => tv.MaHoiDong == maHoiDong)
                .Select(tv => new { tv.MaGv })
                .ToListAsync();

            if (thanhVien.Count != soCan)
                loi.Add($"Cần đúng {soCan} thành viên (hiện có {thanhVien.Count}).");

            var maGvs = thanhVien.Select(t => t.MaGv).ToList();
            int soNgoai = await _context.Giangviens.CountAsync(g => maGvs.Contains(g.MaGv) && g.LaCanBoNgoaiTruong == true);
            if (soNgoai < ngoaiToiThieu)
                loi.Add($"Cần tối thiểu {ngoaiToiThieu} thành viên ngoài trường (hiện có {soNgoai}).");

            var nhd = await _context.Phanconghuongdans
                .Where(pc => pc.MaNcs == hd.MaNcs && pc.TrangThai != false)
                .Select(pc => pc.MaGv)
                .ToListAsync();
            if (maGvs.Any(g => nhd.Contains(g)))
                loi.Add("Người hướng dẫn không được là thành viên hội đồng.");

            return loi;
        }

        private sbyte LoaiTruong() => (sbyte)_configuration.GetValue<int>("Hoidong:LoaiTruong", 0);
    }

    public class BoPhieuRequest
    {
        public bool DongY { get; set; }
    }
}