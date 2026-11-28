using DTMS.Api.DTOs;
using DTMS.Api.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

[Route("api/[controller]")]
[ApiController]
[Authorize(Roles = "ADMIN")]
public class NguoidungsController : ControllerBase
{
    private readonly DtmsDbContext _context;

    public NguoidungsController(DtmsDbContext context)
    {
        _context = context;
    }

    // GET: api/Nguoidungs
    [HttpGet]
    public async Task<ActionResult<IEnumerable<NguoidungDto>>> GetNguoidungs()
    {
        var ds = await _context.Nguoidungs
            .Select(nd => new NguoidungDto
            {
                MaNguoiDung = nd.MaNguoiDung,
                TenDangNhap = nd.TenDangNhap,
                Email = nd.Email,
                SoDienThoai = nd.SoDienThoai,
                LaHoatDong = nd.LaHoatDong,
                NgayTao = nd.NgayTao
            })
            .ToListAsync();

        return Ok(ds);
    }

    // GET: api/Nguoidungs/5
    [HttpGet("{manguoidung:int}")]
    public async Task<ActionResult<NguoidungDto>> GetNguoidung(int manguoidung)
    {
        var nd = await _context.Nguoidungs
            .Where(x => x.MaNguoiDung == manguoidung)
            .Select(x => new NguoidungDto
            {
                MaNguoiDung = x.MaNguoiDung,
                TenDangNhap = x.TenDangNhap,
                Email = x.Email,
                SoDienThoai = x.SoDienThoai,
                LaHoatDong = x.LaHoatDong,
                NgayTao = x.NgayTao
            })
            .FirstOrDefaultAsync();

        if (nd == null)
        {
            return NotFound();
        }

        return Ok(nd);
    }

    // POST: api/Nguoidungs  (tạo tài khoản, mật khẩu được băm bằng BCrypt)
    [HttpPost]
    public async Task<ActionResult<NguoidungDto>> PostNguoidung(CreateNguoidungRequest request)
    {
        var tenDangNhap = request.TenDangNhap.Trim();
        var email = request.Email.Trim();

        if (await _context.Nguoidungs.AnyAsync(x => x.TenDangNhap == tenDangNhap))
        {
            return Conflict(new { Success = false, Message = "Tên đăng nhập đã tồn tại." });
        }

        if (await _context.Nguoidungs.AnyAsync(x => x.Email == email))
        {
            return Conflict(new { Success = false, Message = "Email đã được sử dụng." });
        }

        var nguoidung = new Nguoidung
        {
            TenDangNhap = tenDangNhap,
            MatKhauHash = BCrypt.Net.BCrypt.HashPassword(request.Password),
            Email = email,
            SoDienThoai = request.SoDienThoai,
            LaHoatDong = true,
            NgayTao = DateTime.Now
        };

        _context.Nguoidungs.Add(nguoidung);
        await _context.SaveChangesAsync();

        var dto = new NguoidungDto
        {
            MaNguoiDung = nguoidung.MaNguoiDung,
            TenDangNhap = nguoidung.TenDangNhap,
            Email = nguoidung.Email,
            SoDienThoai = nguoidung.SoDienThoai,
            LaHoatDong = nguoidung.LaHoatDong,
            NgayTao = nguoidung.NgayTao
        };

        return CreatedAtAction(nameof(GetNguoidung), new { manguoidung = nguoidung.MaNguoiDung }, dto);
    }

    // PUT: api/Nguoidungs/5  (cập nhật thông tin, KHÔNG đổi mật khẩu)
    [HttpPut("{manguoidung:int}")]
    public async Task<IActionResult> PutNguoidung(int manguoidung, UpdateNguoidungRequest request)
    {
        var nguoidung = await _context.Nguoidungs.FindAsync(manguoidung);
        if (nguoidung == null)
        {
            return NotFound();
        }

        var email = request.Email.Trim();
        if (await _context.Nguoidungs.AnyAsync(x => x.Email == email && x.MaNguoiDung != manguoidung))
        {
            return Conflict(new { Success = false, Message = "Email đã được sử dụng." });
        }

        nguoidung.Email = email;
        nguoidung.SoDienThoai = request.SoDienThoai;
        nguoidung.LaHoatDong = request.LaHoatDong;

        await _context.SaveChangesAsync();
        return NoContent();
    }

    // PUT: api/Nguoidungs/5/password  (ADMIN đặt lại mật khẩu)
    [HttpPut("{manguoidung:int}/password")]
    public async Task<IActionResult> ResetPassword(int manguoidung, ResetPasswordRequest request)
    {
        var nguoidung = await _context.Nguoidungs.FindAsync(manguoidung);
        if (nguoidung == null)
        {
            return NotFound();
        }

        nguoidung.MatKhauHash = BCrypt.Net.BCrypt.HashPassword(request.NewPassword);
        await _context.SaveChangesAsync();
        return NoContent();
    }

    // DELETE: api/Nguoidungs/5
    [HttpDelete("{manguoidung:int}")]
    public async Task<IActionResult> DeleteNguoidung(int manguoidung)
    {
        var nguoidung = await _context.Nguoidungs.FindAsync(manguoidung);
        if (nguoidung == null)
        {
            return NotFound();
        }

        _context.Nguoidungs.Remove(nguoidung);
        await _context.SaveChangesAsync();

        return NoContent();
    }
}