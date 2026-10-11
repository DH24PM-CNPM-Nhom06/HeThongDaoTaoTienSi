using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace DTMS.Api.Models;

[Table("giangvien")]
[Index("MaNguoiDung", Name = "MaNguoiDung", IsUnique = true)]
public partial class Giangvien
{
    [Key]
    [Column("MaGV")]
    [StringLength(20)]
    public string MaGv { get; set; } = null!;

    [Column(TypeName = "int(11)")]
    public int? MaNguoiDung { get; set; }

    [StringLength(100)]
    public string HoTen { get; set; } = null!;

    [StringLength(20)]
    public string? HocHam { get; set; }

    [StringLength(20)]
    public string HocVi { get; set; } = null!;

    [StringLength(200)]
    public string DonViCongTac { get; set; } = null!;

    public bool? LaCanBoNgoaiTruong { get; set; }

    [ForeignKey("MaNguoiDung")]
    [InverseProperty("Giangvien")]
    public virtual Nguoidung? MaNguoiDungNavigation { get; set; }

    [InverseProperty("MaGvNavigation")]
    public virtual ICollection<Phanbiendoclap> Phanbiendoclaps { get; set; } = new List<Phanbiendoclap>();

    [InverseProperty("MaGvNavigation")]
    public virtual ICollection<Phanconghuongdan> Phanconghuongdans { get; set; } = new List<Phanconghuongdan>();

    [InverseProperty("MaGvNavigation")]
    public virtual ICollection<Thanhvienhoidong> Thanhvienhoidongs { get; set; } = new List<Thanhvienhoidong>();
}
