using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace DTMS.Api.Models;

[PrimaryKey("MaHoiDong", "MaGv")]
[Table("thanhvienhoidong")]
[Index("MaGv", Name = "MaGV")]
public partial class Thanhvienhoidong
{
    [Key]
    [Column(TypeName = "int(11)")]
    public int MaHoiDong { get; set; }

    [Key]
    [Column("MaGV")]
    [StringLength(20)]
    public string MaGv { get; set; } = null!;

    [StringLength(50)]
    public string VaiTro { get; set; } = null!;

    public bool? CoMat { get; set; }

    public float? DiemChuaTron { get; set; }

    [StringLength(500)]
    public string? FilePhieuNhanXet { get; set; }

    [ForeignKey("MaGv")]
    [InverseProperty("Thanhvienhoidongs")]
    public virtual Giangvien MaGvNavigation { get; set; } = null!;

    [ForeignKey("MaHoiDong")]
    [InverseProperty("Thanhvienhoidongs")]
    public virtual Hoidongdanhgium MaHoiDongNavigation { get; set; } = null!;
}
