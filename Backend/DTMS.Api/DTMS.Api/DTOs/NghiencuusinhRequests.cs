using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace DTMS.Api.DTOs;

// DTO chỉ chứa các thuộc tính có thể sửa trực tiếp của hồ sơ NCS.
// Không cho ghi MaNguoiDung, hạn đào tạo và trạng thái học vụ qua PUT.
[JsonUnmappedMemberHandling(JsonUnmappedMemberHandling.Disallow)]
public sealed class UpdateNghiencuusinhRequest
{
    [Required, StringLength(100)]
    public string HoTen { get; set; } = null!;

    [Required]
    public DateOnly? NgaySinh { get; set; }

    [Required]
    public bool? GioiTinh { get; set; }

    [Required, StringLength(20)]
    public string MaNganh { get; set; } = null!;

    [Required, Range(1, 2)]
    public sbyte? DoiTuongDauVao { get; set; }

    [Required, StringLength(50)]
    public string SoQdtrungTuyen { get; set; } = null!;

    [Required]
    public DateOnly? NgayNhapHoc { get; set; }
}

// Tạo hồ sơ cho một tài khoản đã tồn tại và đã được gán vai trò NCS.
// Tạo cả tài khoản lẫn hồ sơ trong một giao dịch: dùng POST /api/NcsImport.
[JsonUnmappedMemberHandling(JsonUnmappedMemberHandling.Disallow)]
public sealed class CreateNghiencuusinhRequest
{
    [Required, StringLength(20)]
    public string MaNcs { get; set; } = null!;

    [Range(1, int.MaxValue)]
    public int MaNguoiDung { get; set; }

    [Required, StringLength(100)]
    public string HoTen { get; set; } = null!;

    [Required]
    public DateOnly? NgaySinh { get; set; }

    [Required]
    public bool? GioiTinh { get; set; }

    [Required, StringLength(20)]
    public string MaNganh { get; set; } = null!;

    [Required, Range(1, 2)]
    public sbyte? DoiTuongDauVao { get; set; }

    [Required, StringLength(50)]
    public string SoQdtrungTuyen { get; set; } = null!;

    [Required]
    public DateOnly? NgayNhapHoc { get; set; }

    [Required]
    public DateOnly? NgayHetHanChuan { get; set; }

    [Required]
    public DateOnly? NgayHetHanToiDa { get; set; }
}
