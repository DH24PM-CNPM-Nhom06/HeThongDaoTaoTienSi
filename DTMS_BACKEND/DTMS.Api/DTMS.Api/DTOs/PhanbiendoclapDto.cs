using System;

namespace DTMS.Api.DTOs
{
    // DTO trả về danh sách phân công phản biện
    public class PhanbiendoclapDto
    {
        public int MaPhanBien { get; set; }
        public string MaNcs { get; set; } = string.Empty;
        public string MaGv { get; set; } = string.Empty;
        public DateOnly NgayGui { get; set; }
        public DateOnly? NgayNhan { get; set; }
        public sbyte KetQua { get; set; }
        public string? FileNhanXet { get; set; }
    }

    // DTO để PBDL cập nhật nhận xét
    public class CapNhatNhanXetPbdlDto
    {
        public sbyte KetQua { get; set; }
        public string? FileNhanXet { get; set; }
    }
}