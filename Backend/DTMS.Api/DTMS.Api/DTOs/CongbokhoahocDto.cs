using System;
namespace DTMS.Api.DTOs
{
    public class CongbokhoahocDto
    {
        public int MaCongBo { get; set; }
        public string MaNcs { get; set; } = null!;
        public string TenBaiBao { get; set; } = null!;
        public string TenTapChi { get; set; } = null!;
        public string PhanLoai { get; set; } = null!;
        public float? DiemTapChi { get; set; }
        public sbyte VaiTroTacGia { get; set; }
        public bool CoTenNhd { get; set; }
        public bool DiaChiTruong { get; set; }
        public string? LinkDoi { get; set; }
        public string FileMinhChung { get; set; } = null!;
        public sbyte? TrangThaiDuyet { get; set; }
    }
}