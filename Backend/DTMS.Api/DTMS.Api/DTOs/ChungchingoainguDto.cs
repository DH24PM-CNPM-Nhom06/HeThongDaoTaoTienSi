using System;
namespace DTMS.Api.DTOs
{
    public class ChungchingoainguDto
    {
        public int MaChungChi { get; set; }
        public string MaNcs { get; set; } = null!;
        public string TenChungChi { get; set; } = null!;
        public string DiemSo { get; set; } = null!;
        public DateOnly NgayCap { get; set; }
        public DateOnly? NgayHetHan { get; set; }
        public string NoiCap { get; set; } = null!;
        public string FileMinhChung { get; set; } = null!;
        public sbyte? TrangThaiDuyet { get; set; }
    }
}