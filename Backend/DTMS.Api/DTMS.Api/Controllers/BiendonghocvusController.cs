using DTMS.Api.DTOs;
using DTMS.Api.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

[Route("api/[controller]")]
[ApiController]
public class BiendonghocvusController : ControllerBase
{
    private readonly DtmsDbContext _context;
    public BiendonghocvusController(DtmsDbContext context)
    {
        _context = context;
    }

    // GET: api/Biendonghocvu
    [HttpGet]
    public async Task<ActionResult<IEnumerable<BiendonghocvuDto>>> GetBiendonghocvus()
    {
        var dsBienDong = await _context.Biendonghocvus
            .Select(bd => new BiendonghocvuDto
            {
                MaBienDong = bd.MaBienDong,
                MaNcs = bd.MaNcs,
                LoaiBienDong = bd.LoaiBienDong,
                SoThang = bd.SoThang,
                SoQuyetDinh = bd.SoQuyetDinh,
                NgayHieuLuc = bd.NgayHieuLuc,
                NgayHetHanMoi = bd.NgayHetHanMoi,
                LyDo = bd.LyDo,
                FileQuyetDinh = bd.FileQuyetDinh
            })
            .ToListAsync();
        return Ok(dsBienDong);
    }

    // GET: api/Biendonghocvu/5
    [HttpGet("{mabiendong}")]
    public async Task<ActionResult<Biendonghocvu>> GetBiendonghocvu(int mabiendong)
    {
        var biendonghocvu = await _context.Biendonghocvus.FindAsync(mabiendong);

        if (biendonghocvu == null)
        {
            return NotFound();
        }

        return biendonghocvu;
    }

    // PUT: api/Biendonghocvu/5
    // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
    [HttpPut("{mabiendong}")]
    public async Task<IActionResult> PutBiendonghocvu(int? mabiendong, Biendonghocvu biendonghocvu)
    {
        if (mabiendong != biendonghocvu.MaBienDong)
        {
            return BadRequest();
        }

        _context.Entry(biendonghocvu).State = EntityState.Modified;

        try
        {
            await _context.SaveChangesAsync();
        }
        catch (DbUpdateConcurrencyException)
        {
            if (!BiendonghocvuExists(mabiendong))
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

    // POST: api/Biendonghocvu
    // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
    [HttpPost]
    public async Task<ActionResult<Biendonghocvu>> PostBiendonghocvu(Biendonghocvu biendonghocvu)
    {
        _context.Biendonghocvus.Add(biendonghocvu);
        await _context.SaveChangesAsync();

        return CreatedAtAction("GetBiendonghocvu", new { mabiendong = biendonghocvu.MaBienDong }, biendonghocvu);
    }

    // DELETE: api/Biendonghocvu/5
    [HttpDelete("{mabiendong}")]
    public async Task<IActionResult> DeleteBiendonghocvu(int? mabiendong)
    {
        var biendonghocvu = await _context.Biendonghocvus.FindAsync(mabiendong);
        if (biendonghocvu == null)
        {
            return NotFound();
        }

        _context.Biendonghocvus.Remove(biendonghocvu);
        await _context.SaveChangesAsync();

        return NoContent();
    }

    private bool BiendonghocvuExists(int? mabiendong)
    {
        return _context.Biendonghocvus.Any(e => e.MaBienDong == mabiendong);
    }
}
