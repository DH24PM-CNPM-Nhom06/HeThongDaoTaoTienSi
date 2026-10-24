using DTMS.Api.DTOs;
using DTMS.Api.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

[Route("api/[controller]")]
[ApiController]
public class VaitroesController : ControllerBase
{
    private readonly DtmsDbContext _context;
    public VaitroesController(DtmsDbContext context)
    {
        _context = context;
    }

    // GET: api/Vaitro
    [HttpGet]
    public async Task<ActionResult<IEnumerable<VaitroDto>>> GetVaitros()
    {
        var dsVaiTro = await _context.Vaitros
            .Select(vt => new VaitroDto
            {
                MaVaiTro = vt.MaVaiTro,
                TenVaiTro = vt.TenVaiTro
            })
            .ToListAsync();
        return Ok(dsVaiTro);
    }

    // GET: api/Vaitro/5
    [HttpGet("{mavaitro}")]
    public async Task<ActionResult<Vaitro>> GetVaitro(string mavaitro)
    {
        var vaitro = await _context.Vaitros.FindAsync(mavaitro);

        if (vaitro == null)
        {
            return NotFound();
        }

        return vaitro;
    }

    // PUT: api/Vaitro/5
    // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
    [HttpPut("{mavaitro}")]
    public async Task<IActionResult> PutVaitro(string? mavaitro, Vaitro vaitro)
    {
        if (mavaitro != vaitro.MaVaiTro)
        {
            return BadRequest();
        }

        _context.Entry(vaitro).State = EntityState.Modified;

        try
        {
            await _context.SaveChangesAsync();
        }
        catch (DbUpdateConcurrencyException)
        {
            if (!VaitroExists(mavaitro))
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

    // POST: api/Vaitro
    // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
    [HttpPost]
    public async Task<ActionResult<Vaitro>> PostVaitro(Vaitro vaitro)
    {
        _context.Vaitros.Add(vaitro);
        await _context.SaveChangesAsync();

        return CreatedAtAction("GetVaitro", new { mavaitro = vaitro.MaVaiTro }, vaitro);
    }

    // DELETE: api/Vaitro/5
    [HttpDelete("{mavaitro}")]
    public async Task<IActionResult> DeleteVaitro(string? mavaitro)
    {
        var vaitro = await _context.Vaitros.FindAsync(mavaitro);
        if (vaitro == null)
        {
            return NotFound();
        }

        _context.Vaitros.Remove(vaitro);
        await _context.SaveChangesAsync();

        return NoContent();
    }

    private bool VaitroExists(string? mavaitro)
    {
        return _context.Vaitros.Any(e => e.MaVaiTro == mavaitro);
    }
}
