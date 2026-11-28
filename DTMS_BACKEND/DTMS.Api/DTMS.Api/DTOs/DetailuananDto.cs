using System;
namespace DTMS.Api.DTOs
{
    public class DetailuananDto
    {
        public int MaDeTai { get; set; }
        public string MaNcs { get; set; } = null!;
        public string TenDeTaiVn { get; set; } = null!;
        public string TenDeTaiEn { get; set; } = null!;
        public int? LanChinhSua { get; set; }
        public string? SoQddieuChinh { get; set; }
        public string? FileToanVan { get; set; }
        public string? FileTomTat { get; set; }
        public bool? TrangThaiKhoa { get; set; }
    }
}