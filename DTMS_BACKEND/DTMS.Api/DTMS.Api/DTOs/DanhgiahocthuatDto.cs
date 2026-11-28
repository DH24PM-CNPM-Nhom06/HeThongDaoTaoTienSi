using System;
namespace DTMS.Api.DTOs
{
    public class DanhgiahocthuatDto
    {
        public int MaDanhGia { get; set; }
        public string MaNcs { get; set; } = null!;
        public sbyte LoaiDanhGia { get; set; }
        public string TenNoiDung { get; set; } = null!;
        public int? MaHoiDong { get; set; }
        public float? DiemTrungBinh { get; set; }
        public sbyte KetLuan { get; set; }
        public string? FileBaoCao { get; set; }
        public string? FileBienBan { get; set; }
        public string? FileGiaiTrinh { get; set; }
    }
}