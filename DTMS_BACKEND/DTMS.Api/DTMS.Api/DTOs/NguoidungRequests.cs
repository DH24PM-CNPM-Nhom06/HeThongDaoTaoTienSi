using System.ComponentModel.DataAnnotations;

namespace DTMS.Api.DTOs
{
    // Dữ liệu ADMIN gửi lên khi tạo tài khoản mới
    public class CreateNguoidungRequest
    {
        [Required, StringLength(50)]
        public string TenDangNhap { get; set; } = null!;

        [Required, MinLength(8), StringLength(100)]
        public string Password { get; set; } = null!;

        [Required, EmailAddress, StringLength(100)]
        public string Email { get; set; } = null!;

        [StringLength(20)]
        public string? SoDienThoai { get; set; }
    }

    // Dữ liệu khi cập nhật thông tin (không có mật khẩu)
    public class UpdateNguoidungRequest
    {
        [Required, EmailAddress, StringLength(100)]
        public string Email { get; set; } = null!;

        [StringLength(20)]
        public string? SoDienThoai { get; set; }

        public bool LaHoatDong { get; set; } = true;
    }

    // Dữ liệu khi đặt lại mật khẩu
    public class ResetPasswordRequest
    {
        [Required, MinLength(8), StringLength(100)]
        public string NewPassword { get; set; } = null!;
    }
}