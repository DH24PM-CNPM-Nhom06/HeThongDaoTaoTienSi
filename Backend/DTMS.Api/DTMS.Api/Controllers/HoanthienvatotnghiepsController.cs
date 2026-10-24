using DTMS.Api.DTOs;
using DTMS.Api.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

[Route("api/[controller]")]
[ApiController]
public class HoanthienvatotnghiepsController : ControllerBase
{
    private readonly DtmsDbContext _context;
    public HoanthienvatotnghiepsController(DtmsDbContext context)
    {
        _context = context;
    }

    // GET: api/Hoanthienvatotnghiep
    [HttpGet]
    public async Task<ActionResult<IEnumerable<HoanthienvatotnghiepDto>>> GetHoanthienvatotnghieps()
    {
        var dsTotNghiep = await _context.Hoanthienvatotnghieps
            .Select(tn => new HoanthienvatotnghiepDto
            {
                MaTotNghiep = tn.MaTotNghiep,
                MaNcs = tn.MaNcs,
                NgayCongKhaiWeb = tn.NgayCongKhaiWeb,
                FileGiaiTrinhSauBv = tn.FileGiaiTrinhSauBv,
                BienNhanTvqg = tn.BienNhanTvqg,
                BienNhanTvtruong = tn.BienNhanTvtruong,
                SoQdcapBang = tn.SoQdcapBang,
                NgayCapBang = tn.NgayCapBang,
                SoHieuBang = tn.SoHieuBang,
                SoVaoSoGoc = tn.SoVaoSoGoc
            })
            .ToListAsync();
        return Ok(dsTotNghiep);
    }

    // GET: api/Hoanthienvatotnghiep/5
    [HttpGet("{matotnghiep}")]
    public async Task<ActionResult<Hoanthienvatotnghiep>> GetHoanthienvatotnghiep(int matotnghiep)
    {
        var hoanthienvatotnghiep = await _context.Hoanthienvatotnghieps.FindAsync(matotnghiep);

        if (hoanthienvatotnghiep == null)
        {
            return NotFound();
        }

        return hoanthienvatotnghiep;
    }

    // PUT: api/Hoanthienvatotnghiep/5
    // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
    [HttpPut("{matotnghiep}")]
    public async Task<IActionResult> PutHoanthienvatotnghiep(int? matotnghiep, Hoanthienvatotnghiep hoanthienvatotnghiep)
    {
        if (matotnghiep != hoanthienvatotnghiep.MaTotNghiep)
        {
            return BadRequest();
        }

        _context.Entry(hoanthienvatotnghiep).State = EntityState.Modified;

        try
        {
            await _context.SaveChangesAsync();
        }
        catch (DbUpdateConcurrencyException)
        {
            if (!HoanthienvatotnghiepExists(matotnghiep))
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

    // POST: api/Hoanthienvatotnghiep
    // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
    [HttpPost]
    public async Task<ActionResult<Hoanthienvatotnghiep>> PostHoanthienvatotnghiep(Hoanthienvatotnghiep hoanthienvatotnghiep)
    {
        _context.Hoanthienvatotnghieps.Add(hoanthienvatotnghiep);
        await _context.SaveChangesAsync();

        return CreatedAtAction("GetHoanthienvatotnghiep", new { matotnghiep = hoanthienvatotnghiep.MaTotNghiep }, hoanthienvatotnghiep);
    }

    // DELETE: api/Hoanthienvatotnghiep/5
    [HttpDelete("{matotnghiep}")]
    public async Task<IActionResult> DeleteHoanthienvatotnghiep(int? matotnghiep)
    {
        var hoanthienvatotnghiep = await _context.Hoanthienvatotnghieps.FindAsync(matotnghiep);
        if (hoanthienvatotnghiep == null)
        {
            return NotFound();
        }

        _context.Hoanthienvatotnghieps.Remove(hoanthienvatotnghiep);
        await _context.SaveChangesAsync();

        return NoContent();
    }

    private bool HoanthienvatotnghiepExists(int? matotnghiep)
    {
        return _context.Hoanthienvatotnghieps.Any(e => e.MaTotNghiep == matotnghiep);
    }
}
