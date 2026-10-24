using DTMS.Api.DTOs;
using DTMS.Api.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

[Route("api/[controller]")]
[ApiController]
public class GiangviensController : ControllerBase
{
    private readonly DtmsDbContext _context;
    public GiangviensController(DtmsDbContext context)
    {
        _context = context;
    }

    // GET: api/Giangvien
    [HttpGet]
    public async Task<ActionResult<IEnumerable<GiangvienDto>>> GetGiangviens()
    {
        var dsGiangVien = await _context.Giangviens
            .Select(gv => new GiangvienDto
            {
                MaGv = gv.MaGv,
                MaNguoiDung = gv.MaNguoiDung,
                HoTen = gv.HoTen,
                HocHam = gv.HocHam,
                HocVi = gv.HocVi,
                DonViCongTac = gv.DonViCongTac,
                LaCanBoNgoaiTruong = gv.LaCanBoNgoaiTruong
            })
            .ToListAsync();
        return Ok(dsGiangVien);
    }

    // GET: api/Giangvien/5
    [HttpGet("{magv}")]
    public async Task<ActionResult<Giangvien>> GetGiangvien(string magv)
    {
        var giangvien = await _context.Giangviens.FindAsync(magv);

        if (giangvien == null)
        {
            return NotFound();
        }

        return giangvien;
    }

    // PUT: api/Giangvien/5
    // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
    [HttpPut("{magv}")]
    public async Task<IActionResult> PutGiangvien(string? magv, Giangvien giangvien)
    {
        if (magv != giangvien.MaGv)
        {
            return BadRequest();
        }

        _context.Entry(giangvien).State = EntityState.Modified;

        try
        {
            await _context.SaveChangesAsync();
        }
        catch (DbUpdateConcurrencyException)
        {
            if (!GiangvienExists(magv))
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

    // POST: api/Giangvien
    // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
    [HttpPost]
    public async Task<ActionResult<Giangvien>> PostGiangvien(Giangvien giangvien)
    {
        _context.Giangviens.Add(giangvien);
        await _context.SaveChangesAsync();

        return CreatedAtAction("GetGiangvien", new { magv = giangvien.MaGv }, giangvien);
    }

    // DELETE: api/Giangvien/5
    [HttpDelete("{magv}")]
    public async Task<IActionResult> DeleteGiangvien(string? magv)
    {
        var giangvien = await _context.Giangviens.FindAsync(magv);
        if (giangvien == null)
        {
            return NotFound();
        }

        _context.Giangviens.Remove(giangvien);
        await _context.SaveChangesAsync();

        return NoContent();
    }

    private bool GiangvienExists(string? magv)
    {
        return _context.Giangviens.Any(e => e.MaGv == magv);
    }
}
