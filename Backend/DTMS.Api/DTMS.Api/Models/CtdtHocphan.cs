using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace DTMS.Api.Models;

// Học phần trong chương trình đào tạo của một ngành, theo đối tượng đầu vào
[Table("ctdt_hocphan")]
public partial class CtdtHocphan
{
    [Key]
    public int MaCtdt { get; set; }

    [StringLength(20)]
    public string MaNganh { get; set; } = null!;

    public sbyte DoiTuongDauVao { get; set; }

    [StringLength(20)]
    public string MaMonHoc { get; set; } = null!;

    // BAT_BUOC hoặc TU_CHON
    [StringLength(20)]
    public string LoaiHocPhan { get; set; } = null!;
}