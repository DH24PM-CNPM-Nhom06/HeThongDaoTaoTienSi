using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace DTMS.Api.Models;

[Table("danhgiahocthuat")]
[Index("MaHoiDong", Name = "MaHoiDong")]
[Index("MaNcs", Name = "MaNCS")]
public partial class Danhgiahocthuat
{
    [Key]
    [Column(TypeName = "int(11)")]
    public int MaDanhGia { get; set; }

    [Column("MaNCS")]
    [StringLength(20)]
    public string MaNcs { get; set; } = null!;

    [Column(TypeName = "tinyint(4)")]
    public sbyte LoaiDanhGia { get; set; }

    [StringLength(500)]
    public string TenNoiDung { get; set; } = null!;

    [Column(TypeName = "int(11)")]
    public int? MaHoiDong { get; set; }

    public float? DiemTrungBinh { get; set; }

    [Column(TypeName = "tinyint(4)")]
    public sbyte KetLuan { get; set; }

    [StringLength(500)]
    public string? FileBaoCao { get; set; }

    [StringLength(500)]
    public string? FileBienBan { get; set; }

    [StringLength(500)]
    public string? FileGiaiTrinh { get; set; }

    [ForeignKey("MaHoiDong")]
    [InverseProperty("Danhgiahocthuats")]
    public virtual Hoidongdanhgium? MaHoiDongNavigation { get; set; }

    [ForeignKey("MaNcs")]
    [InverseProperty("Danhgiahocthuats")]
    public virtual Nghiencuusinh MaNcsNavigation { get; set; } = null!;
}
