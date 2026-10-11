using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace DTMS.Api.Models;

[Table("biendonghocvu")]
[Index("MaNcs", Name = "MaNCS")]
public partial class Biendonghocvu
{
    [Key]
    [Column(TypeName = "int(11)")]
    public int MaBienDong { get; set; }

    [Column("MaNCS")]
    [StringLength(20)]
    public string MaNcs { get; set; } = null!;

    [Column(TypeName = "tinyint(4)")]
    public sbyte LoaiBienDong { get; set; }

    [Column(TypeName = "int(11)")]
    public int? SoThang { get; set; }

    [StringLength(50)]
    public string SoQuyetDinh { get; set; } = null!;

    public DateOnly NgayHieuLuc { get; set; }

    public DateOnly? NgayHetHanMoi { get; set; }

    [StringLength(500)]
    public string? LyDo { get; set; }

    [StringLength(500)]
    public string? FileQuyetDinh { get; set; }

    [ForeignKey("MaNcs")]
    [InverseProperty("Biendonghocvus")]
    public virtual Nghiencuusinh MaNcsNavigation { get; set; } = null!;
}
