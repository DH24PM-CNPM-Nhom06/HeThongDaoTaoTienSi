using System;
namespace DTMS.Api.DTOs
{
    public class HoanthienvatotnghiepDto
    {
        public int MaTotNghiep { get; set; }
        public string MaNcs { get; set; } = null!;
        public DateOnly? NgayCongKhaiWeb { get; set; }
        public string? FileGiaiTrinhSauBv { get; set; }
        public string? BienNhanTvqg { get; set; }
        public string? BienNhanTvtruong { get; set; }
        public string? SoQdcapBang { get; set; }
        public DateOnly? NgayCapBang { get; set; }
        public string? SoHieuBang { get; set; }
        public string? SoVaoSoGoc { get; set; }
    }
}