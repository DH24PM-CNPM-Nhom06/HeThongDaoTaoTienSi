namespace DTMS.Api.DTOs
{
    public class QuenMatKhauRequest
    {
        public string Email { get; set; } = string.Empty;
    }

    public class DatLaiMatKhauRequest
    {
        public string Token { get; set; } = string.Empty;
        public string NewPassword { get; set; } = string.Empty;
    }
}