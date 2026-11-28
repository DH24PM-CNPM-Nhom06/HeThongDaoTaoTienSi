using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace DTMS.Api.Models;

[Table("phanconghuongdan")]
[Index("MaGv", Name = "MaGV")]
[Index("MaNcs", Name = "MaNCS")]
public partial class Phanconghuongdan
{
    [Key]
    [Column(TypeName = "int(11)")]
    public int MaPhanCong { get; set; }

    [Column("MaNCS")]
    [StringLength(20)]
    public string MaNcs { get; set; } = null!;

    [Column("MaGV")]
    [StringLength(20)]
    public string MaGv { get; set; } = null!;

    [Column(TypeName = "tinyint(4)")]
    public sbyte VaiTro { get; set; }

    [StringLength(50)]
    public string SoQuyetDinh { get; set; } = null!;

    public DateOnly NgayHieuLuc { get; set; }

    public DateOnly? NgayKetThuc { get; set; }

    public bool? TrangThai { get; set; }

    [ForeignKey("MaGv")]
    [InverseProperty("Phanconghuongdans")]
    public virtual Giangvien MaGvNavigation { get; set; } = null!;

    [ForeignKey("MaNcs")]
    [InverseProperty("Phanconghuongdans")]
    public virtual Nghiencuusinh MaNcsNavigation { get; set; } = null!;
}
