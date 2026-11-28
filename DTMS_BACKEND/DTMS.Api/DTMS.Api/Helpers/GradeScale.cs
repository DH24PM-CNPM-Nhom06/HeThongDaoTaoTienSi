using System;

namespace DTMS.Api.Helpers
{
    // Quy tắc điểm theo đặc tả mục 2.2.4
    public static class GradeScale
    {
        // Điểm tổng kết hệ mười: chuyên cần 10%, giữa kỳ 30%, thi cuối kỳ 60%
        public static float TinhDiemTongKet(float diemChuyenCan, float diemGiuaKy, float diemThiCuoiKy)
        {
            var tong = diemChuyenCan * 0.10f + diemGiuaKy * 0.30f + diemThiCuoiKy * 0.60f;
            return (float)Math.Round(tong, 2);
        }

        // Quy đổi sang điểm chữ và hệ bốn
        // 8.5 đến 10: A (4.0); 7.0 đến dưới 8.5: B (3.0); 5.5 đến dưới 7.0: C (2.0); dưới 5.5: F (0)
        public static (string DiemChu, float DiemHe4) QuyDoi(float diemHe10)
        {
            if (diemHe10 >= 8.5f) return ("A", 4f);
            if (diemHe10 >= 7.0f) return ("B", 3f);
            if (diemHe10 >= 5.5f) return ("C", 2f);
            return ("F", 0f);
        }

        public static bool LaDat(string? diemChu) => !string.IsNullOrEmpty(diemChu) && diemChu != "F";
    }
}