using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace DTMS.Api.Models;

// Đợt đăng ký học phần do Phòng Đào tạo thiết lập
[Table("dot_dangky_hocphan")]
public partial class DotDangKyHocphan
{
    [Key]
    public int MaDot { get; set; }

    [StringLength(20)]
    public string NamHoc { get; set; } = null!;

    public sbyte HocKy { get; set; }

    public DateOnly TuNgay { get; set; }

    public DateOnly DenNgay { get; set; }

    // Null: áp dụng cho mọi ngành
    [StringLength(20)]
    public string? MaNganh { get; set; }

    [StringLength(255)]
    public string? GhiChu { get; set; }
}

// Học phần NCS đã đăng ký trong một học kỳ
[Table("dangky_hocphan")]
public partial class DangKyHocphan
{
    [Key]
    public int MaDangKy { get; set; }

    [Column("MaNCS")]
    [StringLength(20)]
    public string MaNcs { get; set; } = null!;

    [StringLength(20)]
    public string MaMonHoc { get; set; } = null!;

    [StringLength(20)]
    public string NamHoc { get; set; } = null!;

    public sbyte HocKy { get; set; }

    // BAT_BUOC, TU_CHON hoặc BO_SUNG
    [StringLength(20)]
    public string LoaiHocPhan { get; set; } = null!;

    public DateTime NgayDangKy { get; set; }

    [StringLength(20)]
    public string TrangThai { get; set; } = null!;
}