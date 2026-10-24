using DTMS.Api.DTOs;
using DTMS.Api.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

[Route("api/[controller]")]
[ApiController]
public class ChungchingoaingusController : ControllerBase
{
    private readonly DtmsDbContext _context;
    public ChungchingoaingusController(DtmsDbContext context)
    {
        _context = context;
    }

    // GET: api/Chungchingoaingu
    [HttpGet]
    public async Task<ActionResult<IEnumerable<ChungchingoainguDto>>> GetChungchingoaingus()
    {
        var dsChungChi = await _context.Chungchingoaingus
            .Select(cc => new ChungchingoainguDto
            {
                MaChungChi = cc.MaChungChi,
                MaNcs = cc.MaNcs,
                TenChungChi = cc.TenChungChi,
                DiemSo = cc.DiemSo,
                NgayCap = cc.NgayCap,
                NgayHetHan = cc.NgayHetHan,
                NoiCap = cc.NoiCap,
                FileMinhChung = cc.FileMinhChung,
                TrangThaiDuyet = cc.TrangThaiDuyet
            })
            .ToListAsync();
        return Ok(dsChungChi);
    }

    // GET: api/Chungchingoaingu/5
    [HttpGet("{machungchi}")]
    public async Task<ActionResult<Chungchingoaingu>> GetChungchingoaingu(int machungchi)
    {
        var chungchingoaingu = await _context.Chungchingoaingus.FindAsync(machungchi);

        if (chungchingoaingu == null)
        {
            return NotFound();
        }

        return chungchingoaingu;
    }

    // PUT: api/Chungchingoaingu/5
    // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
    [HttpPut("{machungchi}")]
    public async Task<IActionResult> PutChungchingoaingu(int? machungchi, Chungchingoaingu chungchingoaingu)
    {
        if (machungchi != chungchingoaingu.MaChungChi)
        {
            return BadRequest();
        }

        _context.Entry(chungchingoaingu).State = EntityState.Modified;

        try
        {
            await _context.SaveChangesAsync();
        }
        catch (DbUpdateConcurrencyException)
        {
            if (!ChungchingoainguExists(machungchi))
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

    // POST: api/Chungchingoaingu
    // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
    [HttpPost]
    public async Task<ActionResult<Chungchingoaingu>> PostChungchingoaingu(Chungchingoaingu chungchingoaingu)
    {
        _context.Chungchingoaingus.Add(chungchingoaingu);
        await _context.SaveChangesAsync();

        return CreatedAtAction("GetChungchingoaingu", new { machungchi = chungchingoaingu.MaChungChi }, chungchingoaingu);
    }

    // DELETE: api/Chungchingoaingu/5
    [HttpDelete("{machungchi}")]
    public async Task<IActionResult> DeleteChungchingoaingu(int? machungchi)
    {
        var chungchingoaingu = await _context.Chungchingoaingus.FindAsync(machungchi);
        if (chungchingoaingu == null)
        {
            return NotFound();
        }

        _context.Chungchingoaingus.Remove(chungchingoaingu);
        await _context.SaveChangesAsync();

        return NoContent();
    }

    private bool ChungchingoainguExists(int? machungchi)
    {
        return _context.Chungchingoaingus.Any(e => e.MaChungChi == machungchi);
    }
}
