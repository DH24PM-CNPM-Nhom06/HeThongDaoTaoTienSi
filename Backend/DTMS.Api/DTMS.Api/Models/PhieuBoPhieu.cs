using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace DTMS.Api.Models;

// Phiếu bỏ kín của một thành viên hội đồng. Chỉ lưu kết quả tổng hợp, không công khai phiếu từng người.
[Table("phieu_bo_phieu")]
[PrimaryKey(nameof(MaHoiDong), nameof(MaGv))]
public partial class PhieuBoPhieu
{
    public int MaHoiDong { get; set; }

    [Column("MaGV")]
    [StringLength(20)]
    public string MaGv { get; set; } = null!;

    public sbyte LaDongY { get; set; }

    public DateTime NgayBo { get; set; }
}