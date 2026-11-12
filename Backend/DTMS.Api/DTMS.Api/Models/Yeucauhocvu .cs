using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace DTMS.Api.Models;

// Yêu cầu học vụ của NCS. Các bước duyệt được tạo theo loại yêu cầu.
[Table("yeucau_hocvu")]
public partial class YeucauHocvu
{
    [Key]
    public int MaYeuCau { get; set; }

    [Column("MaNCS")]
    [StringLength(20)]
    public string MaNcs { get; set; } = null!;

    [StringLength(30)]
    public string LoaiYeuCau { get; set; } = null!;

    [StringLength(1000)]
    public string NoiDung { get; set; } = null!;

    [StringLength(1000)]
    public string? LyDo { get; set; }

    [Column("MaGVMoi")]
    [StringLength(20)]
    public string? MaGvMoi { get; set; }

    public int? SoThangGiaHan { get; set; }

    [StringLength(20)]
    public string TrangThai { get; set; } = null!;

    public DateTime NgayTao { get; set; }

    public DateTime? NgayKetThuc { get; set; }
}

// Một bước duyệt trong yêu cầu học vụ. TrangThai: 0 chờ, 1 đồng ý, -1 từ chối.
[Table("yeucau_hocvu_buoc")]
public partial class YeucauHocvuBuoc
{
    [Key]
    public int MaBuoc { get; set; }

    public int MaYeuCau { get; set; }

    [StringLength(20)]
    public string VaiTro { get; set; } = null!;

    public int Thu { get; set; }

    public sbyte TrangThai { get; set; }

    [StringLength(50)]
    public string? NguoiDuyet { get; set; }

    public DateTime? NgayDuyet { get; set; }

    [StringLength(500)]
    public string? YKien { get; set; }
}