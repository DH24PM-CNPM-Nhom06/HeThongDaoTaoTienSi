using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace DTMS.Api.Models;

[Table("chungchingoaingu")]
[Index("MaNcs", Name = "MaNCS")]
public partial class Chungchingoaingu
{
    [Key]
    [Column(TypeName = "int(11)")]
    public int MaChungChi { get; set; }

    [Column("MaNCS")]
    [StringLength(20)]
    public string MaNcs { get; set; } = null!;

    [StringLength(100)]
    public string TenChungChi { get; set; } = null!;

    [StringLength(20)]
    public string DiemSo { get; set; } = null!;

    public DateOnly NgayCap { get; set; }

    public DateOnly? NgayHetHan { get; set; }

    [StringLength(200)]
    public string NoiCap { get; set; } = null!;

    [StringLength(500)]
    public string FileMinhChung { get; set; } = null!;

    [Column(TypeName = "tinyint(4)")]
    public sbyte? TrangThaiDuyet { get; set; }

    [ForeignKey("MaNcs")]
    [InverseProperty("Chungchingoaingus")]
    public virtual Nghiencuusinh MaNcsNavigation { get; set; } = null!;
}
