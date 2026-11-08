using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace DTMS.Api.Models;

[Table("detailuanan")]
[Index("MaNcs", Name = "MaNCS")]
public partial class Detailuanan
{
    [Key]
    [Column(TypeName = "int(11)")]
    public int MaDeTai { get; set; }

    [Column("MaNCS")]
    [StringLength(20)]
    public string MaNcs { get; set; } = null!;

    [Column("TenDeTaiVN")]
    [StringLength(500)]
    public string TenDeTaiVn { get; set; } = null!;

    [Column("TenDeTaiEN")]
    [StringLength(500)]
    public string TenDeTaiEn { get; set; } = null!;

    [Column(TypeName = "int(11)")]
    public int? LanChinhSua { get; set; }

    [Column("SoQDDieuChinh")]
    [StringLength(50)]
    public string? SoQddieuChinh { get; set; }

    [StringLength(500)]
    public string? FileToanVan { get; set; }

    [StringLength(500)]
    public string? FileTomTat { get; set; }

    // Tiểu luận và đề cương (mục đăng ký chuyên đề của NCS)
    [Column("FileTieuLuan")]
    [StringLength(500)]
    public string? FileTieuLuan { get; set; }

    [Column("FileDeCuong")]
    [StringLength(500)]
    public string? FileDeCuong { get; set; }

    public bool? TrangThaiKhoa { get; set; }

    [ForeignKey("MaNcs")]
    [InverseProperty("Detailuanans")]
    public virtual Nghiencuusinh MaNcsNavigation { get; set; } = null!;
}