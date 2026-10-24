namespace DTMS.Api.DTOs
{
    public class GiangvienDto
    {
        public string MaGv { get; set; } = null!;
        public int? MaNguoiDung { get; set; }
        public string HoTen { get; set; } = null!;
        public string? HocHam { get; set; }
        public string HocVi { get; set; } = null!;
        public string DonViCongTac { get; set; } = null!;
        public bool? LaCanBoNgoaiTruong { get; set; }
    }
}