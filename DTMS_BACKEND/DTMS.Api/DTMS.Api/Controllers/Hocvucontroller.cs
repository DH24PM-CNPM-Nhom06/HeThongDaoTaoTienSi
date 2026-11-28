using ClosedXML.Excel;
using DTMS.Api.Helpers;
using DTMS.Api.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace DTMS.Api.Controllers
{
    // Cảnh báo học vụ và báo cáo thống kê (mục 2.2.5, 3.2.3).
    // Cảnh báo khi GPA tích lũy dưới ngưỡng, hoặc còn ít thời gian đến hạn đào tạo tối đa.
    // NCS xem của mình; NHD xem NCS mình hướng dẫn; ADMIN, PDT, TBM xem tất cả.
    [Route("api/[controller]")]
    [ApiController]
    [Authorize(Roles = "ADMIN,PDT,TBM,NHD,NCS")]
    public class HocvuController : ControllerBase
    {
        private readonly DtmsDbContext _context;
        private readonly IConfiguration _configuration;

        public HocvuController(DtmsDbContext context, IConfiguration configuration)
        {
            _context = context;
            _configuration = configuration;
        }

        // GET: api/Hocvu/canhbao
        [HttpGet("canhbao")]
        public async Task<IActionResult> GetCanhBao()
        {
            var ds = await TinhCanhBaoAsync();
            return Ok(ds);
        }

        // GET: api/Hocvu/thongke  (chỉ ADMIN, PDT, TBM)
        [HttpGet("thongke")]
        [Authorize(Roles = "ADMIN,PDT,TBM")]
        public async Task<IActionResult> GetThongKe()
        {
            var tongSo = await _context.Nghiencuusinhs.CountAsync();
            var ds = await TinhCanhBaoAsync();

            return Ok(new
            {
                TongSoNcs = tongSo,
                SoNcsCanhBao = ds.Count,
                SoGpaThap = ds.Count(x => x.LyDo.Any(l => l.StartsWith("GPA"))),
                SoGanHetHanDaoTao = ds.Count(x => x.LyDo.Any(l => l.Contains("hạn đào tạo"))),
                SoNcsDungTienDo = tongSo - ds.Count
            });
        }

        // GET: api/Hocvu/canhbao/xuat  (tải về file Excel)
        [HttpGet("canhbao/xuat")]
        public async Task<IActionResult> XuatCanhBao()
        {
            var ds = await TinhCanhBaoAsync();

            using var wb = new XLWorkbook();
            var ws = wb.Worksheets.Add("CanhBaoHocVu");

            string[] tieuDe = { "Mã NCS", "Họ tên", "Mã ngành", "GPA tích lũy", "Hạn đào tạo tối đa", "Lý do cảnh báo" };
            for (int i = 0; i < tieuDe.Length; i++)
            {
                ws.Cell(1, i + 1).Value = tieuDe[i];
            }
            ws.Row(1).Style.Font.Bold = true;

            int dong = 2;
            foreach (var item in ds)
            {
                ws.Cell(dong, 1).Value = item.MaNcs;
                ws.Cell(dong, 2).Value = item.HoTen;
                ws.Cell(dong, 3).Value = item.MaNganh;
                ws.Cell(dong, 4).Value = item.Gpa.HasValue ? item.Gpa.Value : (double?)null;
                ws.Cell(dong, 5).Value = item.HanDaoTaoToiDa.ToString("dd/MM/yyyy");
                ws.Cell(dong, 6).Value = string.Join("; ", item.LyDo);
                dong++;
            }
            ws.Columns().AdjustToContents();

            using var ms = new MemoryStream();
            wb.SaveAs(ms);

            return File(ms.ToArray(),
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                $"canhbao_hocvu_{DateTime.Now:yyyyMMdd}.xlsx");
        }

        // Dùng chung cho danh sách, thống kê và file Excel
        private async Task<List<CanhBaoDto>> TinhCanhBaoAsync()
        {
            var gpaToiThieu = _configuration.GetValue<float>("Academic:GpaToiThieu", 2.0f);
            var ngayCanhBao = _configuration.GetValue<int>("Academic:NgayCanhBaoHetHan", 180);

            var query = _context.Nghiencuusinhs.AsQueryable();
            var readable = await Access.ReadableNcsAsync(_context, User);
            if (readable != null)
            {
                query = query.Where(n => readable.Contains(n.MaNcs));
            }

            var danhSach = await query
                .Select(n => new { n.MaNcs, n.HoTen, n.MaNganh, n.NgayHetHanToiDa })
                .ToListAsync();

            var ketQua = new List<CanhBaoDto>();
            var homNay = DateTime.Today;

            foreach (var ncs in danhSach)
            {
                var tk = await AcademicCalc.ThongKeAsync(_context, ncs.MaNcs);
                var lyDo = new List<string>();

                if (tk.Gpa.HasValue && tk.Gpa.Value < gpaToiThieu)
                {
                    lyDo.Add($"GPA {tk.Gpa.Value:0.00} dưới mức {gpaToiThieu:0.00}");
                }

                var conNgay = (ncs.NgayHetHanToiDa.ToDateTime(TimeOnly.MinValue) - homNay).TotalDays;
                if (conNgay < 0)
                {
                    lyDo.Add("Đã quá hạn đào tạo tối đa");
                }
                else if (conNgay <= ngayCanhBao)
                {
                    lyDo.Add($"Còn {Math.Floor(conNgay)} ngày đến hạn đào tạo tối đa");
                }

                if (lyDo.Count > 0)
                {
                    ketQua.Add(new CanhBaoDto
                    {
                        MaNcs = ncs.MaNcs,
                        HoTen = ncs.HoTen,
                        MaNganh = ncs.MaNganh,
                        Gpa = tk.Gpa,
                        HanDaoTaoToiDa = ncs.NgayHetHanToiDa,
                        LyDo = lyDo
                    });
                }
            }

            return ketQua;
        }
    }

    public class CanhBaoDto
    {
        public string MaNcs { get; set; } = null!;
        public string HoTen { get; set; } = null!;
        public string MaNganh { get; set; } = null!;
        public float? Gpa { get; set; }
        public DateOnly HanDaoTaoToiDa { get; set; }
        public List<string> LyDo { get; set; } = new();
    }
}