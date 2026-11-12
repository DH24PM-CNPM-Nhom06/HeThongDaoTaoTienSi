using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace DTMS.Api.Models;

// Học phần tiên quyết: MaMonHoc yêu cầu MaTienQuyet phải đạt trước
[Table("monhoc_tienquyet")]
public partial class MonhocTienquyet
{
    [Key]
    [StringLength(20)]
    public string MaMonHoc { get; set; } = null!;

    [Key]
    [StringLength(20)]
    public string MaTienQuyet { get; set; } = null!;
}

// Lý lịch khoa học của NCS (VaiTro = NCS) hoặc hồ sơ khoa học của giảng viên (VaiTro = GV)
[Table("lylich_khoahoc")]
public partial class LylichKhoahoc
{
    [Key]
    public int MaLyLich { get; set; }

    [StringLength(20)]
    public string MaNguoi { get; set; } = null!;

    [StringLength(10)]
    public string VaiTro { get; set; } = null!;

    [StringLength(30)]
    public string LoaiMuc { get; set; } = null!;

    [StringLength(1000)]
    public string NoiDung { get; set; } = null!;

    public int? NamThucHien { get; set; }

    public DateTime NgayTao { get; set; }
}

// Ảnh chụp nội dung kế hoạch trước mỗi lần NCS sửa, để giữ lịch sử phiên bản
[Table("kehoach_lichsu")]
public partial class KehoachLichsu
{
    [Key]
    public int MaLichSu { get; set; }

    public int MaKeHoach { get; set; }

    [StringLength(20)]
    public string NamHoc { get; set; } = null!;

    public sbyte HocKy { get; set; }

    [StringLength(20)]
    public string? MaMonHoc { get; set; }

    [StringLength(500)]
    public string NoiDungKeHoach { get; set; } = null!;

    public DateTime NgayLuu { get; set; }

    [StringLength(50)]
    public string? NguoiLuu { get; set; }
}