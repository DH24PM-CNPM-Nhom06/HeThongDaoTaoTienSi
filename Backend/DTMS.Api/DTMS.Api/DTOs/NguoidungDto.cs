using System;
namespace DTMS.Api.DTOs
{
    public class NguoidungDto
    {
        public int MaNguoiDung { get; set; }
        public string TenDangNhap { get; set; } = null!;
        public string MatKhauHash { get; set; } = null!;
        public string Email { get; set; } = null!;
        public string? SoDienThoai { get; set; }
        public bool? LaHoatDong { get; set; }
        public DateTime? NgayTao { get; set; }
    }
}