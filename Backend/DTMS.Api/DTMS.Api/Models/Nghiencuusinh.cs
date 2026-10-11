using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace DTMS.Api.Models;

[Table("nghiencuusinh")]
[Index("MaNganh", Name = "MaNganh")]
[Index("MaNguoiDung", Name = "MaNguoiDung", IsUnique = true)]
public partial class Nghiencuusinh
{
    [Key]
    [Column("MaNCS")]
    [StringLength(20)]
    public string MaNcs { get; set; } = null!;

    [Column(TypeName = "int(11)")]
    public int MaNguoiDung { get; set; }

    [StringLength(100)]
    public string HoTen { get; set; } = null!;

    public DateOnly NgaySinh { get; set; }

    public bool GioiTinh { get; set; }

    [StringLength(20)]
    public string MaNganh { get; set; } = null!;

    [Column(TypeName = "tinyint(4)")]
    public sbyte DoiTuongDauVao { get; set; }

    [Column("SoQDTrungTuyen")]
    [StringLength(50)]
    public string SoQdtrungTuyen { get; set; } = null!;

    public DateOnly NgayNhapHoc { get; set; }

    public DateOnly NgayHetHanChuan { get; set; }

    public DateOnly NgayHetHanToiDa { get; set; }

    [Column(TypeName = "tinyint(4)")]
    public sbyte? TrangThaiHocVu { get; set; }

    [InverseProperty("MaNcsNavigation")]
    public virtual ICollection<Baocaotiendo> Baocaotiendos { get; set; } = new List<Baocaotiendo>();

    [InverseProperty("MaNcsNavigation")]
    public virtual ICollection<Biendonghocvu> Biendonghocvus { get; set; } = new List<Biendonghocvu>();

    [InverseProperty("MaNcsNavigation")]
    public virtual ICollection<Chungchingoaingu> Chungchingoaingus { get; set; } = new List<Chungchingoaingu>();

    [InverseProperty("MaNcsNavigation")]
    public virtual ICollection<Congbokhoahoc> Congbokhoahocs { get; set; } = new List<Congbokhoahoc>();

    [InverseProperty("MaNcsNavigation")]
    public virtual ICollection<Danhgiahocthuat> Danhgiahocthuats { get; set; } = new List<Danhgiahocthuat>();

    [InverseProperty("MaNcsNavigation")]
    public virtual ICollection<Detailuanan> Detailuanans { get; set; } = new List<Detailuanan>();

    [InverseProperty("MaNcsNavigation")]
    public virtual Hoanthienvatotnghiep? Hoanthienvatotnghiep { get; set; }

    [InverseProperty("MaNcsNavigation")]
    public virtual ICollection<Hoidongdanhgium> Hoidongdanhgia { get; set; } = new List<Hoidongdanhgium>();

    [InverseProperty("MaNcsNavigation")]
    public virtual ICollection<Kehoachhoctap> Kehoachhoctaps { get; set; } = new List<Kehoachhoctap>();

    [InverseProperty("MaNcsNavigation")]
    public virtual ICollection<Ketquahocphan> Ketquahocphans { get; set; } = new List<Ketquahocphan>();

    [ForeignKey("MaNganh")]
    [InverseProperty("Nghiencuusinhs")]
    public virtual Nganhdaotao MaNganhNavigation { get; set; } = null!;

    [ForeignKey("MaNguoiDung")]
    [InverseProperty("Nghiencuusinh")]
    public virtual Nguoidung MaNguoiDungNavigation { get; set; } = null!;

    [InverseProperty("MaNcsNavigation")]
    public virtual ICollection<Phanbiendoclap> Phanbiendoclaps { get; set; } = new List<Phanbiendoclap>();

    [InverseProperty("MaNcsNavigation")]
    public virtual ICollection<Phanconghuongdan> Phanconghuongdans { get; set; } = new List<Phanconghuongdan>();
}
