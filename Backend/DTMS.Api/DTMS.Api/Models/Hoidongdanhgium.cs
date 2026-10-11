using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace DTMS.Api.Models;

[Table("hoidongdanhgia")]
[Index("MaNcs", Name = "MaNCS")]
public partial class Hoidongdanhgium
{
    [Key]
    [Column(TypeName = "int(11)")]
    public int MaHoiDong { get; set; }

    [Column("MaNCS")]
    [StringLength(20)]
    public string MaNcs { get; set; } = null!;

    [Column(TypeName = "tinyint(4)")]
    public sbyte LoaiHoiDong { get; set; }

    [StringLength(50)]
    public string SoQuyetDinh { get; set; } = null!;

    public DateOnly NgayThanhLap { get; set; }

    [Column(TypeName = "datetime")]
    public DateTime? NgayBaoVe { get; set; }

    [StringLength(200)]
    public string? DiaDiem { get; set; }

    [Column(TypeName = "int(11)")]
    public int? SoPhieuTanThanh { get; set; }

    [Column(TypeName = "int(11)")]
    public int? TongSoPhieu { get; set; }

    [Column(TypeName = "tinyint(4)")]
    public sbyte? KetLuan { get; set; }

    [StringLength(500)]
    public string? FileQuyetDinh { get; set; }

    [InverseProperty("MaHoiDongNavigation")]
    public virtual ICollection<Danhgiahocthuat> Danhgiahocthuats { get; set; } = new List<Danhgiahocthuat>();

    [ForeignKey("MaNcs")]
    [InverseProperty("Hoidongdanhgia")]
    public virtual Nghiencuusinh MaNcsNavigation { get; set; } = null!;

    [InverseProperty("MaHoiDongNavigation")]
    public virtual ICollection<Thanhvienhoidong> Thanhvienhoidongs { get; set; } = new List<Thanhvienhoidong>();
}
