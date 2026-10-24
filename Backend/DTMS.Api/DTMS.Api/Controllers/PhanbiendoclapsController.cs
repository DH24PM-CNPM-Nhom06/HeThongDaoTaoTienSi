using DTMS.Api.DTOs;
using DTMS.Api.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

[Route("api/[controller]")]
[ApiController]
public class PhanbiendoclapsController : ControllerBase
{
    private readonly DtmsDbContext _context;
    public PhanbiendoclapsController(DtmsDbContext context)
    {
        _context = context;
    }

    // GET: api/Phanbiendoclap
    [HttpGet]
    public async Task<ActionResult<IEnumerable<PhanbiendoclapDto>>> GetPhanbiendoclaps()
    {
        var dsPhanBien = await _context.Phanbiendoclaps
            .Select(pb => new PhanbiendoclapDto
            {
                MaPhanBien = pb.MaPhanBien,
                MaNcs = pb.MaNcs,
                MaGv = pb.MaGv,
                NgayGui = pb.NgayGui,
                NgayNhan = pb.NgayNhan,
                KetQua = pb.KetQua,
                FileNhanXet = pb.FileNhanXet
            })
            .ToListAsync();
        return Ok(dsPhanBien);
    }

    // GET: api/Phanbiendoclap/5
    [HttpGet("{maphanbien}")]
    public async Task<ActionResult<Phanbiendoclap>> GetPhanbiendoclap(int maphanbien)
    {
        var phanbiendoclap = await _context.Phanbiendoclaps.FindAsync(maphanbien);

        if (phanbiendoclap == null)
        {
            return NotFound();
        }

        return phanbiendoclap;
    }

    // PUT: api/Phanbiendoclap/5
    // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
    [HttpPut("{maphanbien}")]
    public async Task<IActionResult> PutPhanbiendoclap(int? maphanbien, Phanbiendoclap phanbiendoclap)
    {
        if (maphanbien != phanbiendoclap.MaPhanBien)
        {
            return BadRequest();
        }

        _context.Entry(phanbiendoclap).State = EntityState.Modified;

        try
        {
            await _context.SaveChangesAsync();
        }
        catch (DbUpdateConcurrencyException)
        {
            if (!PhanbiendoclapExists(maphanbien))
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

    // POST: api/Phanbiendoclap
    // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
    [HttpPost]
    public async Task<ActionResult<Phanbiendoclap>> PostPhanbiendoclap(Phanbiendoclap phanbiendoclap)
    {
        _context.Phanbiendoclaps.Add(phanbiendoclap);
        await _context.SaveChangesAsync();

        return CreatedAtAction("GetPhanbiendoclap", new { maphanbien = phanbiendoclap.MaPhanBien }, phanbiendoclap);
    }

    // DELETE: api/Phanbiendoclap/5
    [HttpDelete("{maphanbien}")]
    public async Task<IActionResult> DeletePhanbiendoclap(int? maphanbien)
    {
        var phanbiendoclap = await _context.Phanbiendoclaps.FindAsync(maphanbien);
        if (phanbiendoclap == null)
        {
            return NotFound();
        }

        _context.Phanbiendoclaps.Remove(phanbiendoclap);
        await _context.SaveChangesAsync();

        return NoContent();
    }

    private bool PhanbiendoclapExists(int? maphanbien)
    {
        return _context.Phanbiendoclaps.Any(e => e.MaPhanBien == maphanbien);
    }
}
