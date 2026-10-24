using DTMS.Api.DTOs;
using DTMS.Api.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

[Route("api/[controller]")]
[ApiController]
public class DetailuanansController : ControllerBase
{
    private readonly DtmsDbContext _context;
    public DetailuanansController(DtmsDbContext context)
    {
        _context = context;
    }

    // GET: api/Detailuanan
    [HttpGet]
    public async Task<ActionResult<IEnumerable<DetailuananDto>>> GetDetailuanans()
    {
        var dsDeTai = await _context.Detailuanans
            .Select(dt => new DetailuananDto
            {
                MaDeTai = dt.MaDeTai,
                MaNcs = dt.MaNcs,
                TenDeTaiVn = dt.TenDeTaiVn,
                TenDeTaiEn = dt.TenDeTaiEn,
                LanChinhSua = dt.LanChinhSua,
                SoQddieuChinh = dt.SoQddieuChinh,
                FileToanVan = dt.FileToanVan,
                FileTomTat = dt.FileTomTat,
                TrangThaiKhoa = dt.TrangThaiKhoa
            })
            .ToListAsync();
        return Ok(dsDeTai);
    }

    // GET: api/Detailuanan/5
    [HttpGet("{madetai}")]
    public async Task<ActionResult<Detailuanan>> GetDetailuanan(int madetai)
    {
        var detailuanan = await _context.Detailuanans.FindAsync(madetai);

        if (detailuanan == null)
        {
            return NotFound();
        }

        return detailuanan;
    }

    // PUT: api/Detailuanan/5
    // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
    [HttpPut("{madetai}")]
    public async Task<IActionResult> PutDetailuanan(int? madetai, Detailuanan detailuanan)
    {
        if (madetai != detailuanan.MaDeTai)
        {
            return BadRequest();
        }

        _context.Entry(detailuanan).State = EntityState.Modified;

        try
        {
            await _context.SaveChangesAsync();
        }
        catch (DbUpdateConcurrencyException)
        {
            if (!DetailuananExists(madetai))
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

    // POST: api/Detailuanan
    // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
    [HttpPost]
    public async Task<ActionResult<Detailuanan>> PostDetailuanan(Detailuanan detailuanan)
    {
        _context.Detailuanans.Add(detailuanan);
        await _context.SaveChangesAsync();

        return CreatedAtAction("GetDetailuanan", new { madetai = detailuanan.MaDeTai }, detailuanan);
    }

    // DELETE: api/Detailuanan/5
    [HttpDelete("{madetai}")]
    public async Task<IActionResult> DeleteDetailuanan(int? madetai)
    {
        var detailuanan = await _context.Detailuanans.FindAsync(madetai);
        if (detailuanan == null)
        {
            return NotFound();
        }

        _context.Detailuanans.Remove(detailuanan);
        await _context.SaveChangesAsync();

        return NoContent();
    }

    private bool DetailuananExists(int? madetai)
    {
        return _context.Detailuanans.Any(e => e.MaDeTai == madetai);
    }
}
