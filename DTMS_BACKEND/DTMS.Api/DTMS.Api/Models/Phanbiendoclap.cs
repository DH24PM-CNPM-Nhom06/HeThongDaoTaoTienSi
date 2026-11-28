using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace DTMS.Api.Models;

[Table("phanbiendoclap")]
[Index("MaGv", Name = "MaGV")]
[Index("MaNcs", Name = "MaNCS")]
public partial class Phanbiendoclap
{
    [Key]
    [Column(TypeName = "int(11)")]
    public int MaPhanBien { get; set; }

    [Column("MaNCS")]
    [StringLength(20)]
    public string MaNcs { get; set; } = null!;

    [Column("MaGV")]
    [StringLength(20)]
    public string MaGv { get; set; } = null!;

    public DateOnly NgayGui { get; set; }

    public DateOnly? NgayNhan { get; set; }

    [Column(TypeName = "tinyint(4)")]
    public sbyte KetQua { get; set; }

    [StringLength(500)]
    public string? FileNhanXet { get; set; }

    [ForeignKey("MaGv")]
    [InverseProperty("Phanbiendoclaps")]
    public virtual Giangvien MaGvNavigation { get; set; } = null!;

    [ForeignKey("MaNcs")]
    [InverseProperty("Phanbiendoclaps")]
    public virtual Nghiencuusinh MaNcsNavigation { get; set; } = null!;
}
