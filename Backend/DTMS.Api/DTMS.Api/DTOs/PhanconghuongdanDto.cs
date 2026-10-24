using System;
namespace DTMS.Api.DTOs
{
    public class PhanconghuongdanDto
    {
        public int MaPhanCong { get; set; }
        public string MaNcs { get; set; } = null!;
        public string MaGv { get; set; } = null!;
        public sbyte VaiTro { get; set; }
        public string SoQuyetDinh { get; set; } = null!;
        public DateOnly NgayHieuLuc { get; set; }
        public DateOnly? NgayKetThuc { get; set; }
        public bool? TrangThai { get; set; }
    }
}