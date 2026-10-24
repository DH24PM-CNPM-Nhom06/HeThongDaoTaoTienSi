using System;
namespace DTMS.Api.DTOs
{
    public class BiendonghocvuDto
    {
        public int MaBienDong { get; set; }
        public string MaNcs { get; set; } = null!;
        public sbyte LoaiBienDong { get; set; }
        public int? SoThang { get; set; }
        public string SoQuyetDinh { get; set; } = null!;
        public DateOnly NgayHieuLuc { get; set; }
        public DateOnly? NgayHetHanMoi { get; set; }
        public string? LyDo { get; set; }
        public string? FileQuyetDinh { get; set; }
    }
}