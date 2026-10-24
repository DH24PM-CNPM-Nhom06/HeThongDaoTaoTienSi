using DTMS.Api.DTOs;
using DTMS.Api.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

[Route("api/[controller]")]
[ApiController]
public class HoidongdanhgiumsController : ControllerBase
{
    private readonly DtmsDbContext _context;
    public HoidongdanhgiumsController(DtmsDbContext context)
    {
        _context = context;
    }

    // GET: api/Hoidongdanhgium
    [HttpGet]
    public async Task<ActionResult<IEnumerable<HoidongdanhgiumDto>>> GetHoidongdanhgia()
    {
        var dsHoiDong = await _context.Hoidongdanhgia
            .Select(hd => new HoidongdanhgiumDto
            {
                MaHoiDong = hd.MaHoiDong,
                MaNcs = hd.MaNcs,
                LoaiHoiDong = hd.LoaiHoiDong,
                SoQuyetDinh = hd.SoQuyetDinh,
                NgayThanhLap = hd.NgayThanhLap,
                NgayBaoVe = hd.NgayBaoVe,
                DiaDiem = hd.DiaDiem,
                SoPhieuTanThanh = hd.SoPhieuTanThanh,
                TongSoPhieu = hd.TongSoPhieu,
                KetLuan = hd.KetLuan,
                FileQuyetDinh = hd.FileQuyetDinh
            })
            .ToListAsync();
        return Ok(dsHoiDong);
    }

    // GET: api/Hoidongdanhgium/5
    [HttpGet("{mahoidong}")]
    public async Task<ActionResult<Hoidongdanhgium>> GetHoidongdanhgium(int mahoidong)
    {
        var hoidongdanhgium = await _context.Hoidongdanhgia.FindAsync(mahoidong);

        if (hoidongdanhgium == null)
        {
            return NotFound();
        }

        return hoidongdanhgium;
    }

    // PUT: api/Hoidongdanhgium/5
    // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
    [HttpPut("{mahoidong}")]
    public async Task<IActionResult> PutHoidongdanhgium(int? mahoidong, Hoidongdanhgium hoidongdanhgium)
    {
        if (mahoidong != hoidongdanhgium.MaHoiDong)
        {
            return BadRequest();
        }

        _context.Entry(hoidongdanhgium).State = EntityState.Modified;

        try
        {
            await _context.SaveChangesAsync();
        }
        catch (DbUpdateConcurrencyException)
        {
            if (!HoidongdanhgiumExists(mahoidong))
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

    // POST: api/Hoidongdanhgium
    // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
    [HttpPost]
    public async Task<ActionResult<Hoidongdanhgium>> PostHoidongdanhgium(Hoidongdanhgium hoidongdanhgium)
    {
        _context.Hoidongdanhgia.Add(hoidongdanhgium);
        await _context.SaveChangesAsync();

        return CreatedAtAction("GetHoidongdanhgium", new { mahoidong = hoidongdanhgium.MaHoiDong }, hoidongdanhgium);
    }

    // DELETE: api/Hoidongdanhgium/5
    [HttpDelete("{mahoidong}")]
    public async Task<IActionResult> DeleteHoidongdanhgium(int? mahoidong)
    {
        var hoidongdanhgium = await _context.Hoidongdanhgia.FindAsync(mahoidong);
        if (hoidongdanhgium == null)
        {
            return NotFound();
        }

        _context.Hoidongdanhgia.Remove(hoidongdanhgium);
        await _context.SaveChangesAsync();

        return NoContent();
    }

    private bool HoidongdanhgiumExists(int? mahoidong)
    {
        return _context.Hoidongdanhgia.Any(e => e.MaHoiDong == mahoidong);
    }
}
