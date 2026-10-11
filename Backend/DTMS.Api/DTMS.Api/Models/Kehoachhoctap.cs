using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace DTMS.Api.Models;

[Table("kehoachhoctap")]
[Index("MaMonHoc", Name = "MaMonHoc")]
[Index("MaNcs", Name = "MaNCS")]
public partial class Kehoachhoctap
{
    [Key]
    [Column(TypeName = "int(11)")]
    public int MaKeHoach { get; set; }

    [Column("MaNCS")]
    [StringLength(20)]
    public string MaNcs { get; set; } = null!;

    [StringLength(20)]
    public string NamHoc { get; set; } = null!;

    [Column(TypeName = "tinyint(4)")]
    public sbyte HocKy { get; set; }

    [StringLength(20)]
    public string? MaMonHoc { get; set; }

    [StringLength(500)]
    public string NoiDungKeHoach { get; set; } = null!;

    [Column("DuyetNHD", TypeName = "tinyint(4)")]
    public sbyte? DuyetNhd { get; set; }

    [Column("YKienNHD")]
    [StringLength(500)]
    public string? YkienNhd { get; set; }

    [Column("DuyetTBM", TypeName = "tinyint(4)")]
    public sbyte? DuyetTbm { get; set; }

    [Column("DuyetPDT", TypeName = "tinyint(4)")]
    public sbyte? DuyetPdt { get; set; }

    [Column(TypeName = "datetime")]
    public DateTime? NgayCapNhat { get; set; }

    [ForeignKey("MaMonHoc")]
    [InverseProperty("Kehoachhoctaps")]
    public virtual Monhoc? MaMonHocNavigation { get; set; }

    [ForeignKey("MaNcs")]
    [InverseProperty("Kehoachhoctaps")]
    public virtual Nghiencuusinh MaNcsNavigation { get; set; } = null!;
}
