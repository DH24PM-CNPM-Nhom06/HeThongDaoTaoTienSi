using DTMS.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace DTMS.Api.Helpers
{
    // Thống kê học tập và điều kiện tốt nghiệp của một NCS, chỉ tính trên điểm đã khóa
    public record ThongKeHocTap(int TinChiDat, float? Gpa, int SoMonF, int SoMonChuaKhoa);

    public static class AcademicCalc
    {
        public static async Task<ThongKeHocTap> ThongKeAsync(DtmsDbContext db, string maNcs)
        {
            var rows = await db.Ketquahocphans
                .Where(k => k.MaNcs == maNcs && k.TrangThaiKhoa)
                .Select(k => new { k.DiemChu, k.DiemHe4, SoTinChi = k.MaMonHocNavigation.SoTinChi })
                .ToListAsync();

            var chuaKhoa = await db.Ketquahocphans.CountAsync(k => k.MaNcs == maNcs && !k.TrangThaiKhoa);

            int tinChiDat = rows.Where(r => GradeScale.LaDat(r.DiemChu)).Sum(r => r.SoTinChi);
            int soMonF = rows.Count(r => r.DiemChu == "F");

            // GPA tích lũy: trung bình có trọng số theo số tín chỉ, trên các môn đã có điểm hệ bốn
            var coDiem = rows.Where(r => r.DiemHe4.HasValue).ToList();
            int tinChiTinh = coDiem.Sum(r => r.SoTinChi);
            float? gpa = tinChiTinh == 0
                ? null
                : (float)(coDiem.Sum(r => r.DiemHe4!.Value * r.SoTinChi) / tinChiTinh);

            return new ThongKeHocTap(tinChiDat, gpa, soMonF, chuaKhoa);
        }

        // Điều kiện xét tốt nghiệp (mục 3.2.2): đủ tín chỉ, không còn môn F, bảng điểm đã khóa,
        // và có chứng chỉ ngoại ngữ đã được duyệt (nếu cấu hình yêu cầu)
        public static async Task<(bool DuDieuKien, int TinChiDat, List<string> LyDo)> KiemTraTotNghiepAsync(
            DtmsDbContext db, string maNcs, int tinChiYeuCau, bool canNgoaiNgu)
        {
            var tk = await ThongKeAsync(db, maNcs);
            var lyDo = new List<string>();

            if (tk.TinChiDat < tinChiYeuCau)
                lyDo.Add($"Mới tích lũy {tk.TinChiDat}/{tinChiYeuCau} tín chỉ");

            if (tk.SoMonF > 0)
                lyDo.Add($"Còn {tk.SoMonF} môn điểm F");

            if (tk.SoMonChuaKhoa > 0)
                lyDo.Add($"Còn {tk.SoMonChuaKhoa} môn chưa khóa bảng điểm");

            if (canNgoaiNgu)
            {
                var today = DateOnly.FromDateTime(DateTime.Today);
                bool coChungChi = await db.Chungchingoaingus.AnyAsync(c =>
                    c.MaNcs == maNcs && c.TrangThaiDuyet == 1 &&
                    (c.NgayHetHan == null || c.NgayHetHan >= today));
                if (!coChungChi) lyDo.Add("Chưa có chứng chỉ ngoại ngữ được duyệt còn hiệu lực");
            }

            // Công bố khoa học (tài liệu mục 3.4): 1 bài WoS/Scopus, hoặc 2 bài HĐGSNN từ 0,75 điểm,
            // NCS là tác giả chính và bài có địa chỉ trường
            if (!await CoCongBoHopLeAsync(db, maNcs))
            {
                lyDo.Add("Chưa đủ công bố khoa học hợp lệ (1 bài WoS/Scopus hoặc 2 bài HĐGSNN từ 0,75 điểm)");
            }

            return (lyDo.Count == 0, tk.TinChiDat, lyDo);
        }

        public static async Task<bool> CoCongBoHopLeAsync(DtmsDbContext db, string maNcs)
        {
            var cb = await db.Congbokhoahocs
                .Where(c => c.MaNcs == maNcs && c.TrangThaiDuyet == 1 && c.VaiTroTacGia == 1 && c.DiaChiTruong)
                .Select(c => new { c.PhanLoai, c.DiemTapChi })
                .ToListAsync();

            bool coWosHoacScopus = cb.Any(c =>
                c.PhanLoai.Contains("WoS", StringComparison.OrdinalIgnoreCase) ||
                c.PhanLoai.Contains("Scopus", StringComparison.OrdinalIgnoreCase));

            int soHdgsnn = cb.Count(c =>
                (c.PhanLoai.Contains("HĐGSNN", StringComparison.OrdinalIgnoreCase) ||
                 c.PhanLoai.Contains("HDGSNN", StringComparison.OrdinalIgnoreCase)) &&
                c.DiemTapChi >= 0.75f);

            return coWosHoacScopus || soHdgsnn >= 2;
        }
    }
}