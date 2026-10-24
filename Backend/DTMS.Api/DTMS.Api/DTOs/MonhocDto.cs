namespace DTMS.Api.DTOs
{
    public class MonhocDto
    {
        public string MaMonHoc { get; set; } = null!;
        public string TenMonHoc { get; set; } = null!;
        public int SoTinChi { get; set; }
        public sbyte LoaiMon { get; set; }
    }
}