using System.Collections.Generic;

namespace DTMS.Api.DTOs
{
    public class LoginResponse
    {
        public bool Success { get; set; }
        public string Message { get; set; } = string.Empty;
        public string Token { get; set; } = string.Empty;
        public UserInfoDto User { get; set; } = new UserInfoDto();
    }

    public class UserInfoDto
    {
        public int MaNguoiDung { get; set; }
        public string? HoTen { get; set; }

        // Vai trò chính (đã đổi sang mã giao diện): dùng để chọn màn hình mặc định
        public string MaVaiTro { get; set; } = string.Empty;

        // Toàn bộ vai trò của người dùng (mã giao diện), để giao diện cho chuyển vai trò
        public List<string> Roles { get; set; } = new List<string>();
    }
}