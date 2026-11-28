using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace DTMS.Api.Models;

[Table("congbokhoahoc")]
[Index("MaNcs", Name = "MaNCS")]
public partial class Congbokhoahoc
{
    [Key]
    [Column(TypeName = "int(11)")]
    public int MaCongBo { get; set; }

    [Column("MaNCS")]
    [StringLength(20)]
    public string MaNcs { get; set; } = null!;

    [StringLength(500)]
    public string TenBaiBao { get; set; } = null!;

    [StringLength(300)]
    public string TenTapChi { get; set; } = null!;

    [StringLength(50)]
    public string PhanLoai { get; set; } = null!;

    public float? DiemTapChi { get; set; }

    [Column(TypeName = "tinyint(4)")]
    public sbyte VaiTroTacGia { get; set; }

    [Column("CoTenNHD")]
    public bool CoTenNhd { get; set; }

    public bool DiaChiTruong { get; set; }

    [Column("LinkDOI")]
    [StringLength(255)]
    public string? LinkDoi { get; set; }

    [StringLength(500)]
    public string FileMinhChung { get; set; } = null!;

    [Column(TypeName = "tinyint(4)")]
    public sbyte? TrangThaiDuyet { get; set; }

    [ForeignKey("MaNcs")]
    [InverseProperty("Congbokhoahocs")]
    public virtual Nghiencuusinh MaNcsNavigation { get; set; } = null!;
}
