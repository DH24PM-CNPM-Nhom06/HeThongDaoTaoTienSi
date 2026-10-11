using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace DTMS.Api.Models;

[Table("vaitro")]
public partial class Vaitro
{
    [Key]
    [StringLength(20)]
    public string MaVaiTro { get; set; } = null!;

    [StringLength(50)]
    public string TenVaiTro { get; set; } = null!;

    [ForeignKey("MaVaiTro")]
    [InverseProperty("MaVaiTros")]
    public virtual ICollection<Nguoidung> MaNguoiDungs { get; set; } = new List<Nguoidung>();
}
