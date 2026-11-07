using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace DTMS.Api.Models;

[Table("ketquahocphan")]
[Index("MaMonHoc", Name = "MaMonHoc")]
[Index("MaNcs", Name = "MaNCS")]
public partial class Ketquahocphan
{
    [Key]
    [Column(TypeName = "int(11)")]
    public int MaKetQua { get; set; }

    [Column("MaNCS")]
    [StringLength(20)]
    public string MaNcs { get; set; } = null!;

    [StringLength(20)]
    public string MaMonHoc { get; set; } = null!;

    // Điểm thi cũ (giữ để tương thích với dữ liệu trước đây)
    public float? DiemThi { get; set; }

    public bool? TrangThaiDat { get; set; }

    // Thành phần điểm (hệ mười), trọng số: chuyên cần 10%, giữa kỳ 30%, thi cuối kỳ 60%
    public float? DiemChuyenCan { get; set; }

    public float? DiemGiuaKy { get; set; }

    public float? DiemThiCuoiKy { get; set; }

    // Kết quả tính toán tự động
    public float? DiemTongKet { get; set; }

    [StringLength(2)]
    public string? DiemChu { get; set; }

    public float? DiemHe4 { get; set; }

    // Đã khóa bảng điểm: giảng viên không sửa được nữa
    [Column(TypeName = "tinyint(1)")]
    public bool TrangThaiKhoa { get; set; }

    [ForeignKey("MaMonHoc")]
    [InverseProperty("Ketquahocphans")]
    public virtual Monhoc MaMonHocNavigation { get; set; } = null!;

    [ForeignKey("MaNcs")]
    [InverseProperty("Ketquahocphans")]
    public virtual Nghiencuusinh MaNcsNavigation { get; set; } = null!;
}