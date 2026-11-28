using System;

namespace DTMS.Api.DTOs
{
    public class KehoachhoctapDto
    {
        public int MaKeHoach { get; set; }
        public string MaNcs { get; set; } = null!;
        public string NamHoc { get; set; } = null!;
        public sbyte HocKy { get; set; }
        public string? MaMonHoc { get; set; }
        public string NoiDungKeHoach { get; set; } = null!;
        public sbyte? DuyetNhd { get; set; }
        public string? YkienNhd { get; set; }
        public sbyte? DuyetTbm { get; set; }
        public sbyte? DuyetPdt { get; set; }
        public DateTime? NgayCapNhat { get; set; }
    }
}