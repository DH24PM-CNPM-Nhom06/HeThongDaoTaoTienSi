using DTMS.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace DTMS.Api.Services
{
    // Chạy tự động mỗi ngày (tài liệu nhóm 4):
    // - Trước hạn 15 ngày: gửi email nhắc NCS nộp báo cáo tiến độ 6 tháng.
    // - Quá hạn trên 15 ngày: ghi cảnh báo và gửi email cho NCS và cán bộ đào tạo (PDT).
    // Mỗi sự kiện chỉ xử lý một lần: ghi dấu vào nhatky_thaotac với mã trạng thái 0.
    public class NhacNopBaoCaoService : BackgroundService
    {
        private readonly IServiceScopeFactory _scopes;
        private readonly ILogger<NhacNopBaoCaoService> _logger;

        public NhacNopBaoCaoService(IServiceScopeFactory scopes, ILogger<NhacNopBaoCaoService> logger)
        {
            _scopes = scopes;
            _logger = logger;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            while (!stoppingToken.IsCancellationRequested)
            {
                try
                {
                    await ChayMotLanAsync(stoppingToken);
                }
                catch (Exception ex) when (!stoppingToken.IsCancellationRequested)
                {
                    _logger.LogError(ex, "Lỗi khi chạy nhắc nộp báo cáo tiến độ.");
                }

                await Task.Delay(TimeSpan.FromHours(24), stoppingToken);
            }
        }

        private async Task ChayMotLanAsync(CancellationToken ct)
        {
            using var scope = _scopes.CreateScope();
            var db = scope.ServiceProvider.GetRequiredService<DtmsDbContext>();
            var email = scope.ServiceProvider.GetRequiredService<EmailService>();

            var homNay = DateOnly.FromDateTime(DateTime.Today);

            var danhSachNcs = await db.Nghiencuusinhs
                .Select(n => new { n.MaNcs, n.HoTen, n.NgayNhapHoc, n.MaNguoiDung })
                .ToListAsync(ct);

            var emailPdt = await db.Nguoidungs
                .Where(u => u.MaVaiTros.Any(v => v.MaVaiTro == "PDT") && u.LaHoatDong == true)
                .Select(u => u.Email)
                .ToListAsync(ct);

            foreach (var ncs in danhSachNcs)
            {
                var emailNcs = await db.Nguoidungs
                    .Where(u => u.MaNguoiDung == ncs.MaNguoiDung)
                    .Select(u => u.Email)
                    .FirstOrDefaultAsync(ct);

                // Các kỳ báo cáo 6 tháng tính từ ngày nhập học
                for (int ky = 1; ky <= 20; ky++)
                {
                    var hanNop = ncs.NgayNhapHoc.AddMonths(6 * ky);
                    var soNgayConLai = hanNop.DayNumber - homNay.DayNumber;

                    // Kỳ còn xa hơn 15 ngày thì các kỳ sau cũng chưa tới
                    if (soNgayConLai > 15) break;

                    bool daNop = await db.Baocaotiendos
                        .AnyAsync(b => b.MaNcs == ncs.MaNcs && b.HanNop == hanNop, ct);
                    if (daNop) continue;

                    var khoa = $"{ncs.MaNcs}|{hanNop:yyyy-MM-dd}";

                    if (soNgayConLai >= 0)
                    {
                        if (await DaGhiAsync(db, "NHAC", khoa, ct)) continue;
                        if (string.IsNullOrWhiteSpace(emailNcs)) continue;

                        await email.GuiAsync(emailNcs, "Nhắc nộp báo cáo tiến độ",
                            $"Chào {ncs.HoTen},\n\nBạn cần nộp báo cáo tiến độ 6 tháng trước ngày {hanNop:dd/MM/yyyy} (còn {soNgayConLai} ngày).\nVui lòng nộp qua hệ thống DTMS.");
                        await GhiAsync(db, "NHAC", khoa, ct);
                    }
                    else if (soNgayConLai < -15)
                    {
                        if (await DaGhiAsync(db, "CANHBAO", khoa, ct)) continue;

                        var nhan = new List<string>();
                        if (!string.IsNullOrWhiteSpace(emailNcs)) nhan.Add(emailNcs);
                        nhan.AddRange(emailPdt.Where(e => !string.IsNullOrWhiteSpace(e)));

                        foreach (var den in nhan.Distinct())
                        {
                            await email.GuiAsync(den, "Cảnh báo quá hạn báo cáo tiến độ",
                                $"NCS {ncs.HoTen} ({ncs.MaNcs}) đã quá hạn nộp báo cáo tiến độ ngày {hanNop:dd/MM/yyyy} hơn 15 ngày.");
                        }
                        await GhiAsync(db, "CANHBAO", khoa, ct);
                    }
                }
            }
        }

        private static async Task<bool> DaGhiAsync(DtmsDbContext db, string hanhDong, string khoa, CancellationToken ct)
        {
            var so = await db.Database
                .SqlQuery<long>($"SELECT COUNT(*) AS Value FROM nhatky_thaotac WHERE HanhDong = {hanhDong} AND DuongDan = {khoa}")
                .SingleAsync(ct);
            return so > 0;
        }

        private static Task GhiAsync(DtmsDbContext db, string hanhDong, string khoa, CancellationToken ct)
        {
            return db.Database.ExecuteSqlInterpolatedAsync(
                $"INSERT INTO nhatky_thaotac (ThoiDiem, HanhDong, DuongDan, MaTrangThai) VALUES ({DateTime.Now}, {hanhDong}, {khoa}, 0)", ct);
        }
    }
}