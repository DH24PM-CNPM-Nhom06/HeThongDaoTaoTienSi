namespace DTMS.Api.DTOs
{
    public class KetquahocphanDto
    {
        public int MaKetQua { get; set; }
        public string MaNcs { get; set; } = null!;
        public string MaMonHoc { get; set; } = null!;
        public float? DiemThi { get; set; }
        public bool? TrangThaiDat { get; set; }
    }
}