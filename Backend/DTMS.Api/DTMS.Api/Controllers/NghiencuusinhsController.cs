using DTMS.Api.DTOs;
using DTMS.Api.Helpers;
using DTMS.Api.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MySqlConnector;

namespace DTMS.Api.Controllers
{
    // Đọc: ADMIN/PDT/BGH xem tất cả; TBM/KHOA xem trong phạm vi ngành;
    // NHD xem NCS đang hướng dẫn; PBDL xem NCS được phân công; NCS chỉ xem bản thân.
    // Ghi hồ sơ NCS: chỉ ADMIN/PDT.
    [Route("api/[controller]")]
    [ApiController]
    [Authorize(Roles = "ADMIN,PDT,BGH,TBM,KHOA,NHD,PBDL,NCS")]
    public class NghiencuusinhsController : ControllerBase
    {
        private readonly DtmsDbContext _context;

        public NghiencuusinhsController(DtmsDbContext context)
        {
            _context = context;
        }

        // GET: api/Nghiencuusinhs
        [HttpGet]
        public async Task<ActionResult<IEnumerable<NghiencuusinhDto>>> GetNghiencuusinh()
        {
            var query = _context.Nghiencuusinhs.AsNoTracking().AsQueryable();
            var readable = await Access.ReadableNcsAsync(_context, User);
            if (readable != null)
            {
                query = query.Where(ncs => readable.Contains(ncs.MaNcs));
            }

            var ds = await query.Select(ncs => new NghiencuusinhDto
            {
                MaNcs = ncs.MaNcs,
                HoTen = ncs.HoTen,
                NgaySinh = ncs.NgaySinh,
                GioiTinh = ncs.GioiTinh,
                MaNganh = ncs.MaNganh,
                DoiTuongDauVao = ncs.DoiTuongDauVao,
                SoQdtrungTuyen = ncs.SoQdtrungTuyen,
                NgayNhapHoc = ncs.NgayNhapHoc,
                NgayHetHanChuan = ncs.NgayHetHanChuan,
                NgayHetHanToiDa = ncs.NgayHetHanToiDa,
                TrangThaiHocVu = ncs.TrangThaiHocVu
            }).ToListAsync();

            return Ok(ds);
        }

        // GET: api/Nghiencuusinhs/NCS01
        [HttpGet("{mancs}")]
        public async Task<ActionResult<NghiencuusinhDto>> GetNghiencuusinh(string mancs)
        {
            if (!await Access.CanReadNcsAsync(_context, User, mancs)) return NotFound();

            var ncs = await _context.Nghiencuusinhs.AsNoTracking()
                .Where(x => x.MaNcs == mancs)
                .Select(x => new NghiencuusinhDto
                {
                    MaNcs = x.MaNcs,
                    HoTen = x.HoTen,
                    NgaySinh = x.NgaySinh,
                    GioiTinh = x.GioiTinh,
                    MaNganh = x.MaNganh,
                    DoiTuongDauVao = x.DoiTuongDauVao,
                    SoQdtrungTuyen = x.SoQdtrungTuyen,
                    NgayNhapHoc = x.NgayNhapHoc,
                    NgayHetHanChuan = x.NgayHetHanChuan,
                    NgayHetHanToiDa = x.NgayHetHanToiDa,
                    TrangThaiHocVu = x.TrangThaiHocVu
                })
                .FirstOrDefaultAsync();

            if (ncs == null) return NotFound();
            return Ok(ncs);
        }

        // PUT: api/Nghiencuusinhs/NCS01
        // Chỉ cập nhật trường hồ sơ; KHÔNG cập nhật mã tài khoản, trạng thái hoặc hạn đào tạo.
        [HttpPut("{mancs}")]
        [Authorize(Roles = "ADMIN,PDT")]
        public async Task<IActionResult> PutNghiencuusinh(string mancs, [FromBody] UpdateNghiencuusinhRequest request)
        {
            if (string.IsNullOrWhiteSpace(request.HoTen) || string.IsNullOrWhiteSpace(request.SoQdtrungTuyen) ||
                string.IsNullOrWhiteSpace(request.MaNganh))
            {
                return BadRequest(new { Success = false, Message = "Họ tên, mã ngành và số quyết định trúng tuyển không được để trống." });
            }

            if (request.NgaySinh >= request.NgayNhapHoc)
            {
                return BadRequest(new { Success = false, Message = "Ngày sinh phải trước ngày nhập học." });
            }

            var ncs = await _context.Nghiencuusinhs.FindAsync(mancs);
            if (ncs == null) return NotFound();

            var maNganh = request.MaNganh.Trim();
            if (!await _context.Nganhdaotaos.AnyAsync(n => n.MaNganh == maNganh))
            {
                return BadRequest(new { Success = false, Message = "Mã ngành không tồn tại." });
            }

            ncs.HoTen = request.HoTen.Trim();
            ncs.NgaySinh = request.NgaySinh!.Value;
            ncs.GioiTinh = request.GioiTinh!.Value;
            ncs.MaNganh = maNganh;
            ncs.DoiTuongDauVao = request.DoiTuongDauVao!.Value;
            ncs.SoQdtrungTuyen = request.SoQdtrungTuyen.Trim();
            ncs.NgayNhapHoc = request.NgayNhapHoc!.Value;

            // Bảo vệ tính nhất quán với các hạn đào tạo hiện tại.
            if (ncs.NgayNhapHoc > ncs.NgayHetHanChuan || ncs.NgayHetHanChuan > ncs.NgayHetHanToiDa)
            {
                return BadRequest(new { Success = false, Message = "Ngày nhập học không được sau hạn đào tạo; hạn chuẩn không được sau hạn tối đa." });
            }

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!await _context.Nghiencuusinhs.AnyAsync(n => n.MaNcs == mancs)) return NotFound();
                return Conflict(new { Success = false, Message = "Hồ sơ NCS đã thay đổi bởi thao tác khác. Vui lòng tải lại." });
            }
            catch (DbUpdateException ex) when (ex.InnerException is MySqlException { Number: 1452 })
            {
                return Conflict(new { Success = false, Message = "Không thể cập nhật do dữ liệu tham chiếu không còn hợp lệ." });
            }

            return NoContent();
        }

        // POST: api/Nghiencuusinhs
        // Chỉ liên kết hồ sơ với tài khoản đã tồn tại và có vai trò NCS.
        [HttpPost]
        [Authorize(Roles = "ADMIN,PDT")]
        public async Task<ActionResult<NghiencuusinhDto>> PostNghiencuusinh([FromBody] CreateNghiencuusinhRequest request)
        {
            if (string.IsNullOrWhiteSpace(request.MaNcs) || string.IsNullOrWhiteSpace(request.HoTen) ||
                string.IsNullOrWhiteSpace(request.MaNganh) || string.IsNullOrWhiteSpace(request.SoQdtrungTuyen))
            {
                return BadRequest(new { Success = false, Message = "Mã NCS, họ tên, mã ngành và số quyết định là bắt buộc." });
            }

            if (request.NgaySinh >= request.NgayNhapHoc ||
                request.NgayNhapHoc > request.NgayHetHanChuan ||
                request.NgayHetHanChuan > request.NgayHetHanToiDa)
            {
                return BadRequest(new { Success = false, Message = "Thứ tự ngày sinh, nhập học, hạn chuẩn và hạn tối đa không hợp lệ." });
            }

            var maNcs = request.MaNcs.Trim();
            var maNganh = request.MaNganh.Trim();

            if (await _context.Nghiencuusinhs.AnyAsync(n => n.MaNcs == maNcs))
            {
                return Conflict(new { Success = false, Message = "Mã nghiên cứu sinh đã tồn tại." });
            }

            if (!await _context.Nganhdaotaos.AnyAsync(n => n.MaNganh == maNganh))
            {
                return BadRequest(new { Success = false, Message = "Mã ngành không tồn tại." });
            }

            if (!await _context.Nguoidungs.AnyAsync(u => u.MaNguoiDung == request.MaNguoiDung &&
                                                      u.MaVaiTros.Any(v => v.MaVaiTro == "NCS")))
            {
                return BadRequest(new { Success = false, Message = "Tài khoản không tồn tại hoặc chưa có vai trò NCS." });
            }

            if (await _context.Nghiencuusinhs.AnyAsync(n => n.MaNguoiDung == request.MaNguoiDung))
            {
                return Conflict(new { Success = false, Message = "Tài khoản đã được liên kết với một hồ sơ NCS." });
            }

            var ncs = new Nghiencuusinh
            {
                MaNcs = maNcs,
                MaNguoiDung = request.MaNguoiDung,
                HoTen = request.HoTen.Trim(),
                NgaySinh = request.NgaySinh!.Value,
                GioiTinh = request.GioiTinh!.Value,
                MaNganh = maNganh,
                DoiTuongDauVao = request.DoiTuongDauVao!.Value,
                SoQdtrungTuyen = request.SoQdtrungTuyen.Trim(),
                NgayNhapHoc = request.NgayNhapHoc!.Value,
                NgayHetHanChuan = request.NgayHetHanChuan!.Value,
                NgayHetHanToiDa = request.NgayHetHanToiDa!.Value,
                TrangThaiHocVu = 1
            };

            _context.Nghiencuusinhs.Add(ncs);
            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateException ex) when (ex.InnerException is MySqlException { Number: 1062 or 1452 })
            {
                return Conflict(new { Success = false, Message = "Mã NCS, tài khoản hoặc dữ liệu liên kết bị trùng/không hợp lệ." });
            }

            var dto = new NghiencuusinhDto
            {
                MaNcs = ncs.MaNcs,
                HoTen = ncs.HoTen,
                NgaySinh = ncs.NgaySinh,
                GioiTinh = ncs.GioiTinh,
                MaNganh = ncs.MaNganh,
                DoiTuongDauVao = ncs.DoiTuongDauVao,
                SoQdtrungTuyen = ncs.SoQdtrungTuyen,
                NgayNhapHoc = ncs.NgayNhapHoc,
                NgayHetHanChuan = ncs.NgayHetHanChuan,
                NgayHetHanToiDa = ncs.NgayHetHanToiDa,
                TrangThaiHocVu = ncs.TrangThaiHocVu
            };

            return CreatedAtAction(nameof(GetNghiencuusinh), new { mancs = ncs.MaNcs }, dto);
        }

        // DELETE: api/Nghiencuusinhs/NCS01
        // Không xóa hồ sơ đã có nghiệp vụ để bảo vệ dữ liệu lịch sử.
        [HttpDelete("{mancs}")]
        [Authorize(Roles = "ADMIN,PDT")]
        public async Task<IActionResult> DeleteNghiencuusinh(string mancs)
        {
            var ncs = await _context.Nghiencuusinhs.FindAsync(mancs);
            if (ncs == null) return NotFound();

            // Các bảng này chưa có FK trong bản SQL được cung cấp.
            // Chặn xóa trước để tránh tạo dữ liệu mồ côi.
            if (await _context.DangKyHocphans.AnyAsync(d => d.MaNcs == mancs) ||
                await _context.YeucauHocvus.AnyAsync(y => y.MaNcs == mancs) ||
                await _context.LylichKhoahocs.AnyAsync(l => l.VaiTro == "NCS" && l.MaNguoi == mancs))
            {
                return Conflict(new { Success = false, Message = "Hồ sơ đã có dữ liệu học vụ/liên quan, không thể xóa." });
            }

            _context.Nghiencuusinhs.Remove(ncs);
            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateException ex) when (ex.InnerException is MySqlException { Number: 1451 })
            {
                return Conflict(new { Success = false, Message = "Nghiên cứu sinh có dữ liệu liên quan. Không thể xóa hồ sơ." });
            }
            catch (DbUpdateConcurrencyException)
            {
                return NotFound();
            }

            return NoContent();
        }
    }
}
