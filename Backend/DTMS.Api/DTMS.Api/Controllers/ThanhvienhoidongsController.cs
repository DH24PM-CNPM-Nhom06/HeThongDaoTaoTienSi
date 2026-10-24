using DTMS.Api.DTOs;
using DTMS.Api.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

[Route("api/[controller]")]
[ApiController]
public class ThanhvienhoidongsController : ControllerBase
{
    private readonly DtmsDbContext _context;
    public ThanhvienhoidongsController(DtmsDbContext context)
    {
        _context = context;
    }

    // GET: api/Thanhvienhoidong
    [HttpGet]
    public async Task<ActionResult<IEnumerable<ThanhvienhoidongDto>>> GetThanhvienhoidongs()
    {
        var dsThanhVien = await _context.Thanhvienhoidongs
            .Select(tv => new ThanhvienhoidongDto
            {
                MaHoiDong = tv.MaHoiDong,
                MaGv = tv.MaGv,
                VaiTro = tv.VaiTro,
                CoMat = tv.CoMat,
                DiemChuaTron = tv.DiemChuaTron,
                FilePhieuNhanXet = tv.FilePhieuNhanXet
            })
            .ToListAsync();
        return Ok(dsThanhVien);
    }

    // GET: api/Thanhvienhoidong/5
    [HttpGet("{mahoidong}")]
    public async Task<ActionResult<Thanhvienhoidong>> GetThanhvienhoidong(int mahoidong)
    {
        var thanhvienhoidong = await _context.Thanhvienhoidongs.FindAsync(mahoidong);

        if (thanhvienhoidong == null)
        {
            return NotFound();
        }

        return thanhvienhoidong;
    }

    // PUT: api/Thanhvienhoidong/5
    // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
    [HttpPut("{mahoidong}")]
    public async Task<IActionResult> PutThanhvienhoidong(int? mahoidong, Thanhvienhoidong thanhvienhoidong)
    {
        if (mahoidong != thanhvienhoidong.MaHoiDong)
        {
            return BadRequest();
        }

        _context.Entry(thanhvienhoidong).State = EntityState.Modified;

        try
        {
            await _context.SaveChangesAsync();
        }
        catch (DbUpdateConcurrencyException)
        {
            if (!ThanhvienhoidongExists(mahoidong))
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

    // POST: api/Thanhvienhoidong
    // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
    [HttpPost]
    public async Task<ActionResult<Thanhvienhoidong>> PostThanhvienhoidong(Thanhvienhoidong thanhvienhoidong)
    {
        _context.Thanhvienhoidongs.Add(thanhvienhoidong);
        await _context.SaveChangesAsync();

        return CreatedAtAction("GetThanhvienhoidong", new { mahoidong = thanhvienhoidong.MaHoiDong }, thanhvienhoidong);
    }

    // DELETE: api/Thanhvienhoidong/5
    [HttpDelete("{mahoidong}")]
    public async Task<IActionResult> DeleteThanhvienhoidong(int? mahoidong)
    {
        var thanhvienhoidong = await _context.Thanhvienhoidongs.FindAsync(mahoidong);
        if (thanhvienhoidong == null)
        {
            return NotFound();
        }

        _context.Thanhvienhoidongs.Remove(thanhvienhoidong);
        await _context.SaveChangesAsync();

        return NoContent();
    }

    private bool ThanhvienhoidongExists(int? mahoidong)
    {
        return _context.Thanhvienhoidongs.Any(e => e.MaHoiDong == mahoidong);
    }
}
