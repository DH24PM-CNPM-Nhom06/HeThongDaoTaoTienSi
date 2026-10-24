using System;
namespace DTMS.Api.DTOs
{
    public class PhanbiendoclapDto
    {
        public int MaPhanBien { get; set; }
        public string MaNcs { get; set; } = null!;
        public string MaGv { get; set; } = null!;
        public DateOnly NgayGui { get; set; }
        public DateOnly? NgayNhan { get; set; }
        public sbyte KetQua { get; set; }
        public string? FileNhanXet { get; set; }
    }
}