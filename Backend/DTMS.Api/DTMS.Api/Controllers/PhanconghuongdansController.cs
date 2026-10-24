using DTMS.Api.DTOs;
using DTMS.Api.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

[Route("api/[controller]")]
[ApiController]
public class PhanconghuongdansController : ControllerBase
{
    private readonly DtmsDbContext _context;
    public PhanconghuongdansController(DtmsDbContext context)
    {
        _context = context;
    }

    // GET: api/Phanconghuongdan
    [HttpGet]
    public async Task<ActionResult<IEnumerable<PhanconghuongdanDto>>> GetPhanconghuongdans()
    {
        var dsPhanCong = await _context.Phanconghuongdans
            .Select(pc => new PhanconghuongdanDto
            {
                MaPhanCong = pc.MaPhanCong,
                MaNcs = pc.MaNcs,
                MaGv = pc.MaGv,
                VaiTro = pc.VaiTro,
                SoQuyetDinh = pc.SoQuyetDinh,
                NgayHieuLuc = pc.NgayHieuLuc,
                NgayKetThuc = pc.NgayKetThuc,
                TrangThai = pc.TrangThai
            })
            .ToListAsync();
        return Ok(dsPhanCong);
    }

    // GET: api/Phanconghuongdan/5
    [HttpGet("{maphancong}")]
    public async Task<ActionResult<Phanconghuongdan>> GetPhanconghuongdan(int maphancong)
    {
        var phanconghuongdan = await _context.Phanconghuongdans.FindAsync(maphancong);

        if (phanconghuongdan == null)
        {
            return NotFound();
        }

        return phanconghuongdan;
    }

    // PUT: api/Phanconghuongdan/5
    // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
    [HttpPut("{maphancong}")]
    public async Task<IActionResult> PutPhanconghuongdan(int? maphancong, Phanconghuongdan phanconghuongdan)
    {
        if (maphancong != phanconghuongdan.MaPhanCong)
        {
            return BadRequest();
        }

        _context.Entry(phanconghuongdan).State = EntityState.Modified;

        try
        {
            await _context.SaveChangesAsync();
        }
        catch (DbUpdateConcurrencyException)
        {
            if (!PhanconghuongdanExists(maphancong))
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

    // POST: api/Phanconghuongdan
    // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
    [HttpPost]
    public async Task<ActionResult<Phanconghuongdan>> PostPhanconghuongdan(Phanconghuongdan phanconghuongdan)
    {
        _context.Phanconghuongdans.Add(phanconghuongdan);
        await _context.SaveChangesAsync();

        return CreatedAtAction("GetPhanconghuongdan", new { maphancong = phanconghuongdan.MaPhanCong }, phanconghuongdan);
    }

    // DELETE: api/Phanconghuongdan/5
    [HttpDelete("{maphancong}")]
    public async Task<IActionResult> DeletePhanconghuongdan(int? maphancong)
    {
        var phanconghuongdan = await _context.Phanconghuongdans.FindAsync(maphancong);
        if (phanconghuongdan == null)
        {
            return NotFound();
        }

        _context.Phanconghuongdans.Remove(phanconghuongdan);
        await _context.SaveChangesAsync();

        return NoContent();
    }

    private bool PhanconghuongdanExists(int? maphancong)
    {
        return _context.Phanconghuongdans.Any(e => e.MaPhanCong == maphancong);
    }
}
