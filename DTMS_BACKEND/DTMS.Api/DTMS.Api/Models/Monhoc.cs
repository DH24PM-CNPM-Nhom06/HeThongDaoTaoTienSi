using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace DTMS.Api.Models;

[Table("monhoc")]
public partial class Monhoc
{
    [Key]
    [StringLength(20)]
    public string MaMonHoc { get; set; } = null!;

    [StringLength(150)]
    public string TenMonHoc { get; set; } = null!;

    [Column(TypeName = "int(11)")]
    public int SoTinChi { get; set; }

    [Column(TypeName = "tinyint(4)")]
    public sbyte LoaiMon { get; set; }

    [InverseProperty("MaMonHocNavigation")]
    public virtual ICollection<Kehoachhoctap> Kehoachhoctaps { get; set; } = new List<Kehoachhoctap>();

    [InverseProperty("MaMonHocNavigation")]
    public virtual ICollection<Ketquahocphan> Ketquahocphans { get; set; } = new List<Ketquahocphan>();
}
