using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace DTMS.Api.Models;

[Table("hoanthienvatotnghiep")]
[Index("MaNcs", Name = "MaNCS", IsUnique = true)]
public partial class Hoanthienvatotnghiep
{
    [Key]
    [Column(TypeName = "int(11)")]
    public int MaTotNghiep { get; set; }

    [Column("MaNCS")]
    [StringLength(20)]
    public string MaNcs { get; set; } = null!;

    public DateOnly? NgayCongKhaiWeb { get; set; }

    [Column("FileGiaiTrinhSauBV")]
    [StringLength(500)]
    public string? FileGiaiTrinhSauBv { get; set; }

    [Column("BienNhanTVQG")]
    [StringLength(500)]
    public string? BienNhanTvqg { get; set; }

    [Column("BienNhanTVTruong")]
    [StringLength(500)]
    public string? BienNhanTvtruong { get; set; }

    [Column("SoQDCapBang")]
    [StringLength(50)]
    public string? SoQdcapBang { get; set; }

    public DateOnly? NgayCapBang { get; set; }

    [StringLength(50)]
    public string? SoHieuBang { get; set; }

    [StringLength(50)]
    public string? SoVaoSoGoc { get; set; }

    [ForeignKey("MaNcs")]
    [InverseProperty("Hoanthienvatotnghiep")]
    public virtual Nghiencuusinh MaNcsNavigation { get; set; } = null!;
}
