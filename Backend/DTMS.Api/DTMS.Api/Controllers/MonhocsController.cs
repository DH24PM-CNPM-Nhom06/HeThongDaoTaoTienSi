using Microsoft.AspNetCore.Authorization;
using DTMS.Api.DTOs;
using DTMS.Api.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

[Route("api/[controller]")]
[ApiController]
[Authorize]
public class MonhocsController : ControllerBase
{
    private readonly DtmsDbContext _context;
    public MonhocsController(DtmsDbContext context)
    {
        _context = context;
    }

    // GET: api/Monhoc
    [HttpGet]
    public async Task<ActionResult<IEnumerable<MonhocDto>>> GetMonhocs()
    {
        var dsMonHoc = await _context.Monhocs
            .Select(mh => new MonhocDto
            {
                MaMonHoc = mh.MaMonHoc,
                TenMonHoc = mh.TenMonHoc,
                SoTinChi = mh.SoTinChi,
                LoaiMon = mh.LoaiMon
            })
            .ToListAsync();
        return Ok(dsMonHoc);
    }

    // GET: api/Monhoc/5
    [HttpGet("{mamonhoc}")]
    public async Task<ActionResult<Monhoc>> GetMonhoc(string mamonhoc)
    {
        var monhoc = await _context.Monhocs.FindAsync(mamonhoc);

        if (monhoc == null)
        {
            return NotFound();
        }

        return monhoc;
    }

    // PUT: api/Monhoc/5
    // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
    [Authorize(Roles = "ADMIN,PDT")]
    [HttpPut("{mamonhoc}")]
    public async Task<IActionResult> PutMonhoc(string? mamonhoc, Monhoc monhoc)
    {
        if (mamonhoc != monhoc.MaMonHoc)
        {
            return BadRequest();
        }

        _context.Entry(monhoc).State = EntityState.Modified;

        try
        {
            await _context.SaveChangesAsync();
        }
        catch (DbUpdateConcurrencyException)
        {
            if (!MonhocExists(mamonhoc))
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

    // POST: api/Monhoc
    // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
    [Authorize(Roles = "ADMIN,PDT")]
    [HttpPost]
    public async Task<ActionResult<Monhoc>> PostMonhoc(Monhoc monhoc)
    {
        _context.Monhocs.Add(monhoc);
        await _context.SaveChangesAsync();

        return CreatedAtAction("GetMonhoc", new { mamonhoc = monhoc.MaMonHoc }, monhoc);
    }

    // DELETE: api/Monhoc/5
    [Authorize(Roles = "ADMIN,PDT")]
    [HttpDelete("{mamonhoc}")]
    public async Task<IActionResult> DeleteMonhoc(string? mamonhoc)
    {
        var monhoc = await _context.Monhocs.FindAsync(mamonhoc);
        if (monhoc == null)
        {
            return NotFound();
        }

        _context.Monhocs.Remove(monhoc);
        await _context.SaveChangesAsync();

        return NoContent();
    }

    private bool MonhocExists(string? mamonhoc)
    {
        return _context.Monhocs.Any(e => e.MaMonHoc == mamonhoc);
    }
}
