using System;
namespace DTMS.Api.DTOs
{
    public class HoidongdanhgiumDto
    {
        public int MaHoiDong { get; set; }
        public string MaNcs { get; set; } = null!;
        public sbyte LoaiHoiDong { get; set; }
        public string SoQuyetDinh { get; set; } = null!;
        public DateOnly NgayThanhLap { get; set; }
        public DateTime? NgayBaoVe { get; set; }
        public string? DiaDiem { get; set; }
        public int? SoPhieuTanThanh { get; set; }
        public int? TongSoPhieu { get; set; }
        public sbyte? KetLuan { get; set; }
        public string? FileQuyetDinh { get; set; }
    }
}