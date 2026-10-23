using System;

namespace DTMS.Api.DTOs
{
    public class NghiencuusinhDto
    {
        public string MaNcs { get; set; } = null!;
        public string HoTen { get; set; } = null!;
        public DateOnly NgaySinh { get; set; }
        public bool GioiTinh { get; set; }
        public string MaNganh { get; set; } = null!;
        public sbyte DoiTuongDauVao { get; set; }
        public string SoQdtrungTuyen { get; set; } = null!;
        public DateOnly NgayNhapHoc { get; set; }
        public sbyte? TrangThaiHocVu { get; set; }
    }
}