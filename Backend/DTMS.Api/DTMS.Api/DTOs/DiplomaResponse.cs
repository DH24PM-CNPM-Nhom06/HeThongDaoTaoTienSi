namespace DTMS.Api.DTOs
{
    public class DiplomaResponse
    {
        public bool IsValid { get; set; }
        public string Message { get; set; } = string.Empty;
        public DiplomaDetailDto? Data { get; set; }
    }

    public class DiplomaDetailDto
    {
        public string? SoHieuBang { get; set; }
        public string HoTen { get; set; } = string.Empty;
        public string NganhDaoTao { get; set; } = string.Empty;
        public string? SoVaoSoGoc { get; set; }
        public string? NgayCap { get; set; }
    }
}