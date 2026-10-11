using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace DTMS.Api.Models;

[Table("nganhdaotao")]
public partial class Nganhdaotao
{
    [Key]
    [StringLength(20)]
    public string MaNganh { get; set; } = null!;

    [StringLength(150)]
    public string TenNganh { get; set; } = null!;

    [StringLength(150)]
    public string KhoaQuanLy { get; set; } = null!;

    [InverseProperty("MaNganhNavigation")]
    public virtual ICollection<Nghiencuusinh> Nghiencuusinhs { get; set; } = new List<Nghiencuusinh>();
}
