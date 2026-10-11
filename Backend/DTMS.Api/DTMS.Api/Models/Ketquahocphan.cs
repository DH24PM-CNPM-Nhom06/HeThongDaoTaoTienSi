using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace DTMS.Api.Models;

[Table("ketquahocphan")]
[Index("MaMonHoc", Name = "MaMonHoc")]
[Index("MaNcs", Name = "MaNCS")]
public partial class Ketquahocphan
{
    [Key]
    [Column(TypeName = "int(11)")]
    public int MaKetQua { get; set; }

    [Column("MaNCS")]
    [StringLength(20)]
    public string MaNcs { get; set; } = null!;

    [StringLength(20)]
    public string MaMonHoc { get; set; } = null!;

    public float? DiemThi { get; set; }

    public bool? TrangThaiDat { get; set; }

    [ForeignKey("MaMonHoc")]
    [InverseProperty("Ketquahocphans")]
    public virtual Monhoc MaMonHocNavigation { get; set; } = null!;

    [ForeignKey("MaNcs")]
    [InverseProperty("Ketquahocphans")]
    public virtual Nghiencuusinh MaNcsNavigation { get; set; } = null!;
}
