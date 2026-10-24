using DTMS.Api.DTOs;
using DTMS.Api.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

[Route("api/[controller]")]
[ApiController]
public class KetquahocphansController : ControllerBase
{
    private readonly DtmsDbContext _context;
    public KetquahocphansController(DtmsDbContext context)
    {
        _context = context;
    }

    // GET: api/Ketquahocphan
    [HttpGet]
    public async Task<ActionResult<IEnumerable<KetquahocphanDto>>> GetKetquahocphans()
    {
        var dsKetQua = await _context.Ketquahocphans
            .Select(kq => new KetquahocphanDto
            {
                MaKetQua = kq.MaKetQua,
                MaNcs = kq.MaNcs,
                MaMonHoc = kq.MaMonHoc,
                DiemThi = kq.DiemThi,
                TrangThaiDat = kq.TrangThaiDat
            })
            .ToListAsync();
        return Ok(dsKetQua);
    }

    // GET: api/Ketquahocphan/5
    [HttpGet("{maketqua}")]
    public async Task<ActionResult<Ketquahocphan>> GetKetquahocphan(int maketqua)
    {
        var ketquahocphan = await _context.Ketquahocphans.FindAsync(maketqua);

        if (ketquahocphan == null)
        {
            return NotFound();
        }

        return ketquahocphan;
    }

    // PUT: api/Ketquahocphan/5
    // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
    [HttpPut("{maketqua}")]
    public async Task<IActionResult> PutKetquahocphan(int? maketqua, Ketquahocphan ketquahocphan)
    {
        if (maketqua != ketquahocphan.MaKetQua)
        {
            return BadRequest();
        }

        _context.Entry(ketquahocphan).State = EntityState.Modified;

        try
        {
            await _context.SaveChangesAsync();
        }
        catch (DbUpdateConcurrencyException)
        {
            if (!KetquahocphanExists(maketqua))
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

    // POST: api/Ketquahocphan
    // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
    [HttpPost]
    public async Task<ActionResult<Ketquahocphan>> PostKetquahocphan(Ketquahocphan ketquahocphan)
    {
        _context.Ketquahocphans.Add(ketquahocphan);
        await _context.SaveChangesAsync();

        return CreatedAtAction("GetKetquahocphan", new { maketqua = ketquahocphan.MaKetQua }, ketquahocphan);
    }

    // DELETE: api/Ketquahocphan/5
    [HttpDelete("{maketqua}")]
    public async Task<IActionResult> DeleteKetquahocphan(int? maketqua)
    {
        var ketquahocphan = await _context.Ketquahocphans.FindAsync(maketqua);
        if (ketquahocphan == null)
        {
            return NotFound();
        }

        _context.Ketquahocphans.Remove(ketquahocphan);
        await _context.SaveChangesAsync();

        return NoContent();
    }

    private bool KetquahocphanExists(int? maketqua)
    {
        return _context.Ketquahocphans.Any(e => e.MaKetQua == maketqua);
    }
}
