using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace DTMS.Api.Models;

[Table("baocaotiendo")]
[Index("MaNcs", Name = "MaNCS")]
public partial class Baocaotiendo
{
    [Key]
    [Column(TypeName = "int(11)")]
    public int MaBaoCao { get; set; }

    [Column("MaNCS")]
    [StringLength(20)]
    public string MaNcs { get; set; } = null!;

    [StringLength(50)]
    public string KyBaoCao { get; set; } = null!;

    public DateOnly HanNop { get; set; }

    [Column(TypeName = "datetime")]
    public DateTime? NgayNop { get; set; }

    [StringLength(500)]
    public string? FileBaoCao { get; set; }

    [StringLength(500)]
    public string? FileMinhChung { get; set; }

    [Column("DanhGiaNHD", TypeName = "tinyint(4)")]
    public sbyte? DanhGiaNhd { get; set; }

    [Column("NhanXetNHD")]
    [StringLength(1000)]
    public string? NhanXetNhd { get; set; }

    public bool? TrangThaiKhoa { get; set; }

    [ForeignKey("MaNcs")]
    [InverseProperty("Baocaotiendos")]
    public virtual Nghiencuusinh MaNcsNavigation { get; set; } = null!;
}
