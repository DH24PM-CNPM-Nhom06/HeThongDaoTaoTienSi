using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace DTMS.Api.Models;

[Table("nguoidung")]
[Index("Email", Name = "Email", IsUnique = true)]
[Index("TenDangNhap", Name = "TenDangNhap", IsUnique = true)]
public partial class Nguoidung
{
    [Key]
    [Column(TypeName = "int(11)")]
    public int MaNguoiDung { get; set; }

    [StringLength(50)]
    public string TenDangNhap { get; set; } = null!;

    [StringLength(255)]
    public string MatKhauHash { get; set; } = null!;

    [StringLength(100)]
    public string Email { get; set; } = null!;

    [StringLength(20)]
    public string? SoDienThoai { get; set; }

    public bool? LaHoatDong { get; set; }

    [Column(TypeName = "datetime")]
    public DateTime? NgayTao { get; set; }

    // Khóa tài khoản khi nhập sai nhiều lần
    [Column("SoLanSaiDangNhap", TypeName = "int(11)")]
    public int SoLanSaiDangNhap { get; set; }

    [Column("KhoaDenThoiDiem", TypeName = "datetime")]
    public DateTime? KhoaDenThoiDiem { get; set; }

    // Mã băm của token đặt lại mật khẩu (không lưu token gốc)
    [Column("ResetTokenHash")]
    [StringLength(64)]
    public string? ResetTokenHash { get; set; }

    [Column("ResetTokenHetHan", TypeName = "datetime")]
    public DateTime? ResetTokenHetHan { get; set; }

    [InverseProperty("MaNguoiDungNavigation")]
    public virtual Giangvien? Giangvien { get; set; }

    [InverseProperty("MaNguoiDungNavigation")]
    public virtual Nghiencuusinh? Nghiencuusinh { get; set; }

    [ForeignKey("MaNguoiDung")]
    [InverseProperty("MaNguoiDungs")]
    public virtual ICollection<Vaitro> MaVaiTros { get; set; } = new List<Vaitro>();
}