using System;

namespace DTMS.Api.DTOs
{
    // DTO dùng để trả dữ liệu ra ngoài (cho hàm GetBaocaotiendo)
    public class BaocaotiendoDto
    {
        public int MaBaoCao { get; set; }
        public string MaNcs { get; set; }
        public string KyBaoCao { get; set; }
        public DateOnly HanNop { get; set; }
        public DateTime? NgayNop { get; set; }
        public string? FileBaoCao { get; set; }
        public string? FileMinhChung { get; set; }
        public sbyte? DanhGiaNhd { get; set; }
        public string? NhanXetNhd { get; set; }
        public bool? TrangThaiKhoa { get; set; }
    }

    // DTO chuyên biệt cho API Nhận xét của NHD
    public class NhanXetNhdDto
    {
        public sbyte? DanhGiaNhd { get; set; }
        public string NhanXetNhd { get; set; }
    }
}