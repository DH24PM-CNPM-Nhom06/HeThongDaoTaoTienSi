using DTMS.Api.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace DTMS.Api.Controllers
{
    // Danh bạ giảng viên.
    // ADMIN, PDT: xem đầy đủ kể cả liên kết tài khoản.
    // TBM, NHD: xem đầy đủ hồ sơ chuyên môn, không xem liên kết tài khoản.
    // NCS, PBDL và các vai trò khác: chỉ xem thông tin công khai (họ tên, học hàm, học vị, đơn vị).
    // Ghi: chỉ ADMIN, PDT.
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class GiangviensController : ControllerBase
    {
        private readonly DtmsDbContext _context;

        public GiangviensController(DtmsDbContext context)
        {
            _context = context;
        }

        // GET: api/Giangviens
        [HttpGet]
        public async Task<IActionResult> GetGiangviens()
        {
            var quanTri = LaQuanTri();
            var hoSoDayDu = HoSoDayDu();

            if (!hoSoDayDu)
            {
                var congKhai = await _context.Giangviens
                    .Select(gv => new GiangvienCongKhaiDto
                    {
                        MaGv = gv.MaGv,
                        HoTen = gv.HoTen,
                        HocHam = gv.HocHam,
                        HocVi = gv.HocVi,
                        DonViCongTac = gv.DonViCongTac
                    })
                    .ToListAsync();
                return Ok(congKhai);
            }

            var ds = await _context.Giangviens
                .Select(gv => new GiangvienDto
                {
                    MaGv = gv.MaGv,
                    MaNguoiDung = quanTri ? gv.MaNguoiDung : null,
                    HoTen = gv.HoTen,
                    HocHam = gv.HocHam,
                    HocVi = gv.HocVi,
                    DonViCongTac = gv.DonViCongTac,
                    LaCanBoNgoaiTruong = gv.LaCanBoNgoaiTruong
                })
                .ToListAsync();

            return Ok(ds);
        }

        // GET: api/Giangviens/GV01
        [HttpGet("{magv}")]
        public async Task<IActionResult> GetGiangvien(string magv)
        {
            var gv = await _context.Giangviens.FirstOrDefaultAsync(x => x.MaGv == magv);
            if (gv == null) return NotFound();

            if (!HoSoDayDu()) return Ok(ToCongKhai(gv));

            return Ok(new GiangvienDto
            {
                MaGv = gv.MaGv,
                MaNguoiDung = LaQuanTri() ? gv.MaNguoiDung : null,
                HoTen = gv.HoTen,
                HocHam = gv.HocHam,
                HocVi = gv.HocVi,
                DonViCongTac = gv.DonViCongTac,
                LaCanBoNgoaiTruong = gv.LaCanBoNgoaiTruong
            });
        }

        // PUT: api/Giangviens/GV01  (chỉ ADMIN, PDT)
        [HttpPut("{magv}")]
        [Authorize(Roles = "ADMIN,PDT")]
        public async Task<IActionResult> PutGiangvien(string magv, Giangvien giangvien)
        {
            if (magv != giangvien.MaGv) return BadRequest();

            _context.Entry(giangvien).State = EntityState.Modified;
            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!await _context.Giangviens.AnyAsync(e => e.MaGv == magv)) return NotFound();
                throw;
            }

            return NoContent();
        }

        // POST: api/Giangviens  (chỉ ADMIN, PDT)
        [HttpPost]
        [Authorize(Roles = "ADMIN,PDT")]
        public async Task<ActionResult<Giangvien>> PostGiangvien(Giangvien giangvien)
        {
            _context.Giangviens.Add(giangvien);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetGiangvien), new { magv = giangvien.MaGv }, giangvien);
        }

        // DELETE: api/Giangviens/GV01  (chỉ ADMIN, PDT)
        [HttpDelete("{magv}")]
        [Authorize(Roles = "ADMIN,PDT")]
        public async Task<IActionResult> DeleteGiangvien(string magv)
        {
            var gv = await _context.Giangviens.FindAsync(magv);
            if (gv == null) return NotFound();

            _context.Giangviens.Remove(gv);
            await _context.SaveChangesAsync();
            return NoContent();
        }

        private bool LaQuanTri() => User.IsInRole("ADMIN") || User.IsInRole("PDT");

        private bool HoSoDayDu() => LaQuanTri() || User.IsInRole("TBM") || User.IsInRole("NHD");

        private static GiangvienCongKhaiDto ToCongKhai(Giangvien gv) => new GiangvienCongKhaiDto
        {
            MaGv = gv.MaGv,
            HoTen = gv.HoTen,
            HocHam = gv.HocHam,
            HocVi = gv.HocVi,
            DonViCongTac = gv.DonViCongTac
        };
    }

    // Hồ sơ đầy đủ (không có liên kết tài khoản trừ khi là ADMIN/PDT)
    public class GiangvienDto
    {
        public string MaGv { get; set; } = null!;
        public int? MaNguoiDung { get; set; }
        public string HoTen { get; set; } = null!;
        public string? HocHam { get; set; }
        public string HocVi { get; set; } = null!;
        public string DonViCongTac { get; set; } = null!;
        public bool? LaCanBoNgoaiTruong { get; set; }
    }

    // Thông tin công khai cho NCS và các vai trò khác
    public class GiangvienCongKhaiDto
    {
        public string MaGv { get; set; } = null!;
        public string HoTen { get; set; } = null!;
        public string? HocHam { get; set; }
        public string HocVi { get; set; } = null!;
        public string DonViCongTac { get; set; } = null!;
    }
}