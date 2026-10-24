using DTMS.Api.DTOs;
using DTMS.Api.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

[Route("api/[controller]")]
[ApiController]
public class DanhgiahocthuatsController : ControllerBase
{
    private readonly DtmsDbContext _context;
    public DanhgiahocthuatsController(DtmsDbContext context)
    {
        _context = context;
    }

    // GET: api/Danhgiahocthuat
    [HttpGet]
    public async Task<ActionResult<IEnumerable<DanhgiahocthuatDto>>> GetDanhgiahocthuats()
    {
        var dsDanhGia = await _context.Danhgiahocthuats
            .Select(dg => new DanhgiahocthuatDto
            {
                MaDanhGia = dg.MaDanhGia,
                MaNcs = dg.MaNcs,
                LoaiDanhGia = dg.LoaiDanhGia,
                TenNoiDung = dg.TenNoiDung,
                MaHoiDong = dg.MaHoiDong,
                DiemTrungBinh = dg.DiemTrungBinh,
                KetLuan = dg.KetLuan,
                FileBaoCao = dg.FileBaoCao,
                FileBienBan = dg.FileBienBan,
                FileGiaiTrinh = dg.FileGiaiTrinh
            })
            .ToListAsync();
        return Ok(dsDanhGia);
    }

    // GET: api/Danhgiahocthuat/5
    [HttpGet("{madanhgia}")]
    public async Task<ActionResult<Danhgiahocthuat>> GetDanhgiahocthuat(int madanhgia)
    {
        var danhgiahocthuat = await _context.Danhgiahocthuats.FindAsync(madanhgia);

        if (danhgiahocthuat == null)
        {
            return NotFound();
        }

        return danhgiahocthuat;
    }

    // PUT: api/Danhgiahocthuat/5
    // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
    [HttpPut("{madanhgia}")]
    public async Task<IActionResult> PutDanhgiahocthuat(int? madanhgia, Danhgiahocthuat danhgiahocthuat)
    {
        if (madanhgia != danhgiahocthuat.MaDanhGia)
        {
            return BadRequest();
        }

        _context.Entry(danhgiahocthuat).State = EntityState.Modified;

        try
        {
            await _context.SaveChangesAsync();
        }
        catch (DbUpdateConcurrencyException)
        {
            if (!DanhgiahocthuatExists(madanhgia))
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

    // POST: api/Danhgiahocthuat
    // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
    [HttpPost]
    public async Task<ActionResult<Danhgiahocthuat>> PostDanhgiahocthuat(Danhgiahocthuat danhgiahocthuat)
    {
        _context.Danhgiahocthuats.Add(danhgiahocthuat);
        await _context.SaveChangesAsync();

        return CreatedAtAction("GetDanhgiahocthuat", new { madanhgia = danhgiahocthuat.MaDanhGia }, danhgiahocthuat);
    }

    // DELETE: api/Danhgiahocthuat/5
    [HttpDelete("{madanhgia}")]
    public async Task<IActionResult> DeleteDanhgiahocthuat(int? madanhgia)
    {
        var danhgiahocthuat = await _context.Danhgiahocthuats.FindAsync(madanhgia);
        if (danhgiahocthuat == null)
        {
            return NotFound();
        }

        _context.Danhgiahocthuats.Remove(danhgiahocthuat);
        await _context.SaveChangesAsync();

        return NoContent();
    }

    private bool DanhgiahocthuatExists(int? madanhgia)
    {
        return _context.Danhgiahocthuats.Any(e => e.MaDanhGia == madanhgia);
    }
}
