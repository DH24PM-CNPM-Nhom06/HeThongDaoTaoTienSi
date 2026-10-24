using DTMS.Api.DTOs;
using DTMS.Api.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

[Route("api/[controller]")]
[ApiController]
public class NguoidungsController : ControllerBase
{
    private readonly DtmsDbContext _context;
    public NguoidungsController(DtmsDbContext context)
    {
        _context = context;
    }

    // GET: api/Nguoidung
    [HttpGet]
    public async Task<ActionResult<IEnumerable<NguoidungDto>>> GetNguoidungs()
    {
        var dsNguoiDung = await _context.Nguoidungs
            .Select(nd => new NguoidungDto
            {
                MaNguoiDung = nd.MaNguoiDung,
                TenDangNhap = nd.TenDangNhap,
                MatKhauHash = nd.MatKhauHash,
                Email = nd.Email,
                SoDienThoai = nd.SoDienThoai,
                LaHoatDong = nd.LaHoatDong,
                NgayTao = nd.NgayTao
            })
            .ToListAsync();
        return Ok(dsNguoiDung);
    }

    // GET: api/Nguoidung/5
    [HttpGet("{manguoidung}")]
    public async Task<ActionResult<Nguoidung>> GetNguoidung(int manguoidung)
    {
        var nguoidung = await _context.Nguoidungs.FindAsync(manguoidung);

        if (nguoidung == null)
        {
            return NotFound();
        }

        return nguoidung;
    }

    // PUT: api/Nguoidung/5
    // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
    [HttpPut("{manguoidung}")]
    public async Task<IActionResult> PutNguoidung(int? manguoidung, Nguoidung nguoidung)
    {
        if (manguoidung != nguoidung.MaNguoiDung)
        {
            return BadRequest();
        }

        _context.Entry(nguoidung).State = EntityState.Modified;

        try
        {
            await _context.SaveChangesAsync();
        }
        catch (DbUpdateConcurrencyException)
        {
            if (!NguoidungExists(manguoidung))
            {
                return NotFound();
            }
            else
            {
                throw;
            }
        }

        return NoContent();
    }

    // POST: api/Nguoidung
    // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
    [HttpPost]
    public async Task<ActionResult<Nguoidung>> PostNguoidung(Nguoidung nguoidung)
    {
        _context.Nguoidungs.Add(nguoidung);
        await _context.SaveChangesAsync();

        return CreatedAtAction("GetNguoidung", new { manguoidung = nguoidung.MaNguoiDung }, nguoidung);
    }

    // DELETE: api/Nguoidung/5
    [HttpDelete("{manguoidung}")]
    public async Task<IActionResult> DeleteNguoidung(int? manguoidung)
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

    private bool NguoidungExists(int? manguoidung)
    {
        return _context.Nguoidungs.Any(e => e.MaNguoiDung == manguoidung);
    }
}
