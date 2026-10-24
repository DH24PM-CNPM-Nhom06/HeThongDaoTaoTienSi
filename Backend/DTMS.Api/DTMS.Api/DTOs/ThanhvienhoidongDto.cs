namespace DTMS.Api.DTOs
{
    public class ThanhvienhoidongDto
    {
        public int MaHoiDong { get; set; }
        public string MaGv { get; set; } = null!;
        public string VaiTro { get; set; } = null!;
        public bool? CoMat { get; set; }
        public float? DiemChuaTron { get; set; }
        public string? FilePhieuNhanXet { get; set; }
    }
}