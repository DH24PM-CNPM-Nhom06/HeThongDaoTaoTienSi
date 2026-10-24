using Microsoft.AspNetCore.Authorization;
using DTMS.Api.DTOs;
using DTMS.Api.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

[Route("api/[controller]")]
[ApiController]
//[Authorize]
public class KehoachhoctapsController : ControllerBase
{
    private readonly DtmsDbContext _context;
    public KehoachhoctapsController(DtmsDbContext context)
    {
        _context = context;
    }

    // GET: api/Kehoachhoctap
    [HttpGet]
    public async Task<ActionResult<IEnumerable<KehoachhoctapDto>>> GetKehoachhoctap()
    {
        var dsKehoach = await _context.Kehoachhoctaps
            .Select(kh => new KehoachhoctapDto
            {
                MaKeHoach = kh.MaKeHoach,
                MaNcs = kh.MaNcs,
                NamHoc = kh.NamHoc,
                HocKy = kh.HocKy,
                MaMonHoc = kh.MaMonHoc,
                NoiDungKeHoach = kh.NoiDungKeHoach,
                DuyetNhd = kh.DuyetNhd,
                YkienNhd = kh.YkienNhd,
                DuyetTbm = kh.DuyetTbm,
                DuyetPdt = kh.DuyetPdt,
                NgayCapNhat = kh.NgayCapNhat
            })
            .ToListAsync();

        return Ok(dsKehoach);
    }

    // GET: api/Kehoachhoctap/5
    [HttpGet("{makehoach}")]
    public async Task<ActionResult<Kehoachhoctap>> GetKehoachhoctap(int makehoach)
    {
        var kehoachhoctap = await _context.Kehoachhoctaps.FindAsync(makehoach);

        if (kehoachhoctap == null)
        {
            return NotFound();
        }

        return kehoachhoctap;
    }

    // PUT: api/Kehoachhoctap/5
    // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
    [HttpPut("{makehoach}")]
    public async Task<IActionResult> PutKehoachhoctap(int? makehoach, Kehoachhoctap kehoachhoctap)
    {
        if (makehoach != kehoachhoctap.MaKeHoach)
        {
            return BadRequest();
        }

        _context.Entry(kehoachhoctap).State = EntityState.Modified;

        try
        {
            await _context.SaveChangesAsync();
        }
        catch (DbUpdateConcurrencyException)
        {
            if (!KehoachhoctapExists(makehoach))
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

    // POST: api/Kehoachhoctap
    // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
    [HttpPost]
    public async Task<ActionResult<Kehoachhoctap>> PostKehoachhoctap(Kehoachhoctap kehoachhoctap)
    {
        _context.Kehoachhoctaps.Add(kehoachhoctap);
        await _context.SaveChangesAsync();

        return CreatedAtAction("GetKehoachhoctap", new { makehoach = kehoachhoctap.MaKeHoach }, kehoachhoctap);
    }

    // DELETE: api/Kehoachhoctap/5
    [HttpDelete("{makehoach}")]
    public async Task<IActionResult> DeleteKehoachhoctap(int? makehoach)
    {
        var kehoachhoctap = await _context.Kehoachhoctaps.FindAsync(makehoach);
        if (kehoachhoctap == null)
        {
            return NotFound();
        }

        _context.Kehoachhoctaps.Remove(kehoachhoctap);
        await _context.SaveChangesAsync();

        return NoContent();
    }

    private bool KehoachhoctapExists(int? makehoach)
    {
        return _context.Kehoachhoctaps.Any(e => e.MaKeHoach == makehoach);
    }
}
