using DTMS.Api.DTOs;
using DTMS.Api.Helpers;
using DTMS.Api.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MySqlConnector;

namespace DTMS.Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize(Roles = "ADMIN,PDT,BGH,TBM,KHOA,NHD,PBDL,NCS")]
    public class ThanhvienhoidongsController : ControllerBase
    {
        private readonly DtmsDbContext _context;
        private readonly IConfiguration _fileConfig;
        public ThanhvienhoidongsController(DtmsDbContext context, IConfiguration fileConfig)
        {
            _context = context;
            _fileConfig = fileConfig;
        }

        [HttpGet]
        public async Task<IActionResult> GetThanhvienhoidongs()
        {
            var query = _context.Thanhvienhoidongs.AsNoTracking().AsQueryable();
            var visible = await Access.VisibleHoiDongIdsAsync(_context, User);
            if (visible != null) query = query.Where(tv => visible.Contains(tv.MaHoiDong));
            return Ok(await query.ToListAsync());
        }

        [HttpGet("{mahoidong:int}/{magv}")]
        public async Task<ActionResult<Thanhvienhoidong>> GetThanhvienhoidong(int mahoidong, string magv)
        {
            var tv = await _context.Thanhvienhoidongs.AsNoTracking()
                .FirstOrDefaultAsync(x => x.MaHoiDong == mahoidong && x.MaGv == magv);
            if (tv == null) return NotFound();
            var visible = await Access.VisibleHoiDongIdsAsync(_context, User);
            if (visible != null && !visible.Contains(mahoidong)) return NotFound();
            return Ok(tv);
        }

        [HttpPut("{mahoidong:int}/{magv}")]
        [Authorize(Roles = "ADMIN,PDT")]
        public async Task<IActionResult> PutThanhvienhoidong(int mahoidong, string magv, [FromBody] ThanhvienhoidongDto request)
        {
            if (mahoidong != request.MaHoiDong || magv != request.MaGv)
                return BadRequest(new { Success = false, Message = "Mã hội đồng/giảng viên không khớp URL." });
            if (string.IsNullOrWhiteSpace(request.VaiTro))
                return BadRequest(new { Success = false, Message = "Vai trò trong hội đồng là bắt buộc." });

            await using var tx = await _context.Database.BeginTransactionAsync();
            if (!await HoiDongLock.AcquireAsync(_context, mahoidong)) return NotFound();
            if (await DaBoPhieuAsync(mahoidong))
                return Conflict(new { Success = false, Message = "Hội đồng đã có phiếu hoặc kết quả đánh giá, không được thay đổi thành viên." });

            var tv = await _context.Thanhvienhoidongs.FindAsync(mahoidong, magv);
            if (tv == null) return NotFound();
            var hd = await _context.Hoidongdanhgia.FindAsync(mahoidong);
            if (hd == null) return NotFound();
            if (!StoredFileRules.ValidReference(request.FilePhieuNhanXet, hd.MaNcs, "bienban", _fileConfig,
                    tv.FilePhieuNhanXet))
                return BadRequest(new { Success = false, Message = "Đường dẫn tệp không hợp lệ, không thuộc NCS hoặc chưa được tải lên đúng mục đích." });

            tv.VaiTro = request.VaiTro.Trim();
            tv.CoMat = request.CoMat;
            tv.DiemChuaTron = request.DiemChuaTron;
            tv.FilePhieuNhanXet = request.FilePhieuNhanXet;
            await _context.SaveChangesAsync();
            await tx.CommitAsync();
            return NoContent();
        }

        [HttpPost]
        [Authorize(Roles = "ADMIN,PDT")]
        public async Task<ActionResult<Thanhvienhoidong>> PostThanhvienhoidong([FromBody] ThanhvienhoidongDto request)
        {
            if (string.IsNullOrWhiteSpace(request.MaGv) || string.IsNullOrWhiteSpace(request.VaiTro))
                return BadRequest(new { Success = false, Message = "Mã giảng viên và vai trò trong hội đồng là bắt buộc." });

            await using var tx = await _context.Database.BeginTransactionAsync();
            if (!await HoiDongLock.AcquireAsync(_context, request.MaHoiDong))
                return NotFound(new { Success = false, Message = "Hội đồng không tồn tại." });
            if (await DaBoPhieuAsync(request.MaHoiDong))
                return Conflict(new { Success = false, Message = "Hội đồng đã có phiếu hoặc kết quả đánh giá, không được thêm thành viên." });

            var hd = await _context.Hoidongdanhgia.FindAsync(request.MaHoiDong);
            if (hd == null) return NotFound();
            if (!await _context.Giangviens.AnyAsync(g => g.MaGv == request.MaGv))
                return BadRequest(new { Success = false, Message = "Giảng viên không tồn tại." });
            if (await _context.Thanhvienhoidongs.AnyAsync(tv => tv.MaHoiDong == request.MaHoiDong && tv.MaGv == request.MaGv))
                return Conflict(new { Success = false, Message = "Giảng viên đã thuộc hội đồng này." });
            if (await _context.Phanconghuongdans.AnyAsync(pc => pc.MaNcs == hd.MaNcs && pc.MaGv == request.MaGv && pc.TrangThai != false))
                return Conflict(new { Success = false, Message = "Người hướng dẫn của NCS không được tham gia hội đồng đánh giá NCS đó." });

            if (!StoredFileRules.ValidReference(request.FilePhieuNhanXet, hd.MaNcs, "bienban", _fileConfig))
                return BadRequest(new { Success = false, Message = "Đường dẫn tệp không hợp lệ, không thuộc NCS hoặc chưa được tải lên đúng mục đích." });

            var tvMoi = new Thanhvienhoidong
            {
                MaHoiDong = request.MaHoiDong,
                MaGv = request.MaGv,
                VaiTro = request.VaiTro.Trim(),
                CoMat = request.CoMat,
                DiemChuaTron = request.DiemChuaTron,
                FilePhieuNhanXet = request.FilePhieuNhanXet
            };
            _context.Thanhvienhoidongs.Add(tvMoi);
            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateException ex) when (ex.InnerException is MySqlException { Number: 1062 or 1452 })
            {
                return Conflict(new { Success = false, Message = "Thành viên đã tồn tại hoặc dữ liệu liên kết không hợp lệ." });
            }
            await tx.CommitAsync();
            return CreatedAtAction(nameof(GetThanhvienhoidong), new { mahoidong = tvMoi.MaHoiDong, magv = tvMoi.MaGv }, tvMoi);
        }

        [HttpDelete("{mahoidong:int}/{magv}")]
        [Authorize(Roles = "ADMIN,PDT")]
        public async Task<IActionResult> DeleteThanhvienhoidong(int mahoidong, string magv)
        {
            await using var tx = await _context.Database.BeginTransactionAsync();
            if (!await HoiDongLock.AcquireAsync(_context, mahoidong)) return NotFound();
            if (await DaBoPhieuAsync(mahoidong))
                return Conflict(new { Success = false, Message = "Hội đồng đã có phiếu hoặc kết quả đánh giá, không được xóa thành viên." });
            var tv = await _context.Thanhvienhoidongs.FindAsync(mahoidong, magv);
            if (tv == null) return NotFound();
            _context.Thanhvienhoidongs.Remove(tv);
            await _context.SaveChangesAsync();
            await tx.CommitAsync();
            return NoContent();
        }

        private async Task<bool> DaBoPhieuAsync(int maHoiDong)
        {
            var hd = await _context.Hoidongdanhgia.FindAsync(maHoiDong);
            return hd?.TongSoPhieu != null || hd?.SoPhieuTanThanh != null ||
                   await _context.PhieuBoPhieus.AnyAsync(p => p.MaHoiDong == maHoiDong) ||
                   await _context.Danhgiahocthuats.AnyAsync(d => d.MaHoiDong == maHoiDong);
        }
    }
}
