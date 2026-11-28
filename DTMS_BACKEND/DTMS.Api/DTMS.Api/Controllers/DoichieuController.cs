using DTMS.Api.Helpers;
using DTMS.Api.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace DTMS.Api.Controllers
{
    // Đối chiếu tiến độ thực tế với kế hoạch học tập đã được phê duyệt (tài liệu mục 3.2, nhóm 2).
    // Kế hoạch đã duyệt: DuyetPdt = 1. Học phần đã đạt: điểm đã khóa, khác F.
    [Route("api/[controller]")]
    [ApiController]
    [Authorize(Roles = "NCS,NHD,TBM,KHOA,PDT,ADMIN,BGH,PBDL")]
    public class DoichieuController : ControllerBase
    {
        private readonly DtmsDbContext _context;

        public DoichieuController(DtmsDbContext context)
        {
            _context = context;
        }

        // GET: api/Doichieu/NCS01
        [HttpGet("{maNcs}")]
        public async Task<IActionResult> DoiChieu(string maNcs)
        {
            if (!await Access.CanReadNcsAsync(_context, User, maNcs)) return NotFound();

            var kehoach = await _context.Kehoachhoctaps
                .Where(k => k.MaNcs == maNcs && k.DuyetPdt == 1 && k.MaMonHoc != null)
                .Select(k => new { k.NamHoc, k.HocKy, k.MaMonHoc })
                .ToListAsync();

            var keHoachMon = kehoach.Select(k => k.MaMonHoc!).Distinct().ToList();

            var daDat = await _context.Ketquahocphans
                .Where(k => k.MaNcs == maNcs && k.TrangThaiKhoa && k.DiemChu != null && k.DiemChu != "F")
                .Select(k => k.MaMonHoc)
                .Distinct()
                .ToListAsync();

            var hoanThanh = keHoachMon.Where(m => daDat.Contains(m)).ToList();
            var conThieu = keHoachMon.Except(hoanThanh).ToList();
            var tyLe = keHoachMon.Count == 0 ? 0 : Math.Round(100.0 * hoanThanh.Count / keHoachMon.Count, 1);

            return Ok(new
            {
                MaNcs = maNcs,
                SoHocPhanKeHoach = keHoachMon.Count,
                SoHocPhanHoanThanh = hoanThanh.Count,
                TyLeHoanThanhPhanTram = tyLe,
                HocPhanHoanThanh = hoanThanh,
                HocPhanConThieu = conThieu
            });
        }
    }
}