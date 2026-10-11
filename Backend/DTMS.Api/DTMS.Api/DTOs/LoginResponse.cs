namespace DTMS.Api.DTOs
{
    public class LoginResponse
    {
        public bool Success { get; set; }
        public string Message { get; set; } = string.Empty;
        public string Token { get; set; } = string.Empty;
        public UserInfoDto? User { get; set; }
    }

    public class UserInfoDto
    {
        public int MaNguoiDung { get; set; }
        public string HoTen { get; set; } = string.Empty;
        public string MaVaiTro { get; set; } = string.Empty;
    }
}