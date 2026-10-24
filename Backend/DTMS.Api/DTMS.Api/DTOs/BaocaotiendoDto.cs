using System;

namespace DTMS.Api.DTOs
{
    public class BaocaotiendoDto
    {
        public int MaBaoCao { get; set; }
        public string MaNcs { get; set; } = null!;
        public string KyBaoCao { get; set; } = null!;
        public DateOnly HanNop { get; set; }
        public DateTime? NgayNop { get; set; }
        public string? FileBaoCao { get; set; }
        public string? FileMinhChung { get; set; }
        public sbyte? DanhGiaNhd { get; set; }
        public string? NhanXetNhd { get; set; }
        public bool? TrangThaiKhoa { get; set; }
    }
}